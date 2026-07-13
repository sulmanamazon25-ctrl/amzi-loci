import Fastify from "fastify";
import cors from "@fastify/cors";
import { extractInsights } from "./insights.mjs";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const PROVIDERS = ["anthropic", "openai", "google"];

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: true,
  allowedHeaders: ["Content-Type", "X-Amzi-Provider-Key"],
});

app.get("/health", async (_request, reply) => {
  return reply.status(200).send({
    status: "ok",
    service: "amzi-loci",
    db: process.env.DATABASE_URL ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", async (_request, reply) => {
  return reply.status(200).send({
    message: "Amzi Loci API — Phase 2",
    service: "amzi-loci",
    version: "0.3.0",
  });
});

app.post("/insights/extract", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return reply.status(401).send({ error: "Missing BYOK API key header" });
  }

  const { reviews, provider } = request.body ?? {};
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return reply.status(400).send({ error: "reviews array is required" });
  }
  if (!PROVIDERS.includes(provider)) {
    return reply.status(400).send({ error: "Invalid provider" });
  }

  try {
    const result = await extractInsights(reviews, provider, apiKey.trim());
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    const message = err instanceof Error ? err.message : "Insight extraction failed";
    return reply.status(502).send({ error: message });
  }
});

await app.listen({ port, host });
console.log(`Amzi Loci API listening on http://${host}:${port}`);
