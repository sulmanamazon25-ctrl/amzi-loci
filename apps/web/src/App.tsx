import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteNav } from "./components/layout/SiteNav";
import { SiteFooter } from "./components/layout/SiteFooter";
import { HomePage } from "./pages/HomePage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { PricingPage } from "./pages/PricingPage";
import { DownloadPage } from "./pages/DownloadPage";
import { AgenciesPage } from "./pages/AgenciesPage";
import { FaqPage } from "./pages/FaqPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { ByokSetupPage } from "./pages/ByokSetupPage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { GettingStartedPage } from "./pages/GettingStartedPage";
import { ProductionGuidePage } from "./pages/ProductionGuidePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-bg text-text">
        <SiteNav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/guide" element={<ProductionGuidePage />} />
            <Route path="/for-agencies" element={<AgenciesPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/byok-setup" element={<ByokSetupPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}
