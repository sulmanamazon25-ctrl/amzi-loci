import { parseReviewsFromCsv, parseReviewsFromText } from "../lib/reviews";
import type { ApiProvider, ExtractInsightsResponse, ImageSlot, ImageTier, ProductInsight } from "@amzi-loci/shared";
import { API_PROVIDERS, IMAGE_TIERS, SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";
import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getKeyStatuses } from "../lib/apiKeys";
import { BrandKitEditor } from "./BrandKitEditor";
import { ImageGallery } from "./ImageGallery";
import { ExportPanel } from "./ExportPanel";
import { generateImages, type GeneratedImage } from "../lib/images";
import { saveListingSession } from "../lib/studio";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

type WizardStep = "ingest" | "insights" | "brandkit" | "generate" | "export";

export function Workflow() {
  const [step, setStep] = useState<WizardStep>("ingest");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<string[]>([]);
  const [provider, setProvider] = useState<ApiProvider>("anthropic");
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ model: string; reviewCount: number } | null>(null);
  const [productContext, setProductContext] = useState("");
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | null>(null);
  const [imageTier, setImageTier] = useState<ImageTier>("gemini-flash");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generateMeta, setGenerateMeta] = useState<{ model: string; tier: string } | null>(
    null,
  );
  const [generateProgress, setGenerateProgress] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

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
      void saveListingSession("", null, provider, result.insights).catch(() => undefined);
      setStep("insights");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }, [provider, reviewText, reviews]);

  const updateInsight = (id: string, patch: Partial<ProductInsight>) => {
    setInsights((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

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
      setGenerateMeta({ model: result.model, tier: result.tier });
      setStep("generate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setLoading(false);
      setGenerateProgress(null);
    }
  }, [imageTier, insights, productContext, selectedBrandKitId]);

  useEffect(() => {
    if (insights.length === 0) return;
    void saveListingSession(
      productContext,
      selectedBrandKitId,
      provider,
      insights,
    ).catch(() => undefined);
  }, [insights, productContext, selectedBrandKitId, provider]);

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
        setGenerateMeta({ model: result.model, tier: result.tier });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Regeneration failed");
      } finally {
        setRegeneratingId(null);
      }
    },
    [imageTier, insights, productContext, selectedBrandKitId],
  );

  useEffect(() => {
    if (insights.length === 0) return;
    void saveListingSession(
      productContext,
      selectedBrandKitId,
      provider,
      insights,
    ).catch(() => undefined);
  }, [insights, productContext, selectedBrandKitId, provider]);

  return (
    <section className="workflow">
      <div className="wizard-steps">
        <button
          type="button"
          className={step === "ingest" ? "wizard-step active" : "wizard-step"}
          onClick={() => setStep("ingest")}
        >
          1. Reviews
        </button>
        <button
          type="button"
          className={step === "insights" ? "wizard-step active" : "wizard-step"}
          onClick={() => setStep("insights")}
          disabled={insights.length === 0}
        >
          2. Insights
        </button>
        <button
          type="button"
          className={step === "brandkit" ? "wizard-step active" : "wizard-step"}
          onClick={() => setStep("brandkit")}
          disabled={insights.length === 0}
        >
          3. Brand kit
        </button>
        <button
          type="button"
          className={step === "generate" ? "wizard-step active" : "wizard-step"}
          onClick={() => setStep("generate")}
          disabled={generatedImages.length === 0 && step !== "generate"}
        >
          4. Generate
        </button>
        <button
          type="button"
          className={step === "export" ? "wizard-step active" : "wizard-step"}
          onClick={() => setStep("export")}
          disabled={generatedImages.length === 0}
        >
          5. Export
        </button>
      </div>

      {step === "ingest" && (
        <div className="workflow-panel">
          <h2>Add product reviews</h2>
          <p className="muted">Paste reviews or upload a CSV. SP-API import comes later.</p>

          <label className="field-label" htmlFor="reviews">
            Paste reviews
          </label>
          <textarea
            id="reviews"
            className="text-area"
            rows={10}
            placeholder="Paste Amazon reviews here (separate reviews with blank lines)..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <div className="button-row">
            <button type="button" className="secondary-btn" onClick={handleParseText}>
              Parse text ({reviews.length || "0"} reviews)
            </button>
            <label className="secondary-btn file-btn">
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCsvUpload(file);
                }}
              />
            </label>
          </div>

          <label className="field-label" htmlFor="provider">
            AI provider (uses your saved BYOK key)
          </label>
          <select
            id="provider"
            className="text-input"
            value={provider}
            onChange={(e) => setProvider(e.target.value as ApiProvider)}
          >
            {API_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="primary-btn extract-btn"
            disabled={loading}
            onClick={() => void handleExtract()}
          >
            {loading ? "Extracting insights..." : "Extract insights"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>
      )}

      {step === "insights" && (
        <div className="workflow-panel">
          <div className="insights-header">
            <h2>Review insights</h2>
            {meta && (
              <p className="muted">
                {meta.reviewCount} reviews · {meta.model}
              </p>
            )}
          </div>

          <div className="insights-table-wrap">
            <table className="insights-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Sentiment</th>
                  <th>Driver</th>
                  <th>Confidence</th>
                  <th>Source quote</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((insight) => (
                  <tr key={insight.id}>
                    <td>
                      <input
                        className="table-input"
                        value={insight.feature}
                        onChange={(e) =>
                          updateInsight(insight.id, { feature: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={insight.sentiment}
                        onChange={(e) =>
                          updateInsight(insight.id, {
                            sentiment: e.target.value as ProductInsight["sentiment"],
                          })
                        }
                      >
                        <option value="positive">positive</option>
                        <option value="negative">negative</option>
                        <option value="neutral">neutral</option>
                        <option value="mixed">mixed</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={insight.conversionDriver}
                        onChange={(e) =>
                          updateInsight(insight.id, { conversionDriver: e.target.checked })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="table-input table-input-narrow"
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={insight.confidence}
                        onChange={(e) =>
                          updateInsight(insight.id, {
                            confidence: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <textarea
                        className="table-input"
                        rows={2}
                        value={insight.sourceQuote}
                        onChange={(e) =>
                          updateInsight(insight.id, { sourceQuote: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="secondary-btn" onClick={() => setStep("ingest")}>
            Back to reviews
          </button>
          <button
            type="button"
            className="primary-btn"
            style={{ marginTop: "0.75rem", width: "100%" }}
            onClick={() => setStep("brandkit")}
          >
            Continue to brand kit
          </button>
        </div>
      )}

      {step === "brandkit" && (
        <div className="workflow-panel">
          <h2>Brand kit</h2>
          <p className="muted">
            Select or edit a brand kit, then preview how it shapes the image generation prompt.
          </p>

          <label className="field-label" htmlFor="product-context">
            Product context (for prompt preview)
          </label>
          <input
            id="product-context"
            className="text-input"
            placeholder="e.g. Stainless steel water bottle, 32oz, matte black"
            value={productContext}
            onChange={(e) => setProductContext(e.target.value)}
          />

          <BrandKitEditor
            compact
            selectedKitId={selectedBrandKitId}
            onSelectKitId={setSelectedBrandKitId}
            productContext={productContext}
            insights={insights}
            showPromptPreview
          />

          <button type="button" className="secondary-btn" onClick={() => setStep("insights")}>
            Back to insights
          </button>
          <button
            type="button"
            className="primary-btn"
            style={{ marginTop: "0.75rem", width: "100%" }}
            disabled={!selectedBrandKitId || !productContext.trim()}
            onClick={() => setStep("generate")}
          >
            Continue to generate
          </button>
        </div>
      )}

      {step === "generate" && (
        <div className="workflow-panel">
          <h2>Generate listing images</h2>
          <p className="muted">
            Uses your Google API key (BYOK). Generates 3 main + 5 gallery images in one run.
          </p>

          {!selectedBrandKitId && (
            <p className="error">Go back to Brand kit and select a saved kit.</p>
          )}

          <label className="field-label" htmlFor="image-tier">
            Image model tier
          </label>
          <select
            id="image-tier"
            className="text-input"
            value={imageTier}
            onChange={(e) => setImageTier(e.target.value as ImageTier)}
          >
            {IMAGE_TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label} — {tier.estimatedCost}
              </option>
            ))}
          </select>
          <p className="muted tier-hint">
            {IMAGE_TIERS.find((tier) => tier.id === imageTier)?.description}
          </p>

          <p className="muted">
            Product: {productContext || "(not set)"}
            {generateMeta && ` · ${generateMeta.model}`}
          </p>

          <button
            type="button"
            className="primary-btn extract-btn"
            disabled={loading || !selectedBrandKitId || !productContext.trim()}
            onClick={() => void handleGenerate()}
          >
            {loading ? "Generating…" : "Generate 3 main + 5 gallery images"}
          </button>

          <ImageGallery
            images={generatedImages}
            loading={loading}
            progress={generateProgress}
            onRegenerate={(slot) => void handleRegenerate(slot)}
            regeneratingId={regeneratingId}
          />

          {error && <p className="error">{error}</p>}

          <button type="button" className="secondary-btn" onClick={() => setStep("brandkit")}>
            Back to brand kit
          </button>
          <button
            type="button"
            className="primary-btn"
            style={{ marginTop: "0.75rem", width: "100%" }}
            disabled={generatedImages.length === 0}
            onClick={() => setStep("export")}
          >
            Continue to export
          </button>
        </div>
      )}

      {step === "export" && (
        <div className="workflow-panel">
          <h2>Review &amp; export</h2>
          <p className="muted">
            Select images to export as PNG or JPG in a zip. Usage estimates are logged locally.
          </p>
          <ExportPanel images={generatedImages} productContext={productContext} />
          <button type="button" className="secondary-btn" onClick={() => setStep("generate")}>
            Back to generate
          </button>
        </div>
      )}
    </section>
  );
}
