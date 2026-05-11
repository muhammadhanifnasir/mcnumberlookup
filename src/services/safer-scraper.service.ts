import { chromium, type Browser, type Page } from "playwright";

import type { ScrapedCarrierData } from "@/types/carrier";

const SAFER_BASE_URL = "https://safer.fmcsa.dot.gov/query.asp";

function extractField(text: string, label: string) {
  const pattern = new RegExp(`${label}\\s*:?\\s*(.+)`, "i");
  const match = text.match(pattern);

  if (!match?.[1]) {
    return undefined;
  }

  return match[1].split("\n")[0]?.trim() || undefined;
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

export async function scrapeCarrierByMc(mcNumber: string): Promise<ScrapedCarrierData | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    return scrapeCarrierByMcWithPage(page, mcNumber);
  } finally {
    await page.close();
    await browser.close();
  }
}

export async function createSaferScraperSession() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  return {
    browser,
    page,
  };
}

export async function closeSaferScraperSession({
  browser,
  page,
}: {
  browser: Browser;
  page: Page;
}) {
  await page.close();
  await browser.close();
}

export async function scrapeCarrierByMcWithPage(
  page: Page,
  mcNumber: string,
): Promise<ScrapedCarrierData | null> {
  const sourceUrl = buildSaferUrl(mcNumber);
  await page.goto(sourceUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);

  const bodyText = await page.locator("body").innerText();

  if (/no records matching your query were found/i.test(bodyText)) {
    return null;
  }

  return {
    mcNumber,
    usdotNumber: extractField(bodyText, "USDOT Number"),
    legalName: extractField(bodyText, "Legal Name"),
    dbaName: extractField(bodyText, "DBA Name"),
    entityType: extractField(bodyText, "Entity Type"),
    phone: extractField(bodyText, "Telephone"),
    physicalAddress: extractField(bodyText, "Physical Address"),
    mailingAddress: extractField(bodyText, "Mailing Address"),
    operationClassification: extractField(bodyText, "Operation Classification"),
    outOfServiceDate: extractField(bodyText, "Out of Service Date"),
    sourceUrl,
    scrapedAt: new Date().toISOString(),
  };
}
