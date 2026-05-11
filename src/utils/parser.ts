/**
 * Extracts a field value from SAFER FMCSA plain-text page content.
 * Handles labels with or without a trailing colon.
 */
export function extractTextField(text: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}\\s*:?\\s*(.+?)(?:\n|$)`, "i");
  const match = text.match(pattern);
  if (!match?.[1]) return undefined;
  const value = match[1].trim();
  return value.length > 0 ? value : undefined;
}

/**
 * Normalises a status string by collapsing whitespace.
 */
export function normalizeStatus(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Extracts the first integer (possibly comma-separated) from a raw string.
 * Returns the digits-only string, e.g. "1,234" → "1234".
 */
export function extractNumber(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/\d[\d,]*/);
  return match ? match[0].replace(/,/g, "") : undefined;
}
