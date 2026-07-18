import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState } from "../ui/empty-loading";
import { ProgressTimeline, PROJECT_STEPS } from "./progress-timeline";
import { ReviewsScreen } from "./reviews-screen";
import { InsightsScreen } from "./insights-screen";
import { BrandScreen } from "./brand-screen";
import { CopyScreen } from "./copy-screen";
import { ImagesScreen } from "./images-screen";
import { ExportScreen } from "./export-screen";
import { useProjectWorkflow } from "../../hooks/useProjectWorkflow";
import { deriveTopKeywords, positiveReviewPct, WIZARD_TO_STEP_KEY } from "../../lib/projectUi";

export function ProjectWorkspace() {
  const { id, step: stepParam } = useParams<{ id: string; step?: string }>();
  const navigate = useNavigate();
  const wf = useProjectWorkflow(id ?? "");

  useEffect(() => {
    if (stepParam && id) {
      wf.setStepFromKey(stepParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepParam, id]);

  const activeKey = WIZARD_TO_STEP_KEY[wf.step] ?? "reviews";

  const handleStepSelect = useCallback(
    (key: string) => {
      if (!id) return;
      navigate(`/projects/${id}/${key}`);
      wf.setStepFromKey(key);
    },
    [id, navigate, wf],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !id) return;
      const keys = ["1", "2", "3", "4", "5", "6"];
      const idx = keys.indexOf(e.key);
      if (idx >= 0) {
        e.preventDefault();
        handleStepSelect(PROJECT_STEPS[idx].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, handleStepSelect]);

  const completedKeys = useMemo(() => {
    const done: string[] = [];
    if (wf.reviews.length > 0) done.push("reviews");
    if (wf.insights.length > 0) done.push("insights");
    if (wf.selectedBrandKitId) done.push("brand");
    if (wf.listingCopy) done.push("copy");
    if (wf.generatedImages.length > 0) done.push("images");
    if ((wf.project?.exportHistory.length ?? 0) > 0) done.push("export");
    return done;
  }, [wf]);

  const disabledKeys = PROJECT_STEPS.filter((s) => {
    const wizardMap: Record<string, Parameters<typeof wf.stepDisabled>[0]> = {
      reviews: "ingest",
      insights: "insights",
      brand: "brandkit",
      copy: "copy",
      images: "generate",
      export: "export",
    };
    const wizardStep = wizardMap[s.key];
    return wizardStep ? wf.stepDisabled(wizardStep) : false;
  }).map((s) => s.key);

  const reviewRows = wf.reviews.map((text, i) => ({
    author: `Review ${i + 1}`,
    rating: text.toLowerCase().includes("love") || text.toLowerCase().includes("great") ? 5 : 3,
    text,
  }));

  if (wf.projectLoading) {
    return <LoadingState label="Loading project…" />;
  }

  if (!wf.project) {
    return (
      <p className="text-body text-danger">
        {wf.error ?? "Project not found."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[200px_1fr] gap-8">
      <div>
        <p className="mb-1 text-caption text-text-muted">{wf.project.clientName}</p>
        <p className="mb-4 text-section font-medium">{wf.project.projectName}</p>
        <ProgressTimeline
          steps={PROJECT_STEPS}
          activeKey={activeKey}
          completedKeys={completedKeys}
          disabledKeys={disabledKeys}
          onSelect={handleStepSelect}
        />
      </div>

      <div>
        {activeKey === "reviews" && (
          <ReviewsScreen
            reviewText={wf.reviewText}
            onReviewTextChange={wf.setReviewText}
            reviewCount={wf.reviews.length}
            positivePct={positiveReviewPct(wf.reviews)}
            topKeywords={deriveTopKeywords(wf.reviews)}
            reviews={reviewRows}
            provider={wf.provider}
            onProviderChange={wf.setProvider}
            loading={wf.loading}
            error={wf.error}
            onPaste={wf.handleParseText}
            onUploadCsv={(f) => void wf.handleCsvUpload(f)}
            onExtract={() => void wf.handleExtract()}
          />
        )}
        {activeKey === "insights" && (
          <InsightsScreen
            insights={wf.insights}
            meta={wf.meta}
            onUpdateInsight={wf.updateInsight}
            onBack={() => handleStepSelect("reviews")}
            onContinue={() => handleStepSelect("brand")}
          />
        )}
        {activeKey === "brand" && (
          <BrandScreen
            productContext={wf.productContext}
            onProductContextChange={wf.setProductContext}
            selectedBrandKitId={wf.selectedBrandKitId}
            onSelectBrandKitId={wf.setSelectedBrandKitId}
            insights={wf.insights}
            onBack={() => handleStepSelect("insights")}
            onContinue={() => handleStepSelect("copy")}
          />
        )}
        {activeKey === "copy" && (
          <CopyScreen
            brandKitId={wf.selectedBrandKitId}
            productContext={wf.productContext}
            insights={wf.insights}
            provider={wf.provider}
            listingCopy={wf.listingCopy}
            onCopyChange={wf.setListingCopy}
            onBack={() => handleStepSelect("brand")}
            onContinue={() => handleStepSelect("images")}
          />
        )}
        {activeKey === "images" && (
          <ImagesScreen
            imageTier={wf.imageTier}
            onImageTierChange={wf.setImageTier}
            selectedBrandKitId={wf.selectedBrandKitId}
            productContext={wf.productContext}
            generatedImages={wf.generatedImages}
            loading={wf.loading}
            generateProgress={wf.generateProgress}
            regeneratingId={wf.regeneratingId}
            error={wf.error}
            onGenerate={() => void wf.handleGenerate()}
            onRegenerate={(slot) => void wf.handleRegenerate(slot)}
            onBack={() => handleStepSelect("copy")}
            onContinue={() => handleStepSelect("export")}
          />
        )}
        {activeKey === "export" && (
          <ExportScreen
            images={wf.generatedImages}
            productContext={wf.productContext}
            listingCopy={wf.listingCopy}
            insights={wf.insights}
            brandKit={wf.brandKit}
            clientName={wf.project.clientName}
            projectName={wf.project.projectName}
            projectId={wf.project.id}
            onExportNote={(note) => wf.persistProject(note)}
            onBack={() => handleStepSelect("images")}
          />
        )}
      </div>
    </div>
  );
}
