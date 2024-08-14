import fs from "fs";
import type { NextConfig } from "next";
import path from "path";

const logger = (...args: any[]) => {
  if (process.env.TYPED_HANDLERS_DEBUG_MODE === "true") {
    console.log("typed-handlers:", ...args);
  }
};

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
        routes.push(file.replace(/.(ts|js)$/, ""));
      }
    });
  } else {
    const isPrivate = (file: string) => {
      const segments = file.replace(/\\/g, "/").split("/");
      const hasPrivateFolder = segments.some((segment) =>
        segment.startsWith("_")
      );

      return hasPrivateFolder;
    };

    const files = fs.readdirSync(src, { recursive: true });
    files
      .filter((file) => !isPrivate(file as string))
      .forEach((file) => {
        if (typeof file === "string") {
          const lastSegment = file.replace(/\\/g, "/").split("/").pop();
          if (/^route\.(ts|js)$/.test(lastSegment || "")) {
            routes.push(
              file
                .replace(/\\/g, "/")
                // ignore route.ts
                .replace(/route\.(ts|js)/, "")
                // ignore paranthesis ()
                .replace(/\([\w]+\)\//, "")
            );
          }
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

  const routesDeclaration = `
declare global {
\tinterface RoutesConfig ${JSON.stringify(routesConfig, null, 4).replace(
    /\}$/,
    "\t}"
  )}
}\n\nexport {};
`.trim();

  writeRelative("routes.d.ts", `${routesDeclaration}`);
  updateTsConfig();
}

function updateTsConfig() {
  const fExists = (p: string) => fs.existsSync(path.join(process.cwd(), p));
  const fRead = (p: string) =>
    fs.readFileSync(path.join(process.cwd(), p), "utf-8");
  const fWrite = (p: string, content: string) =>
    fs.writeFileSync(path.join(process.cwd(), p), content, "utf-8");

  if (!fExists("routes-env.d.ts")) {
    fWrite(
      "routes-env.d.ts",
      "/// <reference types='typed-handlers/routes' />\n"
    );
  }

  if (fExists("tsconfig.json")) {
    const tsconfig = JSON.parse(fRead("tsconfig.json"));

    if (!tsconfig.include) {
      tsconfig.include = [];
    }

    if (!tsconfig.include.includes("routes-env.d.ts")) {
      tsconfig.include.push("routes-env.d.ts");
      fWrite("tsconfig.json", JSON.stringify(tsconfig, null, 2));
    }
  }
}
