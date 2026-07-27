import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// тесты гоняют чистые модули из src/utils, поэтому нужен только алиас ~
export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
