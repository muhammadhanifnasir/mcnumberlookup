import { logger } from "@/utils/logger";
import { normalizeWebsiteUrl, normalizeWhitespace } from "@/utils/normalization";

const WEBSITE_DISCOVERY_TIMEOUT_MS = 12_000;
const WEBSITE_DISCOVERY_MAX_CANDIDATES = 8;

function slugifyCompanyName(name: string): string[] {
  const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter((token) => token.length > 1);
  if (tokens.length === 0) return [];

  const compact = tokens.join("");
  const dashed = tokens.join("-");
  return Array.from(new Set([compact, dashed]));
}

function buildWebsiteCandidates(companyNames: string[]): string[] {
  const candidates: string[] = [];
  for (const name of companyNames) {
    for (const slug of slugifyCompanyName(name)) {
      candidates.push(`https://www.${slug}.com`);
      candidates.push(`https://${slug}.com`);
      candidates.push(`https://www.${slug}.net`);
      candidates.push(`https://${slug}.net`);
    }
  }

  return Array.from(new Set(candidates)).slice(0, WEBSITE_DISCOVERY_MAX_CANDIDATES);
}

async function isReachableWebsite(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBSITE_DISCOVERY_TIMEOUT_MS);

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    }).catch(() => null);
    if (headResponse?.ok) return true;

    const getResponse = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });
    return getResponse.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function discoverCarrierWebsite(input: {
  legalName?: string;
  dbaName?: string;
}): Promise<string | undefined> {
  const legalName = normalizeWhitespace(input.legalName);
  const dbaName = normalizeWhitespace(input.dbaName);

  const candidates = buildWebsiteCandidates([legalName, dbaName].filter(Boolean) as string[]);
  for (const candidate of candidates) {
    if (await isReachableWebsite(candidate)) {
      const normalized = normalizeWebsiteUrl(candidate);
      if (normalized) {
        logger.info("Discovered carrier website", { candidate: normalized });
        return normalized;
      }
    }
  }

  return undefined;
}
