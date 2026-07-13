import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const TRIAL_DAYS = Number(process.env.LICENSE_TRIAL_DAYS ?? 14);
const DATA_PATH = process.env.LICENSE_DATA_PATH ?? join(process.cwd(), "data", "licenses.json");

const PLAN_DEVICES = {
  starter: 1,
  pro: 2,
  agency: 5,
  trial: 2,
  dev: 99,
};

function featuresForPlan(plan) {
  if (plan === "starter") {
    return { workflow: true, studio: false, maxImagesPerRun: 8 };
  }
  if (plan === "agency" || plan === "pro" || plan === "trial" || plan === "dev") {
    return { workflow: true, studio: true, maxImagesPerRun: 8 };
  }
  return { workflow: false, studio: false, maxImagesPerRun: 0 };
}

function isDevMode() {
  return (
    process.env.LICENSE_DEV_MODE === "true" ||
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
  );
}

function loadStore() {
  if (!existsSync(DATA_PATH)) {
    return { devices: {}, licenses: {} };
  }
  return JSON.parse(readFileSync(DATA_PATH, "utf8"));
}

function saveStore(store) {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isExpired(iso) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function validateLicense(fingerprint) {
  if (isDevMode()) {
    return {
      valid: true,
      plan: "dev",
      status: "active",
      expiresAt: null,
      trialEndsAt: null,
      deviceRegistered: true,
      maxDevices: PLAN_DEVICES.dev,
      features: featuresForPlan("dev"),
      message: "Development mode — all features unlocked",
    };
  }

  const store = loadStore();
  let device = store.devices[fingerprint];

  if (!device) {
    device = {
      fingerprint,
      licenseId: null,
      trialEndsAt: addDays(TRIAL_DAYS),
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
    };
    store.devices[fingerprint] = device;
    saveStore(store);
  } else {
    device.lastSeenAt = nowIso();
    saveStore(store);
  }

  if (!device.licenseId) {
    const trialValid = !isExpired(device.trialEndsAt);
    return {
      valid: trialValid,
      plan: "trial",
      status: trialValid ? "trialing" : "expired",
      expiresAt: device.trialEndsAt,
      trialEndsAt: device.trialEndsAt,
      deviceRegistered: true,
      maxDevices: PLAN_DEVICES.trial,
      features: trialValid ? featuresForPlan("trial") : featuresForPlan("expired"),
      message: trialValid
        ? `Trial active until ${new Date(device.trialEndsAt).toLocaleDateString()}`
        : "Trial expired — subscribe to continue",
    };
  }

  const license = store.licenses[device.licenseId];
  if (!license) {
    return {
      valid: false,
      plan: "starter",
      status: "expired",
      expiresAt: null,
      trialEndsAt: device.trialEndsAt ?? null,
      deviceRegistered: true,
      maxDevices: 0,
      features: featuresForPlan("expired"),
      message: "License record missing — contact support",
    };
  }

  const active =
    license.status === "active" &&
    (!license.expiresAt || !isExpired(license.expiresAt));

  return {
    valid: active,
    plan: license.plan,
    status: active ? license.status : "expired",
    expiresAt: license.expiresAt ?? null,
    trialEndsAt: device.trialEndsAt ?? null,
    deviceRegistered: true,
    maxDevices: license.maxDevices ?? PLAN_DEVICES[license.plan] ?? 1,
    features: active ? featuresForPlan(license.plan) : featuresForPlan("expired"),
    message: active
      ? `${license.plan} plan active`
      : "Subscription inactive — renew to continue",
  };
}

export function attachLicenseToDevice(fingerprint, licenseId) {
  const store = loadStore();
  const license = store.licenses[licenseId];
  if (!license) throw new Error("License not found");

  const devicesOnLicense = Object.values(store.devices).filter(
    (d) => d.licenseId === licenseId,
  );
  const maxDevices = license.maxDevices ?? PLAN_DEVICES[license.plan] ?? 1;
  const alreadyRegistered = Boolean(store.devices[fingerprint]?.licenseId === licenseId);

  if (!alreadyRegistered && devicesOnLicense.length >= maxDevices) {
    throw new Error(`Device limit reached (${maxDevices}) for this plan`);
  }

  store.devices[fingerprint] = {
    ...(store.devices[fingerprint] ?? { fingerprint, createdAt: nowIso(), trialEndsAt: null }),
    fingerprint,
    licenseId,
    lastSeenAt: nowIso(),
  };
  saveStore(store);
}

export function upsertLicenseFromStripe({
  licenseId,
  plan,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  email,
  expiresAt,
}) {
  const store = loadStore();
  store.licenses[licenseId] = {
    id: licenseId,
    plan,
    status,
    stripeCustomerId: stripeCustomerId ?? null,
    stripeSubscriptionId: stripeSubscriptionId ?? null,
    email: email ?? null,
    expiresAt: expiresAt ?? null,
    maxDevices: PLAN_DEVICES[plan] ?? 1,
    updatedAt: nowIso(),
  };
  saveStore(store);
  return store.licenses[licenseId];
}

export function newLicenseId() {
  return `lic_${createHash("sha256").update(nowIso() + Math.random()).digest("hex").slice(0, 12)}`;
}

export async function createStripeCheckout(stripe, { plan, deviceFingerprint, email }) {
  const priceMap = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    agency: process.env.STRIPE_PRICE_AGENCY,
  };
  const priceId = priceMap[plan];
  if (!priceId) throw new Error(`Stripe price not configured for plan: ${plan}`);

  const successUrl =
    process.env.STRIPE_SUCCESS_URL ??
    "https://checkout.stripe.com/success?session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl = process.env.STRIPE_CANCEL_URL ?? "https://checkout.stripe.com/cancel";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email || undefined,
    metadata: {
      plan,
      deviceFingerprint,
    },
    subscription_data: {
      metadata: {
        plan,
        deviceFingerprint,
      },
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id };
}

export async function syncCheckoutSession(stripe, sessionId, deviceFingerprint) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") {
    throw new Error("Checkout session not completed");
  }

  const plan = session.metadata?.plan;
  if (!plan) throw new Error("Missing plan in checkout session");

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const licenseId = newLicenseId();
  upsertLicenseFromStripe({
    licenseId,
    plan,
    status: "active",
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
    stripeSubscriptionId: subscriptionId,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    expiresAt: null,
  });
  attachLicenseToDevice(deviceFingerprint, licenseId);
  return validateLicense(deviceFingerprint);
}

export function handleStripeWebhookEvent(event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const plan = session.metadata?.plan;
    const deviceFingerprint = session.metadata?.deviceFingerprint;
    if (!plan || !deviceFingerprint) return;

    const licenseId = newLicenseId();
    upsertLicenseFromStripe({
      licenseId,
      plan,
      status: "active",
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      stripeSubscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      expiresAt: null,
    });
    attachLicenseToDevice(deviceFingerprint, licenseId);
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const store = loadStore();
    const license = Object.values(store.licenses).find(
      (l) => l.stripeSubscriptionId === sub.id,
    );
    if (!license) return;

    license.status = sub.status === "active" ? "active" : sub.status === "trialing" ? "trialing" : "cancelled";
    if (sub.cancel_at) {
      license.expiresAt = new Date(sub.cancel_at * 1000).toISOString();
    }
    license.updatedAt = nowIso();
    store.licenses[license.id] = license;
    saveStore(store);
  }
}
