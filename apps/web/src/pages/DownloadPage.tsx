import { Download, HardDrive, Monitor, Shield } from "lucide-react";
import { APP_VERSION, DOWNLOAD_BASE_URL } from "../lib/site";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { ButtonLink } from "../components/ui/button";
import { Card } from "../components/ui/card";

const INSTALLERS = [
  { id: "setup", label: "Setup.exe", file: `Amzi-Loci-${APP_VERSION}-setup.exe`, recommended: true },
  { id: "msi", label: "MSI installer", file: `Amzi-Loci-${APP_VERSION}.msi`, recommended: false },
  { id: "portable", label: "Portable", file: `Amzi-Loci-${APP_VERSION}-portable.exe`, recommended: false },
] as const;

export function DownloadPage() {
  return (
    <>
      <PageMeta
        title="Download"
        description={`Download Amzi Loci v${APP_VERSION} for Windows. BYOK Amazon listing desk — setup, MSI, or portable.`}
        path="/download"
      />
      <Hero
        badge={`Version ${APP_VERSION}`}
        title="Download for Windows"
        subtitle="Install the desktop app, add your API keys in Settings, and create your first project. macOS and Linux are on the roadmap."
        primaryCta={{ to: "/pricing", label: "View pricing" }}
      />

      <section className="container-page pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {INSTALLERS.map((item) => (
            <Card key={item.id}>
              {item.recommended && (
                <span className="text-caption font-medium text-primary-hover">Recommended</span>
              )}
              <h3 className="mt-2 text-section font-medium">{item.label}</h3>
              <p className="mt-1 text-caption text-text-muted">{item.file}</p>
              <a
                href={`${DOWNLOAD_BASE_URL}/${item.file}`}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-button bg-primary px-4 text-body font-medium text-white hover:bg-primary-hover"
                download
              >
                <Download size={16} className="mr-2" />
                Download
              </a>
            </Card>
          ))}
        </div>
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
              Anthropic or OpenAI for insights/copy; Google for images
            </p>
          </Card>
        </div>
        <div className="mt-8">
          <ButtonLink to="/faq" variant="secondary">
            Setup FAQ
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
