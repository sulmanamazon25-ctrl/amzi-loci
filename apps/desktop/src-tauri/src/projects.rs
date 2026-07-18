use crate::insights::InsightRow;
use crate::listing_copy::ListingCopyResult;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

const ACTIVE_PROJECT_FILE: &str = "active-project.json";
const PROJECT_FILE: &str = "project.json";

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummary {
    pub id: String,
    pub client_name: String,
    pub project_name: String,
    pub product: String,
    pub updated_at: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedGeneratedImage {
    pub id: String,
    pub slot_type: String,
    pub slot_index: u32,
    pub label: String,
    pub prompt: String,
    pub mime_type: String,
    pub local_path: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectData {
    pub id: String,
    pub client_name: String,
    pub project_name: String,
    pub product: String,
    pub reviews: Vec<String>,
    pub insights: Vec<InsightRow>,
    pub product_context: String,
    pub brand_kit_id: Option<String>,
    pub listing_copy: Option<ListingCopyResult>,
    pub provider: String,
    pub image_tier: String,
    pub generated_images: Vec<SavedGeneratedImage>,
    pub export_history: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectInput {
    pub client_name: String,
    pub project_name: String,
    pub product: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProjectInput {
    pub id: String,
    pub reviews: Vec<String>,
    pub insights: Vec<InsightRow>,
    pub product_context: String,
    pub brand_kit_id: Option<String>,
    pub listing_copy: Option<ListingCopyResult>,
    pub provider: String,
    pub image_tier: String,
    pub generated_images: Vec<SavedGeneratedImage>,
    pub export_note: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ActiveProject {
    project_id: String,
}

fn projects_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|p| p.join("projects"))
}

fn active_project_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|p| p.join(ACTIVE_PROJECT_FILE))
}

fn now_iso() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{secs}")
}

fn sanitize_segment(value: &str) -> String {
    let mut out = String::new();
    for ch in value.trim().chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
        } else if ch.is_ascii_whitespace() || ch == '-' || ch == '_' {
            if !out.ends_with('-') && !out.is_empty() {
                out.push('-');
            }
        }
    }
    let trimmed = out.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "untitled".to_string()
    } else {
        trimmed
    }
}

fn project_id(client_name: &str, project_name: &str) -> String {
    format!(
        "{}/{}",
        sanitize_segment(client_name),
        sanitize_segment(project_name)
    )
}

fn project_dir(app: &tauri::AppHandle, id: &str) -> Result<PathBuf, String> {
    let parts: Vec<&str> = id.split('/').collect();
    if parts.len() != 2 {
        return Err(format!("Invalid project id: {id}"));
    }
    Ok(projects_root(app)?.join(parts[0]).join(parts[1]))
}

fn project_file_path(app: &tauri::AppHandle, id: &str) -> Result<PathBuf, String> {
    Ok(project_dir(app, id)?.join(PROJECT_FILE))
}

