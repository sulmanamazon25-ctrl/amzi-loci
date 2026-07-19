import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  ApiProvider,
  BrandKit,
  ExtractInsightsResponse,
  ImageSlot,
  ImageTier,
  ListingCopy,
  ProductInsight,
  ProjectData,
  SavedGeneratedImage,
} from "@amzi-loci/shared";
import { SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";
import { getKeyStatuses } from "../lib/apiKeys";
import { loadBrandKit } from "../lib/brandKit";
import { generateImages, type GeneratedImage } from "../lib/images";
import { loadProject, readImagePreview, saveProject } from "../lib/projects";
import { parseReviewsFromCsv, parseReviewsFromText } from "../lib/reviews";
import { computeCompletedSteps } from "../lib/projectUi";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

export type WizardStep = "ingest" | "insights" | "brandkit" | "copy" | "generate" | "export";

async function restoreGeneratedImages(
  saved: SavedGeneratedImage[],
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];
  for (const img of saved) {
    try {
      const dataUrl = await readImagePreview(img.localPath);
      results.push({
        id: img.id,
        slotType: img.slotType as GeneratedImage["slotType"],
        slotIndex: img.slotIndex,
        label: img.label,
        prompt: img.prompt,
        mimeType: img.mimeType,
        localPath: img.localPath,
        dataUrl,
      });
    } catch {
      // skip missing files
    }
  }
  return results.sort((a, b) => {
    if (a.slotType !== b.slotType) return a.slotType === "main" ? -1 : 1;
    return a.slotIndex - b.slotIndex;
  });
}

function toSavedImages(images: GeneratedImage[]): SavedGeneratedImage[] {
  return images.map((img) => ({
    id: img.id,
    slotType: img.slotType,
    slotIndex: img.slotIndex,
    label: img.label,
    prompt: img.prompt,
    mimeType: img.mimeType,
    localPath: img.localPath ?? "",
  }));
}

