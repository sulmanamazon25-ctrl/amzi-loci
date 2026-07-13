import { useCallback, useEffect, useState } from "react";
import type { HealthResponse } from "@amzi-loci/shared";
import { SERVER_A_DEFAULT_URL } from "@amzi-loci/shared";
import { Settings } from "./components/Settings";
import { Workflow } from "./components/Workflow";
import "./App.css";

type ConnectionState = "checking" | "connected" | "disconnected";
type Tab = "home" | "workflow" | "settings";

const serverUrl = import.meta.env.VITE_SERVER_A_URL ?? SERVER_A_DEFAULT_URL;

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [connection, setConnection] = useState<ConnectionState>("checking");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setConnection("checking");
    setError(null);

    try {
      const response = await fetch(`${serverUrl}/health`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = (await response.json()) as HealthResponse;
      setHealth(data);
      setConnection(data.status === "ok" ? "connected" : "disconnected");
    } catch (err) {
      setHealth(null);
      setConnection("disconnected");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const statusLabel =
    connection === "checking"
      ? "Checking..."
      : connection === "connected"
        ? "Connected"
        : "Disconnected";

  return (
    <main className="app">
      <header className="header">
        <h1>Amzi Loci</h1>
        <p className="subtitle">Amazon listing asset generator</p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={tab === "home" ? "tab active" : "tab"}
          onClick={() => setTab("home")}
        >
          Status
        </button>
        <button
          type="button"
          className={tab === "workflow" ? "tab active" : "tab"}
          onClick={() => setTab("workflow")}
        >
          Workflow
        </button>
        <button
          type="button"
          className={tab === "settings" ? "tab active" : "tab"}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </nav>

      {tab === "home" ? (
        <section className="status-card">
          <div className="status-row">
            <span className="status-label">Server A</span>
            <span className={`status-badge status-${connection}`}>{statusLabel}</span>
          </div>

          <p className="server-url">{serverUrl}</p>

          {health && (
            <dl className="health-details">
              <div>
                <dt>Service</dt>
                <dd>{health.service}</dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd>{health.db}</dd>
              </div>
              <div>
                <dt>Last check</dt>
                <dd>{new Date(health.timestamp).toLocaleString()}</dd>
              </div>
            </dl>
          )}

          {error && <p className="error">{error}</p>}

          <button type="button" className="retry-btn" onClick={() => void checkHealth()}>
            Retry connection
          </button>
        </section>
      ) : tab === "workflow" ? (
        <Workflow />
      ) : (
        <Settings />
      )}
    </main>
  );
}

export default App;
