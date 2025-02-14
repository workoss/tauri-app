mod cmd;
mod config;
mod error;
mod hotkey;

#[cfg(desktop)]
mod tray;

use config::*;
use hotkey::*;
use tray::*;

use serde::Serialize;

use std::{panic, sync::OnceLock};
use tauri::{
    webview::PageLoadEvent, Emitter, Listener, Manager as _, RunEvent, WebviewUrl,
    WebviewWindowBuilder,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt as _};

pub static APP: OnceLock<tauri::AppHandle> = OnceLock::new();

pub type SetupHook = Box<dyn FnOnce(&mut tauri::App) -> Result<(), Box<dyn std::error::Error>> + Send>;
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
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                let _ = app
                    .get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
            }))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ))
            .plugin(tauri_plugin_cli::init())
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .setup(move |app| {
                #[cfg(target_os = "macos")]
                {
                    app.set_activation_policy(tauri::ActivationPolicy::Accessory);
                }

                // Get the autostart manager
                let autostart_manager = app.autolaunch();
                // Enable autostart
                // let _ = autostart_manager.enable();
                // Check enable state
                log::debug!(
                    target: "workoss::app",
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap()
                );

                // Disable autostart
                // let _ = autostart_manager.disable();

                Ok(())
            })
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
                    // tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview)
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
        .invoke_handler(tauri::generate_handler![cmd::greet])
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
            let mut webview_window_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::default());
            
            #[cfg(desktop)]
            {
                webview_window_builder = webview_window_builder
                    .user_agent(&format!("workoss-app-{}", std::env::consts::OS))
                    .title(app.config().product_name.as_ref().unwrap())
                    .inner_size(800., 600.)
                    .min_inner_size(600., 400.)
                    .visible(false)
                    .resizable(false)
                    .center();
            }

            #[cfg(target_os = "windows")]
            {
                webview_window_builder = webview_window_builder
                    .transparent(true)
                    .shadow(true)
                    .decorations(false)
                    .additional_browser_args("--enable-features=msWebView2EnableDraggableRegions --disable-features=OverscrollHistoryNavigation,msExperimentalScrolling");
            }

            #[cfg(target_os = "macos")]
            {
                webview_window_builder = webview_window_builder
                .transparent(true)
                .decorations(false)
                .hidden_title(true)
                .shadow(true)
                .title_bar_style(tauri::TitleBarStyle::Overlay)
            }

            #[cfg(target_os = "linux")]
            {
                webview_window_builder = webview_window_builder
                .transparent(true)
                .decorations(false)
            }

            let _webview = webview_window_builder.build().unwrap();

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
    let prev = panic::take_hook();
    panic::set_hook(Box::new(move |info| {
        log::error!(target:"workoss::app","panic hook: {:?}",&info);
        prev(info);
    }));
}
