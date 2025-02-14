# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

brew install nsis
brew install llvm
rustup target add x86_64-pc-windows-msvc
cargo install --locked cargo-xwin
pnpm tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc

features = ["macros", "rt", "net", "io-util"]
