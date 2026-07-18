import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  Key,
  Monitor,
  Shield,
  Wrench,
} from "lucide-react";
import { APP_VERSION } from "../lib/site";
import {
  INSTALL_STEPS,
  INSTALLER_OPTIONS,
  IT_DEPLOY_NOTES,
  RECOMMENDED_INSTALLER,
  SMARTScreen_HELP,
} from "../lib/install-guide";
import { DOWNLOAD_BASE_URL } from "../lib/site";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { ButtonLink } from "../components/ui/button";
import { Card, Panel } from "../components/ui/card";

export function GettingStartedPage() {
  const setupUrl = `${DOWNLOAD_BASE_URL}/${RECOMMENDED_INSTALLER}`;

  return (
    <>
      <PageMeta
        title="Getting Started"
        description={`Install Amzi Loci v${APP_VERSION} on Windows in minutes — one-click setup, BYOK keys, and first project walkthrough.`}
        path="/getting-started"
      />
      <Hero
        badge="Setup guide"
        title="Install in 5 steps"
        subtitle="Professional one-click install for Windows 10/11. No server setup on your PC — only API keys from Google, OpenAI, or Anthropic."
        primaryCta={{ to: "/download", label: "Download Setup.exe" }}
        secondaryCta={{ to: "/byok-setup", label: "API key guide" }}
      />

      <section className="container-page pb-16">
        <a
          href={setupUrl}
          className="flex flex-col items-start gap-4 rounded-card border border-primary/40 bg-primary/10 p-8 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-caption font-medium text-primary-hover">Recommended — one click</p>
            <h2 className="mt-2 text-heading font-semibold">Windows Setup.exe</h2>
            <p className="mt-2 max-w-xl text-body text-text-muted">
              Works on any standard client PC (64-bit). Installs shortcuts, uninstaller, and auto-updates path
              for future versions.
            </p>
          </div>
          <span className="inline-flex h-12 items-center justify-center rounded-button bg-primary px-6 text-body font-medium text-white">
            <Download size={18} className="mr-2" />
            Download now
          </span>
        </a>
      </section>

      <section className="container-page pb-16">
        <h2 className="text-heading font-semibold">Step-by-step</h2>
        <ol className="mt-8 space-y-6">
          {INSTALL_STEPS.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-body font-medium text-primary-hover">
                {item.step}
              </span>
              <div>
                <h3 className="text-section font-medium">{item.title}</h3>
                <p className="mt-1 text-body text-text-muted">{item.body}</p>
                {"action" in item && item.action && (
                  <a
                    href={item.action.href}
                    className="mt-2 inline-block text-body font-medium text-primary-hover hover:underline"
                  >
                    {item.action.label} →
                  </a>
                )}
                {"link" in item && item.link && (
                  <Link
                    to={item.link.href}
                    className="mt-2 inline-block text-body font-medium text-primary-hover hover:underline"
                  >
                    {item.link.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <Panel>
            <Shield size={22} className="text-primary-hover" />
            <h2 className="mt-3 text-section font-medium">SmartScreen warning?</h2>
            <ul className="mt-4 space-y-2 text-body text-text-muted">
              {SMARTScreen_HELP.map((line) => (
                <li key={line} className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                  {line}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <Wrench size={22} className="text-primary-hover" />
            <h2 className="mt-3 text-section font-medium">IT / agency deploy</h2>
            <ul className="mt-4 space-y-2 text-body text-text-muted">
              {IT_DEPLOY_NOTES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <ButtonLink to="/download" variant="secondary" className="mt-4">
              All installer options
            </ButtonLink>
          </Panel>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-heading font-semibold">Choose your installer</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {INSTALLER_OPTIONS.map((opt) => (
            <Card key={opt.id}>
              {opt.recommended && (
                <span className="text-caption font-medium text-primary-hover">Recommended</span>
              )}
              <h3 className="mt-2 font-medium">{opt.label}</h3>
              <p className="mt-1 text-caption text-text-muted">{opt.audience}</p>
              <a
                href={`${DOWNLOAD_BASE_URL}/${opt.file}`}
                className="mt-4 inline-flex text-body font-medium text-primary-hover hover:underline"
              >
                Download {opt.file}
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <Monitor size={20} className="text-primary-hover" />
            <h3 className="mt-3 font-medium">Windows 10/11 64-bit</h3>
            <p className="mt-1 text-body text-text-muted">Standard agency and seller laptops</p>
          </Card>
          <Card>
            <Key size={20} className="text-primary-hover" />
            <h3 className="mt-3 font-medium">Google key minimum</h3>
            <p className="mt-1 text-body text-text-muted">Full workflow including listing images</p>
          </Card>
          <Card>
            <Shield size={20} className="text-primary-hover" />
            <h3 className="mt-3 font-medium">Local-first</h3>
            <p className="mt-1 text-body text-text-muted">Projects stay on your PC</p>
          </Card>
        </div>
      </section>
    </>
  );
}
