import { Download, HardDrive, Monitor, Shield, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_VERSION, DOWNLOAD_BASE_URL } from "../lib/site";
import {
  INSTALLER_OPTIONS,
  RECOMMENDED_INSTALLER,
  SMARTScreen_HELP,
} from "../lib/install-guide";
import { PageMeta } from "../components/layout/PageMeta";
import { ProductVideo } from "../components/marketing/ProductVideo";
import { ButtonLink } from "../components/ui/button";
import { Card, Panel } from "../components/ui/card";

const setupUrl = `${DOWNLOAD_BASE_URL}/${RECOMMENDED_INSTALLER}`;

export function DownloadPage() {
  return (
    <>
      <PageMeta
        title="Download"
        description={`Download Amzi Loci v${APP_VERSION} for Windows — one-click Setup.exe, MSI for IT, or portable.`}
        path="/download"
      />

      <section className="container-page py-16 md:py-20">
        <p className="text-caption font-medium text-primary-hover">Version {APP_VERSION}</p>
        <h1 className="mt-3 max-w-2xl text-display font-semibold">One-click install for Windows</h1>
        <p className="mt-4 max-w-2xl text-body text-text-muted md:text-lg">
          Download Setup.exe for any standard 64-bit PC. Full setup guide, BYOK keys, and first project
          walkthrough — no support ticket needed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={setupUrl}
            className="inline-flex h-12 items-center justify-center rounded-button bg-primary px-6 text-section font-medium text-white hover:bg-primary-hover"
          >
            <Download size={20} className="mr-2" />
            Download Setup.exe
          </a>
          <ButtonLink to="/getting-started" variant="secondary" size="lg">
            Full setup guide
          </ButtonLink>
          <ButtonLink to="/byok-setup" variant="secondary" size="lg">
            API keys (BYOK)
          </ButtonLink>
        </div>
      </section>

      <section className="container-page pb-12">
        <Panel className="border-primary/30 bg-primary/5">
          <h2 className="text-section font-medium">After install (2 minutes)</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            <li className="text-body text-text-muted">
              <strong className="text-text">1.</strong> Open Amzi Loci from Start menu
            </li>
            <li className="text-body text-text-muted">
              <strong className="text-text">2.</strong> Settings → add Google API key (simplest)
            </li>
            <li className="text-body text-text-muted">
              <strong className="text-text">3.</strong> Projects → New → paste reviews
            </li>
          </ol>
          <Link to="/getting-started" className="mt-4 inline-block text-body text-primary-hover hover:underline">
            Detailed step-by-step guide →
          </Link>
        </Panel>
      </section>

      <section className="container-page pb-12">
        <h2 className="text-heading font-semibold">All installers</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {INSTALLER_OPTIONS.map((item) => (
            <Card key={item.id} className={item.recommended ? "ring-1 ring-primary/40" : undefined}>
              {item.recommended && (
                <span className="text-caption font-medium text-primary-hover">Recommended</span>
              )}
              <h3 className="mt-2 text-section font-medium">{item.label}</h3>
              <p className="mt-1 text-caption text-text-muted">{item.audience}</p>
              <p className="mt-2 text-caption text-text-muted">{item.file}</p>
              <a
                href={`${DOWNLOAD_BASE_URL}/${item.file}`}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-button bg-primary px-4 text-body font-medium text-white hover:bg-primary-hover"
              >
                <Download size={16} className="mr-2" />
                Download
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <h2 className="text-heading font-semibold">SmartScreen / first run</h2>
        <ul className="mt-4 space-y-2">
          {SMARTScreen_HELP.map((line) => (
            <li key={line} className="flex gap-2 text-body text-text-muted">
              <CheckCircle2 size={18} className="shrink-0 text-success" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pb-12">
        <ProductVideo title="Watch the 2-minute overview" compact />
      </section>

      <section className="container-page pb-20">
        <h2 className="text-heading font-semibold">System requirements</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <Monitor size={20} className="text-primary-hover" />
            <h3 className="mt-3 font-medium">OS</h3>
            <p className="mt-1 text-body text-text-muted">Windows 10 or 11 (64-bit)</p>
          </Card>
          <Card>
            <HardDrive size={20} className="text-primary-hover" />
            <h3 className="mt-3 font-medium">Storage</h3>
            <p className="mt-1 text-body text-text-muted">500 MB app + local project data</p>
          </Card>
          <Card>
            <Shield size={20} className="text-primary-hover" />
            <h3 className="mt-3 font-medium">API keys</h3>
            <p className="mt-1 text-body text-text-muted">
              Google required for images. See{" "}
              <Link to="/byok-setup" className="text-primary-hover hover:underline">
                BYOK guide
              </Link>
              .
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
