import type { ApplyBrandKitResponse, BrandKit, ProductInsight } from "@amzi-loci/shared";
import { BRAND_FONT_OPTIONS } from "@amzi-loci/shared";

function describeTone(kit: BrandKit): string {
  const traits: string[] = [];
  if (kit.toneProfessional >= 70) traits.push("professional and trustworthy");
  else if (kit.toneProfessional <= 30) traits.push("casual and approachable");

  if (kit.tonePlayful >= 70) traits.push("energetic and playful");
  else if (kit.tonePlayful <= 30) traits.push("restrained and serious");

  if (kit.toneLuxury >= 70) traits.push("premium and luxurious");
  else if (kit.toneLuxury <= 30) traits.push("practical and value-focused");

  if (traits.length === 0) {
    return "balanced, marketplace-friendly";
  }
  return traits.join(", ");
}

function insightHighlights(insights: ProductInsight[] | undefined): string {
  if (!insights?.length) return "Highlight the product's core benefits clearly.";

  const drivers = insights
    .filter((item) => item.conversionDriver)
    .map((item) => item.feature.trim())
    .filter(Boolean);

  if (drivers.length === 0) {
    return insights
      .slice(0, 3)
      .map((item) => item.feature.trim())
      .filter(Boolean)
      .join("; ");
  }

  return drivers.join("; ");
}

export function applyBrandKit(
  brandKit: BrandKit,
  productContext?: string,
  insights?: ProductInsight[],
): ApplyBrandKitResponse {
  const product = productContext?.trim() || "the product";
  const tone = describeTone(brandKit);
  const highlights = insightHighlights(insights);
  const refCount = brandKit.referenceImages.length;

  const styleSummary = [
    `Colors: ${brandKit.primaryColor} (primary), ${brandKit.secondaryColor} (secondary)`,
    `Font direction: ${brandKit.fontFamily}`,
    `Tone: ${tone}`,
    brandKit.toneOfVoice.trim() ? `Voice: ${brandKit.toneOfVoice.trim()}` : null,
    refCount > 0 ? `${refCount} local reference image(s) attached` : "No reference images",
  ]
    .filter(Boolean)
    .join(" · ");

  const imagePrompt = [
    "Create a professional Amazon marketplace product listing hero image.",
    `Product: ${product}.`,
    `Brand palette — primary ${brandKit.primaryColor}, secondary ${brandKit.secondaryColor}; use these as accent lighting, props, or subtle background tones without overpowering the product.`,
    `Typography and graphic style should feel like ${brandKit.fontFamily}: clean hierarchy, legible if any callouts appear later.`,
    `Visual mood: ${tone}.`,
    brandKit.toneOfVoice.trim()
      ? `Brand voice guidance: ${brandKit.toneOfVoice.trim()}.`
      : null,
    `Emphasize customer-validated selling points: ${highlights}.`,
    refCount > 0
      ? "Match composition, lighting, and aesthetic cues from the brand reference images provided alongside this brief."
      : null,
    "Requirements: pure white or very light neutral background, product as clear hero, high resolution, e-commerce ready, no watermarks, no fake badges, no cluttered text overlays.",
  ]
    .filter(Boolean)
    .join("\n");

  return { imagePrompt, styleSummary };
}

function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function validateBrandKit(kit: BrandKit | undefined): string | null {
  if (!kit || typeof kit !== "object") return "brandKit is required";
  if (!kit.name?.trim()) return "brandKit.name is required";
  if (!isValidHexColor(kit.primaryColor)) return "Invalid primaryColor (use #RRGGBB)";
  if (!isValidHexColor(kit.secondaryColor)) return "Invalid secondaryColor (use #RRGGBB)";
  if (!BRAND_FONT_OPTIONS.includes(kit.fontFamily)) return "Invalid fontFamily";
  if (!Array.isArray(kit.referenceImages) || kit.referenceImages.length > 3) {
    return "referenceImages must have at most 3 entries";
  }
  return null;
}
