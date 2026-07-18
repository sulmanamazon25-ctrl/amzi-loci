import { Panel } from "../components/ui/card";
import { UsagePanel } from "../components/UsagePanel";

export function UsagePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-heading font-semibold">Usage</h1>
        <p className="text-body text-text-muted">
          BYOK API spend — filter by project for client billing.
        </p>
      </div>
      <Panel>
        <UsagePanel />
      </Panel>
    </div>
  );
}
