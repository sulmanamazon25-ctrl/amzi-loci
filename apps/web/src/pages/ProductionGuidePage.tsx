import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Download, Key } from "lucide-react";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { AiCreationHero } from "../components/marketing/AiCreationHero";
import { AppSnapshot } from "../components/marketing/AppSnapshot";
import { ButtonLink } from "../components/ui/button";
import { Panel } from "../components/ui/card";
import {
  PRODUCTION_CHECKLIST,
  PRODUCTION_PHASES,
  PRODUCTION_TIMELINE_NOTE,
} from "../lib/production-guide";
import { cn } from "../lib/utils";

export function ProductionGuidePage() {
  return (
    <>
      <PageMeta
        title="How to use in production"
        description="Walk through Amzi Loci in production — BYOK setup, six-step review workflow, upload pack export, and optional product video POV."
        path="/guide"
      />
      <Hero
        badge="Production guide"
        title="How to use Amzi Loci in production"
        subtitle="From Google API key to Seller Central upload pack — a realistic walkthrough of the desktop workflow agencies run every week."
        primaryCta={{ to: "/download", label: "Download for Windows" }}
        secondaryCta={{ to: "/byok-setup", label: "API key guide" }}
      />

      <section className="container-page pb-16">
        <AiCreationHero title="End-to-end workflow at a glance" />
      </section>

      <section className="container-page pb-8">
        <div className="flex items-start gap-3 rounded-card border border-border bg-surface p-6">
          <Clock size={20} className="mt-0.5 shrink-0 text-primary-hover" />
          <p className="text-body text-text-muted">{PRODUCTION_TIMELINE_NOTE}</p>
        </div>
      </section>

      {PRODUCTION_PHASES.map((phase, index) => {
        const reversed = index % 2 === 1;
        return (
          <section
            key={phase.id}
            className={cn(
              "container-page py-12",
              index % 2 === 0 ? "" : "border-y border-border bg-surface",
            )}
          >
            <div
              className={cn(
                "grid items-center gap-10 lg:grid-cols-2",
                reversed && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
              )}
            >
              <div>
                <p className="text-caption font-medium text-primary-hover">{phase.subtitle}</p>
                <h2 className="mt-2 text-heading font-semibold">{phase.title}</h2>
                <div className="mt-4 space-y-3">
                  {phase.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-body text-text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {phase.link && (
                  <Link
                    to={phase.link.to}
                    className="mt-4 inline-block text-body font-medium text-primary-hover hover:underline"
                  >
                    {phase.link.label} →
                  </Link>
                )}
              </div>
              <AppSnapshot view={phase.snapshotView} />
            </div>
          </section>
        );
      })}

      <section className="container-page py-16">
        <h2 className="text-heading font-semibold">Production checklist</h2>
        <p className="mt-2 max-w-2xl text-body text-text-muted">
          Run through this list before your first client delivery or internal listing refresh.
        </p>
        <Panel className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {PRODUCTION_CHECKLIST.map((item) => (
              <li key={item} className="flex gap-2 text-body text-text-muted">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="container-page pb-20">
        <Panel className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-heading font-semibold">Ready to run your first listing?</h2>
            <p className="mt-2 max-w-xl text-body text-text-muted">
              Download the desktop app, save your Google key, and walk the six steps. Need install help?{" "}
              <Link to="/getting-started" className="text-primary-hover hover:underline">
                Getting started guide
              </Link>
              {" · "}
              <Link to="/byok-setup" className="text-primary-hover hover:underline">
                BYOK setup
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/download">
              <Download size={18} />
              Download
            </ButtonLink>
            <ButtonLink to="/getting-started" variant="secondary">
              Getting started
            </ButtonLink>
            <ButtonLink to="/byok-setup" variant="secondary">
              <Key size={18} />
              BYOK setup
            </ButtonLink>
          </div>
        </Panel>
      </section>
    </>
  );
}
