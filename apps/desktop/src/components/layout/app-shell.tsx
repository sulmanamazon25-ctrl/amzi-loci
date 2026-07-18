import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar, StatusBar } from "./topbar";

export interface ShellConnection {
  name: string;
  connected: boolean;
}

interface AppShellProps {
  activePath: string;
  onNavigate: (path: string) => void;
  breadcrumb: string;
  onOpenCommandPalette: () => void;
  apiCostToday: number;
  connections: ShellConnection[];
  projectCount: number;
  syncState?: string;
  canUseStudio?: boolean;
  children: ReactNode;
}

export function AppShell({
  activePath,
  onNavigate,
  breadcrumb,
  onOpenCommandPalette,
  apiCostToday,
  connections,
  projectCount,
  syncState = "Saved",
  canUseStudio = false,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      <Sidebar
        activePath={activePath}
        onNavigate={onNavigate}
        apiCostToday={apiCostToday}
        connections={connections}
        canUseStudio={canUseStudio}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar breadcrumb={breadcrumb} onOpenCommandPalette={onOpenCommandPalette} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
        <StatusBar projectCount={projectCount} syncState={syncState} />
      </div>
    </div>
  );
}