export function useProjectWorkflow(projectId: string) {
  const [step, setStep] = useState<WizardStep>("ingest");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<string[]>([]);
  const [provider, setProvider] = useState<ApiProvider>("google");
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ model: string; reviewCount: number } | null>(null);
  const [productContext, setProductContext] = useState("");
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [listingCopy, setListingCopy] = useState<ListingCopy | null>(null);
  const [imageTier, setImageTier] = useState<ImageTier>("imagen-fast");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generateProgress, setGenerateProgress] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSave = useRef(true);

  const applyProject = useCallback(async (data: ProjectData, initialStep?: WizardStep) => {
    skipSave.current = true;
    setProject(data);
    setReviews(data.reviews);
    setReviewText(data.reviews.join("\n\n"));
    setInsights(data.insights);
    setProductContext(data.productContext || data.product);
    setSelectedBrandKitId(data.brandKitId);
    setListingCopy(data.listingCopy);
    setProvider(data.provider);
    setImageTier(data.imageTier);
    if (data.insights.length > 0) {
      setMeta({ model: "saved", reviewCount: data.reviews.length });
    } else {
      setMeta(null);
    }
    const restored = await restoreGeneratedImages(data.generatedImages);
    setGeneratedImages(restored);

    if (initialStep) {
      setStep(initialStep);
    } else if (data.insights.length > 0 && restored.length > 0) {
      setStep("export");
    } else if (data.insights.length > 0 && data.listingCopy) {
      setStep("copy");
    } else if (data.insights.length > 0) {
      setStep("insights");
    } else {
      setStep("ingest");
    }

    window.setTimeout(() => {
      skipSave.current = false;
    }, 300);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProjectLoading(true);
    void loadProject(projectId)
      .then(async (data) => {
        if (cancelled) return;
        await applyProject(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load project");
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyProject, projectId]);

  useEffect(() => {
    if (!selectedBrandKitId) {
      setBrandKit(null);
      return;
    }
    void loadBrandKit(selectedBrandKitId)
      .then(setBrandKit)
      .catch(() => setBrandKit(null));
  }, [selectedBrandKitId]);

  const persistProject = useCallback(
    (exportNote?: string) => {
      if (!project || skipSave.current) return;
      setSaveState("saving");
      void saveProject({
        id: project.id,
        reviews,
        insights,
        productContext,
        brandKitId: selectedBrandKitId,
        listingCopy,
        provider,
        imageTier,
        generatedImages: toSavedImages(generatedImages),
        exportNote,
      })
        .then((updated) => {
          setProject(updated);
          setSaveState("saved");
        })
        .catch(() => setSaveState("error"));
    },
    [
      generatedImages,
      insights,
      listingCopy,
      imageTier,
      productContext,
      project,
      provider,
      reviews,
      selectedBrandKitId,
    ],
  );

  useEffect(() => {
    if (!project || skipSave.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistProject(), 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    generatedImages,
    insights,
    listingCopy,
    imageTier,
    persistProject,
    productContext,
    project,
    provider,
    reviews,
    selectedBrandKitId,
  ]);

  const handleCsvUpload = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = parseReviewsFromCsv(text);
    setReviews(parsed);
    setReviewText(parsed.join("\n\n"));
    setError(null);
  }, []);

  const handleParseText = useCallback(() => {
    const parsed = parseReviewsFromText(reviewText);
    setReviews(parsed);
    if (parsed.length === 0) {
      setError("No reviews found. Paste text or upload a CSV.");
    } else {
      setError(null);
    }
  }, [reviewText]);

  const handleExtract = useCallback(async () => {
    const parsed = reviews.length > 0 ? reviews : parseReviewsFromText(reviewText);
    if (parsed.length === 0) {
      setError("Add at least one review before extracting insights.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const statuses = await getKeyStatuses();
      if (!statuses.find((s) => s.provider === provider && s.saved)) {
        setError(`No ${provider} API key saved. Add one in Settings first.`);
        return;
      }

      const result = await invoke<ExtractInsightsResponse>("extract_insights", {
        provider,
        reviews: parsed,
        serverUrl,
      });

      setInsights(result.insights);
      setMeta({ model: result.model, reviewCount: result.reviewCount });
      setReviews(parsed);
      setStep("insights");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }, [provider, reviewText, reviews]);

  const updateInsight = useCallback((id: string, patch: Partial<ProductInsight>) => {
    setInsights((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedBrandKitId) {
      setError("Select a saved brand kit first.");
      return;
    }
    if (!productContext.trim()) {
      setError("Enter product context before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setGenerateProgress("Generating 8 images (3 main + 5 gallery)…");
    try {
      const statuses = await getKeyStatuses();
      if (!statuses.find((s) => s.provider === "google" && s.saved)) {
        setError("Image generation requires a Google API key in Settings.");
        return;
      }

      const result = await generateImages(
        serverUrl,
        selectedBrandKitId,
        insights,
        productContext.trim(),
        imageTier,
      );

      setGeneratedImages(result.images);
      setStep("generate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setLoading(false);
      setGenerateProgress(null);
    }
  }, [imageTier, insights, productContext, selectedBrandKitId]);

  const handleRegenerate = useCallback(
    async (slot: ImageSlot) => {
      if (!selectedBrandKitId || !productContext.trim()) return;

      const imageId = `${slot.slotType}-${slot.slotIndex}`;
      setRegeneratingId(imageId);
      setError(null);
      try {
        const statuses = await getKeyStatuses();
        if (!statuses.find((s) => s.provider === "google" && s.saved)) {
          setError("Image generation requires a Google API key in Settings.");
          return;
        }

        const result = await generateImages(
          serverUrl,
          selectedBrandKitId,
          insights,
          productContext.trim(),
          imageTier,
          slot,
        );

        const replacement = result.images[0];
        if (!replacement) return;

        setGeneratedImages((current) => {
          const next = current.filter((img) => img.id !== imageId);
          next.push(replacement);
          return next.sort((a, b) => {
            if (a.slotType !== b.slotType) return a.slotType === "main" ? -1 : 1;
            return a.slotIndex - b.slotIndex;
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Regeneration failed");
      } finally {
        setRegeneratingId(null);
      }
    },
    [imageTier, insights, productContext, selectedBrandKitId],
  );

  const stepDisabled = useCallback(
    (id: WizardStep): boolean => {
      if (id === "insights" || id === "brandkit" || id === "copy") return insights.length === 0;
      if (id === "generate") return insights.length === 0;
      if (id === "export") return generatedImages.length === 0;
      return false;
    },
    [generatedImages.length, insights.length],
  );

  const completedSteps = project ? computeCompletedSteps(project) : [];

  const goToStep = useCallback(
    (wizardStep: WizardStep) => {
      if (!stepDisabled(wizardStep)) setStep(wizardStep);
    },
    [stepDisabled],
  );

  const setStepFromKey = useCallback(
    (stepKey: string) => {
      const map: Record<string, WizardStep> = {
        reviews: "ingest",
        insights: "insights",
        brand: "brandkit",
        copy: "copy",
        images: "generate",
        export: "export",
      };
      const wizardStep = map[stepKey];
      if (wizardStep) goToStep(wizardStep);
    },
    [goToStep],
  );

  return {
    step,
    setStep,
    goToStep,
    setStepFromKey,
    stepDisabled,
    reviewText,
    setReviewText,
    reviews,
    provider,
    setProvider,
    insights,
    updateInsight,
    loading,
    error,
    setError,
    meta,
    productContext,
    setProductContext,
    selectedBrandKitId,
    setSelectedBrandKitId,
    brandKit,
    listingCopy,
    setListingCopy,
    imageTier,
    setImageTier,
    generatedImages,
    generateProgress,
    regeneratingId,
    project,
    projectLoading,
    saveState,
    completedSteps,
    handleCsvUpload,
    handleParseText,
    handleExtract,
    handleGenerate,
    handleRegenerate,
    persistProject,
  };
}

export type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;
