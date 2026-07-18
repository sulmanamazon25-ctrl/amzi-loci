import type { BrandKit, GenerateListingCopyRequest, ListingCopy, ProductInsight } from "@amzi-loci/shared";
import { applyBrandKit } from "./brandkit-prompt.js";
import { callTextModel, parseJsonObject } from "./text-llm.js";

const LISTING_COPY_SYSTEM = `You are an Amazon listing copywriter. Write conversion-focused listing text from real customer insights.

Return ONLY valid JSON:
{
  "title": "string",
  "bullets": ["string", "string", "string", "string", "string"],
  "description": "string",
  "backendKeywords": "string"
}

Rules:
- Title: max 200 characters, front-load main keyword, no ALL CAPS spam
- Exactly 5 bullet points, each max 500 characters, benefit-led, use customer language from insights
- Description: max 2000 characters, storytelling + specs, no HTML
- backendKeywords: space-separated, max 250 bytes total, no words repeated from title/bullets, no punctuation
- No medical claims, no "#1 best", no "FDA approved", no guaranteed cures
- Use only facts supported by the provided insights and product context
- Match brand tone from the style summary`;

export async function generateListingCopy(
  input: GenerateListingCopyRequest,
  apiKey: string,
): Promise<ListingCopy> {
  const style = applyBrandKit(
    input.brandKit as BrandKit,
    input.productContext,
    input.insights as ProductInsight[],
  );

  const drivers = input.insights
    .filter((i) => i.conversionDriver)
    .map((i) => `- ${i.feature}: "${i.sourceQuote}"`)
    .join("\n");

  const allInsights = input.insights
    .map((i) => `- [${i.sentiment}] ${i.feature}: "${i.sourceQuote}"`)
    .join("\n");

  const user = `Product context: ${input.productContext}

Brand style summary: ${style.styleSummary}
Image prompt context: ${style.imagePrompt}

Top conversion drivers from reviews:
${drivers || "(none flagged)"}

All review insights:
${allInsights}

Write Amazon listing copy that reflects what buyers actually care about.`;

  const { text, model } = await callTextModel(
    input.provider,
    LISTING_COPY_SYSTEM,
    user,
    apiKey,
  );
  const parsed = parseJsonObject(text) as Record<string, unknown>;

  const rawBullets = Array.isArray(parsed.bullets) ? parsed.bullets : [];
  const bullets = rawBullets.map((b) => String(b).trim()).filter(Boolean);
  while (bullets.length < 5) bullets.push("");

  return {
    title: String(parsed.title ?? "").trim(),
    bullets: bullets.slice(0, 5),
    description: String(parsed.description ?? "").trim(),
    backendKeywords: String(parsed.backendKeywords ?? parsed.backend_keywords ?? "").trim(),
    model,
  };
}
