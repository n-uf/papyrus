import { defineConfig } from "vitest/config";

/**
 * Base Vitest configuration for all packages.
 * Extend this in package-specific vitest.config.ts files.
 */
export default defineConfig({
  test: {
    globals: true,
    include: [
      "src/**/*.test.{ts,tsx}",
      "src/**/__tests__/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "coverage",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/index.ts",
        "**/__mocks__/**",
        "**/types.ts",
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    passWithNoTests: true,
  },
});
