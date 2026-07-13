import type { ImageSlot, ImageTier, ProductInsight } from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";

export type GeneratedImage = {
  id: string;
  slotType: string;
  slotIndex: number;
  label: string;
  prompt: string;
  mimeType: string;
  localPath: string;
  dataUrl: string;
};

export type GenerateImagesResult = {
  images: GeneratedImage[];
  model: string;
  tier: string;
};

export async function generateImages(
  serverUrl: string,
  brandKitId: string,
  insights: ProductInsight[],
  productContext: string,
  tier: ImageTier,
  regenerate?: ImageSlot,
): Promise<GenerateImagesResult> {
  return invoke<GenerateImagesResult>("generate_images", {
    serverUrl,
    brandKitId,
    insights,
    productContext,
    tier,
    regenerate: regenerate
      ? { slotType: regenerate.slotType, slotIndex: regenerate.slotIndex }
      : null,
  });
}
