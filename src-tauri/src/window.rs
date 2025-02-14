use anyhow::Context;
use tauri::{Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

static MAIN_WINDOW_LABEL: &str = "main";

pub fn get_main_window(app_handle: &tauri::AppHandle) -> anyhow::Result<WebviewWindow> {
    app_handle
        .get_webview_window(MAIN_WINDOW_LABEL)
        .context("main webview window not exists")
}

pub fn create_main_window(app: &mut tauri::App) -> anyhow::Result<()> {
    create_window(app, MAIN_WINDOW_LABEL, None)
}

fn create_window(
    app: &mut tauri::App,
    label: &str,
    webview_url: Option<WebviewUrl>,
) -> anyhow::Result<()> {
    let mut webview_window_builder =
        WebviewWindowBuilder::new(app, label, webview_url.unwrap_or(WebviewUrl::default()));

    #[cfg(desktop)]
    {
        webview_window_builder = webview_window_builder
            .user_agent(&format!("workoss-app-{}", std::env::consts::OS))
            .title(app.config().product_name.as_ref().unwrap())
            .inner_size(800., 600.)
            .min_inner_size(600., 400.)
            .visible(false)
            .always_on_top(true)
            .resizable(true) //max
            .center();
    }

    #[cfg(target_os = "windows")]
    {
        webview_window_builder = webview_window_builder
                    .transparent(true)
                    .shadow(true)
                    .decorations(true) //? false
                    .visible(false)
                    .additional_browser_args("--enable-features=msWebView2EnableDraggableRegions --disable-features=OverscrollHistoryNavigation,msExperimentalScrolling");
    }

    #[cfg(target_os = "macos")]
    {
        webview_window_builder = webview_window_builder
            .transparent(true)
            .decorations(true) //menu
            .hidden_title(true)
            .shadow(true)
            .title_bar_style(tauri::TitleBarStyle::Overlay);
    }

    #[cfg(target_os = "linux")]
    {
        webview_window_builder = webview_window_builder.transparent(true).decorations(true)
    }

    let _window = webview_window_builder.build()?;

    // #[cfg(debug_assertions)]
    // window.open_devtools();

    Ok(())
}
