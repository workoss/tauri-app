use tauri_plugin_shell::ShellExt as _;

type CmdResult<T = ()> = Result<T, String>;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn greet(name: &str) -> CmdResult<String> {
    log::debug!(target: "workoss::app::event", "greet:{}", name);
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

#[tauri::command]
pub async fn ping(app: tauri::AppHandle, message: String) -> CmdResult<String> {
    log::debug!(target: "workoss::app::event", "ping:{}", &message);
    let sidecar_command = app.shell().sidecar("app").unwrap().arg("ping").arg(message);
    let output = sidecar_command.output().await.unwrap();
    let response = String::from_utf8(output.stdout).unwrap();
    Ok(response)
    // format!("Hello, {}! ping from Rust!", &message)
}
