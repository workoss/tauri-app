use std::{collections::HashMap, sync::OnceLock};

use rust_embed::Embed;
use serde_json::Value;
use tauri::{Runtime, menu::MenuItemBuilder};

use crate::config;

macro_rules! t {
    ($language_dict: expr, $key: expr) => {
        $language_dict[$key].as_str().unwrap_or_else(|| $key)
    };
}

#[derive(Embed)]
#[folder = "locales/menu/"]
#[include = "*.json"]
struct Asset;

#[tauri::command]
pub fn update_tray<R: Runtime>(
    app: &tauri::AppHandle<R>,
    language: Option<&str>,
) -> tauri::Result<()> {
    let language = if language.is_none() {
        //get store language
        match config::get("language") {
            Some(v) => v.as_str().unwrap().to_string(),
            None => {
                config::set("language", "zh-CN")?;
                "zh-CN".to_string()
            }
        }
    } else {
        language.unwrap().to_string()
    };
    // app menu language
    let value = i18n(language.as_str());

    MenuItemBuilder::with_id("quit", t!(value, "quit")).accelerator("CmdOrCtrl+Q");

    Ok(())
}

fn i18n(mut language: &str) -> &Value {
    static MENU_DICT: OnceLock<HashMap<String, Value>> = OnceLock::new();
    let dict = MENU_DICT.get_or_init(|| {
        let mut language_dict: HashMap<String, Value> = HashMap::new();
        log::debug!(target:"workoss::app::tray","init menu i18n");
        for file in Asset::iter() {
            let file_name = file.as_ref();
            log::debug!(target:"workoss::app::tray","load menu i18n {:?}",file_name);
            let key = file_name.replace(".json", "");
            let data = Asset::get(file_name).unwrap().data;
            let value = serde_json::from_slice(&data).unwrap();
            language_dict.insert(key, value);
        }
        language_dict
    });
    if !dict.contains_key(language) {
        language = "zh-CN";
    }
    dict.get(language).unwrap()
}

#[cfg(test)]
mod tests {
    use serde_json::Value;

    use super::i18n;

    #[test]
    pub fn test_i18n() {
        for _i in 1..5 {
            let value = i18n("zh-CN");
            let dev_tools_text = t!(value, "open-dev-tools");
            assert_eq!(dev_tools_text, "开发者工具");
            let value = i18n("en-US");
            let dev_tools_text = t!(value, "open-dev-tools");
            assert_eq!(dev_tools_text, "Open Dev Tools");
        }
    }
}
