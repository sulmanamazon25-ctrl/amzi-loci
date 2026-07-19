import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Film,
  Image,
  Key,
  Package,
  Sparkles,
  Upload,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type AppSnapshotView =
  | "settings"
  | "reviews"
  | "insights"
  | "copy"
  | "images"
  | "export"
  | "product-video";

type AppSnapshotProps = {
  view: AppSnapshotView;
  className?: string;
  caption?: string;
};

const SIDEBAR_ITEMS = ["Dashboard", "Projects", "Product video", "Settings"] as const;

const WORKFLOW_STEPS = ["Reviews", "Insights", "Brand", "Copy", "Images", "Export"] as const;

function activeSidebarIndex(view: AppSnapshotView): number {
  if (view === "settings") return 3;
  if (view === "product-video") return 2;
  return 1;
}

function activeStepIndex(view: AppSnapshotView): number {
  const map: Record<AppSnapshotView, number> = {
    settings: -1,
    reviews: 0,
    insights: 1,
    copy: 3,
    images: 4,
    export: 5,
    "product-video": 5,
  };
  return map[view];
}

function windowTitle(view: AppSnapshotView): string {
  const titles: Record<AppSnapshotView, string> = {
    settings: "Amzi Loci — Settings",
    reviews: "Amzi Loci — Daily Carry Bag",
    insights: "Amzi Loci — Daily Carry Bag",
    copy: "Amzi Loci — Daily Carry Bag",
    images: "Amzi Loci — Daily Carry Bag",
    export: "Amzi Loci — Daily Carry Bag",
    "product-video": "Amzi Loci — Product video",
  };
  return titles[view];
}

function SettingsView() {
  return (
    <div className="space-y-4">
      <div className="rounded-input border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-body font-medium text-text">Recommended setup</p>
            <p className="mt-1 text-caption text-text-muted">
              Clients: add <strong className="text-text">Google only</strong> — one key covers insights,
              copy, images, and product video.
            </p>
          </div>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-caption font-medium text-success">
            Google key ready
          </span>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-4 text-caption text-text-muted">
          <li>Create a key at Google AI Studio and enable Cloud billing for images.</li>
          <li>Paste below → Test key → Save to keychain.</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-button bg-primary px-2.5 py-1 text-caption font-medium text-white">
            Get API key <ExternalLink size={10} />
          </span>
          <span className="inline-flex items-center gap-1 rounded-button border border-border bg-card px-2.5 py-1 text-caption text-text-muted">
            Enable billing <ExternalLink size={10} />
          </span>
        </div>
      </div>

      <div className="rounded-input border border-border bg-bg p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-primary-hover" />
            <span className="text-body font-medium">Google AI</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-caption text-primary-hover">
              Recommended
            </span>
          </div>
          <span className="text-caption text-success">Saved · AIza…x7Kq</span>
        </div>
        <div className="mt-3 rounded-input border border-border bg-card px-3 py-2 text-caption text-text-muted">
          ••••••••••••••••••••••••••••
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-button border border-border bg-card px-3 py-1.5 text-caption text-text">
            Test key
          </span>
          <span className="rounded-button bg-primary px-3 py-1.5 text-caption font-medium text-white">
            Save to keychain
          </span>
        </div>
        <p className="mt-2 text-caption text-success">Key verified — Gemini 2.0 Flash reachable</p>
      </div>
    </div>
  );
}

function ReviewsView() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_STEPS.map((step, i) => (
          <span
            key={step}
            className={cn(
              "rounded-full px-2.5 py-1 text-caption",
              i === 0 ? "bg-primary/20 text-primary-hover" : "border border-border text-text-muted",
            )}
          >
            {step}
          </span>
        ))}
      </div>
      <div>
        <p className="text-caption font-medium text-text">Step 1 — Paste customer reviews</p>
        <p className="mt-1 text-caption text-text-muted">
          Copy reviews from Amazon product pages or your CRM. One review per line.
        </p>
        <div className="mt-3 min-h-[120px] rounded-input border border-border bg-bg p-3 text-caption text-text-muted">
          <p>&ldquo;Love the battery life — lasts all day on my commute.&rdquo;</p>
          <p className="mt-1.5">&ldquo;Fits perfectly in my bag, lightweight but durable.&rdquo;</p>
          <p className="mt-1.5">&ldquo;Best purchase this year. Five stars.&rdquo;</p>
          <p className="mt-1.5">&ldquo;Compact size without sacrificing storage.&rdquo;</p>
          <p className="mt-1.5 opacity-60">&ldquo;Great value for the price point…&rdquo;</p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-caption text-text-muted">12 reviews · 847 words</span>
          <span className="rounded-button bg-primary px-3 py-1.5 text-caption font-medium text-white">
            Continue to Insights
          </span>
        </div>
      </div>
    </div>
  );
}

