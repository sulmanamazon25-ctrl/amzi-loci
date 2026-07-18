import type { ApiProvider, ImageTier, ListingCopy, ProductInsight } from "./index.js";

export type ProjectSummary = {
  id: string;
  clientName: string;
  projectName: string;
  product: string;
  updatedAt: string;
};

export type SavedGeneratedImage = {
  id: string;
  slotType: string;
  slotIndex: number;
  label: string;
  prompt: string;
  mimeType: string;
  localPath: string;
};

export type ProjectData = {
  id: string;
  clientName: string;
  projectName: string;
  product: string;
  reviews: string[];
  insights: ProductInsight[];
  productContext: string;
  brandKitId: string | null;
  listingCopy: ListingCopy | null;
  provider: ApiProvider;
  imageTier: ImageTier;
  generatedImages: SavedGeneratedImage[];
  exportHistory: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  clientName: string;
  projectName: string;
  product: string;
};

export type SaveProjectInput = {
  id: string;
  reviews: string[];
  insights: ProductInsight[];
  productContext: string;
  brandKitId: string | null;
  listingCopy: ListingCopy | null;
  provider: ApiProvider;
  imageTier: ImageTier;
  generatedImages: SavedGeneratedImage[];
  exportNote?: string;
};

export const DEFAULT_CLIENT_NAME = "Untitled Client";
export const DEFAULT_PROJECT_NAME = "Untitled Project";

export function suggestProjectName(product: string): string {
  const trimmed = product.trim();
  if (!trimmed) return "New listing";
  const words = trimmed.split(/\s+/).slice(0, 4);
  return words.join(" ");
}
