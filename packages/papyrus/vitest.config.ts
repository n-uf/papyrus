import baseConfig from "@n-uf/vitest-config/base";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, defineConfig({ test: { name: "papyrus" } }));
