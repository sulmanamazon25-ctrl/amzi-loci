use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageLogEntry {
    pub id: String,
    pub timestamp: String,
    pub event_type: String,
    pub provider: Option<String>,
    pub review_count: Option<u32>,
    pub image_count: Option<u32>,
    pub image_tier: Option<String>,
    pub model: String,
    pub estimated_cost_usd: f64,
    pub note: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageSummary {
    pub total_estimated_cost_usd: f64,
    pub total_insight_calls: u32,
    pub total_reviews_processed: u32,
    pub total_images_generated: u32,
    pub entries: Vec<UsageLogEntry>,
}

const LOG_FILE: &str = "usage-log.json";

fn log_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|p| p.join(LOG_FILE))
}

fn now_iso() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{secs}")
}

fn new_id(prefix: &str) -> String {
    format!("{prefix}-{}", now_iso())
}

fn read_entries(app: &tauri::AppHandle) -> Result<Vec<UsageLogEntry>, String> {
    let path = log_path(app)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    if raw.trim().is_empty() {
        return Ok(Vec::new());
    }
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn write_entries(app: &tauri::AppHandle, entries: &[UsageLogEntry]) -> Result<(), String> {
    let path = log_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let raw = serde_json::to_string_pretty(entries).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

pub fn record_insights(
    app: &tauri::AppHandle,
    provider: &str,
    review_count: u32,
    model: &str,
) -> Result<(), String> {
    let cost = estimate_insight_cost(review_count);
    let entry = UsageLogEntry {
        id: new_id("insight"),
        timestamp: now_iso(),
        event_type: "insights".to_string(),
        provider: Some(provider.to_string()),
        review_count: Some(review_count),
        image_count: None,
        image_tier: None,
        model: model.to_string(),
        estimated_cost_usd: cost,
        note: None,
    };
    append_entry(app, entry)
}

pub fn record_images(
    app: &tauri::AppHandle,
    tier: &str,
    image_count: u32,
    model: &str,
    regenerated: bool,
) -> Result<(), String> {
    let cost = estimate_image_cost(tier, image_count);
    let entry = UsageLogEntry {
        id: new_id("image"),
        timestamp: now_iso(),
        event_type: "images".to_string(),
        provider: Some("google".to_string()),
        review_count: None,
        image_count: Some(image_count),
        image_tier: Some(tier.to_string()),
        model: model.to_string(),
        estimated_cost_usd: cost,
        note: regenerated.then_some("regenerate".to_string()),
    };
    append_entry(app, entry)
}

fn append_entry(app: &tauri::AppHandle, entry: UsageLogEntry) -> Result<(), String> {
    let mut entries = read_entries(app)?;
    entries.push(entry);
    if entries.len() > 500 {
        let drain = entries.len() - 500;
        entries.drain(0..drain);
    }
    write_entries(app, &entries)
}

pub fn get_usage_summary(app: &tauri::AppHandle) -> Result<UsageSummary, String> {
    let entries = read_entries(app)?;
    let mut total_cost = 0.0;
    let mut insight_calls = 0u32;
    let mut reviews = 0u32;
    let mut images = 0u32;

    for entry in &entries {
        total_cost += entry.estimated_cost_usd;
        if entry.event_type == "insights" {
            insight_calls += 1;
            reviews += entry.review_count.unwrap_or(0);
        }
        if entry.event_type == "images" || entry.event_type == "ads" || entry.event_type == "variations" {
            images += entry.image_count.unwrap_or(0);
        }
    }

    let mut sorted = entries;
    sorted.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    Ok(UsageSummary {
        total_estimated_cost_usd: (total_cost * 100.0).round() / 100.0,
        total_insight_calls: insight_calls,
        total_reviews_processed: reviews,
        total_images_generated: images,
        entries: sorted,
    })
}

fn estimate_insight_cost(review_count: u32) -> f64 {
    let cost = 0.01 + (review_count as f64 * 0.002);
    (cost.min(0.15) * 100.0).round() / 100.0
}

fn estimate_image_cost(tier: &str, count: u32) -> f64 {
    let per = match tier {
        "imagen-fast" => 0.02,
        "gemini-flash" => 0.04,
        "nano-banana-pro" => 0.1,
        _ => 0.05,
    };
    ((per * count as f64) * 100.0).round() / 100.0
}

pub fn estimate_image_cost_usd(tier: &str, count: u32) -> f64 {
    estimate_image_cost(tier, count)
}

pub fn record_studio(
    app: &tauri::AppHandle,
    event_type: &str,
    provider: Option<&str>,
    image_count: Option<u32>,
    image_tier: Option<&str>,
    model: &str,
    estimated_cost_usd: f64,
) -> Result<(), String> {
    let entry = UsageLogEntry {
        id: new_id(event_type),
        timestamp: now_iso(),
        event_type: event_type.to_string(),
        provider: provider.map(String::from),
        review_count: None,
        image_count,
        image_tier: image_tier.map(String::from),
        model: model.to_string(),
        estimated_cost_usd,
        note: None,
    };
    append_entry(app, entry)
}
