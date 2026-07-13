use serde::Deserialize;
use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportImageItem {
    pub local_path: String,
    pub slot_type: String,
    pub slot_index: u32,
    pub label: String,
}

fn sanitize_name(value: &str) -> String {
    let mut out = String::new();
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
        } else if ch.is_ascii_whitespace() || ch == '-' || ch == '_' {
            if !out.ends_with('-') {
                out.push('-');
            }
        }
    }
    let trimmed = out.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "listing".to_string()
    } else {
        trimmed
    }
}

fn export_filename(item: &ExportImageItem, format: &str) -> String {
    let kind = if item.slot_type == "main" {
        "main"
    } else {
        "gallery"
    };
    let label = sanitize_name(&item.label);
    format!("{kind}-{:02}-{label}.{format}", item.slot_index + 1)
}

fn read_and_convert(path: &Path, format: &str) -> Result<Vec<u8>, String> {
    let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
    if format == "jpg" || format == "jpeg" {
        return convert_to_jpeg(&bytes);
    }
    Ok(bytes)
}

fn convert_to_jpeg(bytes: &[u8]) -> Result<Vec<u8>, String> {
    let img = image::ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| e.to_string())?;

    let rgb = img.to_rgb8();
    let mut buffer = Vec::new();
    let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buffer, 90);
    encoder
        .encode(
            rgb.as_raw(),
            rgb.width(),
            rgb.height(),
            image::ExtendedColorType::Rgb8,
        )
        .map_err(|e| e.to_string())?;
    Ok(buffer)
}

pub fn export_images_zip(
    items: Vec<ExportImageItem>,
    format: String,
    product_name: String,
) -> Result<String, String> {
    if items.is_empty() {
        return Err("Select at least one image to export".to_string());
    }

    let fmt = if format == "jpg" || format == "jpeg" {
        "jpg"
    } else {
        "png"
    };

    let folder = sanitize_name(&product_name);
    let default_name = format!("amzi-loci-{folder}.zip");

    let save_path = rfd::FileDialog::new()
        .set_title("Export listing images")
        .set_file_name(&default_name)
        .add_filter("Zip archive", &["zip"])
        .save_file()
        .ok_or_else(|| "Export cancelled".to_string())?;

    let file = File::create(&save_path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    for item in &items {
        let path = PathBuf::from(&item.local_path);
        if !path.exists() {
            return Err(format!("Image not found: {}", item.local_path));
        }
        let bytes = read_and_convert(&path, fmt)?;
        let name = format!("{}/{}", folder, export_filename(item, fmt));
        zip.start_file(name, options)
            .map_err(|e| e.to_string())?;
        zip.write_all(&bytes).map_err(|e| e.to_string())?;
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(save_path.to_string_lossy().to_string())
}
