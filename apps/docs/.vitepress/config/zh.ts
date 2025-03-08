import { createRequire } from "module";
import { defineConfig, type DefaultTheme } from "vitepress";

const require = createRequire(import.meta.url);
// const pkg = require("../../../package.json");

export const zh = defineConfig({
  lang: "zh",
  description: "文档站点",

  themeConfig: {
    nav: [
      { text: "主页", link: "/zh" },
      { text: "示例", link: "/zh/markdown-examples" },
    ],

    sidebar: [
      {
        text: "示例",
        items: [
          { text: "Markdown 示例", link: "/zh/markdown-examples" },
          { text: "Runtime API 示例", link: "/zh/api-examples" },
        ],
      },
    ],

    editLink: {
      pattern:
        "https://github.com/workoss/workoss-app/edit/main/apps/docs/:path",
      text: "在 GitHub 上编辑此页面",
    },

    footer: {
      message: "基于 MIT 许可",
      copyright: `版权所有 © 2024-${new Date().getFullYear()} workoss`,
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    outline: {
      label: "目录",
    },

    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到白色主题",
    darkModeSwitchTitle: "切换到黑色主题",
    skipToContentLabel: "跳转到内容",

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            displayDetails: "显示搜索结果",
            resetButtonTitle: "清除",
            backButtonTitle: "返回",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
              selectKeyAriaLabel: "按Enter选择",
            },
            noResultsText: "无法找到相关结果",
          },
        },
      },
    },
  },
});
