/**
 * Parse reviews from pasted text (blank-line separated blocks or line-by-line).
 */
export function parseReviewsFromText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const blocks = trimmed.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;

  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 10);
}

/**
 * Parse reviews from CSV — uses first column or a column named review/text/body.
 */
export function parseReviewsFromCsv(csv: string): string[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("review") || header.includes("text") || header.includes("body");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  let columnIndex = 0;
  if (hasHeader) {
    const cols = parseCsvLine(lines[0]);
    const idx = cols.findIndex((c) =>
      /review|text|body|content/i.test(c),
    );
    if (idx >= 0) columnIndex = idx;
  }

  return dataLines
    .map((line) => parseCsvLine(line)[columnIndex]?.trim())
    .filter((review): review is string => Boolean(review && review.length > 5));
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((cell) => cell.replace(/^"|"$/g, "").trim());
}
