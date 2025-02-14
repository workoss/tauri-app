use std::sync::{Arc, Mutex};
use std::{collections::HashMap, fs};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{Manager, Wry};
use tauri_plugin_store::{Store, StoreExt as _};

use crate::APP;

#[derive(Debug, Deserialize, Serialize)]
pub struct UserConfig {
    ///开发模式
    pub dev_mode: Option<bool>,
    ///开启自动更新
    pub auto_update: Option<bool>,
    /// language zh-CN en-US
    pub locale: Option<String>,
    /// theme dark,light,system
    pub theme: Option<String>,
    /// 日志级别 error, warn, info, debug, trace
    pub log_level: Option<String>,
}

impl Default for UserConfig {
    fn default() -> Self {
        Self {
            dev_mode: Some(false),
            auto_update: Some(false),
            locale: Some("zh-CN".to_string()),
            theme: Some("system".to_string()),
            log_level: Some("Info".to_string()),
        }
    }
}

static CONFIG_FILE: &str = "config.json";

pub fn init_config(app: &mut tauri::App) -> anyhow::Result<()> {
    // Users/workoss/Library/Application Support/com.workoss.app.workoss-app
    let config_path = app.path().app_config_dir()?;
    if !&config_path.exists() {
        fs::create_dir_all(&config_path)?;
    }
    let default_user_config = default_user_config();
    let config_path = config_path.join(CONFIG_FILE);
    if !&config_path.exists() {
        // fs::write(&config_path, serde_json::to_vec(&UserConfig::default())?)?;
        fs::write(&config_path, "{}")?;
    }

    log::info!(target: "workoss::app::config","Load config from {:?}",config_path);
    let store = app
        .store_builder(CONFIG_FILE)
        .defaults(default_user_config.clone())
        // .auto_save(Duration::from_secs(30))
        .build()?;

    //若是新版本需要合并更新配置，UserConfig::default() key 为准，历史的可用的key对应的值需要更新到配置文件
    let config_map: HashMap<String, Value> = store
        .entries()
        .iter()
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();

    let increase_diff: HashMap<String, Value> = config_map
        .into_iter()
        .filter(|(k, _)| !default_user_config.contains_key(k))
        .collect();

    if !&increase_diff.is_empty() {
        for (k, v) in increase_diff {
            log::debug!(target: "workoss::app::config","add config {}:{:?}",&k,&v);
            store.set(k, v);
        }
    }

    store.save()?;

    // app.manage(StoreWrapper(Mutex::new(store)));

    Ok(())
}

fn default_user_config() -> HashMap<String, Value> {
    let map = serde_json::from_value(serde_json::to_value(UserConfig::default()).unwrap()).unwrap();
    map
}

pub fn get(key: &str) -> Option<Value> {
    let store = APP
        .get()
        .expect("global app can`t init")
        .get_store(CONFIG_FILE)
        .expect("store can`t init");
    match store.get(key) {
        Some(value) => Some(value),
        None => None,
    }
}

pub fn set<T: serde::ser::Serialize>(key: &str, value: T) -> anyhow::Result<()> {
    let store = APP
        .get()
        .expect("global app can`t init")
        .get_store(CONFIG_FILE)
        .expect("store can`t init");
    store.set(key, json!(value));
    store.save()?;
    Ok(())
}

pub fn is_first_run() -> bool {
    let store = APP
        .get()
        .expect("global app can`t init")
        .get_store(CONFIG_FILE)
        .expect("store can`t init");
    store.is_empty()
}