fn read_project_file(path: &Path) -> Result<ProjectData, String> {
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn write_project(app: &tauri::AppHandle, project: &ProjectData) -> Result<(), String> {
    let dir = project_dir(app, &project.id)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(PROJECT_FILE);
    let raw = serde_json::to_string_pretty(project).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

pub fn get_active_project_id(app: &tauri::AppHandle) -> Result<Option<String>, String> {
    let path = active_project_path(app)?;
    if !path.exists() {
        return Ok(None);
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    if raw.trim().is_empty() {
        return Ok(None);
    }
    let active: ActiveProject = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
    Ok(Some(active.project_id))
}

fn set_active_project_id(app: &tauri::AppHandle, project_id: &str) -> Result<(), String> {
    let path = active_project_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let active = ActiveProject {
        project_id: project_id.to_string(),
    };
    let raw = serde_json::to_string_pretty(&active).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

pub fn list_projects(app: &tauri::AppHandle) -> Result<Vec<ProjectSummary>, String> {
    let root = projects_root(app)?;
    if !root.exists() {
        return Ok(Vec::new());
    }

    let mut summaries = Vec::new();
    for client_entry in fs::read_dir(&root).map_err(|e| e.to_string())? {
        let client_entry = client_entry.map_err(|e| e.to_string())?;
        if !client_entry.file_type().map_err(|e| e.to_string())?.is_dir() {
            continue;
        }
        let client_slug = client_entry.file_name().to_string_lossy().to_string();
        for project_entry in fs::read_dir(client_entry.path()).map_err(|e| e.to_string())? {
            let project_entry = project_entry.map_err(|e| e.to_string())?;
            if !project_entry.file_type().map_err(|e| e.to_string())?.is_dir() {
                continue;
            }
            let project_file = project_entry.path().join(PROJECT_FILE);
            if !project_file.exists() {
                continue;
            }
            let project = read_project_file(&project_file)?;
            let project_slug = project_entry.file_name().to_string_lossy().to_string();
            summaries.push(ProjectSummary {
                id: format!("{client_slug}/{project_slug}"),
                client_name: project.client_name,
                project_name: project.project_name,
                product: project.product,
                updated_at: project.updated_at,
            });
        }
    }

    summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(summaries)
}

pub fn create_project(app: &tauri::AppHandle, input: CreateProjectInput) -> Result<ProjectData, String> {
    let client_name = input.client_name.trim();
    let project_name = input.project_name.trim();
    let product = input.product.trim();

    if client_name.is_empty() || project_name.is_empty() {
        return Err("Client name and project name are required.".to_string());
    }

    let id = project_id(client_name, project_name);
    let path = project_file_path(app, &id)?;
    if path.exists() {
        return Err(format!(
            "Project already exists: {client_name} / {project_name}"
        ));
    }

    let now = now_iso();
    let project = ProjectData {
        id: id.clone(),
        client_name: client_name.to_string(),
        project_name: project_name.to_string(),
        product: product.to_string(),
        reviews: Vec::new(),
        insights: Vec::new(),
        product_context: product.to_string(),
        brand_kit_id: None,
        listing_copy: None,
        provider: "anthropic".to_string(),
        image_tier: "gemini-flash".to_string(),
        generated_images: Vec::new(),
        export_history: Vec::new(),
        created_at: now.clone(),
        updated_at: now,
    };

    write_project(app, &project)?;
    set_active_project_id(app, &id)?;
    Ok(project)
}

pub fn load_project(app: &tauri::AppHandle, id: String) -> Result<ProjectData, String> {
    let path = project_file_path(app, &id)?;
    if !path.exists() {
        return Err(format!("Project not found: {id}"));
    }
    let project = read_project_file(&path)?;
    set_active_project_id(app, &id)?;
    Ok(project)
}

pub fn save_project_data(app: &tauri::AppHandle, input: SaveProjectInput) -> Result<ProjectData, String> {
    let path = project_file_path(app, &input.id)?;
    if !path.exists() {
        return Err(format!("Project not found: {}", input.id));
    }

    let mut project = read_project_file(&path)?;
    project.reviews = input.reviews;
    project.insights = input.insights;
    project.product_context = input.product_context.clone();
    project.brand_kit_id = input.brand_kit_id;
    project.listing_copy = input.listing_copy;
    project.provider = input.provider;
    project.image_tier = input.image_tier;
    project.generated_images = input.generated_images;
    if !project.product_context.trim().is_empty() {
        project.product = project.product_context.clone();
    }
    if let Some(note) = input.export_note.filter(|n| !n.trim().is_empty()) {
        project.export_history.push(note);
        if project.export_history.len() > 20 {
            let drain = project.export_history.len() - 20;
            project.export_history.drain(0..drain);
        }
    }
    project.updated_at = now_iso();
    write_project(app, &project)?;
    Ok(project)
}

pub fn delete_project(app: &tauri::AppHandle, id: String) -> Result<(), String> {
    let dir = project_dir(app, &id)?;
    if !dir.exists() {
        return Err(format!("Project not found: {id}"));
    }
    fs::remove_dir_all(&dir).map_err(|e| e.to_string())?;

    if get_active_project_id(app)?.as_deref() == Some(id.as_str()) {
        let active_path = active_project_path(app)?;
        if active_path.exists() {
            fs::remove_file(active_path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn ensure_default_project(app: &tauri::AppHandle) -> Result<ProjectData, String> {
    if let Some(id) = get_active_project_id(app)? {
        let path = project_file_path(app, &id)?;
        if path.exists() {
            return read_project_file(&path);
        }
    }

    let summaries = list_projects(app)?;
    if let Some(first) = summaries.first() {
        return load_project(app, first.id.clone());
    }

    create_project(
        app,
        CreateProjectInput {
            client_name: "Untitled Client".to_string(),
            project_name: "Untitled Project".to_string(),
            product: String::new(),
        },
    )
}

pub fn read_image_data_url(path: &str) -> Result<String, String> {
    let file_path = PathBuf::from(path);
    if !file_path.exists() {
        return Err(format!("Image not found: {path}"));
    }
    let bytes = fs::read(&file_path).map_err(|e| e.to_string())?;
    let ext = file_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png")
        .to_ascii_lowercase();
    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        _ => "image/png",
    };
    Ok(format!("data:{mime};base64,{}", base64_encode(&bytes)))
}

fn base64_encode(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::new();
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(TABLE[((triple >> 18) & 63) as usize] as char);
        out.push(TABLE[((triple >> 12) & 63) as usize] as char);
        if chunk.len() > 1 {
            out.push(TABLE[((triple >> 6) & 63) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(TABLE[(triple & 63) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

pub fn export_creative_brief_file(content: String, product_name: String) -> Result<String, String> {
    let folder = sanitize_segment(&product_name);
    let default_name = format!("amzi-loci-brief-{folder}.md");

    let save_path = rfd::FileDialog::new()
        .set_title("Export creative brief")
        .set_file_name(&default_name)
        .add_filter("Markdown", &["md"])
        .add_filter("Text", &["txt"])
        .save_file()
        .ok_or_else(|| "Export cancelled".to_string())?;

    fs::write(&save_path, content).map_err(|e| e.to_string())?;
    Ok(save_path.to_string_lossy().to_string())
}
