const MC_DIGIT_REGEX = /\d+/g;

export function normalizeMcNumber(input: string) {
  return input.replace(/^MC[-\s]*/i, "").trim();
}

export function parseMcNumbers(raw: string) {
  const lines = raw.split(/\r?\n|,|;/g);
  const unique = new Set<string>();

  for (const line of lines) {
    const cleaned = normalizeMcNumber(line);
    const matches = cleaned.match(MC_DIGIT_REGEX);

    if (!matches) {
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
