import type { FastifyInstance } from "fastify";
import type { BrandKit, GenerateListingCopyRequest, ListingCopy, ProductInsight } from "@amzi-loci/shared";
import { validateBrandKit } from "../lib/brandkit-prompt.js";
import { generateListingCopy } from "../lib/listing-copy.js";

const PROVIDERS = new Set(["anthropic", "openai", "google"]);

export async function registerListingCopyRoutes(app: FastifyInstance) {
  app.post<{ Body: GenerateListingCopyRequest }>("/content/listing-copy", async (request, reply) => {
    const apiKey = request.headers["x-amzi-provider-key"];
    if (!apiKey || typeof apiKey !== "string") {
      return reply.status(401).send({ error: "Missing BYOK API key header" });
    }

    const body = request.body ?? {};
    const validationError = validateBrandKit(body.brandKit as BrandKit);
    if (validationError) return reply.status(400).send({ error: validationError });
    if (!Array.isArray(body.insights) || body.insights.length === 0) {
      return reply.status(400).send({ error: "insights array is required" });
    }
    if (!body.productContext?.trim()) {
      return reply.status(400).send({ error: "productContext is required" });
    }
    if (!PROVIDERS.has(body.provider)) {
      return reply.status(400).send({ error: "Invalid provider" });
    }

    try {
      const result = await generateListingCopy(body, apiKey.trim());
      return reply.status(200).send(result);
    } catch (err) {
      request.log.error(err);
      return reply
        .status(502)
        .send({ error: err instanceof Error ? err.message : "Listing copy generation failed" });
    }
  });
}
