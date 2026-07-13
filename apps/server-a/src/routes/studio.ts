import type { FastifyInstance } from "fastify";
import type {
  ApiProvider,
  GenerateAplusRequest,
  GenerateAdsRequest,
  GenerateVariationsRequest,
  ImageTier,
  LocalizeContentRequest,
  LocaleCode,
} from "@amzi-loci/shared";
import { API_PROVIDERS, IMAGE_TIERS } from "@amzi-loci/shared";
import { getTierModel } from "../lib/image-proxy.js";
import {
  generateAdCreatives,
  generateAplusContent,
  generateVariationImages,
  localizeAplusContent,
} from "../lib/studio.js";
import { validateBrandKit } from "../lib/brandkit-prompt.js";

const PROVIDER_HEADER = "x-amzi-provider-key";
const VALID_TIERS = new Set<ImageTier>(IMAGE_TIERS.map((t) => t.id));
const LOCALES = new Set<LocaleCode>(["de", "fr", "es", "it", "ja", "pt"]);

function getApiKey(request: { headers: Record<string, unknown> }): string | null {
  const value = request.headers[PROVIDER_HEADER];
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function registerStudioRoutes(app: FastifyInstance) {
  app.post<{ Body: GenerateAplusRequest }>("/content/aplus", async (request, reply) => {
    const apiKey = getApiKey(request);
    if (!apiKey) return reply.status(401).send({ error: "Missing BYOK API key header" });

    const { brandKit, insights, productContext, provider } = request.body ?? {};
    const brandError = validateBrandKit(brandKit);
    if (brandError) return reply.status(400).send({ error: brandError });
    if (!Array.isArray(insights)) return reply.status(400).send({ error: "insights array is required" });
    if (!productContext?.trim()) return reply.status(400).send({ error: "productContext is required" });
    if (!API_PROVIDERS.includes(provider as ApiProvider)) {
      return reply.status(400).send({ error: "Invalid provider" });
    }

    try {
      const result = await generateAplusContent(
        brandKit!,
        insights,
        productContext,
        provider as ApiProvider,
        apiKey,
      );
      return reply.status(200).send(result);
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({
        error: err instanceof Error ? err.message : "A+ generation failed",
      });
    }
  });

  app.post<{ Body: LocalizeContentRequest }>("/content/localize", async (request, reply) => {
    const apiKey = getApiKey(request);
    if (!apiKey) return reply.status(401).send({ error: "Missing BYOK API key header" });

    const { modules, targetLocale, provider } = request.body ?? {};
    if (!Array.isArray(modules) || modules.length === 0) {
      return reply.status(400).send({ error: "modules array is required" });
    }
    if (!targetLocale || !LOCALES.has(targetLocale as LocaleCode)) {
      return reply.status(400).send({ error: "Invalid targetLocale" });
    }
    if (!API_PROVIDERS.includes(provider as ApiProvider)) {
      return reply.status(400).send({ error: "Invalid provider" });
    }

    try {
      const result = await localizeAplusContent(
        modules,
        targetLocale as LocaleCode,
        provider as ApiProvider,
        apiKey,
      );
      return reply.status(200).send(result);
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({
        error: err instanceof Error ? err.message : "Localization failed",
      });
    }
  });

  app.post<{ Body: GenerateAdsRequest }>("/ads/generate", async (request, reply) => {
    const apiKey = getApiKey(request);
    if (!apiKey) return reply.status(401).send({ error: "Missing BYOK API key header" });

    const { brandKit, insights, productContext, tier, referenceImagesBase64 } = request.body ?? {};
    const brandError = validateBrandKit(brandKit);
    if (brandError) return reply.status(400).send({ error: brandError });
    if (!Array.isArray(insights)) return reply.status(400).send({ error: "insights array is required" });
    if (!productContext?.trim()) return reply.status(400).send({ error: "productContext is required" });
    if (!tier || !VALID_TIERS.has(tier)) return reply.status(400).send({ error: "Invalid image tier" });

    try {
      const refs = Array.isArray(referenceImagesBase64) ? referenceImagesBase64 : [];
      const images = await generateAdCreatives(
        brandKit!,
        insights,
        productContext,
        tier,
        apiKey,
        refs,
      );
      return reply.status(200).send({ images, model: getTierModel(tier), tier });
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({
        error: err instanceof Error ? err.message : "Ad generation failed",
      });
    }
  });

  app.post<{ Body: GenerateVariationsRequest }>("/variations/generate", async (request, reply) => {
    const apiKey = getApiKey(request);
    if (!apiKey) return reply.status(401).send({ error: "Missing BYOK API key header" });

    const { brandKit, insights, productContext, tier, variants, referenceImagesBase64 } =
      request.body ?? {};
    const brandError = validateBrandKit(brandKit);
    if (brandError) return reply.status(400).send({ error: brandError });
    if (!Array.isArray(insights)) return reply.status(400).send({ error: "insights array is required" });
    if (!productContext?.trim()) return reply.status(400).send({ error: "productContext is required" });
    if (!tier || !VALID_TIERS.has(tier)) return reply.status(400).send({ error: "Invalid image tier" });
    if (!Array.isArray(variants)) return reply.status(400).send({ error: "variants array is required" });

    try {
      const refs = Array.isArray(referenceImagesBase64) ? referenceImagesBase64 : [];
      const images = await generateVariationImages(
        brandKit!,
        insights,
        productContext,
        tier,
        variants,
        apiKey,
        refs,
      );
      return reply.status(200).send({
        images,
        model: getTierModel(tier),
        tier,
        variantCount: images.length,
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({
        error: err instanceof Error ? err.message : "Variation generation failed",
      });
    }
  });
}
