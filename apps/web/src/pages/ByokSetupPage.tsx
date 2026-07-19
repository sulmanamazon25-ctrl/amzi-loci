import {
  BYOK_COST_GUARDRAILS,
  BYOK_PRESETS,
  BYOK_PROVIDER_LINKS,
  BYOK_TASK_MATRIX,
  CLIENT_SINGLE_PROVIDER_PRESET_ID,
  getClientSingleProviderPreset,
  type ByokPresetId,
} from "@amzi-loci/shared";
import { Check, ExternalLink, Key, X } from "lucide-react";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { ButtonLink } from "../components/ui/button";
import { Badge, Card, Panel } from "../components/ui/card";

const PROVIDER_LABELS = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
} as const;

export function ByokSetupPage() {
  const clientPreset = getClientSingleProviderPreset();
  const advancedPresets = BYOK_PRESETS.filter((p) => p.id !== CLIENT_SINGLE_PROVIDER_PRESET_ID);

  return (
    <>
      <PageMeta
        title="BYOK Setup"
        description="One Google API key for the full Amzi Loci workflow — insights, copy, and images. Cost-effective client setup guide."
        path="/byok-setup"
      />
      <Hero
        badge="Bring your own keys"
        title="One key for clients: Google AI"
        subtitle="Add a single Google key to run all six workflow steps — insights, listing copy, and listing images. Typical cost $3–6 per listing. Keys stay in Windows Credential Manager."
        primaryCta={{ to: "/download", label: "Download desktop app" }}
        secondaryCta={{ to: "/getting-started", label: "Getting started" }}
      />

      <section className="container-page pb-12">
        <Card className="ring-1 ring-primary/40">
          <Badge tone="primary" className="mb-3 w-fit">
            Recommended for clients
          </Badge>
          <h2 className="text-heading font-semibold">{clientPreset.name}</h2>
          <p className="mt-2 max-w-2xl text-body text-text-muted">{clientPreset.tagline}</p>
          <p className="mt-4 text-display font-semibold">{clientPreset.estimatedCostUsd}</p>
          <p className="text-caption text-text-muted">typical per listing</p>
          <ul className="mt-4 space-y-2 text-body text-text-muted">
            <li>
              <strong className="text-text">Text:</strong> Google Gemini ({clientPreset.textModel})
            </li>
            <li>
              <strong className="text-text">Images:</strong> Google Imagen Fast ({clientPreset.imageTier})
            </li>
            <li>
              <strong className="text-text">Keys needed:</strong> Google only
            </li>
          </ul>
          <p className="mt-4 text-body text-text-muted">{clientPreset.bestFor}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={BYOK_PROVIDER_LINKS.google.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-body font-medium text-primary-hover hover:underline"
            >
              Get Google API key <ExternalLink size={14} />
            </a>
          </div>
          <Panel className="mt-6 border-primary/20 bg-primary/5">
            <p className="text-body text-text-muted">
              <strong className="text-text">Enable billing</strong> on your Google Cloud project before
              generating images — free-tier-only accounts often fail at the image step.
            </p>
          </Panel>
        </Card>
      </section>

      <section className="container-page pb-12">
        <h2 className="text-heading font-semibold">Advanced presets</h2>
        <p className="mt-2 max-w-2xl text-body text-text-muted">
          Optional multi-key setups if you want lower text cost or premium copy quality.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {advancedPresets.map((preset) => (
            <Card key={preset.id} className="flex flex-col">
              <h3 className="text-section font-medium">{preset.name}</h3>
              <p className="mt-1 text-body text-text-muted">{preset.tagline}</p>
              <p className="mt-4 text-display font-semibold">{preset.estimatedCostUsd}</p>
              <p className="text-caption text-text-muted">typical per listing</p>
              <ul className="mt-4 flex-1 space-y-2 text-body text-text-muted">
                <li>
                  <strong className="text-text">Text:</strong> {PROVIDER_LABELS[preset.textProvider]}{" "}
                  <span className="text-caption">({preset.textModel})</span>
                </li>
                <li>
                  <strong className="text-text">Images:</strong> {PROVIDER_LABELS[preset.imageProvider]}{" "}
                  <span className="text-caption">({preset.imageTier})</span>
                </li>
                <li>
                  <strong className="text-text">Keys needed:</strong>{" "}
                  {preset.keysRequired.map((k) => PROVIDER_LABELS[k]).join(" + ")}
                </li>
              </ul>
              <p className="mt-4 text-caption text-text-muted">{preset.bestFor}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="container-page">
          <h2 className="text-heading font-semibold">Which key does what?</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-body">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 pr-4 font-medium">Task</th>
                  <th className="pb-3 px-4 font-medium">Anthropic</th>
                  <th className="pb-3 px-4 font-medium">OpenAI</th>
                  <th className="pb-3 pl-4 font-medium">Google</th>
                </tr>
              </thead>
              <tbody>
                {BYOK_TASK_MATRIX.map((row) => (
                  <tr key={row.task} className="border-b border-border/60">
                    <td className="py-3 pr-4">{row.task}</td>
                    <td className="px-4">
                      <MatrixCell ok={row.anthropic} />
                    </td>
                    <td className="px-4">
                      <MatrixCell ok={row.openai} />
                    </td>
                    <td className="px-4">
                      <MatrixCell ok={row.google} required={row.task === "Listing images"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-caption text-text-muted">
            Listing images and Imagen/Gemini tiers require a Google AI key — Anthropic and OpenAI cannot
            generate images in Amzi Loci.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-heading font-semibold">Get your keys</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(Object.entries(BYOK_PROVIDER_LINKS) as Array<
            [keyof typeof BYOK_PROVIDER_LINKS, (typeof BYOK_PROVIDER_LINKS)[keyof typeof BYOK_PROVIDER_LINKS]]
          >).map(([id, links]) => (
            <Card key={id}>
              <Key size={20} className="text-primary-hover" />
              <h3 className="mt-3 font-medium">{links.label}</h3>
              <p className="mt-2 text-body text-text-muted">
                {id === "google"
                  ? "Required for images. Also works for insights and copy (Simplest preset)."
                  : id === "openai"
                    ? "Best cost for insights and listing copy."
                    : "Highest-quality insights and listing copy."}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={links.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-body text-primary-hover hover:underline"
                >
                  Get API key <ExternalLink size={14} />
                </a>
                <a
                  href={links.billingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text"
                >
                  Billing & limits <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <Panel>
          <h2 className="text-section font-medium">Add keys in the desktop app</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-body text-text-muted">
            <li>Download and install Amzi Loci for Windows.</li>
            <li>Open <strong className="text-text">Settings</strong> from the sidebar.</li>
            <li>Paste each API key, click <strong className="text-text">Test key</strong>, then{" "}
              <strong className="text-text">Save</strong>.</li>
            <li>Keys are stored in Windows Credential Manager — not on our servers.</li>
            <li>
              For client work, add <strong className="text-text">Google only</strong> — one key covers
              all six workflow steps. Enable billing for image generation.
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/download">Download v0.11</ButtonLink>
            <ButtonLink to="/features" variant="secondary">
              See workflow
            </ButtonLink>
          </div>
        </Panel>
      </section>

      <section className="container-page pb-20">
        <h2 className="text-heading font-semibold">Cost guardrails</h2>
        <ul className="mt-6 space-y-3">
          {BYOK_COST_GUARDRAILS.map((tip) => (
            <li key={tip} className="flex gap-3 text-body text-text-muted">
              <Check size={18} className="mt-0.5 shrink-0 text-success" />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function MatrixCell({ ok, required }: { ok: boolean; required?: boolean }) {
  if (ok) {
    return (
      <span className="inline-flex items-center gap-1 text-success">
        <Check size={16} /> {required ? "Required" : "Yes"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-text-muted">
      <X size={16} /> —
    </span>
  );
}

export type { ByokPresetId };
