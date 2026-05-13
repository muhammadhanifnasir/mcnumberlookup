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

function normalizePageText(raw: string | null | undefined) {
  if (!raw) return "";
  return raw.replace(/\u00a0/g, " ").replace(/\r/g, "").trim();
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

  const innerText = await page.locator("body").innerText().catch(() => "");
  const textContent = await page.locator("body").textContent().catch(() => "");
  const normalizedInnerText = normalizePageText(innerText);
  const normalizedTextContent = normalizePageText(textContent);
  const bodyText =
    normalizedInnerText.length >= normalizedTextContent.length
      ? normalizedInnerText
      : normalizedTextContent;
  const mailtoHref = await page.locator('a[href^="mailto:"]').first().getAttribute("href");
  const websiteHref = await page.locator('a[href^="http"]').first().getAttribute("href");
  const emailAddress = extractEmail(bodyText) ?? extractEmailFromMailtoHref(mailtoHref);
  const website = normalizeWebsiteUrl(websiteHref);

  if (/no records matching your query were found/i.test(bodyText)) {
    logger.info("Carrier not found in SAFER", { mcNumber });
    return null;
  }

  const data: ScrapedCarrierData = {
    mcNumber,
    usdotStatus: normalizeStatus(
      extractTextField(bodyText, "USDOT Status") ?? extractTextField(bodyText, "Operating Status"),
    ),
    ownerStatus: normalizeStatus(
      extractFirstTextField(bodyText, ["Owner Status", "Entity Type", "Carrier Operation"]),
    ),
    usdotNumber: extractTextField(bodyText, "USDOT Number"),
    mcs150FormDate: extractTextField(bodyText, "MCS-150 Form Date"),
    operatingAuthorityStatus: normalizeStatus(
      extractTextField(bodyText, "Operating Authority Status"),
    ),
    legalName: extractTextField(bodyText, "Legal Name"),
    dbaName: extractTextField(bodyText, "DBA Name"),
    emailAddress,
    phone: extractPhone(bodyText),
    powerUnits: extractNumber(extractTextField(bodyText, "Power Units")),
    drivers: extractNumber(extractTextField(bodyText, "Drivers")),
    entityType: extractTextField(bodyText, "Entity Type"),
    physicalAddress: extractTextField(bodyText, "Physical Address"),
    truckType: extractFirstTextField(bodyText, ["Truck Type", "Vehicle Type", "Cargo Carried"]),
    mailingAddress: extractTextField(bodyText, "Mailing Address"),
    operationClassification: extractTextField(bodyText, "Operation Classification"),
    carrierOperation: extractFirstTextField(bodyText, ["Carrier Operation", "Carrier Operations"]),
    cargoCarried: extractFirstTextField(bodyText, ["Cargo Carried", "Cargo"]),
    authorityInformation: extractFirstTextField(bodyText, [
      "Authority Information",
      "Authority Type",
      "Authority",
    ]),
    outOfServiceDate: extractTextField(bodyText, "Out of Service Date"),
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
