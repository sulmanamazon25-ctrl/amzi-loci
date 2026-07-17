import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { PricingTable } from "../components/marketing/PricingTable";
import { Panel } from "../components/ui/card";

export function PricingPage() {
  return (
    <>
      <PageMeta
        title="Pricing"
        description="Starter $29, Pro $79, Agency $199 per month. BYOK — you pay AI providers directly. 14-day trial on desktop."
        path="/pricing"
      />
      <Hero
        title="Simple plans for solo sellers and agencies"
        subtitle="Subscription covers the desktop app and workflow. AI usage is billed by your own provider keys — typically a few dollars per listing."
      />

      <section className="container-page pb-12">
        <PricingTable />
      </section>

      <section className="container-page pb-20">
        <Panel>
          <h2 className="text-section font-medium">What's included in every plan</h2>
          <ul className="mt-4 space-y-2 text-body text-text-muted">
            <li>• Full 6-step workflow (Reviews → Export)</li>
            <li>• Local project storage on your machine</li>
            <li>• Compliance checklist and upload pack</li>
            <li>• 14-day trial — no credit card required in dev mode</li>
          </ul>
          <p className="mt-4 text-caption text-text-muted">
            Checkout and billing are handled inside the desktop app. Stripe integration coming soon for production.
          </p>
        </Panel>
      </section>
    </>
  );
}
