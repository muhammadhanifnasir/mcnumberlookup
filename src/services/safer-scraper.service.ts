import chromiumBinary from "@sparticuz/chromium";
import { chromium, type Browser, type Page } from "playwright-core";

import type { ScrapedCarrierData } from "@/types/carrier";
import { logger } from "@/utils/logger";
import {
  extractEmail,
  extractEmailFromMailtoHref,
  extractFirstTextField,
  extractNumber,
  extractPhone,
  extractTextField,
  normalizeStatus,
} from "@/utils/parser";
import { normalizeWebsiteUrl } from "@/utils/normalization";

const SAFER_BASE_URL = "https://safer.fmcsa.dot.gov/query.asp";
const GOTO_TIMEOUT_MS = 60_000;
const NETWORK_IDLE_TIMEOUT_MS = 15_000;
// Keep supplemental page crawling bounded to control latency during batch imports.
const MAX_SUPPLEMENTAL_PAGES_PER_CARRIER = 3;
const SUPPLEMENTAL_ALLOWED_DOMAIN = "fmcsa.dot.gov";
const BLOCKED_WEBSITE_HOSTS = new Set(["safer.fmcsa.dot.gov", "fmcsa.dot.gov"]);

function normalizePageText(raw: string | null | undefined) {
  if (!raw) return "";
  return raw.replace(/\u00a0/g, " ").replace(/\r/g, "").trim();
}

function isBlockedWebsiteHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  for (const blocked of BLOCKED_WEBSITE_HOSTS) {
    if (normalized === blocked || normalized.endsWith(`.${blocked}`)) {
      return true;
    }
  }

  return false;
}

function pickCarrierWebsiteFromHrefs(hrefs: string[]): string | undefined {
  for (const href of hrefs) {
    const normalized = normalizeWebsiteUrl(href);
    if (!normalized) continue;

    try {
      const parsed = new URL(normalized);
      if (isBlockedWebsiteHost(parsed.hostname)) continue;
      return normalized;
    } catch {
      continue;
    }
  }

  return undefined;
}

