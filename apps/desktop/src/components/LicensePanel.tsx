import { useCallback, useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { LICENSE_PLANS, type LicenseValidation } from "@amzi-loci/shared";
import {
  createLicenseCheckout,
  getDeviceFingerprint,
  syncLicenseCheckout,
  validateLicense,
} from "../lib/license";

type Props = {
  serverUrl: string;
  compact?: boolean;
  onLicenseChange?: (license: LicenseValidation) => void;
};

export function LicensePanel({ serverUrl, compact = false, onLicenseChange }: Props) {
  const [license, setLicense] = useState<LicenseValidation | null>(null);
  const [fingerprint, setFingerprint] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "agency">("pro");
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [validation, fp] = await Promise.all([
        validateLicense(serverUrl),
        getDeviceFingerprint(),
      ]);
      setLicense(validation);
      setFingerprint(fp);
      onLicenseChange?.(validation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "License check failed");
    } finally {
      setLoading(false);
    }
  }, [onLicenseChange, serverUrl]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCheckout = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await createLicenseCheckout(
        serverUrl,
        selectedPlan,
        email.trim() || undefined,
      );
      await openUrl(result.checkoutUrl);
      setMessage("Checkout opened in your browser. After payment, paste the session ID below and sync.");
      setSessionId(result.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async () => {
    if (!sessionId.trim()) {
      setError("Enter the Stripe checkout session ID");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const validation = await syncLicenseCheckout(serverUrl, sessionId.trim());
      setLicense(validation);
      onLicenseChange?.(validation);
      setMessage("License synced successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="hint">Checking license…</p>;
  }

  return (
    <section className={compact ? "license-panel compact" : "license-panel"}>
      {!compact && <h2>License</h2>}

      {license && (
        <dl className="health-details license-status">
          <div>
            <dt>Plan</dt>
            <dd>{license.plan}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{license.status}</dd>
          </div>
          <div>
            <dt>Message</dt>
            <dd>{license.message}</dd>
          </div>
          {license.trialEndsAt && (
            <div>
              <dt>Trial ends</dt>
              <dd>{new Date(license.trialEndsAt).toLocaleDateString()}</dd>
            </div>
          )}
          {fingerprint && (
            <div>
              <dt>Device ID</dt>
              <dd className="mono">{fingerprint.slice(0, 16)}…</dd>
            </div>
          )}
        </dl>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="license-plans">
        {LICENSE_PLANS.map((plan) => (
          <label key={plan.id} className={selectedPlan === plan.id ? "plan-card selected" : "plan-card"}>
            <input
              type="radio"
              name="license-plan"
              value={plan.id}
              checked={selectedPlan === plan.id}
              onChange={() => setSelectedPlan(plan.id)}
            />
            <span className="plan-label">{plan.label}</span>
            <span className="plan-price">{plan.priceLabel}</span>
            <span className="plan-desc">{plan.description}</span>
          </label>
        ))}
      </div>

      <label className="field">
        <span>Email (optional, for receipt)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </label>

      <div className="license-actions">
        <button type="button" className="primary-btn" disabled={busy} onClick={() => void handleCheckout()}>
          {busy ? "Working…" : "Subscribe / upgrade"}
        </button>
        <button type="button" className="retry-btn" disabled={busy} onClick={() => void refresh()}>
          Refresh license
        </button>
      </div>

      <label className="field">
        <span>Stripe session ID (after checkout)</span>
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="cs_test_…"
        />
      </label>
      <button type="button" className="secondary-btn" disabled={busy} onClick={() => void handleSync()}>
        Sync license
      </button>
    </section>
  );
}
