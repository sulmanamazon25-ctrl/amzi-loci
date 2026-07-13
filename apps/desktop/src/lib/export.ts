import type { ExportFormat, UsageSummary } from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";

export type ExportImageItem = {
  localPath: string;
  slotType: string;
  slotIndex: number;
  label: string;
};

export async function getUsageSummary(): Promise<UsageSummary> {
  return invoke<UsageSummary>("get_usage_summary");
}

export async function exportImagesZip(
  items: ExportImageItem[],
  format: ExportFormat,
  productName: string,
): Promise<string> {
  return invoke<string>("export_images_zip_command", {
    items: items.map((item) => ({
      localPath: item.localPath,
      slotType: item.slotType,
      slotIndex: item.slotIndex,
      label: item.label,
    })),
    format,
    productName,
  });
}
