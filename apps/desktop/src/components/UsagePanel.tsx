import type { ProjectSummary, UsageSummary } from "@amzi-loci/shared";
import { useCallback, useEffect, useState } from "react";
import { listProjects } from "../lib/projects";
import { getUsageSummary } from "../lib/usage";

type FilterMode = "all" | "current";

type Props = {
  activeProjectId?: string | null;
  activeProjectLabel?: string;
  compact?: boolean;
};

export function UsagePanel({ activeProjectId, activeProjectLabel, compact }: Props) {
  const [filter, setFilter] = useState<FilterMode>("current");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const projectId =
        filter === "current" && activeProjectId ? activeProjectId : null;
      const summary = await getUsageSummary(projectId);
      setUsage(summary);
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const projectLabel = (id: string | undefined) => {
    if (!id) return "All projects";
    const match = projects.find((p) => p.id === id);
    if (match) return `${match.clientName} / ${match.projectName}`;
    return id;
  };

  return (
    <section className={`usage-panel ${compact ? "usage-panel-compact" : ""}`}>
      <div className="usage-panel-header">
        <div>
          <h3>{compact ? "Usage & cost" : "API usage & billing estimate"}</h3>
          {!compact && (
            <p className="muted">
              Local log of BYOK API calls — use per-project totals for client billing.
            </p>
          )}
        </div>
        <select
          className="text-input usage-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterMode)}
        >
          <option value="current" disabled={!activeProjectId}>
            Current project{activeProjectLabel ? `: ${activeProjectLabel}` : ""}
          </option>
          <option value="all">All projects</option>
        </select>
      </div>

      {loading ? (
        <p className="muted">Loading usage…</p>
      ) : !usage || usage.entries.length === 0 ? (
        <p className="muted">No API usage logged yet.</p>
      ) : (
        <>
          <dl className="usage-stats">
            <div>
              <dt>Est. spend</dt>
              <dd>${usage.totalEstimatedCostUsd.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Insight runs</dt>
              <dd>{usage.totalInsightCalls}</dd>
            </div>
            <div>
              <dt>Reviews processed</dt>
              <dd>{usage.totalReviewsProcessed}</dd>
            </div>
            <div>
              <dt>Images generated</dt>
              <dd>{usage.totalImagesGenerated}</dd>
            </div>
          </dl>

          {!compact && (
            <div className="usage-entries">
              <h4>Recent events</h4>
              <ul className="usage-entry-list">
                {usage.entries.slice(0, 12).map((entry) => (
                  <li key={entry.id} className="usage-entry-item">
                    <span className="usage-entry-type">{entry.eventType}</span>
                    <span className="usage-entry-cost">
                      ${entry.estimatedCostUsd.toFixed(2)}
                    </span>
                    {entry.projectId && filter === "all" && (
                      <span className="usage-entry-project muted">
                        {projectLabel(entry.projectId)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
