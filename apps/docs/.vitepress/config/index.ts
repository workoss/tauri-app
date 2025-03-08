import { defineConfig } from "vitepress";
import { vitepressDemoPlugin } from "vitepress-demo-plugin";
import path, { dirname } from "path";
import mdx from "@mdx-js/rollup";
import { shared } from "./shared";
import { zh } from "./zh";

function fileURLToPath(fileURL: string) {
  let filePath = fileURL;
  if (process.platform === "win32") {
    filePath = filePath.replace(/^file:\/\/\//, "");
    filePath = decodeURIComponent(filePath);
    filePath = filePath.replace(/\//g, "\\");
  } else {
    filePath = filePath.replace(/^file:\/\//, "");
    filePath = decodeURIComponent(filePath);
  }
  console.log("filePath", filePath);
  return filePath;
}

const srcMain = `import { createApp } from "vue";
import Demo from "./Demo.vue";
import 'element-plus/dist/index.css'

const app = createApp(Demo);
app.mount("#app");`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...shared,
  locales: {
    root: {
      label: "简体中文",
      lang: "zh",
      ...zh,
    },
    en: {
      label: "English",
      lang: "en-US",
      title: "workoss doc",
      description: "Documentation site",
    },
  },
  markdown: {
    config: (md) => {
      //md 支持 typst
      md.use(vitepressDemoPlugin, {
        demodir: path.resolve(
          dirname(fileURLToPath(import.meta.url)),
          "../demos",
        ),
        stackblitz: {
          show: true,
          templates: [
            {
              scope: "element",
              files: {
                "src/main.ts": srcMain,
              },
            },
          ],
        },
        codesandbox: {
          show: false,
          templates: [
            {
              scope: "element",
              files: {
                "src/main.ts": srcMain,
              },
            },
          ],
        },
        //
      });
    },
  },

  vite: {
    plugins: [
      // mdx({
      //   providerImportSource: "", // 禁用 React 依赖
      //   jsxRuntime: "classic", // 启用 Vue 运行时支持
      // }),
    ],
  },
});
