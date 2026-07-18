import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import {
  DEFAULT_CLIENT_NAME,
  DEFAULT_PROJECT_NAME,
  suggestProjectName,
  type ProjectData,
  type ProjectSummary,
} from "@amzi-loci/shared";
import { Button } from "../components/ui/button";
import { Panel } from "../components/ui/card";
import { EmptyState, LoadingState } from "../components/ui/empty-loading";
import { ProjectCard } from "../components/projects/project-card";
import { createProject, deleteProject, listProjects, loadProject } from "../lib/projects";
import { summaryToCardModel } from "../lib/projectUi";
import type { ProjectCardModel } from "../lib/projectUi";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [cards, setCards] = useState<ProjectCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [product, setProduct] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listProjects();
      setProjects(list);
      const cardData = await Promise.all(
        list.map(async (summary: ProjectSummary) => {
          try {
            const full = await loadProject(summary.id);
            return summaryToCardModel(summary, full);
          } catch {
            return summaryToCardModel(summary);
          }
        }),
      );
      setCards(cardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleProductChange = (value: string) => {
    setProduct(value);
    if (!projectName.trim() && value.trim()) {
      setProjectName(suggestProjectName(value));
    }
  };

  const handleCreate = async () => {
    const client = clientName.trim() || DEFAULT_CLIENT_NAME;
    const project = projectName.trim() || DEFAULT_PROJECT_NAME;
    if (!product.trim()) {
      setError("Enter a product name or description.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created: ProjectData = await createProject({
        clientName: client,
        projectName: project,
        product: product.trim(),
      });
      setShowDialog(false);
      setClientName("");
      setProjectName("");
      setProduct("");
      navigate(`/projects/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-heading font-semibold">Projects</h1>
          <p className="text-body text-text-muted">Client workspaces for listing production.</p>
        </div>
        <Button variant="primary" onClick={() => setShowDialog(true)}>
          <Plus size={16} />
          New project
        </Button>
      </div>

      {error && <p className="mb-4 text-body text-danger">{error}</p>}

      {loading ? (
        <LoadingState />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project for each client listing you're building."
          actionLabel="New project"
          onAction={() => setShowDialog(true)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((p) => (
            <div key={p.id} className="relative">
              <ProjectCard project={p} onOpen={(id) => navigate(`/projects/${id}`)} />
              <button
                type="button"
                className="absolute right-3 top-3 rounded-input p-1 text-caption text-text-muted hover:bg-danger/10 hover:text-danger"
                disabled={deletingId === p.id}
                onClick={(e) => void handleDelete(p.id, e)}
              >
                {deletingId === p.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Panel className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-section font-medium">New project</h2>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="rounded-input p-1 text-text-muted hover:bg-card"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-caption text-text-muted">Client name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={DEFAULT_CLIENT_NAME}
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
                />
              </div>
              <div>
                <label className="mb-1 block text-caption text-text-muted">Project name</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={DEFAULT_PROJECT_NAME}
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
                />
              </div>
              <div>
                <label className="mb-1 block text-caption text-text-muted">Product</label>
                <input
                  value={product}
                  onChange={(e) => handleProductChange(e.target.value)}
                  placeholder="e.g. Insulated water bottle 32oz"
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={creating} onClick={() => void handleCreate()}>
                {creating ? "Creating…" : "Create & open"}
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