function InsightsView() {
  const tags = [
    { label: "Battery life", tone: "primary" as const },
    { label: "Compact size", tone: "primary" as const },
    { label: "Durability", tone: "neutral" as const },
    { label: "Value", tone: "neutral" as const },
  ];
  const cards = [
    { title: "Battery life", body: "Mentioned in 8/12 reviews — top conversion driver" },
    { title: "Portability", body: "Buyers praise fit in bags and daily carry" },
    { title: "Build quality", body: "Repeat positive sentiment on durability" },
  ];

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1 text-caption font-medium text-primary-hover">
        <Sparkles size={12} /> Step 2 — AI insights from reviews
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.label}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-caption",
              tag.tone === "primary"
                ? "bg-primary/15 text-primary-hover"
                : "border border-border text-text-muted",
            )}
          >
            {tag.label}
          </span>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-input border border-primary/20 bg-primary/5 p-3">
            <p className="text-caption font-medium text-text">{card.title}</p>
            <p className="mt-1 text-caption text-text-muted">{card.body}</p>
          </div>
        ))}
      </div>
      <p className="text-caption text-text-muted">
        Insights feed brand tone, listing copy, and image prompts automatically.
      </p>
    </div>
  );
}

function CopyView() {
  return (
    <div className="space-y-4">
      <p className="text-caption font-medium text-text">Step 4 — Listing copy preview</p>
      <div className="rounded-input border border-border bg-bg p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body font-medium text-text">Ultra-Compact Daily Carry Bag — All-Day Power</p>
          <span className="shrink-0 text-caption text-success">178 / 200</span>
        </div>
        <ul className="mt-3 space-y-2 text-caption text-text-muted">
          <li className="flex gap-2">
            <span className="text-primary-hover">•</span>
            <span>
              All-day battery reviewers rave about — power through commutes without recharging
              <span className="ml-1 text-success">(142/250)</span>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-hover">•</span>
            <span>
              Slim profile fits standard laptop bags — no bulk, maximum portability
              <span className="ml-1 text-success">(98/250)</span>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-hover">•</span>
            <span>
              Durable construction buyers trust — built for daily wear
              <span className="ml-1 text-success">(115/250)</span>
            </span>
          </li>
        </ul>
        <p className="mt-3 text-caption text-text-muted">
          Keywords: daily carry, compact bag, battery life, portable…
        </p>
      </div>
    </div>
  );
}

function ImagesView() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption font-medium text-text">Step 5 — Listing images</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption text-primary-hover">
          Imagen 3 Fast
        </span>
      </div>
      <div>
        <p className="text-caption text-text-muted">3 main images</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {["Hero", "Lifestyle", "Detail"].map((label, i) => (
            <div key={label} className="space-y-1">
              <div
                className={cn(
                  "aspect-square rounded-input",
                  i === 0 ? "bg-primary/30 ring-2 ring-primary/40" : "bg-primary/20",
                )}
              />
              <p className="text-caption text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-caption text-text-muted">5 gallery images</p>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="aspect-square rounded-sm bg-card ring-1 ring-border" />
          ))}
        </div>
      </div>
      <p className="flex items-center gap-1 text-caption text-text-muted">
        <Image size={12} /> Brand kit colors applied · review insights in prompts
      </p>
    </div>
  );
}

