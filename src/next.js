import fs from "fs";
import path from "path";
import * as tsImport from "ts-import";

export function withTypedHandlers(config) {
  if (process.env.NODE_ENV === "production") {
    console.log("Production mode");
  } else {
    console.log("Development mode");
    routeGen();
  }

  return config;
}

async function routeGen() {
  let srcDir;
  let relativeSrcDir;
  const possiblePaths = ["/app", "/src/app"];

  for (const p of possiblePaths) {
    const dir = path.join(process.cwd(), p);
    if (fs.existsSync(dir)) {
      srcDir = dir;
      relativeSrcDir = p;
      break;
    }
  }

  if (!srcDir) {
    throw new Error("typed-handlers: could not determine source directory");
  }

  // find all files in the srcDir that match the pattern route.ts
  const files = fs.readdirSync(srcDir, { recursive: true });
  const routes = files.filter((file) => file.match(/route.ts$/));

  console.log("Routes:", routes);
  const routesConfig = {};

  await Promise.all(
    routes.map(async (route) => {
      const routePath = route.replace(srcDir, "").replace(/\/route.ts$/, "");
      console.log("Route path:", path.join(relativeSrcDir, route));
      const module = await tsImport.load(
        path.join(relativeSrcDir, route).replace(/\\/g, "/"),
        {}
      );
      console.log("Module:", module);
      routesConfig[routePath] = { page: routePath };
    })
  );

  console.log("Routes config:", routesConfig);
}
