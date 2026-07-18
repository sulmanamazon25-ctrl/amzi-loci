import type { ProductInsight } from "@amzi-loci/shared";
import { Panel } from "../ui/card";
import { Button } from "../ui/button";
import { BrandKitEditor } from "../BrandKitEditor";

interface BrandScreenProps {
  productContext: string;
  onProductContextChange: (value: string) => void;
  selectedBrandKitId: string | null;
  onSelectBrandKitId: (id: string | null) => void;
  insights: ProductInsight[];
  onBack: () => void;
  onContinue: () => void;
}

export function BrandScreen({
  productContext,
  onProductContextChange,
  selectedBrandKitId,
  onSelectBrandKitId,
  insights,
  onBack,
  onContinue,
}: BrandScreenProps) {
  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-heading font-semibold">Brand kit</h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!selectedBrandKitId || !productContext.trim()}
              onClick={onContinue}
            >
              Continue to copy
            </Button>
          </div>
        </div>

        <label className="text-caption text-text-muted">Product name / context</label>
        <input
          value={productContext}
          onChange={(e) => onProductContextChange(e.target.value)}
          placeholder="e.g. Stainless steel water bottle, 32oz, matte black"
          className="rounded-input border border-border bg-card px-4 py-2 text-body focus:border-primary focus:outline-none"
        />

        <div className="workflow-embed">
          <BrandKitEditor
            compact
            selectedKitId={selectedBrandKitId}
            onSelectKitId={onSelectBrandKitId}
            productContext={productContext}
            insights={insights}
            showPromptPreview
          />
        </div>
      </div>

      <Panel>
        <h3 className="mb-4 text-section font-medium">Live preview</h3>
        <p className="text-body text-text-muted">
          Brand colors and tone apply to generated images and listing copy.
        </p>
        <div className="mt-6 rounded-card border border-border bg-card p-6">
          <div className="mb-3 h-8 w-24 rounded bg-primary/30" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-4/5 rounded bg-white/10" />
            <div className="h-3 w-3/5 rounded bg-white/10" />
          </div>
        </div>
      </Panel>
    </div>
  );
}
