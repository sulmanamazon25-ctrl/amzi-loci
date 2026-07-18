import type { ExportFormat } from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";

export type ExportImageItem = {
  localPath: string;
  slotType: string;
  slotIndex: number;
  label: string;
};

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

export type ExportPackOptions = {
  items: ExportImageItem[];
  format: ExportFormat;
  productName: string;
  listingCopyText?: string;
  checklistText?: string;
  creativeBriefText?: string;
};

export async function exportListingPack(options: ExportPackOptions): Promise<string> {
  return invoke<string>("export_listing_pack_command", {
    input: {
      items: options.items.map((item) => ({
        localPath: item.localPath,
        slotType: item.slotType,
        slotIndex: item.slotIndex,
        label: item.label,
      })),
      format: options.format,
      productName: options.productName,
      listingCopyText: options.listingCopyText ?? null,
      checklistText: options.checklistText ?? null,
      creativeBriefText: options.creativeBriefText ?? null,
    },
  });
}
