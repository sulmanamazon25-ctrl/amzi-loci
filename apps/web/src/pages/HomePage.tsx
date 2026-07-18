import { Link } from "react-router-dom";
import {
  Building2,
  FileText,
  Image,
  Key,
  Package,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { APP_VERSION } from "../lib/site";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { FeatureGrid } from "../components/marketing/FeatureGrid";
import { WorkflowSteps } from "../components/marketing/WorkflowSteps";
import { ProductVideo } from "../components/marketing/ProductVideo";
import { ButtonLink } from "../components/ui/button";
import { Panel } from "../components/ui/card";

export function HomePage() {
  return (
    <>
      <PageMeta
        title="Amzi Loci — Amazon listing desk for agencies"
        description="Turn Amazon reviews into listing copy, images, and upload-ready packs. BYOK, local-first Windows desktop app."
        path="/"
      />
      <Hero
        badge={`v${APP_VERSION} — Desktop MVP`}
        title="One desk for review-driven Amazon listings"
        subtitle="Amzi Loci is a BYOK, local-first Windows app that turns customer reviews into Seller Central–ready copy, images, and upload packs — built for agencies and serious sellers."
        primaryCta={{ to: "/download", label: "Download for Windows" }}
        secondaryCta={{ to: "/getting-started", label: "Getting started" }}
      />

      <section className="container-page pb-16">
        <ProductVideo title="See how it works" />
      </section>

      <section className="container-page pb-20">
        <h2 className="text-heading font-semibold">Six steps. One upload pack.</h2>
        <p className="mt-2 max-w-2xl text-body text-text-muted">
          No scattered ChatGPT tabs. No guessing what buyers care about. Reviews are the source of truth.
        </p>
        <div className="mt-8">
          <WorkflowSteps />
        </div>
      </section>

      <section className="border-y border-border bg-surface py-20">
        <div className="container-page">
          <h2 className="text-heading font-semibold">Built for trust and control</h2>
          <div className="mt-8">
            <FeatureGrid
              items={[
                {
                  icon: Key,
                  title: "Bring your own keys",
                  description:
                    "Your Anthropic, OpenAI, and Google keys stay in Windows Credential Manager. You control cost and data.",
                },
                {
                  icon: Shield,
                  title: "Amazon compliance built in",
                  description:
                    "Character limits, upload checklist, and compliance warnings before you paste into Seller Central.",
                },
                {
                  icon: Users,
                  title: "Agency desk",
                  description:
                    "Client/project workspaces, per-project API usage, and creative brief exports for billing.",
                },
                {
                  icon: Sparkles,
                  title: "Studio (Pro+)",
                  description: "A+ content, ad creatives, localization, and image variations in one place.",
                },
                {
                  icon: Image,
                  title: "Listing images",
                  description: "Generate 3 main + 5 gallery images aligned to your brand kit and review insights.",
                },
                {
                  icon: Package,
                  title: "Upload pack export",
                  description:
                    "One zip: images, listing copy, checklist, creative brief, and README for your team.",
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <Panel className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-heading font-semibold">Ready to ship your next listing?</h2>
            <p className="mt-2 max-w-xl text-body text-text-muted">
              Download the desktop app, add your API keys, and run your first project in under 30 minutes.{" "}
              <Link to="/getting-started" className="text-primary-hover hover:underline">
                Getting started guide
              </Link>
              {" · "}
              <Link to="/byok-setup" className="text-primary-hover hover:underline">
                BYOK setup guide
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/getting-started">Getting started</ButtonLink>
            <ButtonLink to="/pricing" variant="secondary">View pricing</ButtonLink>
            <ButtonLink to="/download" variant="secondary">
              Download
            </ButtonLink>
          </div>
        </Panel>
      </section>

      <section className="container-page pb-20">
        <div className="flex items-center gap-3 text-text-muted">
          <Building2 size={18} />
          <FileText size={18} />
          <p className="text-body">
            Trusted by Amazon freelancers and micro-agencies who deliver listing refreshes every week.
          </p>
        </div>
      </section>
    </>
  );
}
