mod brand_kit;
mod export;
mod images;
mod insights;
mod keys;
mod license;
mod listing_copy;
mod projects;
mod session;
mod studio;
mod usage_log;

use brand_kit::{BrandKit, BrandKitSummary, SaveBrandKitInput};
use export::{export_images_zip, ExportImageItem};
use images::{GenerateImagesResult, RegenerateSlot};
use insights::{ExtractInsightsResponse, InsightRow};
use keys::KeyStatus;
use session::ListingSession;
use studio::{AplusContentResult, AplusModuleInput, StudioImagesResult};
use usage_log::UsageSummary;
use license::{CheckoutResponse, LicenseValidation};
use listing_copy::ListingCopyResult;
use projects::{
    CreateProjectInput, ProjectData, ProjectSummary, SaveProjectInput,
};
use tauri::AppHandle;

#[tauri::command]
fn get_key_statuses() -> Result<Vec<KeyStatus>, String> {
    keys::get_key_statuses()
}

#[tauri::command]
fn save_api_key(provider: String, key: String) -> Result<(), String> {
    keys::save_api_key(&provider, &key)
}

#[tauri::command]
fn delete_api_key(provider: String) -> Result<(), String> {
    keys::delete_api_key(&provider)
}

#[tauri::command]
async fn test_api_key(provider: String, key: String) -> Result<String, String> {
    keys::test_api_key(&provider, &key).await
}

#[tauri::command]
async fn extract_insights(
    app: AppHandle,
    provider: String,
    reviews: Vec<String>,
    server_url: String,
) -> Result<ExtractInsightsResponse, String> {
    let result = insights::extract_insights(&provider, reviews, &server_url).await?;
    usage_log::record_insights(&app, &provider, result.review_count, &result.model)?;
    Ok(result)
}

#[tauri::command]
fn list_brand_kits(app: AppHandle) -> Result<Vec<BrandKitSummary>, String> {
    brand_kit::list_brand_kits(&app)
}

#[tauri::command]
fn load_brand_kit(app: AppHandle, id: String) -> Result<BrandKit, String> {
    brand_kit::load_brand_kit(&app, &id)
}

#[tauri::command]
fn save_brand_kit(app: AppHandle, input: SaveBrandKitInput) -> Result<BrandKit, String> {
    brand_kit::save_brand_kit(&app, input)
}

#[tauri::command]
fn delete_brand_kit(app: AppHandle, id: String) -> Result<(), String> {
    brand_kit::delete_brand_kit(&app, &id)
}

#[tauri::command]
fn save_reference_image(
    app: AppHandle,
    kit_id: String,
    slot: usize,
    base64_data: String,
    filename: String,
) -> Result<BrandKit, String> {
    brand_kit::save_reference_image(&app, &kit_id, slot, &base64_data, &filename)
}

#[tauri::command]
fn remove_reference_image(app: AppHandle, kit_id: String, slot: usize) -> Result<BrandKit, String> {
    brand_kit::remove_reference_image(&app, &kit_id, slot)
}

#[tauri::command]
fn read_reference_preview(app: AppHandle, path: String) -> Result<String, String> {
    brand_kit::read_reference_preview(&app, &path)
}

#[tauri::command]
async fn generate_images(
    app: AppHandle,
    server_url: String,
    brand_kit_id: String,
    insights: Vec<InsightRow>,
    product_context: String,
    tier: String,
    regenerate: Option<RegenerateSlot>,
) -> Result<GenerateImagesResult, String> {
    let result = images::generate_images(
        &app,
        &server_url,
        &brand_kit_id,
        insights,
        &product_context,
        &tier,
        regenerate.clone(),
    )
    .await?;

    usage_log::record_images(
        &app,
        &tier,
        result.images.len() as u32,
        &result.model,
        regenerate.is_some(),
    )?;

    Ok(result)
}

#[tauri::command]
fn get_usage_summary(app: AppHandle, project_id: Option<String>) -> Result<UsageSummary, String> {
    usage_log::get_usage_summary(&app, project_id)
}

#[tauri::command]
fn export_images_zip_command(
    items: Vec<ExportImageItem>,
    format: String,
    product_name: String,
) -> Result<String, String> {
    export_images_zip(items, format, product_name)
}

#[tauri::command]
fn save_listing_session(
    app: AppHandle,
    product_context: String,
    brand_kit_id: Option<String>,
    provider: String,
    insights: Vec<InsightRow>,
) -> Result<ListingSession, String> {
    session::save_listing_session(&app, product_context, brand_kit_id, provider, insights)
}

#[tauri::command]
fn get_listing_session(app: AppHandle) -> Result<Option<ListingSession>, String> {
    session::get_listing_session(&app)
}

