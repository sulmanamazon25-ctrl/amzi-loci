use keyring::Entry;
use serde::Serialize;

const SERVICE: &str = "amzi-loci";

const PROVIDERS: [&str; 3] = ["anthropic", "openai", "google"];

#[derive(Serialize)]
pub struct KeyStatus {
    pub provider: String,
    pub saved: bool,
    pub masked: Option<String>,
}

fn entry(provider: &str) -> Result<Entry, String> {
    Entry::new(SERVICE, provider).map_err(|e| e.to_string())
}

fn mask_key(key: &str) -> String {
    if key.len() <= 4 {
        return "****".to_string();
    }
    format!("...{}", &key[key.len() - 4..])
}

pub fn get_key_statuses() -> Result<Vec<KeyStatus>, String> {
    PROVIDERS
        .iter()
        .map(|provider| {
            let saved_key = entry(provider)?.get_password();
            match saved_key {
                Ok(key) if !key.is_empty() => Ok(KeyStatus {
                    provider: (*provider).to_string(),
                    saved: true,
                    masked: Some(mask_key(&key)),
                }),
                _ => Ok(KeyStatus {
                    provider: (*provider).to_string(),
                    saved: false,
                    masked: None,
                }),
            }
        })
        .collect()
}

pub fn save_api_key(provider: &str, key: &str) -> Result<(), String> {
    validate_provider(provider)?;
    let trimmed = key.trim();
    if trimmed.is_empty() {
        return Err("API key cannot be empty".to_string());
    }
    entry(provider)?
        .set_password(trimmed)
        .map_err(|e| e.to_string())
}

pub fn delete_api_key(provider: &str) -> Result<(), String> {
    validate_provider(provider)?;
    match entry(provider)?.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

fn validate_provider(provider: &str) -> Result<(), String> {
    if PROVIDERS.contains(&provider) {
        Ok(())
    } else {
        Err(format!("Unknown provider: {provider}"))
    }
}

pub fn get_stored_key(provider: &str) -> Result<String, String> {
    validate_provider(provider)?;
    entry(provider)?
        .get_password()
        .map_err(|e| e.to_string())
}

pub async fn test_api_key(provider: &str, key: &str) -> Result<String, String> {
    validate_provider(provider)?;
    let trimmed = key.trim();
    if trimmed.is_empty() {
        return Err("API key cannot be empty".to_string());
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|e| e.to_string())?;

    match provider {
        "openai" => {
            let response = client
                .get("https://api.openai.com/v1/models")
                .bearer_auth(trimmed)
                .send()
                .await
                .map_err(|e| e.to_string())?;
            if response.status().is_success() {
                Ok("OpenAI key is valid".to_string())
            } else {
                Err(format!("OpenAI rejected the key ({})", response.status()))
            }
        }
        "anthropic" => {
            let response = client
                .get("https://api.anthropic.com/v1/models")
                .header("x-api-key", trimmed)
                .header("anthropic-version", "2023-06-01")
                .send()
                .await
                .map_err(|e| e.to_string())?;
            if response.status().is_success() {
                Ok("Anthropic key is valid".to_string())
            } else {
                Err(format!("Anthropic rejected the key ({})", response.status()))
            }
        }
        "google" => {
            let response = client
                .get(format!(
                    "https://generativelanguage.googleapis.com/v1beta/models?key={trimmed}"
                ))
                .send()
                .await
                .map_err(|e| e.to_string())?;
            if response.status().is_success() {
                Ok("Google AI key is valid".to_string())
            } else {
                Err(format!("Google AI rejected the key ({})", response.status()))
            }
        }
        _ => Err(format!("Unknown provider: {provider}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn masks_keys() {
        assert_eq!(mask_key("sk-abcdefghijklmnop"), "...mnop");
    }
}
