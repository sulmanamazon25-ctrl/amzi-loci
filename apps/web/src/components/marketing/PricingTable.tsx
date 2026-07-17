import { LICENSE_PLANS } from "@amzi-loci/shared";
import { Check } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/card";

const FEATURES: Record<string, string[]> = {
  starter: [
    "Full 6-step workflow",
    "BYOK — your API keys",
    "Listing copy + compliance",
    "Upload pack export",
    "1 device",
  ],
  pro: [
    "Everything in Starter",
    "Studio: A+, ads, localize",
    "Image variations",
    "2 devices",
  ],
  agency: [
    "Everything in Pro",
    "Project workspaces",
    "Per-client usage tracking",
    "Creative brief export",
    "5 devices",
  ],
};

export function PricingTable() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {LICENSE_PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={plan.id === "pro" ? "border-primary/40 ring-1 ring-primary/20" : ""}
        >
          {plan.id === "pro" && (
            <Badge tone="primary" className="mb-3">
              Most popular
            </Badge>
          )}
          <h3 className="text-section font-medium">{plan.label}</h3>
          <p className="mt-1 text-display font-semibold">{plan.priceLabel}</p>
          <p className="mt-2 text-body text-text-muted">{plan.description}</p>
          <ul className="mt-6 space-y-2">
            {(FEATURES[plan.id] ?? []).map((f) => (
              <li key={f} className="flex items-start gap-2 text-body text-text-muted">
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                {f}
              </li>
            ))}
          </ul>
          <ButtonLink to="/download" className="mt-8 w-full" variant={plan.id === "pro" ? "primary" : "secondary"}>
            Start trial
          </ButtonLink>
        </Card>
      ))}
    </div>
  );
}
