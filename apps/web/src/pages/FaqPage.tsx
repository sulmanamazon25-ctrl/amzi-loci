import { Link } from "react-router-dom";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { Panel } from "../components/ui/card";

const FAQ_ITEMS = [
  {
    q: "How do I install the desktop app?",
    a: "Download Setup.exe from the Download page or follow our Getting Started guide for one-click install, SmartScreen tips, and your first project walkthrough.",
  },
  {
    q: "What is Product Video?",
    a: "A desktop sidebar tool that builds Basic (~30–45s) or Complete (~60–90s) storyboards from your project — review insights, copy, and image hints for Amazon-style product videos. Complete mode requires Pro+.",
  },
  {
    q: "What is BYOK?",
    a: "Bring Your Own Key. You add Anthropic, OpenAI, and/or Google API keys in Settings. Keys stay in Windows Credential Manager. Google is required for listing images. See our BYOK setup guide for cost-effective presets.",
  },
  {
    q: "Do you store my listing data?",
    a: "Projects (reviews, insights, copy, image paths) are stored locally on your machine. We do not sell or share your listing content.",
  },
  {
    q: "Which AI models are supported?",
    a: "Insights and copy: Anthropic Claude, OpenAI GPT, or Google Gemini. Images: Google Imagen / Gemini image tiers.",
  },
  {
    q: "Does this connect to Amazon Seller Central?",
    a: "Not yet. v1 is export-first: you download an upload pack and paste into Seller Central manually. SP-API import is planned.",
  },
  {
    q: "How much does AI cost per listing?",
    a: "Typically $2–8 depending on review count, image tier, and Studio usage. You pay providers directly via your keys.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 14-day trial in the desktop app. Production Stripe checkout is coming; dev mode allows full workflow testing today.",
  },
  {
    q: "Windows only?",
    a: "Yes for v0.11. macOS and Linux are on the roadmap.",
  },
  {
    q: "Can I use this for clients?",
    a: "Yes. The Agency plan includes project workspaces, usage tracking, and creative brief exports designed for client delivery.",
  },
];

export function FaqPage() {
  return (
    <>
      <PageMeta
        title="FAQ"
        description="Common questions about Amzi Loci — BYOK, pricing, Amazon compliance, data privacy, and supported AI models."
        path="/faq"
      />
      <Hero title="Frequently asked questions" subtitle="Quick answers about the desktop app, billing, and workflow." />

      <section className="container-page space-y-4 pb-12">
        {FAQ_ITEMS.map((item) => (
          <Panel key={item.q}>
            <h2 className="text-section font-medium">{item.q}</h2>
            <p className="mt-2 text-body text-text-muted">{item.a}</p>
          </Panel>
        ))}
      </section>

      <section className="container-page pb-20">
        <Panel>
          <h2 className="text-section font-medium">New to Amzi Loci?</h2>
          <p className="mt-2 text-body text-text-muted">
            Start with the getting started guide for install steps, then add API keys.
          </p>
          <Link
            to="/getting-started"
            className="mt-4 inline-flex text-body font-medium text-primary-hover hover:underline"
          >
            Open getting started guide →
          </Link>
        </Panel>
      </section>

      <section className="container-page pb-20">
        <Panel>
          <h2 className="text-section font-medium">Need help choosing API keys?</h2>
          <p className="mt-2 text-body text-text-muted">
            We recommend the Simplest preset (Google only) to start, or Budget (OpenAI + Google) for
            lower text cost.
          </p>
          <Link
            to="/byok-setup"
            className="mt-4 inline-flex text-body font-medium text-primary-hover hover:underline"
          >
            Open BYOK setup guide →
          </Link>
        </Panel>
      </section>
    </>
  );
}
