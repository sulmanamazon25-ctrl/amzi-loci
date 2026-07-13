import type {
  AplusModule,
  BrandKit,
  ImageTier,
  ProductInsight,
} from "@amzi-loci/shared";
import { applyBrandKit } from "./brandkit-prompt.js";
import { generateImageFromPrompt, getTierModel } from "./image-proxy.js";
import { callTextModel, parseJsonObject } from "./text-llm.js";

const APLUS_SYSTEM = `You are an Amazon A+ Content strategist. Generate modular A+ content from product insights and brand direction.

Return ONLY valid JSON:
{
  "modules": [
    {
      "id": "string",
      "type": "hero" | "features" | "comparison" | "brandStory",
      "headline": "string",
      "body": "string",
      "bullets": ["string"]
    }
  ]
}

Rules:
- Generate exactly 4 modules: hero, features, comparison, brandStory
- Use customer-validated insights; no fabricated claims
- Match brand tone; concise Amazon-ready copy
- No markdown outside JSON`;

const LOCALIZE_SYSTEM = `You are a marketplace localization expert. Translate Amazon A+ content modules while preserving marketing intent.

Return ONLY valid JSON with the same module schema. Keep ids and types unchanged. Translate headline, body, and bullets only.`;

const AD_SLOTS = [
  {
    slotIndex: 0,
    label: "Square feed (1:1)",
    aspectRatio: "1:1",
    directive:
      "Paid social ad creative, square 1:1, bold product focus, minimal text overlay.",
  },
  {
    slotIndex: 1,
    label: "Story / Reels (9:16)",
    aspectRatio: "9:16",
    directive: "Vertical story ad, product hero with lifestyle context, mobile-first.",
  },
  {
    slotIndex: 2,
    label: "Landscape (16:9)",
    aspectRatio: "16:9",
    directive: "Wide landscape ad banner, product left, benefit callouts right.",
  },
];

function buildAplusUserPrompt(
  brandKit: BrandKit,
  productContext: string,
  insights: ProductInsight[],
): string {
  const style = applyBrandKit(brandKit, productContext, insights);
  const drivers = insights
    .filter((i) => i.conversionDriver)
    .map((i) => i.feature)
    .join("; ");
  return `Product: ${productContext}\nBrand style: ${style.styleSummary}\nKey drivers: ${drivers || "see insights"}\n\nInsights:\n${JSON.stringify(insights.slice(0, 15))}`;
}

function parseModules(parsed: Record<string, unknown>): AplusModule[] {
  if (!Array.isArray(parsed.modules)) throw new Error("JSON missing modules array");
  return parsed.modules as AplusModule[];
}

export async function generateAplusContent(
  brandKit: BrandKit,
  insights: ProductInsight[],
  productContext: string,
  provider: "anthropic" | "openai" | "google",
  apiKey: string,
) {
  const { text, model } = await callTextModel(
    provider,
    APLUS_SYSTEM,
    buildAplusUserPrompt(brandKit, productContext.trim(), insights),
    apiKey,
  );
  return { modules: parseModules(parseJsonObject(text)), model };
}

export async function localizeAplusContent(
  modules: AplusModule[],
  targetLocale: string,
  provider: "anthropic" | "openai" | "google",
  apiKey: string,
) {
  const user = `Target locale: ${targetLocale}\n\n${JSON.stringify(modules)}`;
  const { text, model } = await callTextModel(provider, LOCALIZE_SYSTEM, user, apiKey);
  return {
    modules: parseModules(parseJsonObject(text)),
    targetLocale,
    model,
  };
}

function buildAdPrompt(
  slot: (typeof AD_SLOTS)[number],
  brandKit: BrandKit,
  productContext: string,
  insights: ProductInsight[],
): string {
  const base = applyBrandKit(brandKit, productContext, insights).imagePrompt;
  return `${base}\n\nAd (${slot.label}): ${slot.directive}\nAspect ${slot.aspectRatio}.`;
}

function buildVariationPrompt(
  variantName: string,
  brandKit: BrandKit,
  productContext: string,
  insights: ProductInsight[],
): string {
  const base = applyBrandKit(brandKit, productContext, insights).imagePrompt;
  return `${base}\n\nVariation: ${variantName}. Match parent listing style; change only variant appearance. White background hero.`;
}

export async function generateAdCreatives(
  brandKit: BrandKit,
  insights: ProductInsight[],
  productContext: string,
  tier: ImageTier,
  apiKey: string,
  referenceImagesBase64: string[],
) {
  const images = [];
  for (const slot of AD_SLOTS) {
    const prompt = buildAdPrompt(slot, brandKit, productContext.trim(), insights);
    images.push(
      await generateImageFromPrompt(
        prompt,
        tier,
        apiKey,
        referenceImagesBase64,
        slot.aspectRatio,
        { id: `ad-${slot.slotIndex}`, slotType: "ad", slotIndex: slot.slotIndex, label: slot.label },
      ),
    );
  }
  return images;
}

export async function generateVariationImages(
  brandKit: BrandKit,
  insights: ProductInsight[],
  productContext: string,
  tier: ImageTier,
  variants: string[],
  apiKey: string,
  referenceImagesBase64: string[],
) {
  const names = variants.map((v) => v.trim()).filter(Boolean).slice(0, 5);
  if (names.length === 0) throw new Error("At least one variant name is required");

  const images = [];
  for (let i = 0; i < names.length; i++) {
    const variantName = names[i];
    const prompt = buildVariationPrompt(variantName, brandKit, productContext.trim(), insights);
    images.push(
      await generateImageFromPrompt(
        prompt,
        tier,
        apiKey,
        referenceImagesBase64,
        "1:1",
        { id: `variation-${i}`, slotType: "variation", slotIndex: i, label: variantName },
      ),
    );
  }
  return images;
}

export { getTierModel };
