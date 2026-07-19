import type { AppSnapshotView } from "../components/marketing/AppSnapshot";

export type ProductionPhase = {
  id: string;
  title: string;
  subtitle: string;
  body: string[];
  snapshotView: AppSnapshotView;
  link?: { to: string; label: string };
};

export const PRODUCTION_TIMELINE_NOTE =
  "Typical first listing: under 30 minutes once your Google key is saved — most time is review paste and a quick compliance pass before export.";

export const PRODUCTION_PHASES: ProductionPhase[] = [
  {
    id: "byok",
    title: "Add your Google API key",
    subtitle: "One key, full workflow",
    body: [
      "Open Settings and paste a single Google AI key. Click Test key, then Save to keychain — keys stay in Windows Credential Manager, never on our servers.",
      "Enable billing on your Google Cloud project before generating images. Free-tier-only accounts often fail at the image step.",
      "Anthropic and OpenAI are optional — leave them empty unless you use advanced BYOK presets.",
    ],
    snapshotView: "settings",
    link: { to: "/byok-setup", label: "BYOK setup guide" },
  },
  {
    id: "reviews",
    title: "Paste customer reviews",
    subtitle: "Reviews are the source of truth",
    body: [
      "Create a project and paste Amazon reviews — one per line or bulk from your CRM. Amzi Loci does not scrape product pages; you bring the voice of the customer.",
      "Twelve to twenty reviews is enough for strong insights on most SKUs. The app shows word count and review totals before you continue.",
    ],
    snapshotView: "reviews",
  },
  {
    id: "insights",
    title: "Extract AI insights",
    subtitle: "What buyers actually care about",
    body: [
      "Gemini reads every review and surfaces recurring themes — battery life, fit, durability, value — as tags and insight cards.",
      "These insights drive brand tone, listing copy prompts, and image generation. Edit or dismiss anything that does not match your positioning.",
    ],
    snapshotView: "insights",
  },
  {
    id: "copy",
    title: "Generate listing copy",
    subtitle: "Title, bullets, keywords — compliance built in",
    body: [
      "Run the copy step to produce a Seller Central–ready title, five bullet points, description, and backend keywords grounded in review language.",
      "Character counters show live limits (200 for title, 250 per bullet). Warnings flag claims that need substantiation before export.",
    ],
    snapshotView: "copy",
  },
  {
    id: "images",
    title: "Generate listing images",
    subtitle: "3 main + 5 gallery with Imagen",
    body: [
      "The image step produces eight listing images aligned to your brand kit and review insights — hero, lifestyle, detail, and gallery variants.",
      "Google Imagen Fast is the default tier for cost-effective client work. Regenerate individual slots without rerunning the whole pipeline.",
    ],
    snapshotView: "images",
  },
  {
    id: "export",
    title: "Export the upload pack",
    subtitle: "One zip for Seller Central",
    body: [
      "Export bundles images, listing copy, a compliance checklist, creative brief, and README into listing-upload-pack.zip.",
      "The checklist ticks off character limits, image count, and common Amazon policy flags before you paste into Seller Central.",
    ],
    snapshotView: "export",
  },
  {
    id: "product-video",
    title: "Optional — product video POV",
    subtitle: "Storyboard to short-form clip",
    body: [
      "From your listing images, generate a storyboard and POV product video — useful for A+ content, ads, or social clips.",
      "The rendered MP4 can ship inside the same upload pack. Skip this step if you only need static listing assets.",
    ],
    snapshotView: "product-video",
    link: { to: "/features", label: "See all features" },
  },
];

export const PRODUCTION_CHECKLIST = [
  "Windows 10/11 desktop app installed (Setup.exe recommended)",
  "Google API key saved and tested in Settings",
  "Billing enabled on Google Cloud for image generation",
  "License activated or 14-day trial started",
  "Project created with 12+ customer reviews pasted",
  "All six workflow steps completed through Export",
  "Compliance checklist green before Seller Central upload",
  "Upload pack zip extracted and images uploaded to listing",
] as const;
