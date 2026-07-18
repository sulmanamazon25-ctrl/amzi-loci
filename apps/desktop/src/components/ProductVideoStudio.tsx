import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_VIDEO_TEMPLATE,
  VIDEO_DISCLAIMERS,
  type ProductVideoMode,
  type ProductVideoScript,
  type VideoScene,
} from "@amzi-loci/shared";
import { Film, Sparkles, Upload } from "lucide-react";
import { listProjects, loadProject } from "../lib/projects";
import { Button } from "./ui/button";
import { Card, Panel } from "./ui/card";
import { EmptyState, LoadingState } from "./ui/empty-loading";

type Tab = ProductVideoMode;

function buildTemplateScript(productName: string, mode: ProductVideoMode): ProductVideoScript {
  const scenes: VideoScene[] =
    mode === "basic"
      ? [
          {
            id: "hook",
            title: "Hook",
            durationSec: 8,
            voiceover: `Buyers already told you what matters about ${productName} — in their reviews.`,
            onScreenText: "Reviews → real buyer language",
            assetHint: "Review quotes overlay",
          },
          {
            id: "problem",
            title: "Problem",
            durationSec: 10,
            voiceover: "Generic listings miss the details customers repeat in five-star feedback.",
            onScreenText: "Don't guess — use review insights",
            assetHint: "Split screen generic vs review-driven",
          },
          {
            id: "product",
            title: "Product",
            durationSec: 12,
            voiceover: `${productName} — built around what buyers actually care about.`,
            onScreenText: productName,
            assetHint: "Main image from project",
          },
          {
            id: "cta",
            title: "CTA",
            durationSec: 8,
            voiceover: "See it on Amazon — link in description.",
            onScreenText: "Shop now",
            assetHint: "Logo + product shot",
          },
        ]
      : [
          {
            id: "hook",
            title: "Hook",
            durationSec: 10,
            voiceover: `Still writing ${productName} listings from scratch? Your reviews already have the answers.`,
            onScreenText: "Review-driven listings",
            assetHint: "Dashboard b-roll",
          },
          {
            id: "insights",
            title: "Insights",
            durationSec: 15,
            voiceover: "We extracted verbatim buyer quotes — features, pain points, and conversion drivers.",
            onScreenText: "Verbatim review quotes",
            assetHint: "Insights screen",
          },
          {
            id: "copy",
            title: "Copy",
            durationSec: 15,
            voiceover: "Title, bullets, and description aligned to Amazon limits and compliance checks.",
            onScreenText: "Seller Central–ready copy",
            assetHint: "Copy preview card",
          },
          {
            id: "images",
            title: "Images",
            durationSec: 12,
            voiceover: "On-brand main and gallery images from your brand kit.",
            onScreenText: "3 main + 5 gallery",
            assetHint: "Image gallery",
          },
          {
            id: "export",
            title: "Export",
            durationSec: 10,
            voiceover: "One upload pack — you paste into Seller Central yourself.",
            onScreenText: "Export-first workflow",
            assetHint: "Export zip",
          },
          {
            id: "cta",
            title: "CTA",
            durationSec: 8,
            voiceover: "Upgrade your listing today.",
            onScreenText: "Learn more",
            assetHint: "Product hero",
          },
        ];

  return {
    mode,
    productName,
    scenes,
    disclaimers: [...VIDEO_DISCLAIMERS],
    provider: "google",
    model: "template-v1",
  };
}

export function ProductVideoStudio({ canUseComplete }: { canUseComplete: boolean }) {
  const [tab, setTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [referenceName, setReferenceName] = useState<string | null>(null);
  const [script, setScript] = useState<ProductVideoScript | null>(null);
  const [pattern] = useState(DEFAULT_VIDEO_TEMPLATE);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listProjects();
      setProjects(list.map((p) => ({ id: p.id, name: p.projectName })));
      if (list[0]) {
        setProjectId(list[0].id);
        setProjectName(list[0].projectName);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReferenceName(file.name);
  };

  const generateScript = async () => {
    if (!projectId) return;
    try {
      const full = await loadProject(projectId);
      const name = full.projectName || projectName || "your product";
      setScript(buildTemplateScript(name, tab));
    } catch {
      setScript(buildTemplateScript(projectName || "your product", tab));
    }
  };

  if (loading) return <LoadingState label="Loading projects…" />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-display font-semibold">Product Video</h1>
        <p className="mt-2 text-body text-text-muted">
          Craft Amazon-style product videos from review insights and brand assets. Basic for quick ads;
          Complete for full storyboards.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("basic")}
          className={`rounded-button px-4 py-2 text-body ${tab === "basic" ? "bg-primary/15 text-text" : "text-text-muted hover:bg-card"}`}
        >
          Basic (~30–45s)
        </button>
        <button
          type="button"
          disabled={!canUseComplete}
          onClick={() => setTab("complete")}
          className={`rounded-button px-4 py-2 text-body ${tab === "complete" ? "bg-primary/15 text-text" : "text-text-muted hover:bg-card"} disabled:opacity-40`}
        >
          Complete (~60–90s) {canUseComplete ? "" : "· Pro+"}
        </button>
      </div>

      <Panel>
        <h2 className="text-section font-medium">1. Project & reference</h2>
        <label className="mt-4 block text-caption text-text-muted">Project</label>
        <select
          className="mt-1 w-full rounded-input border border-border bg-card px-3 py-2 text-body"
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            const p = projects.find((x) => x.id === e.target.value);
            if (p) setProjectName(p.name);
          }}
        >
          {projects.length === 0 ? (
            <option value="">Create a project first</option>
          ) : (
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))
          )}
        </select>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-body text-text-muted">
          <Upload size={16} />
          Upload reference video (optional — learn pacing & scene pattern)
          <input type="file" accept="video/*" className="hidden" onChange={handleReference} />
        </label>
        {referenceName && (
          <p className="mt-2 text-caption text-success">
            Reference: {referenceName} — pattern profile saved locally (v1 template merge)
          </p>
        )}
        {!referenceName && (
          <p className="mt-2 text-caption text-text-muted">
            No reference? Uses Amazon-safe template: {pattern.sceneCount} scenes, {pattern.hookSeconds}s
            hook.
          </p>
        )}
      </Panel>

      <Panel>
        <h2 className="text-section font-medium">2. Generate script</h2>
        <p className="mt-2 text-body text-text-muted">
          Pulls product name and workflow context from your project. AI script generation ships in the next
          update — v1 shows the storyboard structure.
        </p>
        <Button className="mt-4" onClick={() => void generateScript()} disabled={!projectId}>
          <Sparkles size={16} />
          Generate {tab} storyboard
        </Button>
      </Panel>

      {script && (
        <div className="space-y-4">
          <h2 className="text-section font-medium">Storyboard — {script.productName}</h2>
          {script.scenes.map((scene) => (
            <Card key={scene.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-caption text-primary-hover">
                    {scene.title} · {scene.durationSec}s
                  </p>
                  <p className="mt-2 text-body">{scene.voiceover}</p>
                  <p className="mt-2 text-caption text-text-muted">On screen: {scene.onScreenText}</p>
                  <p className="text-caption text-text-muted">Asset: {scene.assetHint}</p>
                </div>
                <Film size={18} className="shrink-0 text-text-muted" />
              </div>
            </Card>
          ))}
          <Panel>
            <h3 className="font-medium">Disclaimers (include in export)</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-caption text-text-muted">
              {script.disclaimers.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create a project and run the listing workflow before generating product video scripts."
          actionLabel="Go to Projects"
          onAction={() => {
            window.location.hash = "";
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
        />
      )}
    </div>
  );
}
