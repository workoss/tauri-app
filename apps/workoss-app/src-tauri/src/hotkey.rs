pub fn register<F>(
    app: &tauri::AppHandle,
    name: &str,
    handler: F,
    hotkey: &str,
) -> anyhow::Result<()>
where
    F: FnOnce() + Send + 'static,
{
    Ok(())
}
