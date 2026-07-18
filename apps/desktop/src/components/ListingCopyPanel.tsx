import { useState } from "react";
import type { ApiProvider, ListingCopy, ProductInsight } from "@amzi-loci/shared";
import { AMAZON_LIMITS } from "@amzi-loci/shared";
import { generateListingCopy } from "../lib/listingCopy";
import { SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

type Props = {
  brandKitId: string | null;
  productContext: string;
  insights: ProductInsight[];
  provider: ApiProvider;
  copy: ListingCopy | null;
  onCopyChange: (copy: ListingCopy) => void;
};

function charHint(len: number, max: number): string {
  return `${len}/${max}`;
}

function hintClass(len: number, max: number): string {
  if (len === 0) return "char-hint";
  if (len > max) return "char-hint over";
  if (len > max * 0.9) return "char-hint warn";
  return "char-hint ok";
}

export function ListingCopyPanel({
  brandKitId,
  productContext,
  insights,
  provider,
  copy,
  onCopyChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(brandKitId && productContext.trim() && insights.length > 0);

  const handleGenerate = async () => {
    if (!brandKitId || !ready) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateListingCopy(
        serverUrl,
        brandKitId,
        insights,
        productContext.trim(),
        provider,
      );
      onCopyChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy generation failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (patch: Partial<ListingCopy>) => {
    if (!copy) return;
    onCopyChange({ ...copy, ...patch });
  };

  const updateBullet = (index: number, value: string) => {
    if (!copy) return;
    const bullets = [...copy.bullets];
    bullets[index] = value;
    onCopyChange({ ...copy, bullets });
  };

  return (
    <div className="copy-panel">
      <p className="copy-lead">
        Turn your review insights into Amazon title, bullets, and description — ready to paste.
      </p>

      {!ready && (
        <p className="muted">Complete brand kit and product context on the previous step first.</p>
      )}

      <button
        type="button"
        className="primary-btn extract-btn"
        disabled={loading || !ready}
        onClick={() => void handleGenerate()}
      >
        {loading ? "Writing listing copy…" : copy ? "Regenerate listing copy" : "Generate listing copy"}
      </button>

      {error && <p className="error">{error}</p>}

      {copy && (
        <div className="copy-fields">
          <div className="copy-field-card">
            <label htmlFor="listing-title">
              Title <span className={hintClass(copy.title.length, AMAZON_LIMITS.titleMax)}>{charHint(copy.title.length, AMAZON_LIMITS.titleMax)}</span>
            </label>
            <input
              id="listing-title"
              className="text-input"
              value={copy.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>

          {copy.bullets.map((bullet, index) => (
            <div key={index} className="copy-field-card">
              <label htmlFor={`bullet-${index}`}>
                Bullet {index + 1}{" "}
                <span className={hintClass(bullet.length, AMAZON_LIMITS.bulletMax)}>
                  {charHint(bullet.length, AMAZON_LIMITS.bulletMax)}
                </span>
              </label>
              <textarea
                id={`bullet-${index}`}
                className="text-area copy-textarea"
                rows={2}
                value={bullet}
                onChange={(e) => updateBullet(index, e.target.value)}
              />
            </div>
          ))}

          <div className="copy-field-card">
            <label htmlFor="listing-desc">
              Description{" "}
              <span className={hintClass(copy.description.length, AMAZON_LIMITS.descriptionMax)}>
                {charHint(copy.description.length, AMAZON_LIMITS.descriptionMax)}
              </span>
            </label>
            <textarea
              id="listing-desc"
              className="text-area copy-textarea"
              rows={5}
              value={copy.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="copy-field-card">
            <label htmlFor="listing-kw">
              Backend keywords{" "}
              <span className={hintClass(new TextEncoder().encode(copy.backendKeywords).length, AMAZON_LIMITS.backendKeywordsMaxBytes)}>
                {new TextEncoder().encode(copy.backendKeywords).length}/{AMAZON_LIMITS.backendKeywordsMaxBytes} bytes
              </span>
            </label>
            <input
              id="listing-kw"
              className="text-input"
              value={copy.backendKeywords}
              onChange={(e) => update({ backendKeywords: e.target.value })}
              placeholder="space separated, no repeats from title/bullets"
            />
          </div>

          <p className="muted copy-model">Model: {copy.model}</p>
        </div>
      )}
    </div>
  );
}
