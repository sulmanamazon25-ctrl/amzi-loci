import { invoke } from "@tauri-apps/api/core";
import type { ListingCopy, ProductInsight } from "@amzi-loci/shared";
import type { ApiProvider } from "./apiKeys";

export async function generateListingCopy(
  serverUrl: string,
  brandKitId: string,
  insights: ProductInsight[],
  productContext: string,
  provider: ApiProvider,
): Promise<ListingCopy> {
  return invoke<ListingCopy>("generate_listing_copy", {
    serverUrl,
    brandKitId,
    insights,
    productContext,
    provider,
  });
}
