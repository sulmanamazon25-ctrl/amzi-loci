import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { Panel } from "../components/ui/card";

const FAQ_ITEMS = [
  {
    q: "What is BYOK?",
    a: "Bring Your Own Key. You add your Anthropic, OpenAI, and Google API keys in the desktop app. Keys are stored in Windows Credential Manager — not on our servers except when proxied for AI calls.",
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

      <section className="container-page space-y-4 pb-20">
        {FAQ_ITEMS.map((item) => (
          <Panel key={item.q}>
            <h2 className="text-section font-medium">{item.q}</h2>
            <p className="mt-2 text-body text-text-muted">{item.a}</p>
          </Panel>
        ))}
      </section>
    </>
  );
}
