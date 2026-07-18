import { Upload, FileText, ClipboardPaste } from "lucide-react";
import { API_PROVIDERS, type ApiProvider } from "@amzi-loci/shared";
import { Panel, Card } from "../ui/card";
import { Button } from "../ui/button";

interface ReviewsScreenProps {
  reviewText: string;
  onReviewTextChange: (value: string) => void;
  reviewCount: number;
  positivePct: number;
  topKeywords: string[];
  reviews: { author: string; rating: number; text: string }[];
  provider: ApiProvider;
  onProviderChange: (p: ApiProvider) => void;
  loading: boolean;
  error: string | null;
  onPaste: () => void;
  onUploadCsv: (file: File) => void;
  onExtract: () => void;
}

export function ReviewsScreen({
  reviewText,
  onReviewTextChange,
  reviewCount,
  positivePct,
  topKeywords,
  reviews,
  provider,
  onProviderChange,
  loading,
  error,
  onPaste,
  onUploadCsv,
  onExtract,
}: ReviewsScreenProps) {
  return (
    <div className="grid grid-cols-[240px_1fr_240px] gap-6">
      <Panel>
        <h3 className="mb-4 text-section font-medium">Import reviews</h3>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="md" onClick={onPaste} className="justify-start">
            <ClipboardPaste size={16} />
            Parse pasted text
          </Button>
          <label className="cursor-pointer">
            <span className="inline-flex h-9 w-full items-center justify-start gap-2 rounded-button border border-border bg-card px-4 text-body font-medium text-text transition-colors hover:border-border-hover">
              <Upload size={16} />
              Upload CSV
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadCsv(file);
              }}
            />
          </label>
          <Button variant="secondary" size="md" className="justify-start" disabled>
            <FileText size={16} />
            SP-API import (soon)
          </Button>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-caption text-text-muted">AI provider</label>
          <select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value as ApiProvider)}
            className="w-full rounded-input border border-border bg-card px-3 py-2 text-body text-text"
          >
            {API_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          size="md"
          className="mt-4 w-full"
          disabled={loading}
          onClick={onExtract}
        >
          {loading ? "Extracting…" : "Extract insights"}
        </Button>
        {error && <p className="mt-3 text-caption text-danger">{error}</p>}
      </Panel>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-caption uppercase text-text-muted">Reviews</p>
            <p className="mt-1 text-heading font-semibold">{reviewCount}</p>
          </Card>
          <Card>
            <p className="text-caption uppercase text-text-muted">Positive</p>
            <p className="mt-1 text-heading font-semibold text-success">{positivePct}%</p>
          </Card>
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => onReviewTextChange(e.target.value)}
          rows={8}
          placeholder="Paste Amazon reviews here (separate reviews with blank lines)…"
          className="w-full rounded-input border border-border bg-card px-4 py-3 text-body text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />

        <Panel className="max-h-[320px] overflow-y-auto p-0">
          <ul className="divide-y divide-border">
            {reviews.length === 0 ? (
              <li className="p-4 text-body text-text-muted">No reviews parsed yet.</li>
            ) : (
              reviews.map((r, i) => (
                <li key={i} className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-body font-medium">{r.author}</span>
                    <span className="text-caption text-warning">
                      {"★".repeat(r.rating)}
                      <span className="text-border-hover">{"★".repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  <p className="text-body text-text-muted">{r.text}</p>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      <Panel>
        <h3 className="mb-4 text-section font-medium">Top keywords</h3>
        <div className="flex flex-col gap-2">
          {topKeywords.length === 0 ? (
            <p className="text-body text-text-muted">Parse reviews to see keywords.</p>
          ) : (
            topKeywords.map((kw) => (
              <div
                key={kw}
                className="rounded-input border border-border px-3 py-2 text-body text-text-muted"
              >
                {kw}
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
