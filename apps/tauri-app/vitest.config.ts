import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

const vitestConfig = defineConfig({
  test: {
    pool: "threads",
    // environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    css: true,
    browser: {
      provider: "playwright",
      headless: true,
      // enabled: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
  },
});

export default mergeConfig(viteConfig, vitestConfig);
