import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/next.ts"],
    format: ["cjs"],
    external: ["typed-handlers"],
    external: ["typed-handlers"],
    dts: true,
  },
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
  },
]);
