use crate::insights::InsightRow;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const SESSION_FILE: &str = "listing-session.json";

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListingSession {
    pub product_context: String,
    pub brand_kit_id: Option<String>,
    pub provider: String,
    pub insights: Vec<InsightRow>,
    pub updated_at: String,
}

fn session_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|p| p.join(SESSION_FILE))
}

fn now_iso() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{secs}")
}

pub fn save_listing_session(
    app: &tauri::AppHandle,
    product_context: String,
    brand_kit_id: Option<String>,
    provider: String,
    insights: Vec<InsightRow>,
) -> Result<ListingSession, String> {
    let session = ListingSession {
        product_context,
        brand_kit_id,
        provider,
        insights,
        updated_at: now_iso(),
    };
    let path = session_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let raw = serde_json::to_string_pretty(&session).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())?;
    Ok(session)
}

pub fn get_listing_session(app: &tauri::AppHandle) -> Result<Option<ListingSession>, String> {
    let path = session_path(app)?;
    if !path.exists() {
        return Ok(None);
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    if raw.trim().is_empty() {
        return Ok(None);
    }
    serde_json::from_str(&raw).map_err(|e| e.to_string()).map(Some)
}
