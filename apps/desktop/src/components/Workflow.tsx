import { parseReviewsFromCsv, parseReviewsFromText } from "../lib/reviews";
import type { ApiProvider, ExtractInsightsResponse, ProductInsight } from "@amzi-loci/shared";
import { API_PROVIDERS, SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";
import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getKeyStatuses } from "../lib/apiKeys";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

type WizardStep = "ingest" | "insights";

export function Workflow() {
  const [step, setStep] = useState<WizardStep>("ingest");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<string[]>([]);
  const [provider, setProvider] = useState<ApiProvider>("anthropic");
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ model: string; reviewCount: number } | null>(null);

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

  const updateInsight = (id: string, patch: Partial<ProductInsight>) => {
    setInsights((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

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
        </div>
      )}
    </section>
  );
}
