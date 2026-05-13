export function normalizeWhitespace(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function toNormalizedLower(value: string | null | undefined): string {
  return normalizeWhitespace(value)?.toLowerCase() ?? "";
}

export function normalizeWebsiteUrl(value: string | null | undefined): string | undefined {
  const raw = normalizeWhitespace(value);
  if (!raw) return undefined;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return undefined;
    }
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function normalizeEmail(value: string | null | undefined): string | undefined {
  const email = normalizeWhitespace(value)?.toLowerCase();
  if (!email) return undefined;
  const safeEmailPattern =
    /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9-]{2,})+$/i;
  return safeEmailPattern.test(email) ? email : undefined;
}
