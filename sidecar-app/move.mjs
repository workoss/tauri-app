import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { platform } from 'os';
import { globSync } from 'tinyglobby';

// fs.renameSync(
//   `sidecar-app-macos${ext}`,
//   `../src-tauri/binaries/sidecar-app-${targetTriple}${ext}`,
// );

const copyAppExe = (name, sourceDirName) => {
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
    if (!fs.existsSync(`${sourceDirName}/${key}`)) {
      console.warn(`${key} not exists, not need to move`);
      continue;
    }
    fs.renameSync(
      `${sourceDirName}/${key}`,
      `../src-tauri/binaries/${name}/${value}`,
    );
  }
};

const ensureDirectoryExistence = (dirpath) => {
  const dirname = path.dirname(dirpath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname, { recursive: true });
  return true;
};

const copyFiles = (sourceFiles) => {
  if (sourceFiles.length == 0) {
    return;
  }
  for (const filePath of sourceFiles) {
    const destPath = `../src-tauri/binaries/${filePath}`;
    ensureDirectoryExistence(destPath);
    fs.copyFileSync(filePath, `../src-tauri/binaries/${filePath}`);
  }
};

const matchAssets = (pkgAssets, sourceDirName) => {
  if (pkgAssets.length == 0) {
    return [];
  }
  const patterns = pkgAssets.map((item) => `${sourceDirName}/${item}`);
  const filterFiles =
    globSync(patterns, {
      ignore: [],
    }) || [];
  return filterFiles;
};

// const matchNodeModules = (sourceDirName) => {
//   const filterFiles =
//     globSync([`${sourceDirName}/node_modules/**/*`], {
//       ignore: ['**/*.d.ts', '**/*.js.map', '**/*.ts.map'],
//       dot: true,
//       followSymbolicLinks: true,
//     }) || [];

//   return filterFiles;
// };

const syslink = (sourceDir, targetDir) => {
  const files = fs.readdirSync(`${sourceDir}`, { withFileTypes: true });

  const sourcePath = path.resolve(sourceDir);
  const targetPath = path.resolve(targetDir);

  files
    .filter((file) => {
      return file.isSymbolicLink();
    })
    .forEach((file) => {
      const sourceLinkPath = `${targetPath}/${file.name}`;

      console.log(`开始link ${sourceLinkPath}`); // 输出文件夹名称

      let linkInfo = fs.readlinkSync(`${sourceLinkPath}`, {});
      linkInfo = linkInfo.replace(`${sourcePath}/`, '');

      const targetLinkPath = `${targetPath}/${linkInfo}`;
      console.log(`link:${sourceLinkPath}->${targetLinkPath}`);

      fs.rmSync(sourceLinkPath, { recursive: true, force: true });

      fs.symlinkSync(targetLinkPath, sourceLinkPath);
    });
};

const move = (dirfile) => {
  const dir = `${dirfile.parentPath}${dirfile.name}`;
  const jsonData = JSON.parse(
    fs.readFileSync(`${dir}/package.json`).toString('utf-8'),
  );
  const name = jsonData.name;

  //目标文件夹，没有则创建
  const destDir = `../src-tauri/binaries/${name}`;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const moveFiles = [];

  const appExes = copyAppExe(name, dirfile.name);

  // pkg.assets 匹配的文件
  const assets = matchAssets(jsonData.pkg.assets || [], dirfile.name);
  moveFiles.push(...assets);

  copyFiles(moveFiles);

  const depts = jsonData.dependencies || {};
  console.log(depts);

  const dep_entry = Object.entries(depts);
  if (dep_entry.length > 0) {
    fs.rmSync(
      `${destDir}/node_modules`,
      { recursive: true, force: true },
      (e) => {
        console.error(`${e}`);
      },
    );
    //移动 node_modules
    fs.cpSync(`${dir}/node_modules`, `${destDir}/node_modules`, {
      recursive: true,
    });
    syslink(`${dir}/node_modules`, `${destDir}/node_modules`);
  }
};

//获取下面的目录 目录里面有文件package.json
const files = fs.readdirSync('./', { withFileTypes: true });
files
  .filter((file) => {
    if (!file.isDirectory()) {
      return false;
    }
    return fs.existsSync(`${file.parentPath}${file.name}/package.json`);
  })
  .forEach((file) => {
    console.log(`开始复制迁移 ${file.parentPath}${file.name}`); // 输出文件夹名称
    // const filter = readDirRecursivel(`${file.parentPath}${file.name}`);
    // console.log(filter);
    move(file);
  });
