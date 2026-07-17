import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { Badge } from "../components/ui/card";

const ENTRIES = [
  {
    version: "0.11.0",
    date: "2026-07-14",
    title: "Professional desktop UI redesign",
    items: [
      "New sidebar shell, dashboard, and project workspace",
      "Tailwind design system matching marketing site",
      "Six dedicated workflow step screens",
    ],
  },
  {
    version: "0.10.0",
    date: "2026-07-13",
    title: "Agency desk",
    items: ["Project workspaces", "Per-project usage", "Creative brief in upload pack"],
  },
  {
    version: "0.9.0",
    date: "2026-07-13",
    title: "Listing copy & upload pack",
    items: ["Listing copy generation", "Compliance checklist", "Export upload pack zip"],
  },
  {
    version: "0.8.0",
    date: "2026-07-12",
    title: "Licensing",
    items: ["Trial mode", "Plan tiers", "Stripe-ready checkout"],
  },
];

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
        {ENTRIES.map((entry) => (
          <article
            key={entry.version}
            className="rounded-card border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="primary">v{entry.version}</Badge>
              <span className="text-caption text-text-muted">{entry.date}</span>
            </div>
            <h2 className="mt-3 text-section font-medium">{entry.title}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-body text-text-muted">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}
