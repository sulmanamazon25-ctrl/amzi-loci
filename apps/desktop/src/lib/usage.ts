import type { UsageSummary } from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";

export async function getUsageSummary(projectId?: string | null): Promise<UsageSummary> {
  return invoke<UsageSummary>("get_usage_summary", {
    projectId: projectId ?? null,
  });
}