function toAbsoluteHttpUrl(value: string, baseUrl: string): string | undefined {
  const candidate = value.trim();
  if (!candidate) return undefined;

  try {
    const parsed = new URL(candidate, baseUrl);
    if (!/^https?:$/i.test(parsed.protocol)) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function isHostWithinDomain(hostname: string, domain: string): boolean {
  const normalizedHost = hostname.toLowerCase();
  const normalizedDomain = domain.toLowerCase();
  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

function isAllowedSupplementalHost(hostname: string, sourceHostname: string): boolean {
  const normalized = hostname.toLowerCase();
  const normalizedSource = sourceHostname.toLowerCase();
  return normalized === normalizedSource || isHostWithinDomain(normalized, SUPPLEMENTAL_ALLOWED_DOMAIN);
}

function extractUrlCandidates(value: string): string[] {
  const candidates = new Set<string>();
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (
    /^(https?:\/\/|\/\/|\/|\.\.?\/)/i.test(trimmed) ||
    /Overview\.aspx/i.test(trimmed) ||
    /\/SMS\/Carrier\//i.test(trimmed)
  ) {
    candidates.add(trimmed);
  }

  for (const match of trimmed.matchAll(/window\.open\(\s*['"]([^'"]+)['"]/gi)) {
    const candidate = match[1]?.trim();
    if (candidate) candidates.add(candidate);
  }

  for (const match of trimmed.matchAll(/https?:\/\/[^\s"'<>]+/gi)) {
    const candidate = match[0]?.trim();
    if (candidate) candidates.add(candidate);
  }

  for (const match of trimmed.matchAll(/\/SMS\/Carrier\/\d+\/Overview\.aspx(?:\?[^"'<>\s]*)?/gi)) {
    const candidate = match[0]?.trim();
    if (candidate) candidates.add(candidate);
  }

  return [...candidates];
}

async function extractPageBodyText(page: Page): Promise<string> {
  const innerText = await page.locator("body").innerText().catch(() => "");
  const textContent = await page.locator("body").textContent().catch(() => "");
  const normalizedInnerText = normalizePageText(innerText);
  const normalizedTextContent = normalizePageText(textContent);
  return normalizedInnerText.length >= normalizedTextContent.length
    ? normalizedInnerText
    : normalizedTextContent;
}

async function discoverSupplementalPageUrls(page: Page, sourceUrl: string): Promise<string[]> {
  const rawCandidates = await page
    .evaluate(() => {
      const values: string[] = [];

      document.querySelectorAll("a[href]").forEach((element) => {
        const href = element.getAttribute("href");
        if (href) values.push(href);
      });

      document.querySelectorAll("[onclick]").forEach((element) => {
        const onClick = element.getAttribute("onclick");
        if (onClick) values.push(onClick);
      });

      document.querySelectorAll("script").forEach((script) => {
        const content = script.textContent;
        if (content) values.push(content);
      });

      return values;
    })
    .catch(() => []);

  const sourceHostname = new URL(sourceUrl).hostname;
  const urls = new Set<string>();

  for (const rawCandidate of rawCandidates) {
    const extractedCandidates = extractUrlCandidates(rawCandidate);
    for (const candidate of extractedCandidates) {
      const absoluteUrl = toAbsoluteHttpUrl(candidate, sourceUrl);
      if (!absoluteUrl) continue;

      try {
        const parsed = new URL(absoluteUrl);
        if (!isAllowedSupplementalHost(parsed.hostname, sourceHostname)) continue;
        if (absoluteUrl === sourceUrl) continue;
        urls.add(absoluteUrl);
      } catch {
        continue;
      }
    }
  }

  const discoveredUrls = [...urls];
  if (discoveredUrls.length > MAX_SUPPLEMENTAL_PAGES_PER_CARRIER) {
    logger.info("Limiting supplemental SAFER/SMS pages", {
      discovered: discoveredUrls.length,
      limit: MAX_SUPPLEMENTAL_PAGES_PER_CARRIER,
    });
  }

  return discoveredUrls.slice(0, MAX_SUPPLEMENTAL_PAGES_PER_CARRIER);
}

async function collectSupplementalPageData(
  page: Page,
  supplementalUrls: string[],
  mcNumber: string,
): Promise<{ texts: string[]; mailtoHrefs: string[]; websiteHrefs: string[] }> {
  const texts: string[] = [];
  const mailtoHrefs: string[] = [];
  const websiteHrefs: string[] = [];

  for (const supplementalUrl of supplementalUrls) {
    try {
      logger.info("Navigating to supplemental SAFER/SMS page", { mcNumber, supplementalUrl });
      await page.goto(supplementalUrl, {
        waitUntil: "domcontentloaded",
        timeout: GOTO_TIMEOUT_MS,
      });

      await page
        .waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS })
        .catch(() => {
          logger.warn("networkidle timeout on supplemental page – proceeding", {
            mcNumber,
            supplementalUrl,
          });
        });

      const bodyText = await extractPageBodyText(page);
      if (bodyText) texts.push(bodyText);

      const supplementalMailtoHrefs = await page
        .locator('a[href^="mailto:"]')
        .evaluateAll((anchors) =>
          anchors
            .map((anchor) => anchor.getAttribute("href"))
            .filter((href): href is string => typeof href === "string"),
        )
        .catch(() => []);
      mailtoHrefs.push(...supplementalMailtoHrefs);

      const supplementalWebsiteHrefs = await page
        .locator('a[href^="http://"], a[href^="https://"]')
        .evaluateAll((anchors) =>
          anchors
            .map((anchor) => anchor.getAttribute("href"))
            .filter((href): href is string => typeof href === "string"),
        )
        .catch(() => []);
      websiteHrefs.push(...supplementalWebsiteHrefs);
    } catch (error) {
      logger.warn("Failed to read supplemental SAFER/SMS page", {
        mcNumber,
        supplementalUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { texts, mailtoHrefs, websiteHrefs };
}

export function buildSaferUrl(mcNumber: string) {
  const params = new URLSearchParams({
    searchtype: "ANY",
    query_type: "queryCarrierSnapshot",
    query_param: "MC_MX",
    query_string: mcNumber,
  });

  return `${SAFER_BASE_URL}?${params.toString()}`;
}

export async function createSaferScraperSession() {
  logger.info("Launching Playwright browser");
  const executablePath = await chromiumBinary.executablePath();
  const browser = await chromium.launch({
    args: chromiumBinary.args,
    executablePath,
    headless: true,
  });
  const page = await browser.newPage();
  return { browser, page };
}

export async function closeSaferScraperSession({
  browser,
  page,
}: {
  browser: Browser;
  page: Page;
}) {
  logger.info("Closing Playwright browser");
  await page.close();
  await browser.close();
}

export async function scrapeCarrierByMcWithPage(
  page: Page,
  mcNumber: string,
): Promise<ScrapedCarrierData | null> {
  const sourceUrl = buildSaferUrl(mcNumber);
  logger.info("Navigating to SAFER", { mcNumber, sourceUrl });

  await page.goto(sourceUrl, {
    waitUntil: "domcontentloaded",
    timeout: GOTO_TIMEOUT_MS,
  });

  await page
    .waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS })
    .catch(() => {
      logger.warn("networkidle timeout – proceeding with available content", { mcNumber });
    });

  const bodyText = await extractPageBodyText(page);

  // Exit early when carrier is missing so we avoid unnecessary supplemental-page navigation.
  if (/no records matching your query were found/i.test(bodyText)) {
    logger.info("Carrier not found in SAFER", { mcNumber });
    return null;
  }

  const mailtoHrefs = await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((anchors) =>
      anchors
        .map((anchor) => anchor.getAttribute("href"))
        .filter((href): href is string => typeof href === "string"),
    )
    .catch(() => []);
  const websiteHrefs = await page
    .locator('a[href^="http://"], a[href^="https://"]')
    .evaluateAll((anchors) =>
      anchors
        .map((anchor) => anchor.getAttribute("href"))
        .filter((href): href is string => typeof href === "string"),
    )
    .catch(() => []);

  const supplementalUrls = await discoverSupplementalPageUrls(page, sourceUrl);
  const supplementalData = await collectSupplementalPageData(page, supplementalUrls, mcNumber);
  const combinedBodyText = [bodyText, ...supplementalData.texts].join("\n");
  const combinedMailtoHrefs = [...new Set([...mailtoHrefs, ...supplementalData.mailtoHrefs])];
  const combinedWebsiteHrefs = [...new Set([...websiteHrefs, ...supplementalData.websiteHrefs])];

  if (supplementalUrls.length > 0) {
    logger.info("Collected supplemental SAFER/SMS pages", {
      mcNumber,
      supplementalPages: supplementalUrls.length,
    });
  }

  const emailAddress =
    extractEmail(combinedBodyText) ??
    combinedMailtoHrefs
      .map((href) => extractEmailFromMailtoHref(href))
      .find((value): value is string => Boolean(value));
  const website =
    pickCarrierWebsiteFromHrefs(combinedWebsiteHrefs) ??
    normalizeWebsiteUrl(
      extractFirstTextField(combinedBodyText, ["Website", "Website Address", "Web Address"]),
    );

  const data: ScrapedCarrierData = {
    mcNumber,
    usdotStatus: normalizeStatus(
      extractTextField(bodyText, "USDOT Status") ?? extractTextField(bodyText, "Operating Status"),
    ),
    ownerStatus: normalizeStatus(extractFirstTextField(bodyText, ["Owner Status", "Entity Type"])),
    usdotNumber: extractTextField(bodyText, "USDOT Number"),
    legalName: extractTextField(bodyText, "Legal Name"),
    dbaName: extractTextField(bodyText, "DBA Name"),
    emailAddress,
    phone: extractPhone(combinedBodyText),
    powerUnits: extractNumber(extractTextField(combinedBodyText, "Power Units")),
    drivers: extractNumber(extractTextField(combinedBodyText, "Drivers")),
    physicalAddress: extractTextField(combinedBodyText, "Physical Address"),
    website,
    enrichmentStatus: "pending",
    dataSource: "fmcsa_safer",
    sourceUrl,
    scrapedAt: new Date().toISOString(),
  };

  logger.info("Scraped carrier data", {
    mcNumber,
    legalName: data.legalName,
    usdotStatus: data.usdotStatus,
  });

  return data;
}

/** Standalone scrape that creates and closes its own browser session. */
export async function scrapeCarrierByMc(mcNumber: string): Promise<ScrapedCarrierData | null> {
  const executablePath = await chromiumBinary.executablePath();
  const browser = await chromium.launch({
    args: chromiumBinary.args,
    executablePath,
    headless: true,
  });
  const page = await browser.newPage();

  try {
    return await scrapeCarrierByMcWithPage(page, mcNumber);
  } finally {
    await page.close();
    await browser.close();
  }
}
