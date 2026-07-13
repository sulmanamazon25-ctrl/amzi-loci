import type { LicensePlan, LicenseStatus, LicenseValidation } from "@amzi-loci/shared";
import { featuresForPlan } from "@amzi-loci/shared";
import { prisma } from "@amzi-loci/database";

const TRIAL_DAYS = Number(process.env.LICENSE_TRIAL_DAYS ?? 14);
const PLAN_DEVICES: Record<string, number> = {
  starter: 1,
  pro: 2,
  agency: 5,
  trial: 2,
  dev: 99,
};

function isDevMode(): boolean {
  return (
    process.env.LICENSE_DEV_MODE === "true" ||
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
  );
}

function devValidation(): LicenseValidation {
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

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function validateDeviceLicense(fingerprint: string): Promise<LicenseValidation> {
  if (isDevMode()) return devValidation();

  let device = await prisma.device.findUnique({ where: { fingerprint }, include: { license: true } });

  if (!device) {
    device = await prisma.device.create({
      data: {
        fingerprint,
        trialEndsAt: addDays(TRIAL_DAYS),
      },
      include: { license: true },
    });
  } else {
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });
  }

  if (!device.license) {
    const trialValid = device.trialEndsAt ? device.trialEndsAt.getTime() > Date.now() : false;
    return {
      valid: trialValid,
      plan: "trial",
      status: trialValid ? "trialing" : "expired",
      expiresAt: device.trialEndsAt?.toISOString() ?? null,
      trialEndsAt: device.trialEndsAt?.toISOString() ?? null,
      deviceRegistered: true,
      maxDevices: PLAN_DEVICES.trial,
      features: trialValid ? featuresForPlan("trial") : featuresForPlan("starter"),
      message: trialValid
        ? `Trial active until ${device.trialEndsAt?.toLocaleDateString()}`
        : "Trial expired — subscribe to continue",
    };
  }

  const license = device.license;
  const active =
    (license.status === "active" || license.status === "trialing") &&
    (!license.expiresAt || license.expiresAt.getTime() > Date.now());

  return {
    valid: active,
    plan: license.plan as LicensePlan,
    status: (active ? license.status : "expired") as LicenseStatus,
    expiresAt: license.expiresAt?.toISOString() ?? null,
    trialEndsAt: device.trialEndsAt?.toISOString() ?? null,
    deviceRegistered: true,
    maxDevices: license.maxDevices,
    features: active ? featuresForPlan(license.plan as LicensePlan) : featuresForPlan("starter"),
    message: active ? `${license.plan} plan active` : "Subscription inactive — renew to continue",
  };
}

export async function attachDeviceToLicense(fingerprint: string, licenseId: string): Promise<void> {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
    include: { devices: true },
  });
  if (!license) throw new Error("License not found");

  const existing = await prisma.device.findUnique({ where: { fingerprint } });
  if (existing?.licenseId === licenseId) return;

  if (license.devices.length >= license.maxDevices) {
    throw new Error(`Device limit reached (${license.maxDevices}) for this plan`);
  }

  await prisma.device.upsert({
    where: { fingerprint },
    create: { fingerprint, licenseId },
    update: { licenseId, lastSeenAt: new Date() },
  });
}

export async function upsertLicenseRecord(data: {
  plan: string;
  status: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  email?: string | null;
  expiresAt?: Date | null;
}) {
  if (data.stripeSubscriptionId) {
    const existing = await prisma.license.findUnique({
      where: { stripeSubscriptionId: data.stripeSubscriptionId },
    });
    if (existing) {
      return prisma.license.update({
        where: { id: existing.id },
        data: {
          plan: data.plan,
          status: data.status,
          email: data.email ?? existing.email,
          expiresAt: data.expiresAt ?? existing.expiresAt,
          maxDevices: PLAN_DEVICES[data.plan] ?? existing.maxDevices,
        },
      });
    }
  }

  return prisma.license.create({
    data: {
      plan: data.plan,
      status: data.status,
      stripeCustomerId: data.stripeCustomerId ?? null,
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      email: data.email ?? null,
      expiresAt: data.expiresAt ?? null,
      maxDevices: PLAN_DEVICES[data.plan] ?? 1,
    },
  });
}
