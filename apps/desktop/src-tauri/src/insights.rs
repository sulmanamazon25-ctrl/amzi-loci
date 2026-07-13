use serde::{Deserialize, Serialize};

use crate::keys;

#[derive(Serialize)]
struct ExtractBody<'a> {
    provider: &'a str,
    reviews: &'a [String],
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractInsightsResponse {
    pub insights: Vec<InsightRow>,
    pub model: String,
    #[serde(rename = "reviewCount")]
    pub review_count: u32,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InsightRow {
    pub id: String,
    pub feature: String,
    pub sentiment: String,
    pub conversion_driver: bool,
    pub source_quote: String,
    pub confidence: f64,
}

pub async fn extract_insights(
    provider: &str,
    reviews: Vec<String>,
    server_url: &str,
) -> Result<ExtractInsightsResponse, String> {
    let api_key = keys::get_stored_key(provider)?;
    let base = server_url.trim_end_matches('/');
    let url = format!("{base}/insights/extract");

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .post(&url)
        .header("content-type", "application/json")
        .header("x-amzi-provider-key", api_key)
        .json(&ExtractBody {
            provider,
            reviews: &reviews,
        })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Server error ({status}): {body}"));
    }

    response.json().await.map_err(|e| e.to_string())
}
