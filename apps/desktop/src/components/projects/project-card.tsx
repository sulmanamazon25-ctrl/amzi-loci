import { Badge, Card } from "../ui/card";
import type { ProjectCardModel } from "../../lib/projectUi";

const statusLabel: Record<ProjectCardModel["status"], string> = {
  "in-progress": "In progress",
  "export-ready": "Export ready",
  "needs-images": "Needs images",
  draft: "Draft",
};

const statusTone: Record<
  ProjectCardModel["status"],
  "primary" | "success" | "warning" | "neutral"
> = {
  "in-progress": "primary",
  "export-ready": "success",
  "needs-images": "warning",
  draft: "neutral",
};

export function ProjectCard({
  project,
  onOpen,
}: {
  project: ProjectCardModel;
  onOpen: (id: string) => void;
}) {
  return (
    <Card className="cursor-pointer" onClick={() => onOpen(project.id)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body font-medium">{project.name}</p>
          <p className="mt-0.5 text-caption text-text-muted">
            {project.clientName} · {project.marketplace}
          </p>
        </div>
        <Badge tone={statusTone[project.status]}>{statusLabel[project.status]}</Badge>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-caption text-text-muted">
        <span>${project.apiCost.toFixed(2)} API</span>
        <span>{project.lastEdited}</span>
      </div>
    </Card>
  );
}
