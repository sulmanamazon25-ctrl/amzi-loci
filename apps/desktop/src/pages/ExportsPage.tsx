import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { Panel } from "../components/ui/card";
import { EmptyState, LoadingState } from "../components/ui/empty-loading";
import { listProjects, loadProject } from "../lib/projects";
import { formatRelativeTime } from "../lib/projectUi";

type ExportRow = {
  projectId: string;
  projectName: string;
  clientName: string;
  note: string;
  updatedAt: string;
};

export function ExportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ExportRow[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const summaries = await listProjects();
      const all: ExportRow[] = [];
      for (const s of summaries) {
        try {
          const full = await loadProject(s.id);
          for (const note of full.exportHistory) {
            all.push({
              projectId: s.id,
              projectName: s.projectName,
              clientName: s.clientName,
              note,
              updatedAt: s.updatedAt,
            });
          }
        } catch {
          // skip
        }
      }
      all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setRows(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-heading font-semibold">Exports</h1>
        <p className="text-body text-text-muted">Upload packs and exports across projects.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No exports yet"
          description="Complete a project workflow and export an upload pack."
          actionLabel="Open projects"
          onAction={() => navigate("/projects")}
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <Panel
              key={`${row.projectId}-${i}`}
              className="flex items-center justify-between cursor-pointer hover:border-border-hover"
              onClick={() => navigate(`/projects/${row.projectId}/export`)}
            >
              <div>
                <p className="text-body font-medium">
                  {row.clientName} / {row.projectName}
                </p>
                <p className="text-caption text-text-muted">{row.note}</p>
              </div>
              <span className="text-caption text-text-muted">
                {formatRelativeTime(row.updatedAt)}
              </span>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
