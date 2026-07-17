import {
  ClipboardList,
  FolderKanban,
  Globe,
  Image,
  Key,
  MessageSquareText,
  Palette,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { FeatureGrid } from "../components/marketing/FeatureGrid";
import { WorkflowSteps } from "../components/marketing/WorkflowSteps";

export function FeaturesPage() {
  return (
    <>
      <PageMeta
        title="Features"
        description="Reviews to insights, brand kits, listing copy, images, compliance, and upload packs — all in one Windows desktop workflow."
        path="/features"
      />
      <Hero
        title="Everything you need to produce a listing"
        subtitle="From raw reviews to a Seller Central upload pack — without juggling five different tools."
      />

      <section className="container-page pb-12">
        <WorkflowSteps />
      </section>

      <section className="container-page space-y-16 pb-20">
        <FeatureGrid
          items={[
            {
              icon: MessageSquareText,
              title: "Review-driven insights",
              description:
                "Paste reviews or import CSV. AI extracts features, sentiment, and conversion drivers — not generic keyword fluff.",
            },
            {
              icon: Palette,
              title: "Brand kits",
              description:
                "Colors, fonts, tone sliders, and reference images keep every asset on-brand across copy and images.",
            },
            {
              icon: ClipboardList,
              title: "Listing copy",
              description:
                "Title, 5 bullets, description, and backend keywords with Amazon character limits and live counters.",
            },
            {
              icon: Image,
              title: "Image generation",
              description:
                "3 main + 5 gallery slots via Google image models. Regenerate individual slots without redoing the batch.",
            },
            {
              icon: ShieldCheck,
              title: "Compliance checklist",
              description:
                "Pass, warn, and fail checks before upload. Reduces Seller Central rejections and revision cycles.",
            },
            {
              icon: Upload,
              title: "Upload pack",
              description:
                "Export a zip with images/, listing-copy.txt, upload-checklist.txt, creative-brief.md, and README.",
            },
            {
              icon: FolderKanban,
              title: "Project workspaces",
              description:
                "Save client projects locally. Auto-save workflow state. Resume exactly where you left off.",
            },
            {
              icon: Sparkles,
              title: "Studio (Pro+)",
              description: "A+ modules, ad creatives, marketplace localization, and product variations.",
            },
            {
              icon: Key,
              title: "BYOK architecture",
              description:
                "API keys stored in Windows keychain. Server proxies AI calls with proprietary prompts — your data stays local.",
            },
            {
              icon: Globe,
              title: "Multi-provider AI",
              description: "Anthropic, OpenAI, and Google — pick the best model per step.",
            },
          ]}
        />
      </section>
    </>
  );
}
