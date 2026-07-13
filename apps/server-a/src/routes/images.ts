import type { FastifyInstance } from "fastify";
import type { GenerateImagesRequest, ImageTier } from "@amzi-loci/shared";
import { IMAGE_TIERS } from "@amzi-loci/shared";
import { generateImageForSlot, getTierModel } from "../lib/image-proxy.js";
import { resolveImageSlots } from "../lib/image-prompts.js";

const PROVIDER_HEADER = "x-amzi-provider-key";
const VALID_TIERS = new Set<ImageTier>(IMAGE_TIERS.map((tier) => tier.id));

function getApiKey(request: { headers: Record<string, unknown> }): string | null {
  const value = request.headers[PROVIDER_HEADER];
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function registerImageRoutes(app: FastifyInstance) {
  app.post<{ Body: GenerateImagesRequest }>("/image/generate", async (request, reply) => {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return reply.status(401).send({ error: "Missing BYOK API key header" });
    }

    const { brandKit, insights, productContext, tier, referenceImagesBase64, regenerate } =
      request.body ?? {};

    if (!brandKit?.name) {
      return reply.status(400).send({ error: "brandKit is required" });
    }
    if (!Array.isArray(insights)) {
      return reply.status(400).send({ error: "insights array is required" });
    }
    if (!productContext?.trim()) {
      return reply.status(400).send({ error: "productContext is required" });
    }
    if (!tier || !VALID_TIERS.has(tier)) {
      return reply.status(400).send({ error: "Invalid image tier" });
    }

    const refs = Array.isArray(referenceImagesBase64) ? referenceImagesBase64 : [];
    const slots = resolveImageSlots(regenerate);
    const images = [];

    try {
      for (const slot of slots) {
        const image = await generateImageForSlot(
          slot,
          brandKit,
          productContext.trim(),
          insights,
          tier,
          apiKey,
          refs,
        );
        images.push(image);
      }

      return reply.status(200).send({
        images,
        model: getTierModel(tier),
        tier,
      });
    } catch (err) {
      request.log.error(err);
      const message = err instanceof Error ? err.message : "Image generation failed";
      return reply.status(502).send({ error: message });
    }
  });
}
