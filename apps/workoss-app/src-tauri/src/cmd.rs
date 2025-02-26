use std::sync::{Arc, Mutex, atomic::AtomicBool};

use tauri::Emitter;
use tauri_plugin_shell::{ShellExt as _, process::CommandEvent};

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

#[tauri::command]
pub async fn express(app: tauri::AppHandle) -> CmdResult<()> {
    static RUNNING: AtomicBool = AtomicBool::new(false);
    if RUNNING.load(std::sync::atomic::Ordering::SeqCst) {
        return Ok(());
    }
    log::debug!(target: "workoss::app::event", "express start run");
    // let sidecar_command = app.shell().sidecar("app").unwrap().arg("ping").arg("111");
    let sidecar_command = app.shell().sidecar("express").unwrap().arg("9091");
    // let output = sidecar_command.output().await.unwrap();
    // let response = String::from_utf8(output.stdout).unwrap();

    let (mut rx, mut child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
    log::debug!(target: "workoss::app::event", "express run pid:{}",&child.pid());
    // Wrap child in Arc<Mutex> for safe sharing across threads
    // let child = Arc::new(Mutex::new(child));
    // let child_clone = Arc::clone(&child);

    RUNNING.store(true, std::sync::atomic::Ordering::SeqCst);
    tauri::async_runtime::spawn(async move {
        //reg signal
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    log::info!(target: "workoss::app::event", "stdout:{};",&line);
                    // Emit the line to the frontend
                    app.emit("sidecar-stdout", line.to_string())
                        .expect("Failed to emit sidecar stdout event");
                    child.write("message from Rust\n".as_bytes()).unwrap();
                }
                CommandEvent::Stderr(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    eprintln!("Sidecar stderr: {}", line);
                    log::error!(target: "workoss::app::event", "stderr:{};",&line);
                    // Emit the error line to the frontend
                    app.emit("sidecar-stderr", line.to_string())
                        .expect("Failed to emit sidecar stderr event");
                    child.write("message from Rust\n".as_bytes()).unwrap();
                }
                _ => {}
            }
        }
    });
    Ok(())
}
