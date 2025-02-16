use tauri_plugin_shell::ShellExt as _;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn greet(name: &str) -> String {
    log::debug!(target: "workoss::app::event", "greet:{}", name);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub async fn ping(app: tauri::AppHandle, message: String) -> String {
    log::debug!(target: "workoss::app::event", "ping:{}", &message);
    let sidecar_command = app.shell().sidecar("app").unwrap().arg("ping").arg(message);
    let output = sidecar_command.output().await.unwrap();
    let response = String::from_utf8(output.stdout).unwrap();
    response
    // format!("Hello, {}! ping from Rust!", &message)
}
