import {
  Home,
  FolderOpen,
  Users,
  Star,
  Package,
  BarChart3,
  Settings,
  Palette,
  Sparkles,
  Film,
} from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: FolderOpen, label: "Projects", path: "/projects" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Star, label: "Templates", path: "/templates" },
  { icon: Package, label: "Exports", path: "/exports" },
  { icon: BarChart3, label: "Usage", path: "/usage" },
];

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  apiCostToday: number;
  connections: { name: string; connected: boolean }[];
  canUseStudio?: boolean;
}

function isActive(path: string, activePath: string): boolean {
  if (path === "/") return activePath === "/";
  return activePath === path || activePath.startsWith(`${path}/`);
}

export function Sidebar({
  activePath,
  onNavigate,
  apiCostToday,
  connections,
  canUseStudio = false,
}: SidebarProps) {
  const extraItems = [
    { icon: Film, label: "Product video", path: "/product-video" },
    { icon: Palette, label: "Brand kits", path: "/brand-kits" },
    ...(canUseStudio
      ? [{ icon: Sparkles, label: "Studio", path: "/studio" }]
      : []),
  ];

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-caption font-semibold text-white">
          A
        </div>
        <span className="text-section font-medium">Amzi Loci</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = isActive(path, activePath);
          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate(path)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-input px-3 py-2 text-left text-body transition-colors duration-150",
                active
                  ? "bg-primary/10 text-white"
                  : "text-text-muted hover:bg-card hover:text-text",
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}

        <div className="my-2 border-t border-border" />

        {extraItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path, activePath);
          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate(path)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-input px-3 py-2 text-left text-body transition-colors duration-150",
                active
                  ? "bg-primary/10 text-white"
                  : "text-text-muted hover:bg-card hover:text-text",
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onNavigate("/settings")}
          aria-current={activePath === "/settings" ? "page" : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-input px-3 py-2 text-left text-body transition-colors duration-150",
            activePath === "/settings"
              ? "bg-primary/10 text-white"
              : "text-text-muted hover:bg-card hover:text-text",
          )}
        >
          <Settings size={16} strokeWidth={1.75} />
          Settings
        </button>
      </nav>

      <div className="space-y-2 border-t border-border p-3">
        {connections.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between text-caption text-text-muted"
          >
            {c.name}
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                c.connected ? "bg-success" : "bg-border-hover",
              )}
            />
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 text-caption">
          <span className="text-text-muted">Cost today</span>
          <span className="font-medium text-text">${apiCostToday.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}
