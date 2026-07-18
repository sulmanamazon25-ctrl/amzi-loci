import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, FileText, DollarSign, Package } from "lucide-react";
import { StatCard } from "../ui/stat-card";
import { ProjectCard } from "../projects/project-card";
import { EmptyState, LoadingState } from "../ui/empty-loading";
import { listProjects, loadProject } from "../../lib/projects";
import { getUsageSummary } from "../../lib/usage";
import { summaryToCardModel } from "../../lib/projectUi";
import type { ProjectSummary } from "@amzi-loci/shared";

interface ActivityItem {
  time: string;
  label: string;
}

interface DashboardProps {
  userFirstName?: string;
  serverConnected?: boolean;
}

export function Dashboard({ userFirstName = "there", serverConnected = true }: DashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [cards, setCards] = useState<ReturnType<typeof summaryToCardModel>[]>([]);
  const [stats, setStats] = useState({
    projects: 0,
    listings: 0,
    apiCost: 0,
    exports: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, usage] = await Promise.all([
        listProjects(),
        getUsageSummary(null).catch(() => null),
      ]);
      setProjects(list);

      const cardData = await Promise.all(
        list.slice(0, 6).map(async (summary) => {
          try {
            const full = await loadProject(summary.id);
            return summaryToCardModel(summary, full);
          } catch {
            return summaryToCardModel(summary);
          }
        }),
      );
      setCards(cardData);

      let listings = 0;
      let exports = 0;
      const activityItems: ActivityItem[] = [];

      for (const summary of list) {
        try {
          const full = await loadProject(summary.id);
          if (full.exportHistory.length > 0) listings++;
          exports += full.exportHistory.length;
          for (const note of full.exportHistory.slice(-2)) {
            activityItems.push({
              time: new Date(summary.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              label: `${summary.projectName}: ${note}`,
            });
          }
        } catch {
          // skip
        }
      }

      activityItems.sort((a, b) => b.time.localeCompare(a.time));

      setStats({
        projects: list.length,
        listings,
        apiCost: usage?.totalEstimatedCostUsd ?? 0,
        exports,
      });
      setActivity(activityItems.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (loading) return <LoadingState label="Loading dashboard…" />;

  return (
    <div className="mx-auto max-w-5xl">
      {!serverConnected && (
        <div className="mb-6 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-body text-warning">
          Server disconnected — retry in Settings or check your connection.
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-display font-semibold">
          {greeting}, {userFirstName}
        </h1>
        <p className="mt-1 text-body text-text-muted">Continue where you left off.</p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-3">
        <StatCard label="Projects" value={stats.projects} icon={<Folder size={16} />} />
        <StatCard label="Listings" value={stats.listings} icon={<FileText size={16} />} />
        <StatCard
          label="API cost"
          value={`$${stats.apiCost.toFixed(2)}`}
          icon={<DollarSign size={16} />}
        />
        <StatCard label="Exports" value={stats.exports} icon={<Package size={16} />} />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <h2 className="mb-3 text-section font-medium">Recent projects</h2>
          {projects.length === 0 ? (
            <EmptyState
              title="Start your first project"
              description="Import reviews for a product and Amzi Loci turns them into a full listing package."
              actionLabel="Create project"
              onAction={() => navigate("/projects")}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {cards.slice(0, 4).map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={(id) => navigate(`/projects/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-section font-medium">Activity</h2>
          {activity.length === 0 ? (
            <p className="text-body text-text-muted">No recent activity.</p>
          ) : (
            <ul className="space-y-3 border-l border-border pl-4">
              {activity.map((item, i) => (
                <li key={i} className="text-caption">
                  <span className="block text-text-muted">{item.time}</span>
                  <span className="text-body">{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
