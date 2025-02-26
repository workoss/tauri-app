import { defineConfig } from "vitepress";
import { vitepressDemoPlugin } from "vitepress-demo-plugin";
import path, { dirname } from "path";

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
  return filePath;
}

const srcMain = `import { createApp } from "vue";
import Demo from "./Demo.vue";
import 'element-plus/dist/index.css'

const app = createApp(Demo);
app.mount("#app");`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "workoss app",
  description: "A Docs Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },

  markdown: {
    config: (md) => {
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
    plugins: [],
  },
});
