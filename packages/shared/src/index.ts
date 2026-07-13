export const SERVER_A_DEFAULT_URL = "http://localhost:3000";

export type HealthResponse = {
  status: "ok" | "error";
  service: string;
  db: "connected" | "disconnected";
  timestamp: string;
};

export type ApiInfoResponse = {
  message: string;
  service: string;
  version: string;
};
