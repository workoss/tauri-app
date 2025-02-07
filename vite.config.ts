import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
// import { assert } from "console";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  // root: "src",
  publicDir: "./public",

  plugins: [
    react({
      tsDecorators: true,
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    open: false,
    cors: true,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    envPrefix: ["VITE_", "TAURI_ENV_*"],
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      assetsDir: "assets",
      assetsInlineLimit: 4096, // 4kb
      cssCodeSplit: true,
      // Tauri uses Chromium on Windows and WebKit on macOS and Linux
      // target:
      //   process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: false,
          drop_debugger: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "antd-vendor": ["antd", "@ant-design/icons"],
            "chart-vendor": ["@ant-design/plots"],
            "utils-vendor": ["axios", "dayjs", "lodash"],
          },

          entryFileNames: "js/[name].[hash].js",
          chunkFileNames: "js/[name].[hash].js",
          assetFileNames: "[ext]/[name].[hash].[ext]",
        },
      },
    },
    // brotli 压缩报告
    brotliSize: false,
    // chunk kbs 警告
    chunkSizeWarningLimit: 2000,

    define: {
      OS_ARCH: `"${process.arch}"`,
      OS_PLATFORM: `"${process.platform}"`,
    },
  },
}));
