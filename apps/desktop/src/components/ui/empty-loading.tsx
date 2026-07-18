import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border py-16 text-center">
      {icon && <div className="text-text-muted">{icon}</div>}
      <p className="text-section font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-body text-text-muted">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
      <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
      <span className="text-body">{label}</span>
    </div>
  );
}
