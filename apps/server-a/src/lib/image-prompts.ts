import type { BrandKit, ImageSlot, ImageSlotType, ProductInsight } from "@amzi-loci/shared";
import { applyBrandKit } from "./brandkit-prompt.js";

export type SlotDefinition = {
  slotType: ImageSlotType;
  slotIndex: number;
  label: string;
  directive: string;
};

export const MAIN_IMAGE_SLOTS: SlotDefinition[] = [
  {
    slotType: "main",
    slotIndex: 0,
    label: "Main hero A",
    directive: "Straight-on hero shot, product centered, pure white background, Amazon main image style.",
  },
  {
    slotType: "main",
    slotIndex: 1,
    label: "Main hero B",
    directive: "Slight 15-degree angle, soft natural shadow, white background, premium e-commerce lighting.",
  },
  {
    slotType: "main",
    slotIndex: 2,
    label: "Main hero C",
    directive: "Dynamic three-quarter angle with subtle brand-color accent lighting, still on white background.",
  },
];

export const GALLERY_IMAGE_SLOTS: SlotDefinition[] = [
  {
    slotType: "gallery",
    slotIndex: 0,
    label: "Lifestyle in use",
    directive: "Lifestyle scene showing the product being used in a realistic home or outdoor setting.",
  },
  {
    slotType: "gallery",
    slotIndex: 1,
    label: "Scale & context",
    directive: "Product next to common objects or in a hand for size reference, clean composition.",
  },
  {
    slotType: "gallery",
    slotIndex: 2,
    label: "Feature detail",
    directive: "Macro close-up highlighting a key material, texture, or build-quality detail.",
  },
  {
    slotType: "gallery",
    slotIndex: 3,
    label: "Benefits visual",
    directive: "Infographic-style layout with minimal text callouts for top customer-loved benefits.",
  },
  {
    slotType: "gallery",
    slotIndex: 4,
    label: "Packaging",
    directive: "Product with packaging or accessories arranged neatly, brand colors as accents.",
  },
];

export const ALL_IMAGE_SLOTS = [...MAIN_IMAGE_SLOTS, ...GALLERY_IMAGE_SLOTS];

export function resolveImageSlots(regenerate?: ImageSlot): SlotDefinition[] {
  if (!regenerate) return ALL_IMAGE_SLOTS;
  const match = ALL_IMAGE_SLOTS.find(
    (slot) =>
      slot.slotType === regenerate.slotType && slot.slotIndex === regenerate.slotIndex,
  );
  if (!match) {
    throw new Error("Invalid image slot for regeneration");
  }
  return [match];
}

export function buildSlotPrompt(
  slot: SlotDefinition,
  brandKit: BrandKit,
  productContext: string,
  insights: ProductInsight[],
): string {
  const base = applyBrandKit(brandKit, productContext, insights).imagePrompt;
  return `${base}\n\nSlot goal (${slot.label}): ${slot.directive}\nAmazon listing image, photorealistic, no watermark, no fake review badges.`;
}
