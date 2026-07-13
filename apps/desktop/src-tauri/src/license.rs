use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LicenseFeatures {
    pub workflow: bool,
    pub studio: bool,
    pub max_images_per_run: u32,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LicenseValidation {
    pub valid: bool,
    pub plan: String,
    pub status: String,
    pub expires_at: Option<String>,
    pub trial_ends_at: Option<String>,
    pub device_registered: bool,
    pub max_devices: u32,
    pub features: LicenseFeatures,
    pub message: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckoutResponse {
    pub checkout_url: String,
    pub session_id: String,
}

fn device_secret_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|path| path.join("device-id.txt"))
}

fn get_or_create_device_secret(app: &AppHandle) -> Result<String, String> {
    let path = device_secret_path(app)?;
    if path.exists() {
        return fs::read_to_string(&path)
            .map(|s| s.trim().to_string())
            .map_err(|e| e.to_string());
    }

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let secret = format!("amzi-{nanos}-{}", rand_suffix());
    fs::write(&path, &secret).map_err(|e| e.to_string())?;
    Ok(secret)
}

fn rand_suffix() -> u64 {
    use std::hash::{Hash, Hasher};
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    std::time::SystemTime::now().hash(&mut hasher);
    hasher.finish()
}

fn hostname() -> String {
    std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "unknown-host".into())
}

fn username() -> String {
    std::env::var("USERNAME")
        .or_else(|_| std::env::var("USER"))
        .unwrap_or_else(|_| "unknown-user".into())
}

pub fn compute_fingerprint(app: &AppHandle) -> Result<String, String> {
    let secret = get_or_create_device_secret(app)?;
    let raw = format!("{}:{}:{}", hostname(), username(), secret);
    let mut hasher = Sha256::new();
    hasher.update(raw.as_bytes());
    Ok(format!("{:x}", hasher.finalize()))
}

pub async fn validate_license(app: &AppHandle, server_url: &str) -> Result<LicenseValidation, String> {
    let fingerprint = compute_fingerprint(app)?;
    let base = server_url.trim_end_matches('/');
    let url = format!("{base}/license/validate?deviceFingerprint={fingerprint}");

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("License check failed: {e}"))?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("License validation error: {body}"));
    }

    response
        .json::<LicenseValidation>()
        .await
        .map_err(|e| format!("Invalid license response: {e}"))
}

pub async fn create_checkout(
    app: &AppHandle,
    server_url: &str,
    plan: &str,
    email: Option<&str>,
) -> Result<CheckoutResponse, String> {
    let fingerprint = compute_fingerprint(app)?;
    let base = server_url.trim_end_matches('/');
    let url = format!("{base}/license/checkout");

    let mut body = serde_json::json!({
        "plan": plan,
        "deviceFingerprint": fingerprint,
    });
    if let Some(email) = email.filter(|e| !e.is_empty()) {
        body["email"] = serde_json::Value::String(email.to_string());
    }

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Checkout request failed: {e}"))?;

    if !response.status().is_success() {
        let text = response.text().await.unwrap_or_default();
        return Err(text);
    }

    response
        .json::<CheckoutResponse>()
        .await
        .map_err(|e| format!("Invalid checkout response: {e}"))
}

pub async fn sync_checkout(
    app: &AppHandle,
    server_url: &str,
    session_id: &str,
) -> Result<LicenseValidation, String> {
    let fingerprint = compute_fingerprint(app)?;
    let base = server_url.trim_end_matches('/');
    let url = format!("{base}/license/sync");

    let body = serde_json::json!({
        "sessionId": session_id.trim(),
        "deviceFingerprint": fingerprint,
    });

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("License sync failed: {e}"))?;

    if !response.status().is_success() {
        let text = response.text().await.unwrap_or_default();
        return Err(text);
    }

    response
        .json::<LicenseValidation>()
        .await
        .map_err(|e| format!("Invalid sync response: {e}"))
}
