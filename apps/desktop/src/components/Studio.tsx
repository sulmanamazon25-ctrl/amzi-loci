import {
  API_PROVIDERS,
  IMAGE_TIERS,
  LOCALE_OPTIONS,
  SERVER_A_DEFAULT_URL,
  type AplusModule,
  type ApiProvider,
  type ImageTier,
  type ProductInsight,
} from "@amzi-loci/shared";
import { useCallback, useEffect, useState } from "react";
import { listBrandKits } from "../lib/brandKit";
import type { GeneratedImage } from "../lib/images";
import { ImageGallery } from "./ImageGallery";
import {
  generateAdCreatives,
  generateAplusContent,
  generateVariationImages,
  getListingSession,
  localizeAplusContent,
  modulesToMarkdown,
} from "../lib/studio";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

type StudioSection = "aplus" | "ads" | "localize" | "variations";

export function Studio() {
  const [section, setSection] = useState<StudioSection>("aplus");
  const [productContext, setProductContext] = useState("");
  const [brandKitId, setBrandKitId] = useState<string>("");
  const [provider, setProvider] = useState<ApiProvider>("anthropic");
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [imageTier, setImageTier] = useState<ImageTier>("gemini-flash");
  const [kits, setKits] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [aplusModules, setAplusModules] = useState<AplusModule[]>([]);
  const [localizedModules, setLocalizedModules] = useState<AplusModule[]>([]);
  const [targetLocale, setTargetLocale] = useState<(typeof LOCALE_OPTIONS)[number]["id"]>("de");
  const [adImages, setAdImages] = useState<GeneratedImage[]>([]);
  const [variantText, setVariantText] = useState("");
  const [variationImages, setVariationImages] = useState<GeneratedImage[]>([]);

  const loadContext = useCallback(async () => {
    const [session, brandKits] = await Promise.all([getListingSession(), listBrandKits()]);
    setKits(brandKits.map((k) => ({ id: k.id, name: k.name })));
    if (session) {
      setProductContext(session.productContext);
      setBrandKitId(session.brandKitId ?? brandKits[0]?.id ?? "");
      setProvider(session.provider);
      setInsights(session.insights);
    } else if (brandKits[0]) {
      setBrandKitId(brandKits[0].id);
    }
  }, []);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const ready = Boolean(brandKitId && productContext.trim() && insights.length > 0);

  const handleAplus = async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateAplusContent(
        serverUrl,
        brandKitId,
        insights,
        productContext.trim(),
        provider,
      );
      setAplusModules(result.modules);
      setSuccess(`A+ content generated (${result.model})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A+ generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalize = async () => {
    if (aplusModules.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await localizeAplusContent(serverUrl, aplusModules, targetLocale, provider);
      setLocalizedModules(result.modules);
      setSuccess(`Localized to ${targetLocale} (${result.model})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Localization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAds = async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateAdCreatives(
        serverUrl,
        brandKitId,
        insights,
        productContext.trim(),
        imageTier,
      );
      setAdImages(result.images);
      setSuccess(`Generated ${result.images.length} ad creatives`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ad generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVariations = async () => {
    if (!ready) return;
    const variants = variantText
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (variants.length === 0) {
      setError("Enter at least one variant name (one per line).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateVariationImages(
        serverUrl,
        brandKitId,
        insights,
        productContext.trim(),
        imageTier,
        variants,
      );
      setVariationImages(result.images);
      setSuccess(`Generated ${result.images.length} variation hero images`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Variation generation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = (modules: AplusModule[], suffix: string) => {
    const md = modulesToMarkdown(modules, productContext || "Listing");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amzi-loci-aplus-${suffix}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="studio">
      <div className="settings-intro">
        <h2>Studio</h2>
        <p className="muted">
          Advanced listing tools — uses your last workflow session (insights + brand kit). The core
          wizard stays unchanged.
        </p>
      </div>

      <div className="studio-context">
        <p className="muted">
          {ready
            ? `${insights.length} insights · ${kits.find((k) => k.id === brandKitId)?.name ?? "brand kit"} · ${productContext}`
            : "Complete Workflow steps 1–3 first, or data loads automatically from your last session."}
        </p>
        <button type="button" className="secondary-btn" onClick={() => void loadContext()}>
          Refresh session
        </button>
      </div>

      <nav className="studio-nav">
        {(
          [
            ["aplus", "A+ Content"],
            ["ads", "Ad creatives"],
            ["localize", "Localization"],
            ["variations", "Variations"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={section === id ? "studio-tab active" : "studio-tab"}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {(section === "aplus" || section === "localize") && (
        <div className="workflow-panel">
          <label className="field-label" htmlFor="studio-provider">
            Text model provider
          </label>
          <select
            id="studio-provider"
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
        </div>
      )}

      {(section === "ads" || section === "variations") && (
        <div className="workflow-panel">
          <label className="field-label" htmlFor="studio-tier">
            Image tier (Google key)
          </label>
          <select
            id="studio-tier"
            className="text-input"
            value={imageTier}
            onChange={(e) => setImageTier(e.target.value as ImageTier)}
          >
            {IMAGE_TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {section === "aplus" && (
        <div className="workflow-panel">
          <h3>A+ content modules</h3>
          <p className="muted">Generates hero, features, comparison, and brand story modules.</p>
          <button
            type="button"
            className="primary-btn"
            disabled={loading || !ready}
            onClick={() => void handleAplus()}
          >
            {loading ? "Generating…" : "Generate A+ content"}
          </button>
          {aplusModules.length > 0 && (
            <div className="aplus-modules">
              {aplusModules.map((mod) => (
                <article key={mod.id} className="aplus-module-card">
                  <span className="muted">{mod.type}</span>
                  <h4>{mod.headline}</h4>
                  <p>{mod.body}</p>
                  {mod.bullets?.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </article>
              ))}
              <button
                type="button"
                className="secondary-btn"
                onClick={() => downloadMarkdown(aplusModules, "en")}
              >
                Download A+ markdown
              </button>
            </div>
          )}
        </div>
      )}

      {section === "localize" && (
        <div className="workflow-panel">
          <h3>Localize A+ content</h3>
          <label className="field-label" htmlFor="locale">
            Target language
          </label>
          <select
            id="locale"
            className="text-input"
            value={targetLocale}
            onChange={(e) =>
              setTargetLocale(e.target.value as (typeof LOCALE_OPTIONS)[number]["id"])
            }
          >
            {LOCALE_OPTIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="primary-btn"
            disabled={loading || aplusModules.length === 0}
            onClick={() => void handleLocalize()}
          >
            {loading ? "Translating…" : "Localize A+ modules"}
          </button>
          {localizedModules.length > 0 && (
            <div className="aplus-modules">
              {localizedModules.map((mod) => (
                <article key={mod.id} className="aplus-module-card">
                  <h4>{mod.headline}</h4>
                  <p>{mod.body}</p>
                </article>
              ))}
              <button
                type="button"
                className="secondary-btn"
                onClick={() => downloadMarkdown(localizedModules, targetLocale)}
              >
                Download localized markdown
              </button>
            </div>
          )}
        </div>
      )}

      {section === "ads" && (
        <div className="workflow-panel">
          <h3>Social ad creatives</h3>
          <p className="muted">Square (1:1), Story (9:16), and Landscape (16:9) formats.</p>
          <button
            type="button"
            className="primary-btn extract-btn"
            disabled={loading || !ready}
            onClick={() => void handleAds()}
          >
            {loading ? "Generating…" : "Generate 3 ad creatives"}
          </button>
          <ImageGallery images={adImages} loading={loading} onRegenerate={() => {}} />
        </div>
      )}

      {section === "variations" && (
        <div className="workflow-panel">
          <h3>Variation matching</h3>
          <p className="muted">
            Generate consistent hero images for product variants (color, size, etc.) — one per line,
            max 5.
          </p>
          <textarea
            className="text-area"
            rows={5}
            placeholder={"Matte Black 32oz\nWhite 32oz\nRose Gold 24oz"}
            value={variantText}
            onChange={(e) => setVariantText(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn extract-btn"
            disabled={loading || !ready}
            onClick={() => void handleVariations()}
          >
            {loading ? "Generating…" : "Generate variation heroes"}
          </button>
          <ImageGallery images={variationImages} loading={loading} onRegenerate={() => {}} />
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </section>
  );
}
