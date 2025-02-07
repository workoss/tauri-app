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
      root: "../dist",
      js: "assets/",
      jsAsync: "assets/",
      css: "assets/",
      svg: "assets/",
    },
    cleanDistPath: false,
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
          },
          antd: {
            test: /node_modules[\\/](@ant-design|antd)[\\/]/,
            name: "antd-vendor",
            chunks: "all",
          },
          charts: {
            test: /node_modules[\\/](echarts|@antv)[\\/]/,
            name: "charts-vendor",
            chunks: "all",
          },
          utils: {
            test: /node_modules[\\/](axios|dayjs|lodash)[\\/]/,
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
