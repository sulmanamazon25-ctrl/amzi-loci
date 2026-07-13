import type {
  ApplyBrandKitResponse,
  BrandKit,
  BrandKitSummary,
  ProductInsight,
} from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";

export type SaveBrandKitInput = {
  id?: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  toneOfVoice: string;
  toneProfessional: number;
  tonePlayful: number;
  toneLuxury: number;
};

export async function listBrandKits(): Promise<BrandKitSummary[]> {
  return invoke<BrandKitSummary[]>("list_brand_kits");
}

export async function loadBrandKit(id: string): Promise<BrandKit> {
  return invoke<BrandKit>("load_brand_kit", { id });
}

export async function saveBrandKit(input: SaveBrandKitInput): Promise<BrandKit> {
  return invoke<BrandKit>("save_brand_kit", { input });
}

export async function deleteBrandKit(id: string): Promise<void> {
  return invoke("delete_brand_kit", { id });
}

export async function saveReferenceImage(
  kitId: string,
  slot: number,
  base64Data: string,
  filename: string,
): Promise<BrandKit> {
  return invoke<BrandKit>("save_reference_image", {
    kitId,
    slot,
    base64Data,
    filename,
  });
}

export async function removeReferenceImage(kitId: string, slot: number): Promise<BrandKit> {
  return invoke<BrandKit>("remove_reference_image", { kitId, slot });
}

export async function readReferencePreview(path: string): Promise<string> {
  return invoke<string>("read_reference_preview", { path });
}

export async function applyBrandKitPrompt(
  serverUrl: string,
  brandKit: BrandKit,
  productContext?: string,
  insights?: ProductInsight[],
): Promise<ApplyBrandKitResponse> {
  const response = await fetch(`${serverUrl.replace(/\/$/, "")}/brandkit/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandKit, productContext, insights }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Server returned ${response.status}`);
  }

  return (await response.json()) as ApplyBrandKitResponse;
}

export function createEmptyDraft(): SaveBrandKitInput {
  return {
    name: "New brand kit",
    primaryColor: "#2563eb",
    secondaryColor: "#f59e0b",
    fontFamily: "Inter",
    toneOfVoice: "",
    toneProfessional: 70,
    tonePlayful: 40,
    toneLuxury: 50,
  };
}
