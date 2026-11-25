import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Classic (non-module) <script src> tags are not bundled by Vite, so copy them to dist as-is.
const CLASSIC_SCRIPTS = [
  "shared/account.js",
  "shared/avatar-colors.js",
  "shared/clock-panel.js",
  "shared/top-clock.js",
  "shared/date-picker.js",
  "shared/dropdown.js",
  "shared/menu-search.js",
  "shared/time-off-store.js",
  "shared/topbar.js",
  "dashboard/dashboard.js",
  "timeoff/timeoff.js",
  "timesheets/timesheets.js",
];
const copyClassicScripts = () => ({
  name: "copy-classic-scripts",
  apply: "build",
  closeBundle() {
    for (const file of CLASSIC_SCRIPTS) {
      const to = resolve(import.meta.dirname, "dist", file);
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(resolve(import.meta.dirname, file), to);
    }
  },
});

export default defineConfig({
  plugins: [react(), copyClassicScripts()],
  server: { open: "/dashboard/" },
  optimizeDeps: { exclude: ["maplibre-gl"] }, // keep its worker import resolvable
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(import.meta.dirname, "dashboard/index.html"),
        timesheets: resolve(import.meta.dirname, "timesheets/index.html"),
        timeoff: resolve(import.meta.dirname, "timeoff/index.html"),
      },
    },
  },
});
