import { applyBrandKit } from "./brandkit.mjs";
import { callTextModel, parseJsonObject } from "./text-llm.mjs";
import { generateSingleImage, VALID_TIERS, TIER_MODELS } from "./images.mjs";

const APLUS_SYSTEM = `You are an Amazon A+ Content strategist. Generate modular A+ content from product insights and brand direction.

Return ONLY valid JSON:
{
  "modules": [
    {
      "id": "string",
      "type": "hero" | "features" | "comparison" | "brandStory",
      "headline": "string",
      "body": "string",
      "bullets": ["string"] // optional, for features/comparison modules
    }
  ]
}

Rules:
- Generate exactly 4 modules: hero, features, comparison, brandStory
- Use customer-validated insights; no fabricated claims
- Match brand tone; concise Amazon-ready copy
- No markdown outside JSON`;

const LOCALIZE_SYSTEM = `You are a marketplace localization expert. Translate Amazon A+ content modules while preserving marketing intent and compliance.

Return ONLY valid JSON with the same module schema (id, type, headline, body, bullets).
Keep ids and types unchanged. Translate headline, body, and bullets only.`;

export const AD_SLOTS = [
  {
    slotType: "ad",
    slotIndex: 0,
    label: "Square feed (1:1)",
    aspectRatio: "1:1",
    directive: "Paid social ad creative, square 1:1, bold product focus, minimal text overlay, scroll-stopping.",
  },
  {
    slotType: "ad",
    slotIndex: 1,
    label: "Story / Reels (9:16)",
    aspectRatio: "9:16",
    directive: "Vertical story ad, product hero with lifestyle context, mobile-first composition.",
  },
  {
    slotType: "ad",
    slotIndex: 2,
    label: "Landscape (16:9)",
    aspectRatio: "16:9",
    directive: "Wide landscape ad banner, product left, benefit callouts right, clean brand colors.",
  },
];

function buildAplusUserPrompt(brandKit, productContext, insights) {
  const style = applyBrandKit(brandKit, productContext, insights);
  const drivers = insights
    .filter((i) => i.conversionDriver)
    .map((i) => i.feature)
    .join("; ");
  return `Product: ${productContext}\nBrand style: ${style.styleSummary}\nImage brief context: ${style.imagePrompt.slice(0, 800)}\nKey conversion drivers: ${drivers || "see insights"}\n\nInsights JSON:\n${JSON.stringify(insights.slice(0, 15))}`;
}

function buildAdPrompt(slot, brandKit, productContext, insights) {
  const base = applyBrandKit(brandKit, productContext, insights).imagePrompt;
  return `${base}\n\nAd format (${slot.label}): ${slot.directive}\nAspect ratio ${slot.aspectRatio}. No fake badges or misleading claims.`;
}

function buildVariationPrompt(variantName, brandKit, productContext, insights) {
  const base = applyBrandKit(brandKit, productContext, insights).imagePrompt;
  return `${base}\n\nVariation: ${variantName}. Keep identical brand style, lighting, and composition system as the parent listing; only change the variant-specific product appearance. Amazon main-image style, white background.`;
}

export async function generateAplus(body, apiKey, provider) {
  const { brandKit, insights, productContext } = body;
  const { text, model } = await callTextModel(
    provider,
    APLUS_SYSTEM,
    buildAplusUserPrompt(brandKit, productContext.trim(), insights),
    apiKey,
  );
  const parsed = parseJsonObject(text);
  if (!Array.isArray(parsed.modules)) throw new Error("A+ JSON missing modules array");
  return { modules: parsed.modules, model };
}

export async function localizeContent(body, apiKey, provider) {
  const { modules, targetLocale } = body;
  const user = `Target locale: ${targetLocale}\n\nModules to translate:\n${JSON.stringify(modules)}`;
  const { text, model } = await callTextModel(provider, LOCALIZE_SYSTEM, user, apiKey);
  const parsed = parseJsonObject(text);
  if (!Array.isArray(parsed.modules)) throw new Error("Localization JSON missing modules array");
  return { modules: parsed.modules, targetLocale, model };
}

export async function generateAds(body, apiKey) {
  const { brandKit, insights, productContext, tier, referenceImagesBase64 } = body;
  if (!VALID_TIERS.has(tier)) throw new Error("Invalid image tier");
  const refs = Array.isArray(referenceImagesBase64) ? referenceImagesBase64 : [];
  const images = [];

  for (const slot of AD_SLOTS) {
    const prompt = buildAdPrompt(slot, brandKit, productContext.trim(), insights);
    const image = await generateSingleImage({
      prompt,
      tier,
      apiKey,
      refs,
      aspectRatio: slot.aspectRatio,
    });
    images.push({
      id: `ad-${slot.slotIndex}`,
      slotType: slot.slotType,
      slotIndex: slot.slotIndex,
      label: slot.label,
      prompt,
      mimeType: image.mimeType,
      base64: image.base64,
    });
  }

  return { images, model: TIER_MODELS[tier]?.model ?? tier, tier };
}

export async function generateVariations(body, apiKey) {
  const { brandKit, insights, productContext, tier, variants, referenceImagesBase64 } = body;
  if (!VALID_TIERS.has(tier)) throw new Error("Invalid image tier");
  const names = (variants ?? []).map((v) => v.trim()).filter(Boolean).slice(0, 5);
  if (names.length === 0) throw new Error("At least one variant name is required");

  const refs = Array.isArray(referenceImagesBase64) ? referenceImagesBase64 : [];
  const images = [];

  for (let i = 0; i < names.length; i++) {
    const variantName = names[i];
    const prompt = buildVariationPrompt(variantName, brandKit, productContext.trim(), insights);
    const image = await generateSingleImage({
      prompt,
      tier,
      apiKey,
      refs,
      aspectRatio: "1:1",
    });
    images.push({
      id: `variation-${i}`,
      slotType: "variation",
      slotIndex: i,
      label: variantName,
      prompt,
      mimeType: image.mimeType,
      base64: image.base64,
    });
  }

  return { images, model: TIER_MODELS[tier]?.model ?? tier, tier, variantCount: names.length };
}

export { VALID_TIERS };
