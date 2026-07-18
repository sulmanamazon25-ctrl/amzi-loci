import { IMAGE_TIERS, type ImageTier } from "@amzi-loci/shared";
import { Panel } from "../ui/card";
import { Button } from "../ui/button";
import { ImageGallery } from "../ImageGallery";
import type { GeneratedImage } from "../../lib/images";
import type { ImageSlot } from "@amzi-loci/shared";

interface ImagesScreenProps {
  imageTier: ImageTier;
  onImageTierChange: (tier: ImageTier) => void;
  selectedBrandKitId: string | null;
  productContext: string;
  generatedImages: GeneratedImage[];
  loading: boolean;
  generateProgress: string | null;
  regeneratingId: string | null;
  error: string | null;
  onGenerate: () => void;
  onRegenerate: (slot: ImageSlot) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function ImagesScreen({
  imageTier,
  onImageTierChange,
  selectedBrandKitId,
  productContext,
  generatedImages,
  loading,
  generateProgress,
  regeneratingId,
  error,
  onGenerate,
  onRegenerate,
  onBack,
  onContinue,
}: ImagesScreenProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold">Listing images</h2>
          <p className="text-body text-text-muted">3 main + 5 gallery — uses your Google API key.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" disabled={generatedImages.length === 0} onClick={onContinue}>
            Continue to export
          </Button>
        </div>
      </div>

      <Panel className="flex flex-wrap items-end gap-4">
        <div className="min-w-[240px] flex-1">
          <label className="mb-2 block text-caption text-text-muted">Image quality tier</label>
          <select
            value={imageTier}
            onChange={(e) => onImageTierChange(e.target.value as ImageTier)}
            className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
          >
            {IMAGE_TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label} — {tier.estimatedCost}
              </option>
            ))}
          </select>
          <p className="mt-1 text-caption text-text-muted">
            {IMAGE_TIERS.find((t) => t.id === imageTier)?.description}
          </p>
        </div>
        <Button
          variant="primary"
          disabled={loading || !selectedBrandKitId || !productContext.trim()}
          onClick={onGenerate}
        >
          {loading ? "Generating…" : "Generate images"}
        </Button>
      </Panel>

      {!selectedBrandKitId && (
        <p className="text-body text-danger">Go back to Brand and select a saved kit.</p>
      )}

      <div className="workflow-embed">
        <ImageGallery
          images={generatedImages}
          loading={loading}
          progress={generateProgress}
          onRegenerate={onRegenerate}
          regeneratingId={regeneratingId}
        />
      </div>

      {error && <p className="text-body text-danger">{error}</p>}
    </div>
  );
}
