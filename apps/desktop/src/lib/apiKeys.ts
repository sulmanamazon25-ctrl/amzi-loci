import { invoke } from "@tauri-apps/api/core";

export type ApiProvider = "anthropic" | "openai" | "google";

export type KeyStatus = {
  provider: ApiProvider;
  saved: boolean;
  masked: string | null;
};

export const PROVIDERS: Array<{
  id: ApiProvider;
  label: string;
  hint: string;
}> = [
  {
    id: "anthropic",
    label: "Anthropic",
    hint: "Used for Claude review insights (Phase 2+)",
  },
  {
    id: "openai",
    label: "OpenAI",
    hint: "Used for GPT-based workflows (Phase 2+)",
  },
  {
    id: "google",
    label: "Google AI",
    hint: "Used for Gemini / Imagen image generation (Phase 4+)",
  },
];

export async function getKeyStatuses(): Promise<KeyStatus[]> {
  return invoke<KeyStatus[]>("get_key_statuses");
}

export async function saveApiKey(provider: ApiProvider, key: string): Promise<void> {
  await invoke("save_api_key", { provider, key });
}

export async function deleteApiKey(provider: ApiProvider): Promise<void> {
  await invoke("delete_api_key", { provider });
}

export async function testApiKey(provider: ApiProvider, key: string): Promise<string> {
  return invoke<string>("test_api_key", { provider, key });
}
