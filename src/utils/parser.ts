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

export function extractFirstTextField(text: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const value = extractTextField(text, label);
    if (value) return value;
  }

  return undefined;
}

// SAFER labels are short descriptors (for example, "Physical Address" and "USDOT Status");
// keeping this bounded avoids over-matching long free-form lines as labels.
const LABELED_FIELD_MAX_LABEL_LENGTH = 40;
const LABELED_FIELD_ALLOWED_CHAR_CLASS = "A-Za-z0-9/&().,' -";
const LABELED_FIELD_LINE_PATTERN = new RegExp(
  `^[A-Za-z][${LABELED_FIELD_ALLOWED_CHAR_CLASS}]{1,${LABELED_FIELD_MAX_LABEL_LENGTH}}\\s*:\\s*\\S`,
);
const MULTI_LINE_FIELD_PATTERN_CACHE = new Map<string, RegExp>();

function isLikelyLabeledFieldLine(line: string): boolean {
  return LABELED_FIELD_LINE_PATTERN.test(line);
}

export function extractMultiLineTextField(
  text: string,
  label: string,
  maxLines: number = 2,
): string | undefined {
  if (maxLines < 1) return undefined;

  let pattern = MULTI_LINE_FIELD_PATTERN_CACHE.get(label);
  if (!pattern) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`^\\s*${escaped}\\s*:?\\s*(.*)$`, "i");
    MULTI_LINE_FIELD_PATTERN_CACHE.set(label, pattern);
  }
  const lines = text.split("\n");

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const match = line.match(pattern);
    if (!match) continue;

    const parts: string[] = [];
    const firstValue = match[1]?.trim();
    if (firstValue) parts.push(firstValue);

    let nextIndex = lineIndex + 1;
    while (parts.length < maxLines && nextIndex < lines.length) {
      const nextLine = lines[nextIndex]?.trim();
      if (!nextLine) break;
      if (isLikelyLabeledFieldLine(nextLine)) break;
      parts.push(nextLine);
      nextIndex++;
    }

    return parts.length > 0 ? parts.join(", ") : undefined;
  }

  return undefined;
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

const US_PHONE_PATTERN =
  /(?:\+?1[\s.-]*)?(?:\(?\d{3}\)?[\s.-]*)\d{3}[\s.-]*\d{4}(?:\s*(?:x|ext\.?)\s*\d+)?/i;
const EMAIL_PATTERN =
  /\b[A-Z0-9](?:[A-Z0-9._%+-]{0,62}[A-Z0-9])?@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9-]{2,})+\b/i;

export function extractPhoneNumber(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(US_PHONE_PATTERN);
  return match ? match[0].trim() : undefined;
}

export function extractPhone(text: string): string | undefined {
  const labeledPhone =
    extractTextField(text, "Telephone") ??
    extractTextField(text, "Telephone Number") ??
    extractTextField(text, "Phone");

  const parsedPhone = extractPhoneNumber(labeledPhone);
  if (parsedPhone) return parsedPhone;

  if (!labeledPhone) return undefined;
  const digits = labeledPhone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? labeledPhone.trim() : undefined;
}

export function extractEmail(text: string): string | undefined {
  const labeledEmail = extractFirstTextField(text, ["Email Address", "Email", "E-mail"]);
  const email = labeledEmail?.match(EMAIL_PATTERN)?.[0] ?? text.match(EMAIL_PATTERN)?.[0];
  return email?.trim();
}

export function extractEmailFromMailtoHref(href: string | null | undefined): string | undefined {
  if (!href) return undefined;

  const normalizedHref = href.trim();
  if (!/^mailto:/i.test(normalizedHref)) return undefined;

  const withoutScheme = normalizedHref.replace(/^mailto:/i, "");
  const addressPart = withoutScheme.split("?")[0] ?? "";

  let decodedAddress = addressPart;
  try {
    decodedAddress = decodeURIComponent(addressPart);
  } catch {
    decodedAddress = addressPart;
  }

  const email = decodedAddress.match(EMAIL_PATTERN)?.[0];
  return email?.trim();
}
