import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    external: ["next", "zod"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/legacy.ts"],
    format: ["cjs", "esm"],
    external: ["next", "zod"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/next.ts"],
    format: ["cjs"],
    external: ["typed-handlers"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ["src/client/index.ts"],
    outDir: "dist/client",
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
  },
]);
