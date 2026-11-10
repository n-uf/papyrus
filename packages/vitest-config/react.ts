import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./base.ts";

/**
 * Vitest configuration for React packages.
 * Includes happy-dom environment and React Testing Library setup.
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: "happy-dom",
      setupFiles: ["./test-setup.ts"],
    },
  })
);
