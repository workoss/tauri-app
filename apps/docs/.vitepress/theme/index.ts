// https://vitepress.dev/guide/custom-theme
// import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "docs-theme/theme/mocha/mauve.css";
import ElementPlus from "element-plus"; // 引入组件库
import "element-plus/dist/index.css"; // 引入样式

export default {
  extends: DefaultTheme,
  // Layout: () => {
  //   return h(DefaultTheme.Layout, null, {
  //     // https://vitepress.dev/guide/extending-default-theme#layout-slots
  //   });
  // },
  enhanceApp({ app, router, siteData }) {
    // ...
    app.use(ElementPlus);
  },
} satisfies Theme;
