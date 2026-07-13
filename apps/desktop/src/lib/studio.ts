import type {
  AplusModule,
  ApiProvider,
  ImageTier,
  ListingSession,
  LocaleCode,
  ProductInsight,
} from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";
import type { GeneratedImage } from "./images";

export async function getListingSession(): Promise<ListingSession | null> {
  return invoke<ListingSession | null>("get_listing_session");
}

export async function saveListingSession(
  productContext: string,
  brandKitId: string | null,
  provider: ApiProvider,
  insights: ProductInsight[],
): Promise<ListingSession> {
  return invoke<ListingSession>("save_listing_session", {
    productContext,
    brandKitId,
    provider,
    insights,
  });
}

export async function generateAplusContent(
  serverUrl: string,
  brandKitId: string,
  insights: ProductInsight[],
  productContext: string,
  provider: ApiProvider,
): Promise<{ modules: AplusModule[]; model: string }> {
  const result = await invoke<{ modules: AplusModule[]; model: string }>("generate_aplus_content", {
    serverUrl,
    brandKitId,
    insights,
    productContext,
    provider,
  });
  return result;
}

export async function localizeAplusContent(
  serverUrl: string,
  modules: AplusModule[],
  targetLocale: LocaleCode,
  provider: ApiProvider,
): Promise<{ modules: AplusModule[]; model: string }> {
  return invoke("localize_aplus_content", {
    serverUrl,
    modules,
    targetLocale,
    provider,
  });
}

export async function generateAdCreatives(
  serverUrl: string,
  brandKitId: string,
  insights: ProductInsight[],
  productContext: string,
  tier: ImageTier,
): Promise<{ images: GeneratedImage[]; model: string; tier: string }> {
  return invoke("generate_ad_creatives", {
    serverUrl,
    brandKitId,
    insights,
    productContext,
    tier,
  });
}

export async function generateVariationImages(
  serverUrl: string,
  brandKitId: string,
  insights: ProductInsight[],
  productContext: string,
  tier: ImageTier,
  variants: string[],
): Promise<{ images: GeneratedImage[]; model: string; tier: string }> {
  return invoke("generate_variation_images", {
    serverUrl,
    brandKitId,
    insights,
    productContext,
    tier,
    variants,
  });
}

export function modulesToMarkdown(modules: AplusModule[], title: string): string {
  const lines = [`# ${title} — A+ Content`, ""];
  for (const mod of modules) {
    lines.push(`## ${mod.headline}`, "", mod.body, "");
    if (mod.bullets?.length) {
      for (const bullet of mod.bullets) lines.push(`- ${bullet}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}
