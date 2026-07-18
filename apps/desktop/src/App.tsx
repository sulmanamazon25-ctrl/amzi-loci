import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { HealthResponse, LicenseValidation } from "@amzi-loci/shared";
import { SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";
import { AppShell } from "./components/layout/app-shell";
import { Dashboard } from "./components/dashboard/dashboard";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ClientsPage } from "./pages/ClientsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { ExportsPage } from "./pages/ExportsPage";
import { UsagePage } from "./pages/UsagePage";
import { ProjectWorkspace } from "./components/workflow/project-workspace";
import { Settings } from "./components/Settings";
import { BrandKits } from "./components/BrandKits";
import { Studio } from "./components/Studio";
import { ProductVideoStudio } from "./components/ProductVideoStudio";
import { LicenseGate } from "./components/LicenseGate";
import { validateLicense } from "./lib/license";
import { getKeyStatuses } from "./lib/apiKeys";
import { listProjects } from "./lib/projects";
import { getUsageSummary } from "./lib/usage";
import { LoadingState } from "./components/ui/empty-loading";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

function ShellRoutes({
  license,
  onLicenseChange,
}: {
  license: LicenseValidation;
  onLicenseChange: (l: LicenseValidation) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [connections, setConnections] = useState<{ name: string; connected: boolean }[]>([]);
  const [apiCostToday, setApiCostToday] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [syncState] = useState("Saved");

  const refreshShell = useCallback(async () => {
    try {
      const [statuses, projects, usage] = await Promise.all([
        getKeyStatuses(),
        listProjects(),
        getUsageSummary(null).catch(() => null),
      ]);
      setConnections(
        statuses.map((s) => ({
          name: s.provider.charAt(0).toUpperCase() + s.provider.slice(1),
          connected: s.saved,
        })),
      );
      setProjectCount(projects.length);

      if (usage) {
        const today = new Date().toDateString();
        const todayCost = usage.entries
          .filter((e) => new Date(e.timestamp).toDateString() === today)
          .reduce((sum, e) => sum + e.estimatedCostUsd, 0);
        setApiCostToday(todayCost);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void refreshShell();
    const id = window.setInterval(() => void refreshShell(), 30000);
    return () => window.clearInterval(id);
  }, [refreshShell]);

  useEffect(() => {
    void fetch(`${serverUrl}/health`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setHealth(data as HealthResponse | null))
      .catch(() => setHealth(null));
  }, []);

  const activePath = location.pathname === "/" ? "/" : `/${location.pathname.split("/")[1]}`;

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    if (parts[0] === "projects" && parts.length >= 2) {
      const step = parts[2] ? ` / ${parts[2]}` : "";
      return `Projects / Workspace${step}`;
    }
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")).join(" / ");
  }, [location.pathname]);

  const canUseStudio = license.features.studio;

  return (
    <AppShell
      activePath={activePath}
      onNavigate={(path) => navigate(path)}
      breadcrumb={breadcrumb}
      onOpenCommandPalette={() => undefined}
      apiCostToday={apiCostToday}
      connections={connections}
      projectCount={projectCount}
      syncState={syncState}
      canUseStudio={canUseStudio}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              userFirstName="there"
              serverConnected={health?.status === "ok"}
            />
          }
        />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/projects/:id/:step" element={<ProjectWorkspace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/exports" element={<ExportsPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route
          path="/brand-kits"
          element={
            <div className="page-legacy mx-auto max-w-4xl">
              <BrandKits />
            </div>
          }
        />
        <Route
          path="/studio"
          element={
            canUseStudio ? (
              <div className="page-legacy mx-auto max-w-4xl">
                <Studio />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/product-video"
          element={
            <div className="page-legacy mx-auto max-w-4xl">
              <ProductVideoStudio canUseComplete={canUseStudio} />
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="page-legacy mx-auto max-w-3xl">
              <Settings serverUrl={serverUrl} onLicenseChange={onLicenseChange} />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function App() {
  const [license, setLicense] = useState<LicenseValidation | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  const refreshLicense = useCallback(async () => {
    setLicenseLoading(true);
    setLicenseError(null);
    try {
      const result = await validateLicense(serverUrl);
      setLicense(result);
    } catch (err) {
      setLicense(null);
      setLicenseError(err instanceof Error ? err.message : "License check failed");
    } finally {
      setLicenseLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLicense();
  }, [refreshLicense]);

  if (licenseLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <LoadingState label="Checking license…" />
      </div>
    );
  }

  if (license && !license.valid) {
    return (
      <div className="page-legacy flex min-h-screen items-center justify-center bg-bg p-8">
        <LicenseGate
          serverUrl={serverUrl}
          license={license}
          error={licenseError}
          onLicenseChange={(next) => {
            setLicense(next);
            if (next.valid) setLicenseError(null);
          }}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {license && (
        <ShellRoutes license={license} onLicenseChange={setLicense} />
      )}
    </BrowserRouter>
  );
}

export default App;
