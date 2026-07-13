use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

const KITS_FILE: &str = "kits.json";
const MAX_REFERENCE_IMAGES: usize = 3;

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrandKit {
    pub id: String,
    pub name: String,
    pub primary_color: String,
    pub secondary_color: String,
    pub font_family: String,
    pub tone_of_voice: String,
    pub tone_professional: u8,
    pub tone_playful: u8,
    pub tone_luxury: u8,
    pub reference_images: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrandKitSummary {
    pub id: String,
    pub name: String,
    pub primary_color: String,
    pub updated_at: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveBrandKitInput {
    pub id: Option<String>,
    pub name: String,
    pub primary_color: String,
    pub secondary_color: String,
    pub font_family: String,
    pub tone_of_voice: String,
    pub tone_professional: u8,
    pub tone_playful: u8,
    pub tone_luxury: u8,
}

fn brand_kits_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|path| path.join("brand-kits"))
}

fn kits_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(brand_kits_root(app)?.join(KITS_FILE))
}

fn refs_dir(app: &tauri::AppHandle, kit_id: &str) -> Result<PathBuf, String> {
    Ok(brand_kits_root(app)?.join("refs").join(kit_id))
}

fn ensure_storage(app: &tauri::AppHandle) -> Result<(), String> {
    let root = brand_kits_root(app)?;
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let kits_path = root.join(KITS_FILE);
    if !kits_path.exists() {
        fs::write(&kits_path, "[]").map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn read_all_kits(app: &tauri::AppHandle) -> Result<Vec<BrandKit>, String> {
    ensure_storage(app)?;
    let path = kits_file_path(app)?;
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    if raw.trim().is_empty() {
        return Ok(Vec::new());
    }
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn write_all_kits(app: &tauri::AppHandle, kits: &[BrandKit]) -> Result<(), String> {
    ensure_storage(app)?;
    let path = kits_file_path(app)?;
    let raw = serde_json::to_string_pretty(kits).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

fn new_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("kit-{nanos}")
}

fn now_iso() -> String {
    // ISO-like timestamp without chrono dependency
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{secs}")
}

fn extension_from_filename(filename: &str) -> String {
    Path::new(filename)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("png")
        .to_ascii_lowercase()
}

fn is_path_inside(base: &Path, candidate: &Path) -> bool {
    candidate.canonicalize().ok().and_then(|resolved| {
        base.canonicalize()
            .ok()
            .map(|base_resolved| resolved.starts_with(base_resolved))
    }).unwrap_or(false)
}

pub fn list_brand_kits(app: &tauri::AppHandle) -> Result<Vec<BrandKitSummary>, String> {
    let kits = read_all_kits(app)?;
    let mut summaries: Vec<BrandKitSummary> = kits
        .into_iter()
        .map(|kit| BrandKitSummary {
            id: kit.id,
            name: kit.name,
            primary_color: kit.primary_color,
            updated_at: kit.updated_at,
        })
        .collect();
    summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(summaries)
}

pub fn load_brand_kit(app: &tauri::AppHandle, id: &str) -> Result<BrandKit, String> {
    read_all_kits(app)?
        .into_iter()
        .find(|kit| kit.id == id)
        .ok_or_else(|| "Brand kit not found".to_string())
}

pub fn save_brand_kit(app: &tauri::AppHandle, input: SaveBrandKitInput) -> Result<BrandKit, String> {
    let mut kits = read_all_kits(app)?;
    let timestamp = now_iso();

    if let Some(id) = input.id.clone() {
        let index = kits
            .iter()
            .position(|kit| kit.id == id)
            .ok_or_else(|| "Brand kit not found".to_string())?;
        let existing = kits[index].clone();
        kits[index] = BrandKit {
            id,
            name: input.name,
            primary_color: input.primary_color,
            secondary_color: input.secondary_color,
            font_family: input.font_family,
            tone_of_voice: input.tone_of_voice,
            tone_professional: input.tone_professional,
            tone_playful: input.tone_playful,
            tone_luxury: input.tone_luxury,
            reference_images: existing.reference_images,
            created_at: existing.created_at,
            updated_at: timestamp,
        };
        let saved = kits[index].clone();
        write_all_kits(app, &kits)?;
        return Ok(saved);
    }

    let kit = BrandKit {
        id: new_id(),
        name: input.name,
        primary_color: input.primary_color,
        secondary_color: input.secondary_color,
        font_family: input.font_family,
        tone_of_voice: input.tone_of_voice,
        tone_professional: input.tone_professional,
        tone_playful: input.tone_playful,
        tone_luxury: input.tone_luxury,
        reference_images: Vec::new(),
        created_at: timestamp.clone(),
        updated_at: timestamp,
    };
    kits.push(kit.clone());
    write_all_kits(app, &kits)?;
    Ok(kit)
}

pub fn delete_brand_kit(app: &tauri::AppHandle, id: &str) -> Result<(), String> {
    let mut kits = read_all_kits(app)?;
    let before = kits.len();
    kits.retain(|kit| kit.id != id);
    if kits.len() == before {
        return Err("Brand kit not found".to_string());
    }
    write_all_kits(app, &kits)?;

    if let Ok(refs_path) = refs_dir(app, id) {
        let _ = fs::remove_dir_all(refs_path);
    }
    Ok(())
}

pub fn save_reference_image(
    app: &tauri::AppHandle,
    kit_id: &str,
    slot: usize,
    base64_data: &str,
    filename: &str,
) -> Result<BrandKit, String> {
    if slot >= MAX_REFERENCE_IMAGES {
        return Err(format!("Only {MAX_REFERENCE_IMAGES} reference images allowed"));
    }

    let mut kits = read_all_kits(app)?;
    let index = kits
        .iter()
        .position(|kit| kit.id == kit_id)
        .ok_or_else(|| "Brand kit not found".to_string())?;

    let payload = base64_data
        .split_once(',')
        .map(|(_, data)| data)
        .unwrap_or(base64_data);

    let bytes = base64_decode(payload)?;
    let ext = extension_from_filename(filename);
    let refs_path = refs_dir(app, kit_id)?;
    fs::create_dir_all(&refs_path).map_err(|e| e.to_string())?;

    let file_name = format!("ref-{slot}.{ext}");
    let file_path = refs_path.join(&file_name);
    fs::write(&file_path, bytes).map_err(|e| e.to_string())?;

    let mut refs = kits[index].reference_images.clone();
    while refs.len() <= slot {
        refs.push(String::new());
    }
    refs[slot] = file_path.to_string_lossy().to_string();
    refs.retain(|path| !path.is_empty());
    kits[index].reference_images = refs;
    kits[index].updated_at = now_iso();

    let saved = kits[index].clone();
    write_all_kits(app, &kits)?;
    Ok(saved)
}

pub fn remove_reference_image(
    app: &tauri::AppHandle,
    kit_id: &str,
    slot: usize,
) -> Result<BrandKit, String> {
    let mut kits = read_all_kits(app)?;
    let index = kits
        .iter()
        .position(|kit| kit.id == kit_id)
        .ok_or_else(|| "Brand kit not found".to_string())?;

    if slot >= kits[index].reference_images.len() {
        return Ok(kits[index].clone());
    }

    let path = PathBuf::from(&kits[index].reference_images[slot]);
    if path.exists() {
        let _ = fs::remove_file(path);
    }
    kits[index].reference_images.remove(slot);
    kits[index].updated_at = now_iso();

    let saved = kits[index].clone();
    write_all_kits(app, &kits)?;
    Ok(saved)
}

pub fn read_reference_preview(app: &tauri::AppHandle, path: &str) -> Result<String, String> {
    let root = brand_kits_root(app)?;
    let file_path = PathBuf::from(path);
    if !is_path_inside(&root, &file_path) {
        return Err("Invalid reference image path".to_string());
    }
    if !file_path.exists() {
        return Err("Reference image not found".to_string());
    }

    let bytes = fs::read(&file_path).map_err(|e| e.to_string())?;
    let ext = extension_from_filename(
        file_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("reference.png"),
    );
    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        _ => "image/png",
    };
    Ok(format!("data:{mime};base64,{}", base64_encode(&bytes)))
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

fn base64_encode(bytes: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::new();
    let mut i = 0;
    while i < bytes.len() {
        let b0 = bytes[i];
        let b1 = bytes.get(i + 1).copied().unwrap_or(0);
        let b2 = bytes.get(i + 2).copied().unwrap_or(0);

        out.push(CHARS[(b0 >> 2) as usize] as char);
        out.push(CHARS[(((b0 & 0x03) << 4) | (b1 >> 4)) as usize] as char);
        if i + 1 < bytes.len() {
            out.push(CHARS[(((b1 & 0x0f) << 2) | (b2 >> 6)) as usize] as char);
        } else {
            out.push('=');
        }
        if i + 2 < bytes.len() {
            out.push(CHARS[(b2 & 0x3f) as usize] as char);
        } else {
            out.push('=');
        }
        i += 3;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_base64() {
        let input = b"hello brand kit";
        let encoded = base64_encode(input);
        let decoded = base64_decode(&encoded).unwrap();
        assert_eq!(decoded, input);
    }
}
