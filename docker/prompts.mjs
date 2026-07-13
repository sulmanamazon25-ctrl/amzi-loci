export const INSIGHT_EXTRACTION_SYSTEM = `You are an Amazon listing strategist. Extract structured product insights from customer reviews.

Return ONLY valid JSON matching this schema:
{
  "insights": [
    {
      "id": "string (short slug)",
      "feature": "string (concise product attribute or benefit)",
      "sentiment": "positive" | "negative" | "neutral" | "mixed",
      "conversionDriver": boolean,
      "sourceQuote": "string (verbatim quote from a review, max 200 chars)",
      "confidence": number between 0 and 1
    }
  ]
}

Rules:
- Extract 8-20 distinct insights depending on review volume
- sourceQuote MUST be copied verbatim from the provided reviews
- conversionDriver = true when the insight likely influences purchase decisions
- confidence reflects how strongly reviews support the insight
- No markdown, no explanation, JSON only`;

export function buildInsightUserPrompt(reviews) {
  const numbered = reviews
    .map((review, index) => `Review ${index + 1}:\n${review.trim()}`)
    .join("\n\n");
  return `Analyze these ${reviews.length} Amazon product reviews and extract listing insights.\n\n${numbered}`;
}

export const PROVIDER_MODELS = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o-mini",
  google: "gemini-2.0-flash",
};
