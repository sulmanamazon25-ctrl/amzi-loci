import { Link } from "react-router-dom";
import { APP_VERSION, formatReleaseRelativeDate, getLatestRelease } from "@amzi-loci/shared";
import { API_STATUS_URL, FOOTER_LINKS } from "../../lib/site";

export function SiteFooter() {
  const latest = getLatestRelease();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-caption font-semibold text-white">
              A
            </span>
            Amzi Loci
          </div>
          <p className="mt-3 text-body text-text-muted">
            BYOK, local-first Amazon listing desk for agencies and sellers.
          </p>
          <Link
            to="/changelog"
            className="mt-3 inline-flex items-center gap-2 text-caption text-text-muted hover:text-text"
          >
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary-hover">
              v{APP_VERSION}
            </span>
            <span>{formatReleaseRelativeDate(latest.releasedAt)}</span>
          </Link>
        </div>

        <div>
          <h3 className="text-caption font-medium uppercase tracking-wide text-text-muted">
            Product
          </h3>
          <ul className="mt-3 space-y-2">
            {FOOTER_LINKS.product.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-body text-text-muted hover:text-text">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-caption font-medium uppercase tracking-wide text-text-muted">
            Company
          </h3>
          <ul className="mt-3 space-y-2">
            {FOOTER_LINKS.company.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-body text-text-muted hover:text-text">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-caption font-medium uppercase tracking-wide text-text-muted">
            Legal
          </h3>
          <ul className="mt-3 space-y-2">
            {FOOTER_LINKS.legal.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-body text-text-muted hover:text-text">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={API_STATUS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-body text-text-muted hover:text-text"
              >
                API status
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <p className="container-page text-caption text-text-muted">
          © {new Date().getFullYear()} Amzi Loci. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
