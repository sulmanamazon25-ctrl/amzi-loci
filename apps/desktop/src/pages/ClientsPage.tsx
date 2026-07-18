import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { Panel } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { EmptyState, LoadingState } from "../components/ui/empty-loading";
import { listProjects } from "../lib/projects";
import { getUsageSummary } from "../lib/usage";

type ClientGroup = {
  clientName: string;
  projectCount: number;
  apiCost: number;
};

export function ClientsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientGroup[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const summaries = await listProjects();
      const usage = await getUsageSummary(null).catch(() => null);
      const byClient = new Map<string, ClientGroup>();

      for (const s of summaries) {
        const existing = byClient.get(s.clientName) ?? {
          clientName: s.clientName,
          projectCount: 0,
          apiCost: 0,
        };
        existing.projectCount++;
        byClient.set(s.clientName, existing);
      }

      if (usage) {
        for (const entry of usage.entries) {
          if (!entry.projectId) continue;
          const summary = summaries.find((p) => p.id === entry.projectId);
          if (!summary) continue;
          const g = byClient.get(summary.clientName);
          if (g) g.apiCost += entry.estimatedCostUsd;
        }
      }

      setClients([...byClient.values()].sort((a, b) => b.projectCount - a.projectCount));
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-heading font-semibold">Clients</h1>
          <p className="text-body text-text-muted">Projects grouped by client.</p>
        </div>
        <Button variant="primary" onClick={() => navigate("/projects")}>
          <Plus size={16} />
          New project
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Client roster"
          description="Organize projects by client name when you create them. Full client CRM coming soon."
          actionLabel="Create first project"
          onAction={() => navigate("/projects")}
        />
      ) : (
        <div className="grid gap-3">
          {clients.map((c) => (
            <Panel
              key={c.clientName}
              className="flex items-center justify-between cursor-pointer hover:border-border-hover"
              onClick={() => navigate("/projects")}
            >
              <div>
                <p className="text-body font-medium">{c.clientName}</p>
                <p className="text-caption text-text-muted">
                  {c.projectCount} project{c.projectCount !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="text-body text-text-muted">${c.apiCost.toFixed(2)} API</p>
            </Panel>
          ))}
        </div>
      )}

      <p className="mt-8 text-caption text-text-muted">Full client CRM coming soon.</p>
    </div>
  );
}
