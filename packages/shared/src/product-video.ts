import type { ApiProvider } from "./index.js";

export type ProductVideoMode = "basic" | "complete";

export type VideoPatternProfile = {
  id: string;
  name: string;
  source: "reference" | "template";
  hookSeconds: number;
  sceneCount: number;
  ctaPlacement: "end";
  createdAt: string;
};

export type VideoScene = {
  id: string;
  title: string;
  durationSec: number;
  voiceover: string;
  onScreenText: string;
  assetHint: string;
};

export type ProductVideoScript = {
  mode: ProductVideoMode;
  productName: string;
  scenes: VideoScene[];
  disclaimers: string[];
  provider: ApiProvider;
  model: string;
};

export const VIDEO_DISCLAIMERS = [
  "Export-first — paste assets into your editor or ad platform; no auto-upload to Amazon.",
  "If visuals are AI-generated, disclose when Amazon or your ad platform requires it.",
  "You pay AI providers directly via BYOK keys.",
] as const;

export const DEFAULT_VIDEO_TEMPLATE: Omit<VideoPatternProfile, "id" | "createdAt"> = {
  name: "Amazon listing refresh",
  source: "template",
  hookSeconds: 8,
  sceneCount: 5,
  ctaPlacement: "end",
};
