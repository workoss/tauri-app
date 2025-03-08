import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { resolve } from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  html: {
    template: "./index.html",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/main.tsx",
    },
    define: {
      OS_ARCH: `"${process.arch}"`,
      OS_PLATFORM: `"${process.platform}"`,
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host,
    open: false,
    cors: true,
    publicDir: {
      name: "./public",
    },
  },
  environments: {},
  dev: {
    hmr: true,
    watchFiles: [
      {
        paths: ["./src"],
      },
    ],
  },
  output: {
    distPath: {
      root: "./dist",
      js: "js/",
      jsAsync: "js/",
      css: "css/",
      svg: "svg/",
    },
    cleanDistPath: "auto",
    filenameHash: true,
    minify: !process.env.TAURI_DEBUG,
    sourceMap: !!process.env.TAURI_DEBUG,
  },
  performance: {
    chunkSplit: {
      strategy: "custom",
      splitChunks: {
        cacheGroups: {
          react: {
            test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: "react-vendor",
            chunks: "all",
            maxSize: 4096,
          },
          i18next: {
            test: /node_modules[\\/](i18next|react-i18next)[\\/]/,
            name: "i18n-vendor",
            chunks: "all",
            maxSize: 4096,
          },
          antd: {
            test: /node_modules[\\/](@ant-design|antd|antd-style)[\\/]/,
            name: "antd-vendor",
            chunks: "all",
          },
          utils: {
            test: /node_modules[\\/](axios|dayjs)[\\/]/,
            name: "utils-vendor",
            chunks: "all",
          },
        },
      },
    },
    printFileSize: true,
    removeConsole: false,
    bundleAnalyze: {
      // analyzerMode: "static",
      // openAnalyzer: false,
      // reportFilename: `${resolve(__dirname, "src")}/../dist/report.html`,
      // defaultSizes: "gzip",
    },
  },
});
