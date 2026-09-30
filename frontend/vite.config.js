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
      reporter: ["text", "html", "lcov"],

      thresholds: {
        lines: 91,
        functions: 91,
        branches: 91,
        statements: 91
      }
    }
  }
});
