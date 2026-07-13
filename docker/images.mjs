import { applyBrandKit } from "./brandkit.mjs";

export const MAIN_IMAGE_SLOTS = [
  {
    slotType: "main",
    slotIndex: 0,
    label: "Main hero A",
    directive:
      "Straight-on hero shot, product centered, pure white background, Amazon main image style.",
  },
  {
    slotType: "main",
    slotIndex: 1,
    label: "Main hero B",
    directive:
      "Slight 15-degree angle, soft natural shadow, white background, premium e-commerce lighting.",
  },
  {
    slotType: "main",
    slotIndex: 2,
    label: "Main hero C",
    directive:
      "Dynamic three-quarter angle with subtle brand-color accent lighting, still on white background.",
  },
];

export const GALLERY_IMAGE_SLOTS = [
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

export function resolveImageSlots(regenerate) {
  if (!regenerate) return ALL_IMAGE_SLOTS;
  const match = ALL_IMAGE_SLOTS.find(
    (slot) => slot.slotType === regenerate.slotType && slot.slotIndex === regenerate.slotIndex,
  );
  if (!match) throw new Error("Invalid image slot for regeneration");
  return [match];
}

export function buildSlotPrompt(slot, brandKit, productContext, insights) {
  const base = applyBrandKit(brandKit, productContext, insights).imagePrompt;
  return `${base}\n\nSlot goal (${slot.label}): ${slot.directive}\nAmazon listing image, photorealistic, no watermark, no fake review badges.`;
}

export const TIER_MODELS = {
  "imagen-fast": { model: "imagen-4.0-fast-generate-001", mode: "imagen" },
  "gemini-flash": { model: "gemini-2.5-flash-preview-image-generation", mode: "gemini" },
  "nano-banana-pro": { model: "gemini-2.5-pro-preview-image-generation", mode: "gemini" },
};

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function generateWithImagen(prompt, model, apiKey, aspectRatio = "1:1") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio },
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Imagen API error (${response.status}): ${body.slice(0, 300)}`);
  }
  const data = await response.json();
  const prediction = data.predictions?.[0];
  const base64 =
    prediction?.bytesBase64Encoded ??
    prediction?.image?.imageBytes ??
    data.generatedImages?.[0]?.image?.imageBytes;
  if (!base64) throw new Error("Imagen returned no image data");
  return { mimeType: prediction?.mimeType ?? "image/png", base64 };
}

async function generateWithGemini(prompt, model, apiKey, referenceImagesBase64, aspectRatio = "1:1") {
  const parts = [];
  for (const ref of referenceImagesBase64.slice(0, 3)) {
    const parsed = parseDataUrl(ref);
    if (parsed) parts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.data } });
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
  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) throw new Error("Gemini returned no image data");
  return {
    mimeType: imagePart.inlineData.mimeType ?? "image/png",
    base64: imagePart.inlineData.data,
  };
}

export async function generateSingleImage({ prompt, tier, apiKey, refs = [], aspectRatio = "1:1" }) {
  const config = TIER_MODELS[tier];
  if (!config) throw new Error("Invalid image tier");
  if (config.mode === "imagen") {
    return generateWithImagen(prompt, config.model, apiKey, aspectRatio);
  }
  return generateWithGemini(prompt, config.model, apiKey, refs, aspectRatio);
}

export async function generateImages(body, apiKey) {
  const { brandKit, insights, productContext, tier, referenceImagesBase64, regenerate } = body;
  const refs = Array.isArray(referenceImagesBase64) ? referenceImagesBase64 : [];
  const slots = resolveImageSlots(regenerate);
  const config = TIER_MODELS[tier];
  const images = [];

  for (const slot of slots) {
    const prompt = buildSlotPrompt(slot, brandKit, productContext.trim(), insights);
    const image =
      config.mode === "imagen"
        ? await generateWithImagen(prompt, config.model, apiKey)
        : await generateWithGemini(prompt, config.model, apiKey, refs);

    images.push({
      id: `${slot.slotType}-${slot.slotIndex}`,
      slotType: slot.slotType,
      slotIndex: slot.slotIndex,
      label: slot.label,
      prompt,
      mimeType: image.mimeType,
      base64: image.base64,
    });
  }

  return { images, model: config.model, tier };
}

export const VALID_TIERS = new Set(Object.keys(TIER_MODELS));
