import type { ApiProvider, ListingCopy, ProductInsight } from "@amzi-loci/shared";
import { AMAZON_LIMITS } from "@amzi-loci/shared";
import { Panel, Card } from "../ui/card";
import { Button } from "../ui/button";
import { ListingCopyPanel } from "../ListingCopyPanel";

interface CopyScreenProps {
  brandKitId: string | null;
  productContext: string;
  insights: ProductInsight[];
  provider: ApiProvider;
  listingCopy: ListingCopy | null;
  onCopyChange: (copy: ListingCopy) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CopyScreen({
  brandKitId,
  productContext,
  insights,
  provider,
  listingCopy,
  onCopyChange,
  onBack,
  onContinue,
}: CopyScreenProps) {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading font-semibold">Listing copy</h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button variant="primary" onClick={onContinue}>
              Continue to images
            </Button>
          </div>
        </div>
        <div className="workflow-embed">
          <ListingCopyPanel
            brandKitId={brandKitId}
            productContext={productContext}
            insights={insights}
            provider={provider}
            copy={listingCopy}
            onCopyChange={onCopyChange}
          />
        </div>
      </div>

      <Panel>
        <h3 className="mb-4 text-section font-medium">Amazon preview</h3>
        <Card className="space-y-3">
          <p className="text-caption text-warning">★★★★★</p>
          <p className="text-body font-medium leading-snug">
            {listingCopy?.title || "Product title will appear here"}
          </p>
          <ul className="space-y-1 text-caption text-text-muted">
            {(listingCopy?.bullets ?? ["Bullet points will appear here"]).map((b, i) => (
              <li key={i}>• {b || `Bullet ${i + 1}`}</li>
            ))}
          </ul>
          <p className="border-t border-border pt-3 text-caption text-text-muted">
            {listingCopy?.description?.slice(0, 200) ||
              "Description preview…"}
            {(listingCopy?.description?.length ?? 0) > 200 ? "…" : ""}
          </p>
          {listingCopy && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-3 text-caption">
              <span className={listingCopy.title.length > AMAZON_LIMITS.titleMax ? "text-danger" : "text-success"}>
                Title {listingCopy.title.length}/{AMAZON_LIMITS.titleMax}
              </span>
            </div>
          )}
        </Card>
      </Panel>
    </div>
  );
}
