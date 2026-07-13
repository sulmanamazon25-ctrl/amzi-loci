export const SERVER_A_DEFAULT_URL = "http://localhost:3000";

export type HealthResponse = {
  status: "ok" | "error";
  service: string;
  db: "connected" | "disconnected";
  timestamp: string;
};

export type ApiInfoResponse = {
  message: string;
  service: string;
  version: string;
};

export type ApiProvider = "anthropic" | "openai" | "google";

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

export type ProductInsight = {
  id: string;
  feature: string;
  sentiment: Sentiment;
  conversionDriver: boolean;
  sourceQuote: string;
  confidence: number;
};

export type ExtractInsightsRequest = {
  reviews: string[];
  provider: ApiProvider;
};

export type ExtractInsightsResponse = {
  insights: ProductInsight[];
  model: string;
  reviewCount: number;
};

export const API_PROVIDERS: ApiProvider[] = ["anthropic", "openai", "google"];

export const BRAND_FONT_OPTIONS = [
  "Inter",
  "Helvetica Neue",
  "Arial",
  "Georgia",
  "Playfair Display",
  "Roboto",
  "Montserrat",
  "Open Sans",
] as const;

export type BrandFont = (typeof BRAND_FONT_OPTIONS)[number];

export type BrandKit = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: BrandFont;
  toneOfVoice: string;
  toneProfessional: number;
  tonePlayful: number;
  toneLuxury: number;
  referenceImages: string[];
  createdAt: string;
  updatedAt: string;
};

export type BrandKitSummary = Pick<BrandKit, "id" | "name" | "primaryColor" | "updatedAt">;

export type ApplyBrandKitRequest = {
  brandKit: BrandKit;
  productContext?: string;
  insights?: ProductInsight[];
};

export type ApplyBrandKitResponse = {
  imagePrompt: string;
  styleSummary: string;
};

export type ImageTier = "imagen-fast" | "gemini-flash" | "nano-banana-pro";

export type ImageSlotType = "main" | "gallery" | "ad" | "variation";

export type ImageSlot = {
  slotType: ImageSlotType;
  slotIndex: number;
};

export type GeneratedImage = {
  id: string;
  slotType: ImageSlotType;
  slotIndex: number;
  label: string;
  prompt: string;
  mimeType: string;
  base64: string;
};

export type GenerateImagesRequest = {
  brandKit: BrandKit;
  insights: ProductInsight[];
  productContext: string;
  tier: ImageTier;
  referenceImagesBase64?: string[];
  regenerate?: ImageSlot;
};

export type GenerateImagesResponse = {
  images: GeneratedImage[];
  model: string;
  tier: ImageTier;
};

export const IMAGE_TIERS: Array<{
  id: ImageTier;
  label: string;
  description: string;
  estimatedCost: string;
}> = [
  {
    id: "imagen-fast",
    label: "Imagen 4 Fast",
    description: "Fastest, lowest cost — great for drafts",
    estimatedCost: "~$0.02/image",
  },
  {
    id: "gemini-flash",
    label: "Gemini 2.5 Flash Image",
    description: "Balanced speed and quality (Nano Banana)",
    estimatedCost: "~$0.04/image",
  },
  {
    id: "nano-banana-pro",
    label: "Nano Banana Pro",
    description: "Highest quality Gemini image model",
    estimatedCost: "~$0.08–0.13/image",
  },
];

export type UsageEventType =
  | "insights"
  | "images"
  | "aplus"
  | "localize"
  | "ads"
  | "variations";

export type UsageLogEntry = {
  id: string;
  timestamp: string;
  eventType: UsageEventType;
  provider?: ApiProvider;
  reviewCount?: number;
  imageCount?: number;
  imageTier?: ImageTier;
  model: string;
  estimatedCostUsd: number;
  note?: string;
};

export type UsageSummary = {
  totalEstimatedCostUsd: number;
  totalInsightCalls: number;
  totalReviewsProcessed: number;
  totalImagesGenerated: number;
  entries: UsageLogEntry[];
};

export type ExportFormat = "png" | "jpg";

export const EXPORT_FORMATS: Array<{ id: ExportFormat; label: string }> = [
  { id: "png", label: "PNG (lossless)" },
  { id: "jpg", label: "JPG (smaller files)" },
];

export function estimateInsightCostUsd(reviewCount: number): number {
  return Math.round((0.01 + reviewCount * 0.002) * 100) / 100;
}

export function estimateImageCostUsd(tier: ImageTier, imageCount: number): number {
  const perImage =
    tier === "imagen-fast" ? 0.02 : tier === "gemini-flash" ? 0.04 : 0.1;
  return Math.round(perImage * imageCount * 100) / 100;
}

export type AplusModuleType = "hero" | "features" | "comparison" | "brandStory";

export type AplusModule = {
  id: string;
  type: AplusModuleType;
  headline: string;
  body: string;
  bullets?: string[];
};

export type AplusContent = {
  modules: AplusModule[];
  model: string;
};

export type GenerateAplusRequest = {
  brandKit: BrandKit;
  insights: ProductInsight[];
  productContext: string;
  provider: ApiProvider;
};

export type LocaleCode = "de" | "fr" | "es" | "it" | "ja" | "pt";

export const LOCALE_OPTIONS: Array<{ id: LocaleCode; label: string }> = [
  { id: "de", label: "German" },
  { id: "fr", label: "French" },
  { id: "es", label: "Spanish" },
  { id: "it", label: "Italian" },
  { id: "ja", label: "Japanese" },
  { id: "pt", label: "Portuguese" },
];

export type LocalizeContentRequest = {
  modules: AplusModule[];
  targetLocale: LocaleCode;
  provider: ApiProvider;
};

export type LocalizeContentResponse = {
  modules: AplusModule[];
  targetLocale: LocaleCode;
  model: string;
};

export type GenerateAdsRequest = {
  brandKit: BrandKit;
  insights: ProductInsight[];
  productContext: string;
  tier: ImageTier;
  referenceImagesBase64?: string[];
};

export type GenerateVariationsRequest = {
  brandKit: BrandKit;
  insights: ProductInsight[];
  productContext: string;
  tier: ImageTier;
  variants: string[];
  referenceImagesBase64?: string[];
};

export type ListingSession = {
  productContext: string;
  brandKitId: string | null;
  provider: ApiProvider;
  insights: ProductInsight[];
  updatedAt: string;
};

export function estimateTextCostUsd(): number {
  return 0.03;
}

export * from "./license.js";
