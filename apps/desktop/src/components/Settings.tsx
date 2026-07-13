import { useCallback, useEffect, useState } from "react";
import {
  deleteApiKey,
  getKeyStatuses,
  PROVIDERS,
  saveApiKey,
  testApiKey,
  type ApiProvider,
  type KeyStatus,
} from "../lib/apiKeys";
import type { LicenseValidation } from "@amzi-loci/shared";
import { LicensePanel } from "./LicensePanel";

type ProviderState = {
  input: string;
  testing: boolean;
  saving: boolean;
  message: string | null;
  error: string | null;
};

type Props = {
  serverUrl: string;
  onLicenseChange?: (license: LicenseValidation) => void;
};

const emptyProviderState = (): ProviderState => ({
  input: "",
  testing: false,
  saving: false,
  message: null,
  error: null,
});

export function Settings({ serverUrl, onLicenseChange }: Props) {
  const [statuses, setStatuses] = useState<KeyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerState, setProviderState] = useState<Record<ApiProvider, ProviderState>>({
    anthropic: emptyProviderState(),
    openai: emptyProviderState(),
    google: emptyProviderState(),
  });

  const refreshStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getKeyStatuses();
      setStatuses(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatuses();
  }, [refreshStatuses]);

  const updateProvider = (provider: ApiProvider, patch: Partial<ProviderState>) => {
    setProviderState((current) => ({
      ...current,
      [provider]: { ...current[provider], ...patch },
    }));
  };

  const handleTest = async (provider: ApiProvider) => {
    const key = providerState[provider].input.trim();
    if (!key) {
      updateProvider(provider, { error: "Enter a key to test", message: null });
      return;
    }

    updateProvider(provider, { testing: true, error: null, message: null });
    try {
      const message = await testApiKey(provider, key);
      updateProvider(provider, { message, error: null });
    } catch (err) {
      updateProvider(provider, {
        error: err instanceof Error ? err.message : "Test failed",
        message: null,
      });
    } finally {
      updateProvider(provider, { testing: false });
    }
  };

  const handleSave = async (provider: ApiProvider) => {
    const key = providerState[provider].input.trim();
    if (!key) {
      updateProvider(provider, { error: "Enter a key to save", message: null });
      return;
    }

    updateProvider(provider, { saving: true, error: null, message: null });
    try {
      await saveApiKey(provider, key);
      updateProvider(provider, { input: "", message: "Saved to OS keychain", error: null });
      await refreshStatuses();
    } catch (err) {
      updateProvider(provider, {
        error: err instanceof Error ? err.message : "Save failed",
        message: null,
      });
    } finally {
      updateProvider(provider, { saving: false });
    }
  };

  const handleDelete = async (provider: ApiProvider) => {
    updateProvider(provider, { saving: true, error: null, message: null });
    try {
      await deleteApiKey(provider);
      updateProvider(provider, { input: "", message: "Key removed from keychain", error: null });
      await refreshStatuses();
    } catch (err) {
      updateProvider(provider, {
        error: err instanceof Error ? err.message : "Delete failed",
        message: null,
      });
    } finally {
      updateProvider(provider, { saving: false });
    }
  };

  const statusFor = (provider: ApiProvider) =>
    statuses.find((item) => item.provider === provider);

  return (
    <section className="settings">
      <LicensePanel
        serverUrl={serverUrl}
        compact
        onLicenseChange={onLicenseChange}
      />

      <div className="settings-intro">
        <h2>BYOK API Keys</h2>
        <p>
          Keys are stored in your OS keychain only. They never touch Server A, Server B, or
          plaintext files on disk.
        </p>
      </div>

      {loading ? (
        <p className="muted">Loading key status...</p>
      ) : (
        <div className="provider-list">
          {PROVIDERS.map((provider) => {
            const state = providerState[provider.id];
            const saved = statusFor(provider.id);

            return (
              <article key={provider.id} className="provider-card">
                <div className="provider-header">
                  <div>
                    <h3>{provider.label}</h3>
                    <p className="muted">{provider.hint}</p>
                  </div>
                  {saved?.saved ? (
                    <span className="status-badge status-connected">Saved {saved.masked}</span>
                  ) : (
                    <span className="status-badge status-disconnected">Not set</span>
                  )}
                </div>

                <label className="field-label" htmlFor={`${provider.id}-key`}>
                  API key
                </label>
                <input
                  id={`${provider.id}-key`}
                  className="text-input"
                  type="password"
                  placeholder={saved?.saved ? "Enter new key to replace" : "Paste API key"}
                  value={state.input}
                  onChange={(event) =>
                    updateProvider(provider.id, { input: event.currentTarget.value })
                  }
                  autoComplete="off"
                />

                <div className="button-row">
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={state.testing || state.saving}
                    onClick={() => void handleTest(provider.id)}
                  >
                    {state.testing ? "Testing..." : "Test key"}
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={state.testing || state.saving}
                    onClick={() => void handleSave(provider.id)}
                  >
                    {state.saving ? "Saving..." : "Save to keychain"}
                  </button>
                  {saved?.saved && (
                    <button
                      type="button"
                      className="danger-btn"
                      disabled={state.testing || state.saving}
                      onClick={() => void handleDelete(provider.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {state.message && <p className="success">{state.message}</p>}
                {state.error && <p className="error">{state.error}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
