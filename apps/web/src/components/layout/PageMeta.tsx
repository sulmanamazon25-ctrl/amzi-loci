import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  path?: string;
}

export function PageMeta({ title, description, path = "" }: PageMetaProps) {
  useEffect(() => {
    document.title = title.includes("Amzi Loci") ? title : `${title} — Amzi Loci`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogTitle) ogTitle.setAttribute("content", document.title);
    if (ogDesc) ogDesc.setAttribute("content", description);
    if (ogUrl && path) ogUrl.setAttribute("content", `${window.location.origin}${path}`);
  }, [title, description, path]);

  return null;
}
