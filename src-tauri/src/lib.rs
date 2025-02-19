mod cmd;
mod config;
mod error;
mod hotkey;
mod window;

#[cfg(desktop)]
mod tray;

use crate::config::init_config;
use crate::window::{create_main_window, get_main_window};
use error as app_error;

use serde::Serialize;

use std::sync::OnceLock;
use tauri::{webview::PageLoadEvent, Emitter, Listener, RunEvent};
use tauri_plugin_autostart::MacosLauncher;

pub static APP: OnceLock<tauri::AppHandle> = OnceLock::new();

pub type SetupHook =
    Box<dyn FnOnce(&mut tauri::App) -> Result<(), Box<dyn std::error::Error>> + Send>;
pub type OnEvent = Box<dyn FnMut(&tauri::AppHandle, RunEvent)>;

#[derive(Clone, Serialize)]
struct Reply {
    data: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    let mut builder = tauri::Builder::default().plugin(tauri_plugin_deep_link::init());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(
                |app_handle, _args, _cwd| {
                    if let Ok(windows) = get_main_window(app_handle) {
                        let _ = windows.set_focus();
                    }
                },
            ))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ))
            .plugin(tauri_plugin_cli::init())
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_window_state::Builder::new().build());
    }

    let app = builder
        .plugin(
            tauri_plugin_log::Builder::new()
                // .clear_targets()
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: None,
                    }),
                ])
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                // .format(|out, message, record| {
                //     out.finish(format_args!("[{} {}] {}",record.level(),record.target(),message))
                //   })
                .level(log::LevelFilter::Info)
                .level_for("workoss::app", log::LevelFilter::Debug)
                // .filter(|metadata| {
                //     let target = metadata.target();
                //     target == "app" || target == "migrate"
                // })
                .build(),
        )
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .invoke_handler(tauri::generate_handler![cmd::greet, cmd::ping])
        .on_page_load(|webview, payload| {
            if payload.event() == PageLoadEvent::Finished {
                let webview_ = webview.clone();
                webview.listen("js-event", move |event| {
                    log::debug!(
                        target: "workoss::app::listen",
                        "got js-event with message '{:?}'",
                        event.payload()
                    );
                    let reply = Reply {
                        data: "something else".to_string(),
                    };

                    webview_
                        .emit("rust-event", Some(reply))
                        .expect("failed to emit");
                });
            }
        })
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Regular);
            }
            create_main_window(app)?;
            //Global AppHandle
            APP.get_or_init(|| app.handle().clone());

            log::info!(target: "workoss::app","Init Config Store");
            init_config(app)?;

            Ok(())
        })
        .build(tauri::generate_context!())
        // .run(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(move |_app_handle, event| match event {
        #[cfg(desktop)]
        RunEvent::ExitRequested { .. } => {
            log::debug!(target:"workoss::app::event", "ExitRequested");
            // if code.is_none() {
            // api.prevent_exit();
            // }
        }
        RunEvent::WindowEvent { label, event, .. } => {
            if label != "main" {
                return;
            }
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                //如果点击关闭 是退出软件
                log::debug!(
                    target: "workoss::app::event",
                    "WindowEvent::CloseRequested"
                );
                // api.prevent_close();
            }
        }
        _ => {}
    });

    app_error::panic_hook();
}
