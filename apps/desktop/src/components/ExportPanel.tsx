import type { ExportFormat } from "@amzi-loci/shared";
import { EXPORT_FORMATS } from "@amzi-loci/shared";
import { useCallback, useEffect, useState } from "react";
import { openPath } from "@tauri-apps/plugin-opener";
import type { GeneratedImage } from "../lib/images";
import { exportImagesZip, getUsageSummary, type ExportImageItem } from "../lib/export";
import type { UsageSummary } from "@amzi-loci/shared";

type ExportPanelProps = {
  images: GeneratedImage[];
  productContext: string;
};

export function ExportPanel({ images, productContext }: ExportPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<ExportFormat>("png");
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastExportPath, setLastExportPath] = useState<string | null>(null);

  const refreshUsage = useCallback(async () => {
    try {
      const summary = await getUsageSummary();
      setUsage(summary);
    } catch {
      setUsage(null);
    }
  }, []);

  useEffect(() => {
    setSelected(new Set(images.map((img) => img.id)));
  }, [images]);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  const toggleImage = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    const items: ExportImageItem[] = images
      .filter((img) => selected.has(img.id))
      .map((img) => ({
        localPath: img.localPath,
        slotType: img.slotType,
        slotIndex: img.slotIndex,
        label: img.label,
      }));

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const zipPath = await exportImagesZip(
        items,
        format,
        productContext.trim() || "listing",
      );
      setLastExportPath(zipPath);
      setSuccess(`Exported ${items.length} image(s) to zip archive.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExport = async () => {
    if (!lastExportPath) return;
    try {
      await openPath(lastExportPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open export");
    }
  };

  return (
    <div className="export-panel">
      <section className="usage-summary-card">
        <h3>Usage log (estimated)</h3>
        <p className="muted">Informational only — cross-check against your provider dashboard.</p>
        {usage ? (
          <>
            <dl className="usage-stats">
              <div>
                <dt>Total est. cost</dt>
                <dd>${usage.totalEstimatedCostUsd.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Insight calls</dt>
                <dd>{usage.totalInsightCalls}</dd>
              </div>
              <div>
                <dt>Reviews processed</dt>
                <dd>{usage.totalReviewsProcessed}</dd>
              </div>
              <div>
                <dt>Images generated</dt>
                <dd>{usage.totalImagesGenerated}</dd>
              </div>
            </dl>
            {usage.entries.length > 0 && (
              <div className="usage-log-wrap">
                <table className="usage-log-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Type</th>
                      <th>Detail</th>
                      <th>Est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.entries.slice(0, 15).map((entry) => (
                      <tr key={entry.id}>
                        <td>{formatTimestamp(entry.timestamp)}</td>
                        <td>{entry.eventType}</td>
                        <td>{formatEntryDetail(entry)}</td>
                        <td>${entry.estimatedCostUsd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="muted">No usage recorded yet.</p>
        )}
        <button type="button" className="secondary-btn" onClick={() => void refreshUsage()}>
          Refresh usage
        </button>
      </section>

      <section className="export-section">
        <h3>Export approved images</h3>
        {images.length === 0 ? (
          <p className="muted">Generate images first, then export as PNG or JPG in a zip file.</p>
        ) : (
          <>
            <div className="export-select-grid">
              {images.map((image) => (
                <label key={image.id} className="export-select-item">
                  <input
                    type="checkbox"
                    checked={selected.has(image.id)}
                    onChange={() => toggleImage(image.id)}
                  />
                  <img src={image.dataUrl} alt={image.label} />
                  <span>{image.label}</span>
                </label>
              ))}
            </div>

            <label className="field-label" htmlFor="export-format">
              Export format
            </label>
            <select
              id="export-format"
              className="text-input"
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              {EXPORT_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="button-row">
              <button
                type="button"
                className="primary-btn"
                disabled={loading || selected.size === 0}
                onClick={() => void handleExport()}
              >
                {loading ? "Exporting…" : `Export ${selected.size} image(s) as zip`}
              </button>
              {lastExportPath && (
                <button type="button" className="secondary-btn" onClick={() => void handleOpenExport()}>
                  Open zip
                </button>
              )}
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </section>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const secs = Number(timestamp);
  if (!Number.isFinite(secs)) return timestamp;
  return new Date(secs * 1000).toLocaleString();
}

function formatEntryDetail(entry: UsageSummary["entries"][number]): string {
  if (entry.eventType === "insights") {
    return `${entry.provider ?? "ai"} · ${entry.reviewCount ?? 0} reviews · ${entry.model}`;
  }
  const tier = entry.imageTier ?? "image";
  const count = entry.imageCount ?? 0;
  const suffix = entry.note === "regenerate" ? " (regen)" : "";
  return `${tier} · ${count} img · ${entry.model}${suffix}`;
}
