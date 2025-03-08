import { log_info, log_error, downloadProgressBar } from "./util.mjs";
import fsp from "node:fs/promises";
import { HttpsProxyAgent } from "https-proxy-agent";
import { execSync } from "node:child_process";

const cwd = process.cwd();
const TEMP_DIR = `node_modules/.workoss`;
const FORCE = process.argv.includes("--force");

const PLATFORM_MAP = {
  "x86_64-pc-windows-msvc": "win32",
  "aarch64-pc-windows-msvc": "win32",
  "x86_64-unknown-linux-gnu": "linux",
  "aarch64-unknown-linux-gnu": "linux",
  "x86_64-apple-darwin": "macos",
  "aarch64-apple-darwin": "darwin",
};

const ARCH_MAP = {
  "x86_64-pc-windows-msvc": "x64",
  "aarch64-pc-windows-msvc": "arm64",
  "x86_64-unknown-linux-gnu": "x64",
  "aarch64-unknown-linux-gnu": "arm64",
  "x86_64-apple-darwin": "x64",
  "aarch64-apple-darwin": "arm64",
};

const arg1 = process.argv.slice(2)[0];
const arg2 = process.argv.slice(2)[1];
const target = arg1 === "--force" ? arg2 : arg1;
const { platform, arch } = target
  ? { platform: PLATFORM_MAP[target], arch: ARCH_MAP[target] }
  : process;

const APP_RELEASE_URL =
  process.env.APP_RELEASE_URL ||
  "https://github.com/1111mp/nvmd-command/releases/latest/download";

const APP_LATEST_MAP = {
  "win32-x64": "react-tauri_windows-x64.exe",
  "win32-arm64": "react-tauri_windows-arm64.exe",
  "darwin-x64": "react-tauri_macos-x64",
  "darwin-arm64": "react-tauri_macos-arm64",
  "linux-x64": "react-tauri_linux-x64",
  "linux-arm64": "react-tauri_linux-arm64",
};

// Check if the latest version exists
if (!APP_LATEST_MAP[`${platform}-${arch}`]) {
  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

async function downloadFile(url, destPath) {
  log_info(`start downloading ${url} to ${destPath}`);
  const options = {};
  const httpProxy =
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.HTTPS_PROXY ||
    process.env.https_proxy;
  if (httpProxy) {
    options.agent = new HttpsProxyAgent(httpProxy);
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
  if (!response.ok) {
    throw new Error(`failed to download ${url}`);
  }

  const totalLength = parseInt(response.headers.get("content-length"), 10);
  const progressBar = downloadProgressBar(totalLength);

  //新建一个空文件
  await fsp.mkdir(TEMP_DIR, { recursive: true });

  const fileStream = await fsp.open(destPath, "w");
  const writer = fileStream.createWriteStream();
  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    progressBar.tick(value.length);
  }

  writer.on("finish", () => {
    log_info(`finish downloading ${url} to ${destPath}`);
  });

  writer.on("error", (err) => {
    progressBar.interrupt(`failed to write file ${destPath}: ${err}`);
    log_error(`failed to write file ${destPath}: ${err}`);
  });

  for (const chunk of chunks) {
    writer.write(chunk);
  }

  writer.end();

  // const buffer = await response.arrayBuffer();

  // await fsp.writeFile(destPath, Buffer.from(buffer));

  // console.info(`[INFO] finish downloading ${url} to ${destPath}`);
}

downloadFile(
  `https://github.com/1111mp/envpath/releases/download/v1.0.0/envpath_x64.exe`,
  `${TEMP_DIR}/envpath_x64.exe`,
);
