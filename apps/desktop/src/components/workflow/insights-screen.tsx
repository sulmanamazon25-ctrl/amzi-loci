import type { ProductInsight } from "@amzi-loci/shared";
import { Panel } from "../ui/card";
import { Badge } from "../ui/card";
import { StatCard } from "../ui/stat-card";
import { Button } from "../ui/button";
import { ThumbsDown, ThumbsUp, Target } from "lucide-react";

interface InsightsScreenProps {
  insights: ProductInsight[];
  meta: { model: string; reviewCount: number } | null;
  onUpdateInsight: (id: string, patch: Partial<ProductInsight>) => void;
  onBack: () => void;
  onContinue: () => void;
}

function topPain(insights: ProductInsight[]) {
  return insights
    .filter((i) => i.sentiment === "negative" || i.sentiment === "mixed")
    .sort((a, b) => b.confidence - a.confidence)[0];
}

function mostLoved(insights: ProductInsight[]) {
  return insights
    .filter((i) => i.sentiment === "positive")
    .sort((a, b) => b.confidence - a.confidence)[0];
}

function buyingDriver(insights: ProductInsight[]) {
  return insights.filter((i) => i.conversionDriver).sort((a, b) => b.confidence - a.confidence)[0];
}

export function InsightsScreen({
  insights,
  meta,
  onUpdateInsight,
  onBack,
  onContinue,
}: InsightsScreenProps) {
  const pain = topPain(insights);
  const loved = mostLoved(insights);
  const driver = buyingDriver(insights);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold">Review insights</h2>
          {meta && (
            <p className="text-body text-text-muted">
              {meta.reviewCount} reviews · {meta.model}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Continue to brand
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Top pain point"
          value={pain?.feature ?? "—"}
          icon={<ThumbsDown size={16} />}
          trend={pain ? `${Math.round(pain.confidence * 100)}% conf` : undefined}
        />
        <StatCard
          label="Most loved"
          value={loved?.feature ?? "—"}
          icon={<ThumbsUp size={16} />}
          trend={loved ? `${Math.round(loved.confidence * 100)}% conf` : undefined}
        />
        <StatCard
          label="Buying motivation"
          value={driver?.feature ?? "—"}
          icon={<Target size={16} />}
          trend={driver ? "conversion driver" : undefined}
        />
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full text-left text-body">
          <thead>
            <tr className="border-b border-border text-caption text-text-muted">
              <th className="px-4 py-3 font-medium">Feature</th>
              <th className="px-4 py-3 font-medium">Sentiment</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Source quote</th>
            </tr>
          </thead>
          <tbody>
            {insights.map((insight) => (
              <tr key={insight.id} className="border-b border-border/60">
                <td className="px-4 py-3">
                  <input
                    value={insight.feature}
                    onChange={(e) => onUpdateInsight(insight.id, { feature: e.target.value })}
                    className="w-full rounded-input border border-border bg-card px-2 py-1 text-body"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={insight.sentiment}
                    onChange={(e) =>
                      onUpdateInsight(insight.id, {
                        sentiment: e.target.value as ProductInsight["sentiment"],
                      })
                    }
                    className="rounded-input border border-border bg-card px-2 py-1 text-body"
                  >
                    <option value="positive">positive</option>
                    <option value="negative">negative</option>
                    <option value="neutral">neutral</option>
                    <option value="mixed">mixed</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={insight.conversionDriver}
                    onChange={(e) =>
                      onUpdateInsight(insight.id, { conversionDriver: e.target.checked })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge tone={insight.conversionDriver ? "primary" : "neutral"}>
                    {Math.round(insight.confidence * 100)}%
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <textarea
                    rows={2}
                    value={insight.sourceQuote}
                    onChange={(e) =>
                      onUpdateInsight(insight.id, { sourceQuote: e.target.value })
                    }
                    className="w-full min-w-[200px] rounded-input border border-border bg-card px-2 py-1 text-body"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
