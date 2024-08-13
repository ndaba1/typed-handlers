import { z } from "zod";
import { RouteParams, SearchParamsInit } from "./types";

export type Params<K extends keyof RoutesConfig> = RouteParams<K>;

export function handle<K extends keyof RoutesConfig, S extends z.ZodType>(
  path: K,
  options: {
    query?: SearchParamsInit;
    params?: RouteParams<K>;
    bodySchema?: S;
  } = {}
) {
  return {
    url: generateEndpoint(path, {
      params: options.params,
      query: options.query,
    }),
    body: (body: z.output<S>) => body,
  };
}

function generateEndpoint<K extends keyof RoutesConfig>(
  route: K,
  { params, query }: { params?: RouteParams<K>; query?: SearchParamsInit }
): string {
  let path = route as string;
  Object.keys(params ?? {}).forEach((key) => {
    const value = params?.[key as keyof RouteParams<K>] as string | string[];
    if (typeof value === "string") {
      path = path.replace(new RegExp(`\\[${key}\\]`, "g"), value as string);
    } else {
      path = path
        .replace(/$\//, "")
        .replace(
          new RegExp(`\\[\\[...${key}\\]\\]`, "g"),
          (value as string[]).join("/")
        )
        .replace(
          new RegExp(`\\[...${key}\\]`, "g"),
          (value as string[]).join("/")
        );
    }
  });

  if (query) {
    const searchParams = new URLSearchParams(query);
    const queryString = searchParams.toString();
    path = `${path}?${queryString}`;
  }

  return path;
}
