import { defineConfig } from "vitepress";
// import mdx from "@mdx-js/rollup";

export const shared = defineConfig({
  title: "workoss app",
  description: "workoss app",

  rewrites: {},

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: "/vitepress-logo-mini.svg" },
    ],
    [
      "link",
      { rel: "icon", type: "image/png", href: "/vitepress-logo-mini.png" },
    ],
    ["meta", { name: "theme-color", content: "#5f67ee" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh-CN" }],
    ["meta", { property: "og:title", content: "Workoss | Workoss Docs" }],
    ["meta", { property: "og:site_name", content: "Workoss App" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://vitepress.dev/vitepress-og.jpg",
      },
    ],
    ["meta", { property: "og:url", content: "https://workoss.com/" }],
    // ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
  ],

  sitemap: {
    hostname: "https://workoss.com",
    transformItems(items) {
      return items.filter((item) => !item.url.includes("migration"));
    },
  },

  themeConfig: {
    logo: { src: "/vitepress-logo-mini.svg", width: 24, height: 24 },

    socialLinks: [
      { icon: "github", link: "https://github.com/workoss/workoss-app" },
    ],

    search: {
      provider: "local",
    },
  },

  markdown: {
    math: true,
    codeTransformers: [
      // [!!code
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, "[!code");
        },
      },
    ],

    config(md) {
      const fence = md.renderer.rules.fence!;
      md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const { localeIndex = "root" } = env;
        const codeCopyButtonTitle = (() => {
          switch (localeIndex) {
            case "zh":
              return "复制代码";
            default:
              return "Copy code";
          }
        })();
        return fence(tokens, idx, options, env, self).replace(
          '<button title="Copy Code" class="copy"></button>',
          `<button title="${codeCopyButtonTitle}" class="copy"></button>`,
        );
      };
      //   md.use(groupIconMdPlugin);
    },
  },

  vite: {
    plugins: [
      // {
      //   enforce: "pre",
      //   ...mdx({
      //     jsxRuntime: "automatic",
      //     jsx: true,
      //     //   providerImportSource: "@mdx-js/react",
      //     jsxImportSource: "react",
      //   }),
      // },
    ],
  },
});
