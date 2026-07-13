use crate::brand_kit;
use crate::images::{save_image_from_server, save_session_dir, GeneratedImage, ServerImage};
use crate::insights::InsightRow;
use crate::keys;
use crate::usage_log;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AplusContentResult {
    pub modules: serde_json::Value,
    pub model: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StudioImagesResult {
    pub images: Vec<GeneratedImage>,
    pub model: String,
    pub tier: String,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AplusModuleInput {
    pub id: String,
    #[serde(rename = "type")]
    pub module_type: String,
    pub headline: String,
    pub body: String,
    pub bullets: Option<Vec<String>>,
}

async fn post_json(
    server_url: &str,
    path: &str,
    provider: &str,
    body: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let api_key = keys::get_stored_key(provider)?;
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(600))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}{}", server_url.trim_end_matches('/'), path);
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

    response.json().await.map_err(|e| e.to_string())
}

async fn post_google_json(
    server_url: &str,
    path: &str,
    body: serde_json::Value,
) -> Result<serde_json::Value, String> {
    post_json(server_url, path, "google", body).await
}

fn load_refs(app: &AppHandle, brand_kit_id: &str) -> Result<(brand_kit::BrandKit, Vec<String>), String> {
    let kit = brand_kit::load_brand_kit(app, brand_kit_id)?;
    let mut refs = Vec::new();
    for path in &kit.reference_images {
        if let Ok(data_url) = brand_kit::read_reference_preview(app, path) {
            refs.push(data_url);
        }
    }
    Ok((kit, refs))
}

fn save_server_images(app: &AppHandle, images: Vec<ServerImage>) -> Result<Vec<GeneratedImage>, String> {
    let session_dir = save_session_dir(app)?;
    let mut saved = Vec::new();
    for image in images {
        saved.push(save_image_from_server(&session_dir, &image)?);
    }
    Ok(saved)
}

pub async fn generate_aplus(
    app: &AppHandle,
    server_url: &str,
    brand_kit_id: &str,
    insights: Vec<InsightRow>,
    product_context: &str,
    provider: &str,
) -> Result<AplusContentResult, String> {
    let (kit, _) = load_refs(app, brand_kit_id)?;
    let body = serde_json::json!({
        "brandKit": kit,
        "insights": insights,
        "productContext": product_context,
        "provider": provider,
    });
    let result = post_json(server_url, "/content/aplus", provider, body).await?;
    let model = result["model"].as_str().unwrap_or("unknown").to_string();
    usage_log::record_studio(app, "aplus", Some(provider), None, None, &model, 0.03)?;
    Ok(AplusContentResult {
        modules: result["modules"].clone(),
        model,
    })
}

pub async fn localize_content(
    app: &AppHandle,
    server_url: &str,
    modules: Vec<AplusModuleInput>,
    target_locale: &str,
    provider: &str,
) -> Result<AplusContentResult, String> {
    let body = serde_json::json!({
        "modules": modules,
        "targetLocale": target_locale,
        "provider": provider,
    });
    let result = post_json(server_url, "/content/localize", provider, body).await?;
    let model = result["model"].as_str().unwrap_or("unknown").to_string();
    usage_log::record_studio(app, "localize", Some(provider), None, None, &model, 0.03)?;
    Ok(AplusContentResult {
        modules: result["modules"].clone(),
        model,
    })
}

pub async fn generate_ads(
    app: &AppHandle,
    server_url: &str,
    brand_kit_id: &str,
    insights: Vec<InsightRow>,
    product_context: &str,
    tier: &str,
) -> Result<StudioImagesResult, String> {
    let (kit, refs) = load_refs(app, brand_kit_id)?;
    let body = serde_json::json!({
        "brandKit": kit,
        "insights": insights,
        "productContext": product_context,
        "tier": tier,
        "referenceImagesBase64": refs,
    });
    let result = post_google_json(server_url, "/ads/generate", body).await?;
    let images: Vec<ServerImage> =
        serde_json::from_value(result["images"].clone()).map_err(|e| e.to_string())?;
    let model = result["model"].as_str().unwrap_or(tier).to_string();
    let tier_str = result["tier"].as_str().unwrap_or(tier).to_string();
    let saved = save_server_images(app, images)?;
    let cost = usage_log::estimate_image_cost_usd(tier, saved.len() as u32);
    usage_log::record_studio(
        app,
        "ads",
        Some("google"),
        Some(saved.len() as u32),
        Some(tier),
        &model,
        cost,
    )?;
    Ok(StudioImagesResult {
        images: saved,
        model,
        tier: tier_str,
    })
}

pub async fn generate_variations(
    app: &AppHandle,
    server_url: &str,
    brand_kit_id: &str,
    insights: Vec<InsightRow>,
    product_context: &str,
    tier: &str,
    variants: Vec<String>,
) -> Result<StudioImagesResult, String> {
    let (kit, refs) = load_refs(app, brand_kit_id)?;
    let body = serde_json::json!({
        "brandKit": kit,
        "insights": insights,
        "productContext": product_context,
        "tier": tier,
        "variants": variants,
        "referenceImagesBase64": refs,
    });
    let result = post_google_json(server_url, "/variations/generate", body).await?;
    let images: Vec<ServerImage> =
        serde_json::from_value(result["images"].clone()).map_err(|e| e.to_string())?;
    let model = result["model"].as_str().unwrap_or(tier).to_string();
    let tier_str = result["tier"].as_str().unwrap_or(tier).to_string();
    let saved = save_server_images(app, images)?;
    let cost = usage_log::estimate_image_cost_usd(tier, saved.len() as u32);
    usage_log::record_studio(
        app,
        "variations",
        Some("google"),
        Some(saved.len() as u32),
        Some(tier),
        &model,
        cost,
    )?;
    Ok(StudioImagesResult {
        images: saved,
        model,
        tier: tier_str,
    })
}
