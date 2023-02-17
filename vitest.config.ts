import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "dist-test/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    testTimeout: 30000,
  },
});