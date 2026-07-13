import type { FastifyInstance } from "fastify";
import type { ApiProvider, ExtractInsightsRequest } from "@amzi-loci/shared";
import { API_PROVIDERS } from "@amzi-loci/shared";
import { extractInsights } from "../lib/ai-proxy.js";

const PROVIDER_HEADER = "x-amzi-provider-key";

function getApiKey(request: { headers: Record<string, unknown> }): string | null {
  const value = request.headers[PROVIDER_HEADER];
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function registerInsightRoutes(app: FastifyInstance) {
  app.post<{ Body: ExtractInsightsRequest }>("/insights/extract", async (request, reply) => {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return reply.status(401).send({ error: "Missing BYOK API key header" });
    }

    const { reviews, provider } = request.body ?? {};
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return reply.status(400).send({ error: "reviews array is required" });
    }
    if (!API_PROVIDERS.includes(provider as ApiProvider)) {
      return reply.status(400).send({ error: "Invalid provider" });
    }

    try {
      const result = await extractInsights(reviews, provider as ApiProvider, apiKey);
      return reply.status(200).send(result);
    } catch (err) {
      request.log.error(err);
      const message = err instanceof Error ? err.message : "Insight extraction failed";
      return reply.status(502).send({ error: message });
    }
  });
}