#[tauri::command]
async fn generate_aplus_content(
    app: AppHandle,
    server_url: String,
    brand_kit_id: String,
    insights: Vec<InsightRow>,
    product_context: String,
    provider: String,
) -> Result<AplusContentResult, String> {
    studio::generate_aplus(
        &app,
        &server_url,
        &brand_kit_id,
        insights,
        &product_context,
        &provider,
    )
    .await
}

#[tauri::command]
async fn localize_aplus_content(
    app: AppHandle,
    server_url: String,
    modules: Vec<AplusModuleInput>,
    target_locale: String,
    provider: String,
) -> Result<AplusContentResult, String> {
    studio::localize_content(&app, &server_url, modules, &target_locale, &provider).await
}

#[tauri::command]
async fn generate_ad_creatives(
    app: AppHandle,
    server_url: String,
    brand_kit_id: String,
    insights: Vec<InsightRow>,
    product_context: String,
    tier: String,
) -> Result<StudioImagesResult, String> {
    studio::generate_ads(
        &app,
        &server_url,
        &brand_kit_id,
        insights,
        &product_context,
        &tier,
    )
    .await
}

#[tauri::command]
async fn generate_variation_images(
    app: AppHandle,
    server_url: String,
    brand_kit_id: String,
    insights: Vec<InsightRow>,
    product_context: String,
    tier: String,
    variants: Vec<String>,
) -> Result<StudioImagesResult, String> {
    studio::generate_variations(
        &app,
        &server_url,
        &brand_kit_id,
        insights,
        &product_context,
        &tier,
        variants,
    )
    .await
}

#[tauri::command]
async fn generate_listing_copy(
    app: AppHandle,
    server_url: String,
    brand_kit_id: String,
    insights: Vec<InsightRow>,
    product_context: String,
    provider: String,
) -> Result<ListingCopyResult, String> {
    listing_copy::generate_listing_copy(
        &app,
        &server_url,
        &brand_kit_id,
        insights,
        &product_context,
        &provider,
    )
    .await
}

#[tauri::command]
fn export_listing_pack_command(input: export::ExportPackInput) -> Result<String, String> {
    export::export_listing_pack(input)
}

#[tauri::command]
fn get_device_fingerprint(app: AppHandle) -> Result<String, String> {
    license::compute_fingerprint(&app)
}

#[tauri::command]
async fn validate_license(app: AppHandle, server_url: String) -> Result<LicenseValidation, String> {
    license::validate_license(&app, &server_url).await
}

#[tauri::command]
async fn create_license_checkout(
    app: AppHandle,
    server_url: String,
    plan: String,
    email: Option<String>,
) -> Result<CheckoutResponse, String> {
    license::create_checkout(&app, &server_url, &plan, email.as_deref()).await
}

#[tauri::command]
async fn sync_license_checkout(
    app: AppHandle,
    server_url: String,
    session_id: String,
) -> Result<LicenseValidation, String> {
    license::sync_checkout(&app, &server_url, &session_id).await
}

#[tauri::command]
fn list_projects(app: AppHandle) -> Result<Vec<ProjectSummary>, String> {
    projects::list_projects(&app)
}

#[tauri::command]
fn create_project(app: AppHandle, input: CreateProjectInput) -> Result<ProjectData, String> {
    projects::create_project(&app, input)
}

#[tauri::command]
fn load_project(app: AppHandle, id: String) -> Result<ProjectData, String> {
    projects::load_project(&app, id)
}

#[tauri::command]
fn save_project(app: AppHandle, input: SaveProjectInput) -> Result<ProjectData, String> {
    projects::save_project_data(&app, input)
}

#[tauri::command]
fn delete_project(app: AppHandle, id: String) -> Result<(), String> {
    projects::delete_project(&app, id)
}

#[tauri::command]
fn get_active_project(app: AppHandle) -> Result<Option<ProjectData>, String> {
    match projects::ensure_default_project(&app) {
        Ok(project) => Ok(Some(project)),
        Err(e) => Err(e),
    }
}

#[tauri::command]
fn read_image_preview(path: String) -> Result<String, String> {
    projects::read_image_data_url(&path)
}

#[tauri::command]
fn export_creative_brief_command(content: String, product_name: String) -> Result<String, String> {
    projects::export_creative_brief_file(content, product_name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_key_statuses,
            save_api_key,
            delete_api_key,
            test_api_key,
            extract_insights,
            list_brand_kits,
            load_brand_kit,
            save_brand_kit,
            delete_brand_kit,
            save_reference_image,
            remove_reference_image,
            read_reference_preview,
            generate_images,
            get_usage_summary,
            export_images_zip_command,
            export_listing_pack_command,
            save_listing_session,
            get_listing_session,
            generate_aplus_content,
            localize_aplus_content,
            generate_ad_creatives,
            generate_variation_images,
            generate_listing_copy,
            get_device_fingerprint,
            validate_license,
            create_license_checkout,
            sync_license_checkout,
            list_projects,
            create_project,
            load_project,
            save_project,
            delete_project,
            get_active_project,
            read_image_preview,
            export_creative_brief_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
