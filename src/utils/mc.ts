const MC_DIGIT_REGEX = /\d+/g;
const MC_RANGE_REGEX = /^(?:MC[-\s]*)?(\d+)\s*(?:-|to)\s*(?:MC[-\s]*)?(\d+)$/i;
const MAX_RANGE_SIZE = 5_000;

export function normalizeMcNumber(input: string) {
  return input.replace(/^MC[-\s]*/i, "").trim();
}

export function parseMcNumbers(raw: string) {
  const lines = raw.split(/\r?\n|,|;/g);
  const unique = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const rangeMatch = trimmed.match(MC_RANGE_REGEX);
    if (rangeMatch) {
      const start = Number.parseInt(rangeMatch[1], 10);
      const end = Number.parseInt(rangeMatch[2], 10);
      const rangeSize = Math.abs(end - start) + 1;

      if (Number.isFinite(start) && Number.isFinite(end) && rangeSize <= MAX_RANGE_SIZE) {
        if (start <= end) {
          for (let current = start; current <= end; current += 1) {
            unique.add(String(current));
          }
        } else {
          for (let current = start; current >= end; current -= 1) {
            unique.add(String(current));
          }
        }
        continue;
      }
    }

    const explicitMcMatches = [...trimmed.matchAll(/\bMC[-\s]*(\d+)\b/gi)];
    if (explicitMcMatches.length > 0) {
      for (const match of explicitMcMatches) {
        const mc = match[1];
        if (mc) unique.add(mc);
      }
      continue;
    }

    const cleaned = normalizeMcNumber(line);
    const matches = cleaned.match(MC_DIGIT_REGEX);

    if (!matches) {
      continue;
    }

    if (/[/:]/.test(cleaned) && matches.length > 1) {
      // Rows pasted from tables often contain trailing date/time values; keep the first numeric token
      // as the intended MC number and ignore timestamp fragments.
      unique.add(matches[0]);
      continue;
    }

    for (const match of matches) {
      if (match) {
        unique.add(match);
      }
    }
  }

  return Array.from(unique);
}
