import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./widget-src/test-setup.ts"],
    include: ["widget-src/**/*.test.ts"],
    typecheck: {
      tsconfig: "./widget-src/tsconfig.test.json",
    },
  },
});
