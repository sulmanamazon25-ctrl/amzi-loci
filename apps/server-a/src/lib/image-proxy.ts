import type { GeneratedImage, ImageTier } from "@amzi-loci/shared";
import type { SlotDefinition } from "./image-prompts.js";
import { buildSlotPrompt } from "./image-prompts.js";
import type { BrandKit, ProductInsight } from "@amzi-loci/shared";

const TIER_MODELS: Record<ImageTier, { model: string; mode: "imagen" | "gemini" }> = {
  "imagen-fast": { model: "imagen-4.0-fast-generate-001", mode: "imagen" },
  "gemini-flash": { model: "gemini-2.5-flash-preview-image-generation", mode: "gemini" },
  "nano-banana-pro": { model: "gemini-2.5-pro-preview-image-generation", mode: "gemini" },
};

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function generateWithImagen(
  prompt: string,
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
): Promise<{ mimeType: string; base64: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Imagen API error (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    predictions?: Array<{
      bytesBase64Encoded?: string;
      mimeType?: string;
      image?: { imageBytes?: string };
    }>;
    generatedImages?: Array<{ image?: { imageBytes?: string } }>;
  };

  const prediction = data.predictions?.[0];
  const base64 =
    prediction?.bytesBase64Encoded ??
    prediction?.image?.imageBytes ??
    data.generatedImages?.[0]?.image?.imageBytes;

  if (!base64) {
    throw new Error("Imagen returned no image data");
  }

  return {
    mimeType: prediction?.mimeType ?? "image/png",
    base64,
  };
}

async function generateWithGemini(
  prompt: string,
  model: string,
  apiKey: string,
  referenceImagesBase64: string[],
  aspectRatio = "1:1",
): Promise<{ mimeType: string; base64: string }> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  for (const ref of referenceImagesBase64.slice(0, 3)) {
    const parsed = parseDataUrl(ref);
    if (parsed) {
      parts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.data } });
    }
  }

  parts.push({ text: prompt });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini image API error (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; data?: string };
        }>;
      };
    }>;
  };

  const imagePart = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini returned no image data");
  }

  return {
    mimeType: imagePart.inlineData.mimeType ?? "image/png",
    base64: imagePart.inlineData.data,
  };
}

export async function generateImageFromPrompt(
  prompt: string,
  tier: ImageTier,
  apiKey: string,
  referenceImagesBase64: string[],
  aspectRatio: string,
  meta: { id: string; slotType: string; slotIndex: number; label: string },
): Promise<GeneratedImage> {
  const config = TIER_MODELS[tier];
  const image =
    config.mode === "imagen"
      ? await generateWithImagen(prompt, config.model, apiKey, aspectRatio)
      : await generateWithGemini(prompt, config.model, apiKey, referenceImagesBase64, aspectRatio);

  return {
    id: meta.id,
    slotType: meta.slotType as GeneratedImage["slotType"],
    slotIndex: meta.slotIndex,
    label: meta.label,
    prompt,
    mimeType: image.mimeType,
    base64: image.base64,
  };
}

export async function generateImageForSlot(
  slot: SlotDefinition,
  brandKit: BrandKit,
  productContext: string,
  insights: ProductInsight[],
  tier: ImageTier,
  apiKey: string,
  referenceImagesBase64: string[],
): Promise<GeneratedImage> {
  const config = TIER_MODELS[tier];
  const prompt = buildSlotPrompt(slot, brandKit, productContext, insights);

  const image =
    config.mode === "imagen"
      ? await generateWithImagen(prompt, config.model, apiKey)
      : await generateWithGemini(prompt, config.model, apiKey, referenceImagesBase64);

  return {
    id: `${slot.slotType}-${slot.slotIndex}`,
    slotType: slot.slotType,
    slotIndex: slot.slotIndex,
    label: slot.label,
    prompt,
    mimeType: image.mimeType,
    base64: image.base64,
  };
}

export function getTierModel(tier: ImageTier): string {
  return TIER_MODELS[tier].model;
}
