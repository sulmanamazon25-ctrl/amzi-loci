export type ReleaseEntry = {
  version: string;
  /** ISO date (YYYY-MM-DD) */
  releasedAt: string;
  title: string;
  highlights: string[];
};

export const APP_VERSION = "0.11.0";

export const RELEASE_LOG: ReleaseEntry[] = [
  {
    version: "0.11.0",
    releasedAt: "2026-07-14",
    title: "Professional desktop UI redesign",
    highlights: [
      "New sidebar shell, dashboard, and project workspace",
      "Tailwind design system matching marketing site",
      "Six dedicated workflow step screens",
      "Getting Started guide and 1-click Windows install",
      "Product Video storyboard studio (Basic + Complete modes)",
    ],
  },
  {
    version: "0.10.0",
    releasedAt: "2026-07-13",
    title: "Agency desk",
    highlights: ["Project workspaces", "Per-project usage", "Creative brief in upload pack"],
  },
  {
    version: "0.9.0",
    releasedAt: "2026-07-13",
    title: "Listing copy & upload pack",
    highlights: ["Listing copy generation", "Compliance checklist", "Export upload pack zip"],
  },
  {
    version: "0.8.0",
    releasedAt: "2026-07-12",
    title: "Licensing",
    highlights: ["Trial mode", "Plan tiers", "Stripe-ready checkout"],
  },
];

export function getLatestRelease(): ReleaseEntry {
  return RELEASE_LOG[0];
}

export function getRelease(version: string): ReleaseEntry | undefined {
  return RELEASE_LOG.find((entry) => entry.version === version);
}

/** Human-friendly relative time for release dates (site + desktop). */
export function formatReleaseRelativeDate(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "Unknown date";

  const diff = Date.now() - ts;
  if (diff < 0) {
    const days = Math.ceil(Math.abs(diff) / 86400000);
    return days === 1 ? "tomorrow" : `in ${days} days`;
  }

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
