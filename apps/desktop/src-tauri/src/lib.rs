mod keys;

use keys::KeyStatus;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_key_statuses,
            save_api_key,
            delete_api_key,
            test_api_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
