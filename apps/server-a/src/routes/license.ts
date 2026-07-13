import type { FastifyInstance } from "fastify";
import type { CreateCheckoutRequest, SyncCheckoutRequest } from "@amzi-loci/shared";
import { prisma } from "@amzi-loci/database";
import Stripe from "stripe";
import {
  attachDeviceToLicense,
  upsertLicenseRecord,
  validateDeviceLicense,
} from "../lib/license-service.js";

const LICENSE_PLANS = new Set(["starter", "pro", "agency"]);

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function registerLicenseRoutes(app: FastifyInstance) {
  app.get("/license/validate", async (request, reply) => {
    const fingerprint = (request.query as { deviceFingerprint?: string }).deviceFingerprint;
    if (!fingerprint?.trim()) {
      return reply.status(400).send({ error: "deviceFingerprint query param is required" });
    }
    try {
      const result = await validateDeviceLicense(fingerprint.trim());
      return reply.status(200).send(result);
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({ error: "License validation failed" });
    }
  });

  app.post<{ Body: CreateCheckoutRequest }>("/license/checkout", async (request, reply) => {
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

    const priceMap: Record<string, string | undefined> = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      agency: process.env.STRIPE_PRICE_AGENCY,
    };
    const priceId = priceMap[plan];
    if (!priceId) {
      return reply.status(503).send({ error: `Stripe price not configured for plan: ${plan}` });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url:
          process.env.STRIPE_SUCCESS_URL ??
          "https://checkout.stripe.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: process.env.STRIPE_CANCEL_URL ?? "https://checkout.stripe.com/cancel",
        customer_email: email,
        metadata: { plan, deviceFingerprint: deviceFingerprint.trim() },
        subscription_data: {
          metadata: { plan, deviceFingerprint: deviceFingerprint.trim() },
        },
      });

      return reply.status(200).send({
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({ error: err instanceof Error ? err.message : "Checkout failed" });
    }
  });

  app.post<{ Body: SyncCheckoutRequest }>("/license/sync", async (request, reply) => {
    const stripe = getStripe();
    if (!stripe) {
      return reply.status(503).send({ error: "Stripe is not configured on this server" });
    }

    const { sessionId, deviceFingerprint } = request.body ?? {};
    if (!sessionId?.trim() || !deviceFingerprint?.trim()) {
      return reply.status(400).send({ error: "sessionId and deviceFingerprint are required" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId.trim());
      if (session.payment_status !== "paid" && session.status !== "complete") {
        return reply.status(400).send({ error: "Checkout session not completed" });
      }

      const plan = session.metadata?.plan;
      if (!plan || !LICENSE_PLANS.has(plan as "starter")) {
        return reply.status(400).send({ error: "Missing plan in checkout session" });
      }

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      const license = await upsertLicenseRecord({
        plan,
        status: "active",
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripeSubscriptionId: subscriptionId ?? null,
        email: session.customer_details?.email ?? session.customer_email ?? null,
      });

      await attachDeviceToLicense(deviceFingerprint.trim(), license.id);
      const validation = await validateDeviceLicense(deviceFingerprint.trim());
      return reply.status(200).send(validation);
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({ error: err instanceof Error ? err.message : "License sync failed" });
    }
  });

  app.post("/webhooks/stripe", async (request, reply) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      let event = request.body as Stripe.Event;
      if (stripe && webhookSecret && request.headers["stripe-signature"]) {
        event = stripe.webhooks.constructEvent(
          JSON.stringify(request.body),
          request.headers["stripe-signature"] as string,
          webhookSecret,
        );
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const plan = session.metadata?.plan;
        const deviceFingerprint = session.metadata?.deviceFingerprint;
        if (plan && deviceFingerprint) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          const license = await upsertLicenseRecord({
            plan,
            status: "active",
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : session.customer?.id,
            stripeSubscriptionId: subscriptionId ?? null,
            email: session.customer_details?.email ?? session.customer_email ?? null,
          });
          await attachDeviceToLicense(deviceFingerprint, license.id);
        }
      }

      if (
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted"
      ) {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await prisma.license.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existing) {
          await prisma.license.update({
            where: { id: existing.id },
            data: {
              status: sub.status === "active" ? "active" : sub.status,
              expiresAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : existing.expiresAt,
            },
          });
        }
      }

      return reply.status(200).send({ received: true });
    } catch (err) {
      request.log.error(err);
      return reply.status(400).send({ error: err instanceof Error ? err.message : "Webhook error" });
    }
  });
}
