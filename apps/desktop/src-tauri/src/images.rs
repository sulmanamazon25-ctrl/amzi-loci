use crate::brand_kit::{self, BrandKit};
use crate::insights::InsightRow;
use crate::keys;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateSlot {
    pub slot_type: String,
    pub slot_index: u32,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedImage {
    pub id: String,
    pub slot_type: String,
    pub slot_index: u32,
    pub label: String,
    pub prompt: String,
    pub mime_type: String,
    pub local_path: String,
    pub data_url: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateImagesResult {
    pub images: Vec<GeneratedImage>,
    pub model: String,
    pub tier: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct GenerateResponse {
    images: Vec<ServerImage>,
    model: String,
    tier: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerImage {
    id: String,
    slot_type: String,
    slot_index: u32,
    label: String,
    prompt: String,
    mime_type: String,
    base64: String,
}

fn generated_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|path| path.join("generated"))
}

pub fn save_session_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    use std::time::{SystemTime, UNIX_EPOCH};
    let root = generated_root(app)?;
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let dir = root.join(format!("session-{nanos}"));
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn save_image(
    session_dir: &PathBuf,
    image: &ServerImage,
) -> Result<(String, String), String> {
    let ext = if image.mime_type.contains("jpeg") {
        "jpg"
    } else if image.mime_type.contains("webp") {
        "webp"
    } else {
        "png"
    };
    let filename = format!("{}-{}.{}", image.slot_type, image.slot_index, ext);
    let path = session_dir.join(&filename);

    let bytes = base64_decode(&image.base64)?;
    fs::write(&path, bytes).map_err(|e| e.to_string())?;

    let data_url = format!("data:{};base64,{}", image.mime_type, image.base64);
    Ok((path.to_string_lossy().to_string(), data_url))
}

pub fn save_image_from_server(
    session_dir: &PathBuf,
    image: &ServerImage,
) -> Result<GeneratedImage, String> {
    let (local_path, data_url) = save_image(session_dir, image)?;
    Ok(GeneratedImage {
        id: image.id.clone(),
        slot_type: image.slot_type.clone(),
        slot_index: image.slot_index,
        label: image.label.clone(),
        prompt: image.prompt.clone(),
        mime_type: image.mime_type.clone(),
        local_path,
        data_url,
    })
}

pub async fn generate_images(
    app: &tauri::AppHandle,
    server_url: &str,
    brand_kit_id: &str,
    insights: Vec<InsightRow>,
    product_context: &str,
    tier: &str,
    regenerate: Option<RegenerateSlot>,
) -> Result<GenerateImagesResult, String> {
    let api_key = keys::get_stored_key("google")?;
    let brand_kit: BrandKit = brand_kit::load_brand_kit(app, brand_kit_id)?;

    let mut reference_images_base64 = Vec::new();
    for path in &brand_kit.reference_images {
        if let Ok(data_url) = brand_kit::read_reference_preview(app, path) {
            reference_images_base64.push(data_url);
        }
    }

    let mut body = serde_json::json!({
        "brandKit": brand_kit,
        "insights": insights,
        "productContext": product_context,
        "tier": tier,
        "referenceImagesBase64": reference_images_base64,
    });
    if let Some(slot) = regenerate {
        body["regenerate"] = serde_json::to_value(slot).map_err(|e| e.to_string())?;
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(600))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/image/generate", server_url.trim_end_matches('/'));
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
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Server error ({status}): {body}"));
    }

    let result: GenerateResponse = response.json().await.map_err(|e| e.to_string())?;
    let session_dir = save_session_dir(app)?;
    let mut saved = Vec::new();

    for image in result.images {
        saved.push(save_image_from_server(&session_dir, &image)?);
    }

    Ok(GenerateImagesResult {
        images: saved,
        model: result.model,
        tier: result.tier,
    })
}

fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    const TABLE: &[u8; 256] = &{
        let mut table = [255u8; 256];
        let mut i = 0u8;
        while i < 26 {
            table[(b'A' + i) as usize] = i;
            table[(b'a' + i) as usize] = i + 26;
            i += 1;
        }
        let mut digit = 0u8;
        while digit < 10 {
            table[(b'0' + digit) as usize] = digit + 52;
            digit += 1;
        }
        table[b'+' as usize] = 62;
        table[b'/' as usize] = 63;
        table
    };

    let cleaned: Vec<u8> = input.bytes().filter(|b| !b.is_ascii_whitespace()).collect();
    if cleaned.len() % 4 != 0 {
        return Err("Invalid base64 payload".to_string());
    }

    let mut out = Vec::with_capacity(cleaned.len() / 4 * 3);
    let mut i = 0;
    while i < cleaned.len() {
        let a = TABLE[cleaned[i] as usize];
        let b = TABLE[cleaned[i + 1] as usize];
        let c = TABLE[cleaned[i + 2] as usize];
        let d = TABLE[cleaned[i + 3] as usize];
        if a == 255 || b == 255 {
            return Err("Invalid base64 payload".to_string());
        }
        out.push((a << 2) | (b >> 4));
        if cleaned[i + 2] != b'=' {
            if c == 255 {
                return Err("Invalid base64 payload".to_string());
            }
            out.push((b << 4) | (c >> 2));
        }
        if cleaned[i + 3] != b'=' {
            if d == 255 {
                return Err("Invalid base64 payload".to_string());
            }
            out.push((c << 6) | d);
        }
        i += 4;
    }
    Ok(out)
}
