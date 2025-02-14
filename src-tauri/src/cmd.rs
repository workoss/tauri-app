// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn greet(name: &str) -> String {
    log::debug!(target: "workoss::app::event", "greet:{}", name);
    format!("Hello, {}! You've been greeted from Rust!", name)
}
