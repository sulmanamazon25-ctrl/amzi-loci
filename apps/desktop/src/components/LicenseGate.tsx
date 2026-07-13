import type { LicenseValidation } from "@amzi-loci/shared";
import { LicensePanel } from "./LicensePanel";

type Props = {
  serverUrl: string;
  license: LicenseValidation | null;
  error: string | null;
  onLicenseChange: (license: LicenseValidation) => void;
};

export function LicenseGate({ serverUrl, license, error, onLicenseChange }: Props) {
  return (
    <main className="app license-gate">
      <header className="header">
        <h1>Amzi Loci</h1>
        <p className="subtitle">Your trial has ended</p>
      </header>

      <section className="status-card">
        <p>
          {license?.message ??
            "Subscribe to keep generating Amazon listing assets. Your BYOK keys and brand kits stay on this device."}
        </p>
        {error && <p className="error">{error}</p>}
        <LicensePanel serverUrl={serverUrl} onLicenseChange={onLicenseChange} />
      </section>
    </main>
  );
}
