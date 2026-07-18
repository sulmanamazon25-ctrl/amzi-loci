import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]",
  secondary:
    "bg-card border border-border text-text hover:border-border-hover active:scale-[0.98]",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-card active:scale-[0.98]",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-caption",
  md: "h-9 px-4 text-body",
  lg: "h-11 px-5 text-section",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-button font-medium transition-[background,transform] duration-150 disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
