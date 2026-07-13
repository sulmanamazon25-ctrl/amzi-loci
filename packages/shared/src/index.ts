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
