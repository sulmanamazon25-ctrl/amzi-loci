export const API_STATUS_URL =
  import.meta.env.VITE_API_STATUS_URL ??
  "https://iz1yfanbxaefgipk6e1k3o20.46-62-226-89.sslip.io/health";

export const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL ?? "hello@amziloci.com";

export const DOWNLOAD_BASE_URL =
  import.meta.env.VITE_DOWNLOAD_BASE_URL ?? "/downloads";

export { APP_VERSION } from "@amzi-loci/shared";

export const WORKFLOW_STEPS = [
  { num: 1, title: "Reviews", desc: "Paste or import customer reviews" },
  { num: 2, title: "Insights", desc: "AI extracts what buyers care about" },
  { num: 3, title: "Brand", desc: "Apply colors, tone, and brand kit" },
  { num: 4, title: "Copy", desc: "Title, bullets, description, keywords" },
  { num: 5, title: "Images", desc: "3 main + 5 gallery listing images" },
  { num: 6, title: "Export", desc: "Upload pack zip for Seller Central" },
] as const;

export const NAV_LINKS = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/for-agencies", label: "Agencies" },
  { to: "/getting-started", label: "Getting started" },
  { to: "/download", label: "Download" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/getting-started", label: "Getting started" },
    { to: "/download", label: "Download" },
    { to: "/changelog", label: "Changelog" },
  ],
  company: [
    { to: "/about", label: "About" },
    { to: "/byok-setup", label: "BYOK setup" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
  ],
  legal: [
    { to: "/privacy", label: "Privacy" },
    { to: "/terms", label: "Terms" },
  ],
} as const;
