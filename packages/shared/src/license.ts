export type LicensePlan = "trial" | "starter" | "pro" | "agency" | "dev";

export type LicenseStatus = "active" | "trialing" | "past_due" | "cancelled" | "expired";

export type LicenseValidation = {
  valid: boolean;
  plan: LicensePlan;
  status: LicenseStatus;
  expiresAt: string | null;
  trialEndsAt: string | null;
  deviceRegistered: boolean;
  maxDevices: number;
  features: LicenseFeatures;
  message: string;
};

export type LicenseFeatures = {
  workflow: boolean;
  studio: boolean;
  maxImagesPerRun: number;
};

export type CreateCheckoutRequest = {
  plan: Exclude<LicensePlan, "trial" | "dev">;
  deviceFingerprint: string;
  email?: string;
};

export type CreateCheckoutResponse = {
  checkoutUrl: string;
  sessionId: string;
};

export type SyncCheckoutRequest = {
  sessionId: string;
  deviceFingerprint: string;
};

export const LICENSE_PLANS: Array<{
  id: Exclude<LicensePlan, "trial" | "dev">;
  label: string;
  priceLabel: string;
  maxDevices: number;
  description: string;
}> = [
  {
    id: "starter",
    label: "Starter",
    priceLabel: "$29/mo",
    maxDevices: 1,
    description: "Core workflow — reviews to export",
  },
  {
    id: "pro",
    label: "Pro",
    priceLabel: "$79/mo",
    maxDevices: 2,
    description: "Workflow + Studio (A+, ads, localization, variations)",
  },
  {
    id: "agency",
    label: "Agency",
    priceLabel: "$199/mo",
    maxDevices: 5,
    description: "Pro for teams — 5 devices, priority features",
  },
];

export function featuresForPlan(plan: LicensePlan): LicenseFeatures {
  switch (plan) {
    case "agency":
    case "pro":
    case "trial":
    case "dev":
      return { workflow: true, studio: true, maxImagesPerRun: 8 };
    case "starter":
      return { workflow: true, studio: false, maxImagesPerRun: 8 };
    default:
      return { workflow: false, studio: false, maxImagesPerRun: 0 };
  }
}
