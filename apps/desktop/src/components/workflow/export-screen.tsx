import type { BrandKit, ListingCopy, ProductInsight } from "@amzi-loci/shared";
import { Button } from "../ui/button";
import { ExportPanel } from "../ExportPanel";
import type { GeneratedImage } from "../../lib/images";

interface ExportScreenProps {
  images: GeneratedImage[];
  productContext: string;
  listingCopy: ListingCopy | null;
  insights: ProductInsight[];
  brandKit: BrandKit | null;
  clientName?: string;
  projectName?: string;
  projectId?: string;
  onExportNote: (note: string) => void;
  onBack: () => void;
}

export function ExportScreen({
  images,
  productContext,
  listingCopy,
  insights,
  brandKit,
  clientName,
  projectName,
  projectId,
  onExportNote,
  onBack,
}: ExportScreenProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold">Export pack</h2>
          <p className="text-body text-text-muted">
            Download images, copy, creative brief, and compliance checklist.
          </p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Back to images
        </Button>
      </div>

      <div className="workflow-embed">
        <ExportPanel
          images={images}
          productContext={productContext}
          listingCopy={listingCopy}
          insights={insights}
          brandKit={brandKit}
          clientName={clientName}
          projectName={projectName}
          projectId={projectId}
          onExportNote={onExportNote}
        />
      </div>
    </div>
  );
}
