import { RELEASE_LOG, formatReleaseRelativeDate } from "@amzi-loci/shared";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { Badge } from "../components/ui/card";

export function ChangelogPage() {
  return (
    <>
      <PageMeta
        title="Changelog"
        description="Amzi Loci release history — desktop app versions and features."
        path="/changelog"
      />
      <Hero title="Changelog" subtitle="Desktop app release notes." />

      <section className="container-page space-y-8 pb-20">
        {RELEASE_LOG.map((entry) => (
          <article
            key={entry.version}
            className="rounded-card border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="primary">v{entry.version}</Badge>
              <span className="text-caption text-text-muted" title={entry.releasedAt}>
                {formatReleaseRelativeDate(entry.releasedAt)}
              </span>
              <span className="text-caption text-text-muted">· {entry.releasedAt}</span>
            </div>
            <h2 className="mt-3 text-section font-medium">{entry.title}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-body text-text-muted">
              {entry.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}
