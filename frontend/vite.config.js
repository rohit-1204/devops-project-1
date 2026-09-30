import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",

    coverage: {
      provider: "v8",

      reporter: [
        "text",
        "html",
        "lcov"
      ],

      exclude: [
        "src/main.jsx",
        "src/api/todoApi.js",
        "vite.config.js"
      ],

      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95
      }
    }
  }
});
