import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";

export function TermsPage() {
  return (
    <>
      <PageMeta
        title="Terms of Service"
        description="Terms of use for Amzi Loci desktop software and subscription plans."
        path="/terms"
      />
      <Hero title="Terms of Service" subtitle="Last updated: July 2026" />

      <section className="container-page prose-page pb-20">
        <h2>Agreement</h2>
        <p>
          By downloading or using Amzi Loci, you agree to these terms. If you do not agree, do not
          use the software.
        </p>
        <h2>Service description</h2>
        <p>
          Amzi Loci provides desktop software that assists with Amazon listing asset production
          using your own third-party AI API keys. We do not guarantee Amazon listing approval or
          sales performance.
        </p>
        <h2>Subscriptions</h2>
        <p>
          Paid plans are billed monthly per device limits shown on the Pricing page. Trials convert
          to paid unless cancelled. Refunds are handled case-by-case.
        </p>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use the service for illegal content or counterfeit products</li>
          <li>Do not reverse-engineer or redistribute the desktop application</li>
          <li>Comply with Amazon's seller policies and AI disclosure requirements</li>
        </ul>
        <h2>Disclaimer</h2>
        <p>
          AI-generated copy and images may require human review. You are responsible for accuracy
          and compliance before publishing to Amazon.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          Amzi Loci is provided as-is. We are not liable for indirect damages, lost revenue, or
          account suspensions resulting from listing content you publish.
        </p>
      </section>
    </>
  );
}
