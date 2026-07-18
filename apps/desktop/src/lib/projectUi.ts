import type { ProjectData, ProjectSummary } from "@amzi-loci/shared";

export type ProjectCardStatus = "draft" | "in-progress" | "needs-images" | "export-ready";

export type ProjectCardModel = {
  id: string;
  name: string;
  clientName: string;
  marketplace: string;
  progress: number;
  status: ProjectCardStatus;
  apiCost: number;
  lastEdited: string;
};

const WORKFLOW_STEPS = ["reviews", "insights", "brand", "copy", "images", "export"] as const;

export function computeCompletedSteps(project: ProjectData): string[] {
  const done: string[] = [];
  if (project.reviews.length > 0) done.push("reviews");
  if (project.insights.length > 0) done.push("insights");
  if (project.brandKitId) done.push("brand");
  if (project.listingCopy) done.push("copy");
  if (project.generatedImages.length > 0) done.push("images");
  if (project.exportHistory.length > 0) done.push("export");
  return done;
}

export function computeProgress(project: ProjectData): number {
  const done = computeCompletedSteps(project);
  return Math.round((done.length / WORKFLOW_STEPS.length) * 100);
}

export function computeProjectStatus(project: ProjectData): ProjectCardStatus {
  if (project.exportHistory.length > 0) return "export-ready";
  if (project.generatedImages.length > 0) return "in-progress";
  if (project.insights.length > 0 && !project.generatedImages.length) return "needs-images";
  if (project.reviews.length > 0 || project.insights.length > 0) return "in-progress";
  return "draft";
}

export function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "—";

  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function summaryToCardModel(
  summary: ProjectSummary,
  project?: ProjectData | null,
  apiCost = 0,
): ProjectCardModel {
  const progress = project ? computeProgress(project) : 0;
  const status = project ? computeProjectStatus(project) : "draft";
  return {
    id: summary.id,
    name: summary.projectName,
    clientName: summary.clientName,
    marketplace: "Amazon US",
    progress,
    status,
    apiCost,
    lastEdited: formatRelativeTime(summary.updatedAt),
  };
}

export function deriveTopKeywords(reviews: string[], limit = 5): string[] {
  const stop = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "it", "this", "that",
    "for", "with", "on", "in", "to", "of", "my", "i", "me", "very", "really", "not",
  ]);
  const freq = new Map<string, number>();
  for (const review of reviews) {
    for (const word of review.toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length < 4 || stop.has(word)) continue;
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

export function positiveReviewPct(reviews: string[]): number {
  if (reviews.length === 0) return 0;
  const positiveWords = ["great", "love", "perfect", "excellent", "amazing", "best", "good", "five", "stars"];
  let positive = 0;
  for (const r of reviews) {
    const lower = r.toLowerCase();
    if (positiveWords.some((w) => lower.includes(w))) positive++;
  }
  return Math.round((positive / reviews.length) * 100);
}

export const STEP_KEY_TO_WIZARD: Record<string, string> = {
  reviews: "ingest",
  insights: "insights",
  brand: "brandkit",
  copy: "copy",
  images: "generate",
  export: "export",
};

export const WIZARD_TO_STEP_KEY: Record<string, string> = {
  ingest: "reviews",
  insights: "insights",
  brandkit: "brand",
  copy: "copy",
  generate: "images",
  export: "export",
};
