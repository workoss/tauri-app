# node sea

> link [single-executable-applications](https://nodejs.org/api/single-executable-applications.html#single-executable-applications)

## example

1. js

```sh
echo 'console.log(`Hello, ${process.argv[2]}!`);' > hello.js
```

2. 配置文件(blob相关配置)

```sh
echo '{ "main": "hello.js", "output": "sea-prep.blob" }' > sea-config.json
```

3. 生成要注入的blob

```sh
node --experimental-sea-config sea-config.json
```

4. 生成可执行文件副本

mac/linux

```sh
cp $(command -v node) hello
```

windows

```powershell
node -e "require('fs').copyFileSync(process.execPath, 'hello.exe')"
```

5. 删除二进制签名

macos

```sh
codesign --remove-signature hello
```

windows

```sh
codesign --remove-signature hello
```

6. postject通过使用以下选项运行将 blob 注入到复制的二进制文件中

macos

```sh
npx postject hello NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
```

linux

```sh
npx postject hello NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
```

windows

```powershell
npx postject hello.exe NODE_SEA_BLOB sea-prep.blob `
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
```

7. 对二进制文件进行签名

macos

```sh
codesign --sign - hello
```

windows

```powershell
signtool sign /fd SHA256 hello.exe
```

8. 运行

macos/linux

```sh
./hello world
```

windows

```powershell
.\hello.exe world
```

配置参考

```json
{
  "main": "/path/to/bundled/script.js",
  "output": "/path/to/write/the/generated/blob.blob",
  "disableExperimentalSEAWarning": true, // Default: false
  "useSnapshot": false, // Default: false
  "useCodeCache": true, // Default: false
  "assets": {
    // Optional
    "a.dat": "/path/to/a.dat",
    "b.txt": "/path/to/b.txt"
  }
}
```

js 中使用

```js
const { getAsset, getAssetAsBlob, getRawAsset } = require('node:sea');
// Returns a copy of the data in an ArrayBuffer.
const image = getAsset('a.jpg');
// Returns a string decoded from the asset as UTF8.
const text = getAsset('b.txt', 'utf8');
// Returns a Blob containing the asset.
const blob = getAssetAsBlob('a.jpg');
// Returns an ArrayBuffer containing the raw asset without copying.
const raw = getRawAsset('a.jpg');
```
