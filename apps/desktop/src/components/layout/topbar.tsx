import { useState } from "react";
import { Search, Bell } from "lucide-react";

interface TopBarProps {
  breadcrumb: string;
  onOpenCommandPalette: () => void;
}

export function TopBar({ breadcrumb, onOpenCommandPalette }: TopBarProps) {
  const [showPaletteHint, setShowPaletteHint] = useState(false);

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-border bg-bg px-6">
      <span className="text-body text-text-muted">{breadcrumb}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            onOpenCommandPalette();
            setShowPaletteHint(true);
            window.setTimeout(() => setShowPaletteHint(false), 2500);
          }}
          className="flex items-center gap-2 rounded-input border border-border bg-card px-3 py-1.5 text-caption text-text-muted transition-colors duration-150 hover:border-border-hover"
        >
          <Search size={14} />
          Search
          <kbd className="ml-2 rounded bg-white/5 px-1.5 py-0.5 text-[10px]">Ctrl+K</kbd>
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-input p-2 text-text-muted transition-colors duration-150 hover:bg-card hover:text-text"
        >
          <Bell size={16} />
        </button>
      </div>

      {showPaletteHint && (
        <div className="absolute right-6 top-12 z-50 rounded-input border border-border bg-card px-3 py-2 text-caption text-text-muted shadow-lg">
          Command palette coming soon
        </div>
      )}
    </header>
  );
}

export function StatusBar({
  projectCount,
  syncState = "Saved",
}: {
  projectCount: number;
  syncState?: string;
}) {
  return (
    <footer className="flex h-8 items-center justify-between border-t border-border bg-surface px-4 text-caption text-text-muted">
      <span>{projectCount} projects</span>
      <span>{syncState}</span>
    </footer>
  );
}
