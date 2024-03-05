import fs from "fs";
import type { NextConfig } from "next";
import path from "path";
import { logger } from "./utils";

export function withTypedHandlers(
  config: NextConfig,
  {
    legacy,
  }: {
    legacy?: boolean;
  } = {}
) {
  // load src directory
  const possiblePaths = legacy
    ? ["/src/pages", "/pages"]
    : ["/src/app", "/app"];

  const srcDir = possiblePaths
    .map((p) => path.join(process.cwd(), p))
    .find((path) => fs.existsSync(path));

  if (!srcDir) {
    throw new Error("typed-handlers: could not determine source directory");
  }

  if (process.env.NODE_ENV === "production") {
    generateRoutes({ src: srcDir, legacy });
  } else {
    generateRoutes({ src: srcDir, legacy });

    // watch for changes
    fs.watch(srcDir, { recursive: true }, (_event, filename) => {
      logger(`file ${filename} has been changed`);
      generateRoutes({ src: srcDir, legacy });
    });
  }

  return config;
}

function generateRoutes({ src, legacy }: { src: string; legacy?: boolean }) {
  const routes: string[] = [];
  const routesConfig: Record<string, {}> = {};

  if (legacy) {
    const apiDir = path.join(src, "api");
    const files = fs.readdirSync(apiDir, { recursive: true });
    files.forEach((file) => {
      if (typeof file === "string") {
        routes.push(file);
      }
    });
  } else {
    const files = fs.readdirSync(src, { recursive: true });
    files.forEach((file) => {
      if (typeof file === "string") {
        const lastSegment = file.replace(/\\/g, "/").split("/").pop();
        if (/^route\.(ts|js)$/.test(lastSegment || ""))
          routes.push(file.replace(/route\.(ts|js)/, ""));
      }
    });
  }

  routes.forEach((route) => {
    routesConfig[`/${route.replace(/\\/g, "/").replace(/\/$/, "")}`] = {};
  });

  logger(`generating routes config`, { routes, routesConfig });

  writeTypeDefs(routesConfig);
}

function writeTypeDefs(routesConfig: Record<string, {}>) {
  const nodeModulePath = path.dirname(require.resolve("typed-handlers"));
  const writeRelative = (p: string, content: string) =>
    fs.writeFileSync(path.join(nodeModulePath, p), content, "utf-8");

  const routesDeclaration = `declare global {
    interface RoutesConfig ${
      Object.keys(routesConfig).length > 0
        ? JSON.stringify(routesConfig, null, 2)
        : ""
    }
  }\nexport {}`.trim();

  writeRelative("routes.d.ts", `${routesDeclaration}`);

  // generate typed-handlers.d.ts
  updateTsConfig();
}

function updateTsConfig() {
  const fExists = (p: string) => fs.existsSync(path.join(process.cwd(), p));
  const fRead = (p: string) =>
    fs.readFileSync(path.join(process.cwd(), p), "utf-8");
  const fWrite = (p: string, content: string) =>
    fs.writeFileSync(path.join(process.cwd(), p), content, "utf-8");

  if (!fExists("typed-handlers.d.ts")) {
    fWrite(
      "typed-handlers.d.ts",
      "/// <reference types='typed-handlers/routes' />\n"
    );
  }

  if (fExists("tsconfig.json")) {
    const tsconfig = JSON.parse(fRead("tsconfig.json"));

    if (!tsconfig.include) {
      tsconfig.include = [];
    }

    if (!tsconfig.include.includes("typed-handlers.d.ts")) {
      tsconfig.include.push("typed-handlers.d.ts");
      fWrite("tsconfig.json", JSON.stringify(tsconfig, null, 2));
    }
  }
}
