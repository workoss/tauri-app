import { execSync } from 'child_process';
import fs from 'fs';
import { platform } from 'os';

const jsonData = JSON.parse(
  fs.readFileSync('./package.json').toString('utf-8'),
);

const name = jsonData.name;

const appNames = [`${name}-macos`, `${name}-linux`, `${name}-win.exe`];

const appMap = {
  [`${name}-macos`]: `${name}-x86_64-apple-darwin`,
  [`${name}-linux`]: `${name}-x86_64-unknown-linux-gnu`,
  [`${name}-win.exe`]: `${name}-x86_64-pc-windows-msvc.exe`,
};

const ext = process.platform === 'win32' ? '.exe' : '';

console.log(`platform: ${platform}`);

const rustInfo = execSync('rustc -vV');
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
  console.error('Failed to determine platform target triple');
}

for (const [key, value] of Object.entries(appMap)) {
  //文件是否存在
  if (!fs.existsSync(key)) {
    console.warn(`${key} not exists, not need to move`);
    continue;
  }
  //迁移文件到 src-tauri/binaries
  // sidecar-x86_64-apple-darwin  sidecar-x86_64-unknown-linux-gnu sidecar-x86_64-pc-windows-msvc.exe
  fs.renameSync(key, `../src-tauri/binaries/${value}`);
}

// fs.renameSync(
//   `sidecar-app-macos${ext}`,
//   `../src-tauri/binaries/sidecar-app-${targetTriple}${ext}`,
// );
