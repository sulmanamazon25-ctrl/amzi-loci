import type { ApiProvider, ImageTier } from "./index.js";

export type ByokPresetId = "budget" | "simplest" | "agency";

export type ByokPreset = {
  id: ByokPresetId;
  name: string;
  tagline: string;
  estimatedCostUsd: string;
  keysRequired: ApiProvider[];
  textProvider: ApiProvider;
  textModel: string;
  imageProvider: ApiProvider;
  imageTier: ImageTier;
  imageModel: string;
  bestFor: string;
};

export const BYOK_PROVIDER_LINKS: Record<
  ApiProvider,
  { label: string; signupUrl: string; billingUrl: string }
> = {
  anthropic: {
    label: "Anthropic",
    signupUrl: "https://console.anthropic.com/",
    billingUrl: "https://console.anthropic.com/settings/billing",
  },
  openai: {
    label: "OpenAI",
    signupUrl: "https://platform.openai.com/api-keys",
    billingUrl: "https://platform.openai.com/settings/organization/billing",
  },
  google: {
    label: "Google AI (Gemini)",
    signupUrl: "https://aistudio.google.com/apikey",
    billingUrl: "https://aistudio.google.com/",
  },
};

/** Matches server-side defaults in apps/server-a/src/lib/prompts.ts and image-proxy.ts */
export const BYOK_PRESETS: ByokPreset[] = [
  {
    id: "simplest",
    name: "Simplest",
    tagline: "One key for the full workflow",
    estimatedCostUsd: "$3–6",
    keysRequired: ["google"],
    textProvider: "google",
    textModel: "gemini-2.0-flash",
    imageProvider: "google",
    imageTier: "imagen-fast",
    imageModel: "imagen-4.0-fast-generate-001",
    bestFor: "First-time users who want one signup and the complete six-step workflow.",
  },
  {
    id: "budget",
    name: "Budget",
    tagline: "Lowest text cost + fast images",
    estimatedCostUsd: "$2–4",
    keysRequired: ["openai", "google"],
    textProvider: "openai",
    textModel: "gpt-4o-mini",
    imageProvider: "google",
    imageTier: "imagen-fast",
    imageModel: "imagen-4.0-fast-generate-001",
    bestFor: "High-volume refreshes where text cost matters most.",
  },
  {
    id: "agency",
    name: "Agency quality",
    tagline: "Best copy + premium image tiers",
    estimatedCostUsd: "$5–8",
    keysRequired: ["anthropic", "google"],
    textProvider: "anthropic",
    textModel: "claude-sonnet-4-20250514",
    imageProvider: "google",
    imageTier: "gemini-flash",
    imageModel: "gemini-2.5-flash-preview-image-generation",
    bestFor: "Client deliverables where copy quality and hero images matter most.",
  },
];

export const BYOK_TASK_MATRIX = [
  {
    task: "Review insights",
    anthropic: true,
    openai: true,
    google: true,
  },
  {
    task: "Listing copy",
    anthropic: true,
    openai: true,
    google: true,
  },
  {
    task: "Listing images",
    anthropic: false,
    openai: false,
    google: true,
  },
  {
    task: "Studio (Pro+)",
    anthropic: true,
    openai: true,
    google: true,
  },
] as const;

export const BYOK_COST_GUARDRAILS = [
  "Set billing alerts in each provider console before client work.",
  "Use Imagen Fast for drafts; upgrade tier only for hero/main slots.",
  "Track per-project usage in the desktop Usage panel for client billing.",
  "Typical all-in AI cost: $2–8 per listing depending on reviews and image tier.",
] as const;

export function getByokPreset(id: ByokPresetId): ByokPreset | undefined {
  return BYOK_PRESETS.find((p) => p.id === id);
}
