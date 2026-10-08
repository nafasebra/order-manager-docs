import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/auth/**",
        "src/mocks/mutations.ts",
        "src/mocks/store.ts",
        "src/lib/router/**",
        "src/lib/permissions/**",
        "src/lib/api/sellerCommerce.ts",
        "src/hooks/useListQuery.ts",
      ],
      exclude: ["**/*.test.*"],
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
