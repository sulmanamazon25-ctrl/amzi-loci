import {
  BRAND_FONT_OPTIONS,
  type BrandFont,
  type BrandKit,
  type BrandKitSummary,
  type ProductInsight,
} from "@amzi-loci/shared";
import { useCallback, useEffect, useState } from "react";
import {
  applyBrandKitPrompt,
  createEmptyDraft,
  deleteBrandKit,
  listBrandKits,
  loadBrandKit,
  readReferencePreview,
  removeReferenceImage,
  saveBrandKit,
  saveReferenceImage,
  type SaveBrandKitInput,
} from "../lib/brandKit";
import { SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

type BrandKitEditorProps = {
  compact?: boolean;
  selectedKitId?: string | null;
  onSelectKitId?: (id: string | null) => void;
  productContext?: string;
  insights?: ProductInsight[];
  showPromptPreview?: boolean;
};

export function BrandKitEditor({
  compact = false,
  selectedKitId,
  onSelectKitId,
  productContext = "",
  insights = [],
  showPromptPreview = false,
}: BrandKitEditorProps) {
  const [kits, setKits] = useState<BrandKitSummary[]>([]);
  const [activeKit, setActiveKit] = useState<BrandKit | null>(null);
  const [draft, setDraft] = useState<SaveBrandKitInput>(createEmptyDraft());
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [promptPreview, setPromptPreview] = useState<{
    imagePrompt: string;
    styleSummary: string;
  } | null>(null);

  const refreshList = useCallback(async () => {
    const summaries = await listBrandKits();
    setKits(summaries);
    return summaries;
  }, []);

  const loadPreviews = useCallback(async (kit: BrandKit) => {
    const urls: string[] = [];
    for (const path of kit.referenceImages) {
      try {
        urls.push(await readReferencePreview(path));
      } catch {
        urls.push("");
      }
    }
    setPreviews(urls);
  }, []);

  const selectKit = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setPromptPreview(null);
      try {
        const kit = await loadBrandKit(id);
        setActiveKit(kit);
        setDraft({
          id: kit.id,
          name: kit.name,
          primaryColor: kit.primaryColor,
          secondaryColor: kit.secondaryColor,
          fontFamily: kit.fontFamily,
          toneOfVoice: kit.toneOfVoice,
          toneProfessional: kit.toneProfessional,
          tonePlayful: kit.tonePlayful,
          toneLuxury: kit.toneLuxury,
        });
        await loadPreviews(kit);
        onSelectKitId?.(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brand kit");
      } finally {
        setLoading(false);
      }
    },
    [loadPreviews, onSelectKitId],
  );

  useEffect(() => {
    void refreshList().then((summaries) => {
      if (selectedKitId) {
        void selectKit(selectedKitId);
        return;
      }
      if (!compact && summaries.length > 0) {
        void selectKit(summaries[0].id);
      }
    });
  }, [compact, refreshList, selectKit, selectedKitId]);

  const handleNew = () => {
    setActiveKit(null);
    setDraft(createEmptyDraft());
    setPreviews([]);
    setPromptPreview(null);
    setError(null);
    setSuccess(null);
    onSelectKitId?.(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const saved = await saveBrandKit(draft);
      setActiveKit(saved);
      setDraft({
        id: saved.id,
        name: saved.name,
        primaryColor: saved.primaryColor,
        secondaryColor: saved.secondaryColor,
        fontFamily: saved.fontFamily,
        toneOfVoice: saved.toneOfVoice,
        toneProfessional: saved.toneProfessional,
        tonePlayful: saved.tonePlayful,
        toneLuxury: saved.toneLuxury,
      });
      await refreshList();
      await loadPreviews(saved);
      onSelectKitId?.(saved.id);
      setSuccess("Brand kit saved locally.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeKit) return;
    setLoading(true);
    setError(null);
    try {
      await deleteBrandKit(activeKit.id);
      handleNew();
      await refreshList();
      setSuccess("Brand kit deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (slot: number, file: File) => {
    if (!activeKit) {
      setError("Save the brand kit before adding reference images.");
      return;
    }
    if (activeKit.referenceImages.length >= 3 && slot >= activeKit.referenceImages.length) {
      setError("Maximum 3 reference images.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const base64 = await fileToDataUrl(file);
      const saved = await saveReferenceImage(activeKit.id, slot, base64, file.name);
      setActiveKit(saved);
      await loadPreviews(saved);
      setSuccess("Reference image saved locally.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (slot: number) => {
    if (!activeKit) return;
    setLoading(true);
    setError(null);
    try {
      const saved = await removeReferenceImage(activeKit.id, slot);
      setActiveKit(saved);
      await loadPreviews(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPrompt = async () => {
    if (!activeKit) {
      setError("Save and select a brand kit first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const kitForPreview: BrandKit = {
        ...activeKit,
        ...draft,
        fontFamily: draft.fontFamily as BrandFont,
        referenceImages: activeKit.referenceImages,
        createdAt: activeKit.createdAt,
        updatedAt: activeKit.updatedAt,
      };
      const result = await applyBrandKitPrompt(
        serverUrl,
        kitForPreview,
        productContext,
        insights,
      );
      setPromptPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prompt preview failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "brand-kit-editor compact" : "brand-kit-editor"}>
      {!compact && (
        <div className="brand-kit-sidebar">
          <div className="brand-kit-sidebar-header">
            <h2>Brand kits</h2>
            <button type="button" className="secondary-btn" onClick={handleNew}>
              New
            </button>
          </div>
          <ul className="brand-kit-list">
            {kits.map((kit) => (
              <li key={kit.id}>
                <button
                  type="button"
                  className={
                    activeKit?.id === kit.id ? "brand-kit-item active" : "brand-kit-item"
                  }
                  onClick={() => void selectKit(kit.id)}
                >
                  <span
                    className="brand-kit-swatch"
                    style={{ backgroundColor: kit.primaryColor }}
                  />
                  <span>{kit.name}</span>
                </button>
              </li>
            ))}
            {kits.length === 0 && <li className="muted">No brand kits yet.</li>}
          </ul>
        </div>
      )}

      {compact && kits.length > 0 && (
        <>
          <label className="field-label" htmlFor="brand-kit-select">
            Saved brand kit
          </label>
          <select
            id="brand-kit-select"
            className="text-input"
            value={activeKit?.id ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              if (id) void selectKit(id);
            }}
          >
            <option value="">Select a brand kit...</option>
            {kits.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </>
      )}

      <div className="brand-kit-form">
        <label className="field-label" htmlFor="kit-name">
          Kit name
        </label>
        <input
          id="kit-name"
          className="text-input"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        />

        <div className="color-row">
          <div>
            <label className="field-label" htmlFor="primary-color">
              Primary color
            </label>
            <div className="color-input-row">
              <input
                id="primary-color"
                type="color"
                value={draft.primaryColor}
                onChange={(e) => setDraft((d) => ({ ...d, primaryColor: e.target.value }))}
              />
              <input
                className="text-input"
                value={draft.primaryColor}
                onChange={(e) => setDraft((d) => ({ ...d, primaryColor: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="secondary-color">
              Secondary color
            </label>
            <div className="color-input-row">
              <input
                id="secondary-color"
                type="color"
                value={draft.secondaryColor}
                onChange={(e) => setDraft((d) => ({ ...d, secondaryColor: e.target.value }))}
              />
              <input
                className="text-input"
                value={draft.secondaryColor}
                onChange={(e) => setDraft((d) => ({ ...d, secondaryColor: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <label className="field-label" htmlFor="font-family">
          Font direction
        </label>
        <select
          id="font-family"
          className="text-input"
          value={draft.fontFamily}
          onChange={(e) => setDraft((d) => ({ ...d, fontFamily: e.target.value }))}
        >
          {BRAND_FONT_OPTIONS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="tone-text">
          Tone of voice (short description)
        </label>
        <textarea
          id="tone-text"
          className="text-area"
          rows={3}
          placeholder="e.g. Confident, family-friendly, science-backed..."
          value={draft.toneOfVoice}
          onChange={(e) => setDraft((d) => ({ ...d, toneOfVoice: e.target.value }))}
        />

        <ToneSlider
          label="Professional"
          value={draft.toneProfessional}
          onChange={(value) => setDraft((d) => ({ ...d, toneProfessional: value }))}
        />
        <ToneSlider
          label="Playful"
          value={draft.tonePlayful}
          onChange={(value) => setDraft((d) => ({ ...d, tonePlayful: value }))}
        />
        <ToneSlider
          label="Luxury"
          value={draft.toneLuxury}
          onChange={(value) => setDraft((d) => ({ ...d, toneLuxury: value }))}
        />

        <div className="reference-images">
          <p className="field-label">Reference images (up to 3, stored locally)</p>
          <div className="reference-grid">
            {[0, 1, 2].map((slot) => (
              <div key={slot} className="reference-slot">
                {previews[slot] ? (
                  <img src={previews[slot]} alt={`Reference ${slot + 1}`} />
                ) : (
                  <div className="reference-placeholder">Slot {slot + 1}</div>
                )}
                <div className="reference-actions">
                  <label className="secondary-btn file-btn">
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleImageUpload(slot, file);
                      }}
                    />
                  </label>
                  {previews[slot] && (
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => void handleRemoveImage(slot)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="primary-btn"
            disabled={loading}
            onClick={() => void handleSave()}
          >
            {loading ? "Saving..." : "Save brand kit"}
          </button>
          {activeKit && !compact && (
            <button
              type="button"
              className="danger-btn"
              disabled={loading}
              onClick={() => void handleDelete()}
            >
              Delete
            </button>
          )}
          {(showPromptPreview || compact) && (
            <button
              type="button"
              className="secondary-btn"
              disabled={loading || !activeKit}
              onClick={() => void handlePreviewPrompt()}
            >
              Preview image prompt
            </button>
          )}
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {promptPreview && (
          <div className="prompt-preview">
            <div
              className="prompt-preview-banner"
              style={{
                background: `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`,
              }}
            >
              <span style={{ fontFamily: draft.fontFamily }}>{draft.name}</span>
            </div>
            <p className="muted">{promptPreview.styleSummary}</p>
            <pre className="prompt-preview-text">{promptPreview.imagePrompt}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function ToneSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="tone-slider">
      <div className="tone-slider-header">
        <span className="field-label">{label}</span>
        <span className="muted">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
