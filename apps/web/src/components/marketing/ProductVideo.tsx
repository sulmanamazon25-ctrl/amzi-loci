import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { cn } from "../../lib/utils";
import { AiCreationHero } from "./AiCreationHero";

const VIDEO_SRC =
  import.meta.env.VITE_PRODUCT_VIDEO_URL ?? "/video/amzi-loci-hero.mp4";
const POSTER_SRC =
  import.meta.env.VITE_PRODUCT_VIDEO_POSTER ?? "/video/amzi-loci-hero-poster.svg";
const CAPTIONS_SRC = "/video/amzi-loci-hero.vtt";

/** Set true when hero MP4 is uploaded to public/video/ */
const HAS_HERO_VIDEO = Boolean(import.meta.env.VITE_PRODUCT_VIDEO_URL);

type ProductVideoProps = {
  title?: string;
  className?: string;
  compact?: boolean;
};

export function ProductVideo({
  title = "See Amzi Loci in action",
  className,
  compact = false,
}: ProductVideoProps) {
  const [failed, setFailed] = useState(false);

  if (!HAS_HERO_VIDEO || failed) {
    return (
      <AiCreationHero
        className={className}
        title={compact ? undefined : title}
        showTitle={!compact}
      />
    );
  }

  return (
    <figure className={cn("space-y-3", className)}>
      {!compact && <h2 className="text-heading font-semibold">{title}</h2>}
      <div className="relative overflow-hidden rounded-card border border-border bg-black shadow-none">
        <video
          className="aspect-video w-full bg-black object-cover"
          controls
          playsInline
          preload="metadata"
          poster={POSTER_SRC}
          onError={() => setFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          <track kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" default />
          Your browser does not support embedded video.
        </video>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-hover:opacity-100"
          aria-hidden
        >
          <Play className="text-white/80" size={48} />
        </div>
      </div>
      {!compact && (
        <figcaption className="text-caption text-text-muted">
          Reviews to upload pack — export-first workflow.{" "}
          <Link to="/guide" className="text-primary-hover hover:underline">
            Production guide
          </Link>
          {" · "}
          <Link to="/byok-setup" className="text-primary-hover hover:underline">
            BYOK setup guide
          </Link>
        </figcaption>
      )}
    </figure>
  );
}
