import { Link } from "react-router-dom";
import {
  ClipboardList,
  Film,
  Image,
  MessageSquareText,
  Package,
  Palette,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

type AiCreationHeroProps = {
  className?: string;
  title?: string;
  showTitle?: boolean;
};

export function AiCreationHero({
  className,
  title = "AI-powered listing creation",
  showTitle = true,
}: AiCreationHeroProps) {
  return (
    <figure className={cn("space-y-3", className)}>
      {showTitle && <h2 className="text-heading font-semibold">{title}</h2>}
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-none">
        <div className="border-b border-border bg-card/80 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger/80" />
            <div className="h-3 w-3 rounded-full bg-warning/80" />
            <div className="h-3 w-3 rounded-full bg-success/80" />
            <span className="ml-2 text-caption text-text-muted">Amzi Loci — Project workspace</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[200px_1fr_220px]">
          {/* Sidebar mock */}
          <div className="hidden border-r border-border bg-card/40 p-3 lg:block">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary" />
              <span className="text-caption font-medium">Amzi Loci</span>
            </div>
            {["Dashboard", "Projects", "Product video", "Settings"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "mb-1 rounded-input px-2 py-1.5 text-caption",
                  i === 1 ? "bg-primary/15 text-text" : "text-text-muted",
                )}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main pipeline */}
          <div className="p-4 md:p-6">
            <p className="text-caption font-medium text-primary-hover">Review-driven workflow</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Reviews", "Insights", "Brand", "Copy", "Images", "Export"].map((step, i) => (
                <span
                  key={step}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-caption",
                    i <= 4
                      ? "bg-primary/20 text-primary-hover"
                      : "border border-border text-text-muted",
                  )}
                >
                  {step}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-input border border-border bg-bg p-3">
                <p className="text-caption text-text-muted">Customer reviews in</p>
                <p className="mt-2 text-body text-text">
                  &ldquo;Love the battery life&rdquo; · &ldquo;Fits perfectly in my bag&rdquo;
                </p>
                <p className="mt-1 text-body text-text-muted">
                  &ldquo;Best purchase this year — five stars&rdquo;
                </p>
              </div>
              <div className="rounded-input border border-primary/30 bg-primary/5 p-3">
                <p className="flex items-center gap-1 text-caption text-primary-hover">
                  <Sparkles size={12} /> AI insights
                </p>
                <ul className="mt-2 space-y-1 text-caption text-text">
                  <li>• Battery life — conversion driver</li>
                  <li>• Compact size — positive sentiment</li>
                  <li>• Durability — repeat mention</li>
                </ul>
              </div>
              <div className="rounded-input border border-border bg-bg p-3">
                <p className="text-caption text-text-muted">Listing copy</p>
                <p className="mt-2 text-body font-medium text-text">Ultra-Compact Daily Carry Bag</p>
                <p className="mt-1 text-caption text-text-muted">
                  • All-day battery reviewers rave about…
                </p>
              </div>
              <div className="rounded-input border border-border bg-bg p-3">
                <p className="text-caption text-text-muted">Gallery images</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className={cn(
                        "aspect-square rounded-sm",
                        n <= 3 ? "bg-primary/25" : "bg-card ring-1 ring-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Output panel */}
          <div className="border-t border-border bg-card/30 p-4 lg:border-l lg:border-t-0">
            <p className="text-caption font-medium text-success">Upload pack ready</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-input bg-bg px-2 py-1.5 text-caption">
                <Package size={14} className="text-primary-hover" />
                listing-upload-pack.zip
              </div>
              <div className="flex items-center gap-2 rounded-input bg-bg px-2 py-1.5 text-caption">
                <Film size={14} className="text-primary-hover" />
                product-video-pov.mp4
              </div>
            </div>
            <p className="mt-4 text-caption text-text-muted">
              One Google key · BYOK · export-first
            </p>
          </div>
        </div>
      </div>
      <figcaption className="text-caption text-text-muted">
        Reviews → AI insights → copy, images & POV video → Seller Central upload pack.{" "}
        <Link to="/guide" className="text-primary-hover hover:underline">
          Production guide
        </Link>
        {" · "}
        <Link to="/byok-setup" className="text-primary-hover hover:underline">
          BYOK setup
        </Link>
      </figcaption>
    </figure>
  );
}

const STEP_VISUALS = [
  {
    icon: MessageSquareText,
    preview: (
      <div className="mt-3 space-y-1 rounded-input bg-bg p-2 text-caption text-text-muted">
        <p>&ldquo;Great quality, fast shipping&rdquo;</p>
        <p>&ldquo;Exactly as described&rdquo;</p>
      </div>
    ),
  },
  {
    icon: Sparkles,
    preview: (
      <div className="mt-3 flex flex-wrap gap-1">
        {["Battery", "Quality", "Value"].map((tag) => (
          <span key={tag} className="rounded-full bg-primary/15 px-2 py-0.5 text-caption text-primary-hover">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: Palette,
    preview: (
      <div className="mt-3 flex gap-2">
        <div className="h-8 w-8 rounded-md bg-primary" />
        <div className="h-8 w-8 rounded-md bg-[#6366F1]" />
        <div className="h-8 w-8 rounded-md bg-card ring-1 ring-border" />
      </div>
    ),
  },
  {
    icon: ClipboardList,
    preview: (
      <div className="mt-3 space-y-1 text-caption text-text-muted">
        <p className="font-medium text-text">Title · 180 chars</p>
        <p>• Bullet one with buyer language…</p>
      </div>
    ),
  },
  {
    icon: Image,
    preview: (
      <div className="mt-3 grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="aspect-square rounded-sm bg-primary/20" />
        ))}
      </div>
    ),
  },
  {
    icon: Package,
    preview: (
      <div className="mt-3 flex items-center gap-2 rounded-input bg-bg px-2 py-2 text-caption text-text-muted">
        <Package size={14} className="shrink-0 text-primary-hover" />
        upload-pack.zip
      </div>
    ),
  },
] as const;

export function WorkflowStepsVisual({
  steps,
}: {
  steps: ReadonlyArray<{ num: number; title: string; desc: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, idx) => {
        const visual = STEP_VISUALS[idx];
        const Icon = visual?.icon ?? Sparkles;
        return (
          <div
            key={step.num}
            className="flex flex-col rounded-card border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-caption font-medium text-primary-hover">Step {step.num}</span>
              <Icon size={18} className="shrink-0 text-primary-hover" />
            </div>
            <h3 className="mt-2 text-section font-medium">{step.title}</h3>
            <p className="mt-1 flex-1 text-body text-text-muted">{step.desc}</p>
            {visual?.preview}
          </div>
        );
      })}
    </div>
  );
}
