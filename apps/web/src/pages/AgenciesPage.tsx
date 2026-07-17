import { Briefcase, DollarSign, FileOutput, FolderOpen, Users } from "lucide-react";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { FeatureGrid } from "../components/marketing/FeatureGrid";
import { ButtonLink } from "../components/ui/button";
import { Panel } from "../components/ui/card";

export function AgenciesPage() {
  return (
    <>
      <PageMeta
        title="For Agencies"
        description="Client workspaces, per-project API cost tracking, creative briefs, and upload packs for Amazon listing agencies."
        path="/for-agencies"
      />
      <Hero
        badge="Agency plan $199/mo"
        title="One desk for every client listing"
        subtitle="Stop rebuilding the same workflow in spreadsheets and ChatGPT threads. Amzi Loci gives freelancers and micro-agencies a repeatable production line."
        primaryCta={{ to: "/download", label: "Download desktop app" }}
        secondaryCta={{ to: "/pricing", label: "Agency pricing" }}
      />

      <section className="container-page pb-12">
        <FeatureGrid
          items={[
            {
              icon: FolderOpen,
              title: "Client / project workspaces",
              description:
                "Organize work by client and SKU. Auto-save reviews, insights, copy, and images per project.",
            },
            {
              icon: DollarSign,
              title: "Per-project usage",
              description:
                "Track estimated API spend per client for accurate billing and margin visibility.",
            },
            {
              icon: FileOutput,
              title: "Creative brief export",
              description:
                "Markdown brief with insights, brand summary, and image slot plan — client-ready deliverable.",
            },
            {
              icon: Briefcase,
              title: "Upload pack handoff",
              description:
                "One zip for your VA or client ops team: images, copy, checklist, and README.",
            },
            {
              icon: Users,
              title: "5 devices (Agency plan)",
              description: "Small team access without enterprise SaaS overhead.",
            },
          ]}
        />
      </section>

      <section className="container-page pb-20">
        <Panel>
          <h2 className="text-section font-medium">Typical agency workflow</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-body text-text-muted">
            <li>Create project: client name + product</li>
            <li>Import reviews → extract insights → apply brand kit</li>
            <li>Generate copy and images</li>
            <li>Export creative brief + upload pack</li>
            <li>Invoice client using per-project usage totals</li>
          </ol>
          <ButtonLink to="/contact" className="mt-6" variant="secondary">
            Talk to us
          </ButtonLink>
        </Panel>
      </section>
    </>
  );
}
