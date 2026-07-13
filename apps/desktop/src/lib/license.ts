import { invoke } from "@tauri-apps/api/core";
import type {
  CreateCheckoutResponse,
  LicenseValidation,
} from "@amzi-loci/shared";

export async function getDeviceFingerprint(): Promise<string> {
  return invoke<string>("get_device_fingerprint");
}

export async function validateLicense(serverUrl: string): Promise<LicenseValidation> {
  return invoke<LicenseValidation>("validate_license", { serverUrl });
}

export async function createLicenseCheckout(
  serverUrl: string,
  plan: "starter" | "pro" | "agency",
  email?: string,
): Promise<CreateCheckoutResponse> {
  return invoke<CreateCheckoutResponse>("create_license_checkout", {
    serverUrl,
    plan,
    email: email ?? null,
  });
}

export async function syncLicenseCheckout(
  serverUrl: string,
  sessionId: string,
): Promise<LicenseValidation> {
  return invoke<LicenseValidation>("sync_license_checkout", { serverUrl, sessionId });
}
