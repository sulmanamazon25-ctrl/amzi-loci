import type { BrandKit, ListingCopy, ProductInsight } from "@amzi-loci/shared";

import {

  EXPORT_FORMATS,

  formatComplianceChecklist,

  formatCreativeBrief,

  formatListingCopyText,

  runComplianceChecks,

} from "@amzi-loci/shared";

import { useEffect, useMemo, useState } from "react";

import { openPath } from "@tauri-apps/plugin-opener";

import { ComplianceChecklist } from "./ComplianceChecklist";

import type { GeneratedImage } from "../lib/images";

import {

  exportImagesZip,

  exportListingPack,

  type ExportImageItem,

} from "../lib/export";

import { exportCreativeBriefFile } from "../lib/projects";

import { UsagePanel } from "./UsagePanel";



type ExportPanelProps = {

  images: GeneratedImage[];

  productContext: string;

  listingCopy: ListingCopy | null;

  insights: ProductInsight[];

  brandKit: BrandKit | null;

  clientName?: string;

  projectName?: string;

  projectId?: string | null;

  onExportNote?: (note: string) => void;

};



export function ExportPanel({

  images,

  productContext,

  listingCopy,

  insights,

  brandKit,

  clientName,

  projectName,

  projectId,

  onExportNote,

}: ExportPanelProps) {

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [format, setFormat] = useState<"png" | "jpg">("png");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const [lastExportPath, setLastExportPath] = useState<string | null>(null);



  const complianceItems = useMemo(() => runComplianceChecks(listingCopy), [listingCopy]);

  const hasBlockingIssues = complianceItems.some((item) => item.status === "fail");



  const creativeBriefText = useMemo(

    () =>

      formatCreativeBrief({

        clientName,

        projectName,

        productContext,

        insights,

        brandKit,

        imageSlots: images.map((img) => ({

          slotType: img.slotType,

          slotIndex: img.slotIndex,

          label: img.label,

          prompt: img.prompt,

        })),

        listingCopy,

      }),

    [brandKit, clientName, images, insights, listingCopy, productContext, projectName],

  );



  useEffect(() => {

    setSelected(new Set(images.map((img) => img.id)));

  }, [images]);



  const toggleImage = (id: string) => {

    setSelected((current) => {

      const next = new Set(current);

      if (next.has(id)) next.delete(id);

      else next.add(id);

      return next;

    });

  };



  const buildItems = (): ExportImageItem[] =>

    images

      .filter((img) => selected.has(img.id))

      .map((img) => ({

        localPath: img.localPath,

        slotType: img.slotType,

        slotIndex: img.slotIndex,

        label: img.label,

      }));



  const handleExportPack = async () => {

    const items = buildItems();

    setLoading(true);

    setError(null);

    setSuccess(null);

    try {

      const copyText = listingCopy

        ? formatListingCopyText(listingCopy, productContext)

        : undefined;

      const checklistText = formatComplianceChecklist(complianceItems);

      const zipPath = await exportListingPack({

        items,

        format,

        productName: productContext.trim() || "listing",

        listingCopyText: copyText,

        checklistText,

        creativeBriefText,

      });

      setLastExportPath(zipPath);

      onExportNote?.(`Upload pack exported (${items.length} images)`);

      setSuccess(`Upload pack ready — ${items.length} image(s) + copy + brief + checklist.`);

    } catch (err) {

      setError(err instanceof Error ? err.message : "Export failed");

    } finally {

      setLoading(false);

    }

  };



  const handleExportImagesOnly = async () => {

    const items = buildItems();

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

      onExportNote?.(`Images zip exported (${items.length} images)`);

      setSuccess(`Exported ${items.length} image(s) to zip.`);

    } catch (err) {

      setError(err instanceof Error ? err.message : "Export failed");

    } finally {

      setLoading(false);

    }

  };



  const handleExportBrief = async () => {

    setLoading(true);

    setError(null);

    setSuccess(null);

    try {

      const path = await exportCreativeBriefFile(

        creativeBriefText,

        productContext.trim() || "listing",

      );

      setLastExportPath(path);

      onExportNote?.("Creative brief exported");

      setSuccess("Creative brief saved.");

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

      <ComplianceChecklist items={complianceItems} />



      <section className="export-section export-section-primary">

        <h3>Download upload pack</h3>

        <p className="muted">

          One zip with images, listing copy, creative brief, and checklist.

        </p>



        {images.length === 0 ? (

          <p className="muted">Generate images first.</p>

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

              Image format

            </label>

            <select

              id="export-format"

              className="text-input"

              value={format}

              onChange={(e) => setFormat(e.target.value as "png" | "jpg")}

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

                onClick={() => void handleExportPack()}

              >

                {loading ? "Building pack…" : "Export upload pack"}

              </button>

              {hasBlockingIssues && (

                <span className="muted export-hint">Fix red checklist items first (recommended).</span>

              )}

            </div>



            <button

              type="button"

              className="secondary-btn export-images-only"

              disabled={loading || selected.size === 0}

              onClick={() => void handleExportImagesOnly()}

            >

              Images only (zip)

            </button>



            <button

              type="button"

              className="secondary-btn"

              disabled={loading}

              onClick={() => void handleExportBrief()}

            >

              Export creative brief

            </button>



            {lastExportPath && (

              <button type="button" className="secondary-btn" onClick={() => void handleOpenExport()}>

                Open last export

              </button>

            )}

          </>

        )}



        {error && <p className="error">{error}</p>}

        {success && <p className="success">{success}</p>}

      </section>



      <UsagePanel

        compact

        activeProjectId={projectId}

        activeProjectLabel={

          clientName && projectName ? `${clientName} / ${projectName}` : undefined

        }

      />

    </div>

  );

}