function ExportView() {
  const checks = [
    "Title within 200 characters",
    "All 5 bullet points present",
    "8 images in upload folder",
    "Backend keywords included",
    "Compliance warnings cleared",
  ];

  return (
    <div className="space-y-4">
      <p className="text-caption font-medium text-text">Step 6 — Export upload pack</p>
      <div className="flex items-center gap-3 rounded-input border border-success/30 bg-success/5 p-4">
        <Package size={20} className="shrink-0 text-success" />
        <div>
          <p className="text-body font-medium text-text">listing-upload-pack.zip</p>
          <p className="text-caption text-text-muted">Images · copy · checklist · creative brief · README</p>
        </div>
        <span className="ml-auto rounded-button bg-primary px-3 py-1.5 text-caption font-medium text-white">
          <Upload size={12} className="mr-1 inline" />
          Export
        </span>
      </div>
      <div className="rounded-input border border-border bg-bg p-4">
        <p className="text-caption font-medium text-text">Compliance checklist</p>
        <ul className="mt-3 space-y-2">
          {checks.map((item) => (
            <li key={item} className="flex items-start gap-2 text-caption text-text-muted">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProductVideoView() {
  const scenes = [
    { num: 1, label: "Unbox reveal", duration: "3s" },
    { num: 2, label: "Battery close-up", duration: "4s" },
    { num: 3, label: "Bag fit demo", duration: "3s" },
    { num: 4, label: "CTA end card", duration: "2s" },
  ];

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1 text-caption font-medium text-primary-hover">
        <Film size={12} /> Product video — POV from listing images
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-caption text-text-muted">Storyboard</p>
          <div className="mt-2 space-y-2">
            {scenes.map((scene) => (
              <div
                key={scene.num}
                className="flex items-center gap-3 rounded-input border border-border bg-bg px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-caption font-medium text-primary-hover">
                  {scene.num}
                </span>
                <span className="flex-1 text-caption text-text">{scene.label}</span>
                <span className="text-caption text-text-muted">{scene.duration}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-caption text-text-muted">POV render output</p>
          <div className="relative mt-2 aspect-video overflow-hidden rounded-input border border-border bg-gradient-to-br from-primary/20 via-card to-bg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/40 p-3">
                <Film size={20} className="text-white/90" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="rounded bg-black/50 px-2 py-0.5 text-caption text-white/90">
                product-video-pov.mp4
              </span>
              <span className="rounded bg-black/50 px-2 py-0.5 text-caption text-white/90">0:12</span>
            </div>
          </div>
          <p className="mt-2 text-caption text-text-muted">
            Generated from gallery images · included in upload pack
          </p>
        </div>
      </div>
    </div>
  );
}

function SnapshotContent({ view }: { view: AppSnapshotView }) {
  switch (view) {
    case "settings":
      return <SettingsView />;
    case "reviews":
      return <ReviewsView />;
    case "insights":
      return <InsightsView />;
    case "copy":
      return <CopyView />;
    case "images":
      return <ImagesView />;
    case "export":
      return <ExportView />;
    case "product-video":
      return <ProductVideoView />;
  }
}

export function AppSnapshot({ view, className, caption }: AppSnapshotProps) {
  const sidebarActive = activeSidebarIndex(view);
  const stepActive = activeStepIndex(view);
  const showWorkflow = view !== "settings";

  return (
    <figure className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-none">
        <div className="border-b border-border bg-card/80 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger/80" />
            <div className="h-3 w-3 rounded-full bg-warning/80" />
            <div className="h-3 w-3 rounded-full bg-success/80" />
            <span className="ml-2 text-caption text-text-muted">{windowTitle(view)}</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[180px_1fr]">
          <div className="hidden border-r border-border bg-card/40 p-3 lg:block">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary" />
              <span className="text-caption font-medium">Amzi Loci</span>
            </div>
            {SIDEBAR_ITEMS.map((item, i) => (
              <div
                key={item}
                className={cn(
                  "mb-1 rounded-input px-2 py-1.5 text-caption",
                  i === sidebarActive ? "bg-primary/15 text-text" : "text-text-muted",
                )}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {showWorkflow && stepActive >= 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {WORKFLOW_STEPS.map((step, i) => (
                  <span
                    key={step}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption",
                      i < stepActive
                        ? "bg-success/10 text-success"
                        : i === stepActive
                          ? "bg-primary/20 text-primary-hover"
                          : "border border-border text-text-muted",
                    )}
                  >
                    {i < stepActive ? (
                      <CheckCircle2 size={10} />
                    ) : i === stepActive ? (
                      <Circle size={10} className="fill-primary/30" />
                    ) : null}
                    {step}
                  </span>
                ))}
              </div>
            )}
            <SnapshotContent view={view} />
          </div>
        </div>
      </div>
      {caption && <figcaption className="text-caption text-text-muted">{caption}</figcaption>}
    </figure>
  );
}
