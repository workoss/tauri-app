use std::{
    env, fs,
    path::{Path, PathBuf},
};

use anyhow::Result;

fn main() -> Result<()> {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let target_dir = out_dir
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap();

    let source_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("binaries");

    if let Err(e) = copy_sidecar(&source_dir, &target_dir) {
        eprintln!("Error copying binaries: {e}");
    }

    tauri_build::build();

    println!("cargo::rerun-if-changed=build.rs");

    Ok(())
}

fn copy_sidecar(source_dir: &Path, target_dir: &Path) -> Result<()> {
    //source_dir: "/Users/workoss/IDE/webProjects/tauri-app/src-tauri/binaries" target_dir: "/Users/workoss/IDE/webProjects/tauri-app/src-tauri/target/debug"
    for entry in fs::read_dir(&source_dir).unwrap() {
        if let Err(e) = entry {
            eprint!("Error reading directory:{:?} {e}", &source_dir);
            continue;
        }
        let path = entry.unwrap().path();

        let source_path = &source_dir.join(path.file_name().unwrap());

        if !path.is_dir() {
            continue;
        }
        let symlink_files = copy_app_sidecar(&source_path, &target_dir);
        if let Err(e) = symlink_files {
            eprintln!("Error copying app sidecar: {:?} {e}", &source_path);
            return Err(e);
        }
        for (target, real) in symlink_files.unwrap() {
            if target.exists() {
                continue;
            }
            if let Err(e) = symlink_dir(&real, &target) {
                eprintln!("Error creating symlink: {:?} {e}", &target);
                return Err(anyhow::Error::new(e));
            }
        }

        //binaries/express/(node_modules|views|)
    }
    Ok(())
}

fn copy_app_sidecar(source_dir: &Path, target_dir: &Path) -> Result<Vec<(PathBuf, PathBuf)>> {
    //source_dir: "/Users/workoss/IDE/webProjects/tauri-app/src-tauri/binaries" target_dir: "/Users/workoss/IDE/webProjects/tauri-app/src-tauri/target/debug"

    let mut symlink_files: Vec<(PathBuf, PathBuf)> = Vec::new();

    for entry in fs::read_dir(&source_dir).unwrap() {
        if let Err(e) = entry {
            eprint!("Error reading directory:{:?} {e}", &source_dir);
            continue;
        }
        let path = entry.unwrap().path();

        let source_path = &source_dir.join(path.file_name().unwrap());

        if path.is_symlink() {
            //转换成新路径
            let link_path = path.read_link()?;
            let source_link_path = target_dir.join(link_path.strip_prefix(&source_dir)?);
            let target_link_path = target_dir.join(path.strip_prefix(&source_dir)?);
            // println!(
            //     "symlink: {:?} link_paht:{:?}",
            //     &target_link_path, &source_link_path
            // );
            return Ok(vec![(target_link_path, source_link_path)]);
        }

        if !path.is_dir() {
            continue;
        }

        //node_modules 目录不需要复制 递归里面的目录复制
        if path.file_name().unwrap() == "node_modules" {
            let target_path = target_dir.join("node_modules");
            fs::create_dir_all(&target_path)?;
            symlink_files.extend(copy_app_sidecar(&path, &target_path)?);
        } else {
            //复制目录
            fs_extra::dir::copy(
                &source_path,
                &target_dir,
                &fs_extra::dir::CopyOptions::new()
                    .skip_exist(true)
                    .copy_inside(true),
            )
            .unwrap();
        }
        //binaries/express/(node_modules|views|)
    }
    Ok(symlink_files)
}

#[cfg(unix)]
fn symlink_dir(src: &Path, dst: &Path) -> std::io::Result<()> {
    std::os::unix::fs::symlink(src, dst)
}

/// Makes a symbolic link to a directory.
#[cfg(windows)]
fn symlink_dir(src: &Path, dst: &Path) -> std::io::Result<()> {
    std::os::windows::fs::symlink_dir(src, dst)
}

/// Makes a symbolic link to a file.
#[cfg(unix)]
fn symlink_file(src: &Path, dst: &Path) -> std::io::Result<()> {
    std::os::unix::fs::symlink(src, dst)
}

/// Makes a symbolic link to a file.
#[cfg(windows)]
fn symlink_file(src: &Path, dst: &Path) -> std::io::Result<()> {
    std::os::windows::fs::symlink_file(src, dst)
}
