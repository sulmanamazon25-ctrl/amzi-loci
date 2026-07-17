import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-6 transition-colors hover:border-border-hover",
        className,
      )}
      {...props}
    />
  );
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border border-border bg-surface p-8", className)}
      {...props}
    />
  );
}

type BadgeTone = "neutral" | "success" | "primary";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-white/5 text-text-muted",
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary-hover",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-caption font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
