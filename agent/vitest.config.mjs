import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  plugins: [tsconfigPaths()]
});
