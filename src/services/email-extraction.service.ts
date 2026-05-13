import { normalizeEmail, normalizeWebsiteUrl } from "@/utils/normalization";

const CONTACT_PAGE_TIMEOUT_MS = 12_000;
const EMAIL_PATTERN =
  /\b[A-Z0-9](?:[A-Z0-9._%+-]{0,62}[A-Z0-9])?@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9-]{2,})+\b/gi;
const CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us"];

async function fetchHtml(url: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONTACT_PAGE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "mcnextractor/1.0 (carrier-enrichment)" },
    });
    if (!response.ok) return undefined;
    return await response.text();
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

function extractValidEmailsFromHtml(html: string): string[] {
  const found = html.match(EMAIL_PATTERN) ?? [];
  return Array.from(
    new Set(
      found
        .map((email) => normalizeEmail(email))
        .filter((email): email is string => Boolean(email))
        .filter((email) => !email.endsWith(".png") && !email.endsWith(".jpg")),
    ),
  );
}

export async function extractBusinessEmailFromWebsite(website: string): Promise<string | undefined> {
  const baseWebsite = normalizeWebsiteUrl(website);
  if (!baseWebsite) return undefined;

  const urlsToTry = [baseWebsite, ...CONTACT_PATHS.map((path) => `${baseWebsite}${path}`)];
  for (const url of urlsToTry) {
    const html = await fetchHtml(url);
    if (!html) continue;
    const emails = extractValidEmailsFromHtml(html);
    if (emails.length > 0) return emails[0];
  }

  return undefined;
}
