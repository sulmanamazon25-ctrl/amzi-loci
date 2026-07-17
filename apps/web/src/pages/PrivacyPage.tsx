import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";

export function PrivacyPage() {
  return (
    <>
      <PageMeta
        title="Privacy Policy"
        description="How Amzi Loci handles your data — BYOK keys, local storage, and API proxying."
        path="/privacy"
      />
      <Hero title="Privacy Policy" subtitle="Last updated: July 2026" />

      <section className="container-page prose-page pb-20">
        <h2>Overview</h2>
        <p>
          Amzi Loci is a local-first desktop application. Your listing projects, brand kits, and
          API keys are stored primarily on your device.
        </p>
        <h2>API keys (BYOK)</h2>
        <p>
          API keys you enter are stored in Windows Credential Manager on your machine. When you
          run AI features, keys are sent to our API server solely to proxy requests to Anthropic,
          OpenAI, or Google on your behalf. We do not store your raw API keys in our database.
        </p>
        <h2>Project data</h2>
        <p>
          Reviews, insights, generated copy, and image file paths are saved locally under your
          app data directory. We do not upload your listing content to cloud storage.
        </p>
        <h2>Licensing</h2>
        <p>
          We collect a device fingerprint and license status to validate subscriptions. No
          personally identifiable listing content is required for licensing.
        </p>
        <h2>Analytics</h2>
        <p>
          This marketing website does not use third-party analytics cookies in v1. The desktop app
          logs local API usage estimates for your billing reference only.
        </p>
        <h2>Contact</h2>
        <p>Privacy questions: hello@amziloci.com</p>
      </section>
    </>
  );
}
