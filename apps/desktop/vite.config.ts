import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";

const directory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(directory, "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: "react-native-web" },
      { find: "@lich-oi/core", replacement: path.resolve(workspaceRoot, "packages/core/src/index.ts") },
      { find: "@lich-am/ui", replacement: path.resolve(workspaceRoot, "packages/ui/src/index.ts") },
    ],
    dedupe: ["react", "react-dom", "react-native-web"],
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    fs: {
      allow: [searchForWorkspaceRoot(directory)],
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
  },
});
