import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { open: "/dashboard/" },
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
