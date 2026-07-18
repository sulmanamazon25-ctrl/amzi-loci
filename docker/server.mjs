import Fastify from "fastify";
import cors from "@fastify/cors";
import { extractInsights } from "./insights.mjs";
import { applyBrandKit, validateBrandKit } from "./brandkit.mjs";
import { generateImages, VALID_TIERS } from "./images.mjs";
import { generateAplus, generateAds, generateVariations, localizeContent } from "./studio.mjs";
import { generateListingCopy } from "./listing-copy.mjs";
import {
  validateLicense,
  createStripeCheckout,
  syncCheckoutSession,
  handleStripeWebhookEvent,
} from "./license.mjs";
import Stripe from "stripe";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const PROVIDERS = ["anthropic", "openai", "google"];
const LICENSE_PLANS = new Set(["starter", "pro", "agency"]);

let stripeClient = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

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
    message: "Amzi Loci API — Phase 8",
    service: "amzi-loci",
    version: "0.9.0",
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

app.post("/brandkit/apply", async (request, reply) => {
  const { brandKit, productContext, insights } = request.body ?? {};
  const validationError = validateBrandKit(brandKit);
  if (validationError) {
    return reply.status(400).send({ error: validationError });
  }

  const result = applyBrandKit(brandKit, productContext, insights);
  return reply.status(200).send(result);
});

app.post("/image/generate", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
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

  try {
    const result = await generateImages(
      { brandKit, insights, productContext, tier, referenceImagesBase64, regenerate },
      apiKey.trim(),
    );
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    const message = err instanceof Error ? err.message : "Image generation failed";
    return reply.status(502).send({ error: message });
  }
});

const STUDIO_PROVIDERS = ["anthropic", "openai", "google"];

app.post("/content/aplus", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return reply.status(401).send({ error: "Missing BYOK API key header" });
  }
  const { brandKit, insights, productContext, provider } = request.body ?? {};
  const validationError = validateBrandKit(brandKit);
  if (validationError) return reply.status(400).send({ error: validationError });
  if (!STUDIO_PROVIDERS.includes(provider)) return reply.status(400).send({ error: "Invalid provider" });
  try {
    const result = await generateAplus({ brandKit, insights, productContext }, apiKey.trim(), provider);
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.status(502).send({ error: err instanceof Error ? err.message : "A+ generation failed" });
  }
});

app.post("/content/localize", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return reply.status(401).send({ error: "Missing BYOK API key header" });
  }
  const { modules, targetLocale, provider } = request.body ?? {};
  if (!STUDIO_PROVIDERS.includes(provider)) return reply.status(400).send({ error: "Invalid provider" });
  try {
    const result = await localizeContent({ modules, targetLocale }, apiKey.trim(), provider);
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.status(502).send({ error: err instanceof Error ? err.message : "Localization failed" });
  }
});

app.post("/ads/generate", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return reply.status(401).send({ error: "Missing BYOK API key header" });
  }
  const body = request.body ?? {};
  const validationError = validateBrandKit(body.brandKit);
  if (validationError) return reply.status(400).send({ error: validationError });
  if (!VALID_TIERS.has(body.tier)) return reply.status(400).send({ error: "Invalid image tier" });
  try {
    const result = await generateAds(body, apiKey.trim());
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.status(502).send({ error: err instanceof Error ? err.message : "Ad generation failed" });
  }
});

app.post("/variations/generate", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return reply.status(401).send({ error: "Missing BYOK API key header" });
  }
  const body = request.body ?? {};
  const validationError = validateBrandKit(body.brandKit);
  if (validationError) return reply.status(400).send({ error: validationError });
  if (!VALID_TIERS.has(body.tier)) return reply.status(400).send({ error: "Invalid image tier" });
  try {
    const result = await generateVariations(body, apiKey.trim());
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.status(502).send({ error: err instanceof Error ? err.message : "Variation generation failed" });
  }
});

app.post("/content/listing-copy", async (request, reply) => {
  const apiKey = request.headers["x-amzi-provider-key"];
  if (!apiKey || typeof apiKey !== "string") {
    return reply.status(401).send({ error: "Missing BYOK API key header" });
  }
  const { brandKit, insights, productContext, provider } = request.body ?? {};
  const validationError = validateBrandKit(brandKit);
  if (validationError) return reply.status(400).send({ error: validationError });
  if (!Array.isArray(insights) || insights.length === 0) {
    return reply.status(400).send({ error: "insights array is required" });
  }
  if (!productContext?.trim()) {
    return reply.status(400).send({ error: "productContext is required" });
  }
  if (!PROVIDERS.includes(provider)) return reply.status(400).send({ error: "Invalid provider" });
  try {
    const result = await generateListingCopy(
      { brandKit, insights, productContext, provider },
      apiKey.trim(),
      provider,
    );
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply
      .status(502)
      .send({ error: err instanceof Error ? err.message : "Listing copy generation failed" });
  }
});

app.get("/license/validate", async (request, reply) => {
  const fingerprint = request.query.deviceFingerprint;
  if (!fingerprint || typeof fingerprint !== "string") {
    return reply.status(400).send({ error: "deviceFingerprint query param is required" });
  }
  return reply.status(200).send(validateLicense(fingerprint.trim()));
});

app.post("/license/checkout", async (request, reply) => {
  const stripe = getStripe();
  if (!stripe) {
    return reply.status(503).send({ error: "Stripe is not configured on this server" });
  }
  const { plan, deviceFingerprint, email } = request.body ?? {};
  if (!LICENSE_PLANS.has(plan)) {
    return reply.status(400).send({ error: "Invalid plan" });
  }
  if (!deviceFingerprint?.trim()) {
    return reply.status(400).send({ error: "deviceFingerprint is required" });
  }
  try {
    const result = await createStripeCheckout(stripe, {
      plan,
      deviceFingerprint: deviceFingerprint.trim(),
      email,
    });
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.status(502).send({ error: err instanceof Error ? err.message : "Checkout failed" });
  }
});

app.post("/license/sync", async (request, reply) => {
  const stripe = getStripe();
  if (!stripe) {
    return reply.status(503).send({ error: "Stripe is not configured on this server" });
  }
  const { sessionId, deviceFingerprint } = request.body ?? {};
  if (!sessionId?.trim() || !deviceFingerprint?.trim()) {
    return reply.status(400).send({ error: "sessionId and deviceFingerprint are required" });
  }
  try {
    const result = await syncCheckoutSession(stripe, sessionId.trim(), deviceFingerprint.trim());
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.status(502).send({ error: err instanceof Error ? err.message : "License sync failed" });
  }
});

app.post("/webhooks/stripe", async (request, reply) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    let event = request.body;
    if (stripe && webhookSecret && request.headers["stripe-signature"]) {
      event = stripe.webhooks.constructEvent(
        JSON.stringify(request.body),
        request.headers["stripe-signature"],
        webhookSecret,
      );
    }
    handleStripeWebhookEvent(event);
    return reply.status(200).send({ received: true });
  } catch (err) {
    request.log.error(err);
    return reply.status(400).send({ error: err instanceof Error ? err.message : "Webhook error" });
  }
});

await app.listen({ port, host });
console.log(`Amzi Loci API listening on http://${host}:${port}`);
