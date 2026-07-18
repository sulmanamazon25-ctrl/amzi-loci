use crate::brand_kit::{self, BrandKit};
use crate::insights::InsightRow;
use crate::keys;
use crate::usage_log;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ListingCopyResult {
    pub title: String,
    pub bullets: Vec<String>,
    pub description: String,
    pub backend_keywords: String,
    pub model: String,
}

pub async fn generate_listing_copy(
    app: &AppHandle,
    server_url: &str,
    brand_kit_id: &str,
    insights: Vec<InsightRow>,
    product_context: &str,
    provider: &str,
) -> Result<ListingCopyResult, String> {
    let kit = brand_kit::load_brand_kit(app, brand_kit_id)?;
    let api_key = keys::get_stored_key(provider)?;
    let base = server_url.trim_end_matches('/');
    let url = format!("{base}/content/listing-copy");

    let body = serde_json::json!({
        "brandKit": kit_to_json(&kit),
        "insights": insights,
        "productContext": product_context,
        "provider": provider,
    });

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(180))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .post(&url)
        .header("content-type", "application/json")
        .header("x-amzi-provider-key", api_key)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Server error ({status}): {text}"));
    }

    let result: ListingCopyResult = response.json().await.map_err(|e| e.to_string())?;
    usage_log::record_listing_copy(app, provider, &result.model)?;
    Ok(result)
}

fn kit_to_json(kit: &BrandKit) -> serde_json::Value {
    serde_json::json!({
        "id": kit.id,
        "name": kit.name,
        "primaryColor": kit.primary_color,
        "secondaryColor": kit.secondary_color,
        "fontFamily": kit.font_family,
        "toneOfVoice": kit.tone_of_voice,
        "toneProfessional": kit.tone_professional,
        "tonePlayful": kit.tone_playful,
        "toneLuxury": kit.tone_luxury,
        "referenceImages": kit.reference_images,
        "createdAt": kit.created_at,
        "updatedAt": kit.updated_at,
    })
}
