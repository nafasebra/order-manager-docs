import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            /node_modules[\\/]react(?:-dom)?[\\/]/.test(id) ||
            /node_modules[\\/]scheduler[\\/]/.test(id)
          )
            return "react-vendor";
          if (
            /node_modules[\\/]@tanstack[\\/](react-router|router-core|history|react-query|query-core)[\\/]/.test(
              id,
            )
          )
            return "data-vendor";
        },
      },
    },
  },
});
