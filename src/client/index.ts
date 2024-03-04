import { ZodObject, ZodRawShape, z } from "zod";
import { RouteParams, Schema } from "../types";

declare global {
  interface RoutesConfig {}
}

export async function post<
  K extends keyof RoutesConfig,
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  route: RoutesConfig[K] extends {} ? K : never,
  options: Omit<RequestInit, "body" | "method"> & {
    schema: Schema<TInput, TQuery, RouteParams<K>, TOutput>;
  } & keyof RouteParams<K> extends never
    ? {
        body: z.infer<ZodObject<TInput>>;
        query: z.infer<ZodObject<TQuery>>;
        schema: Schema<TInput, TQuery, RouteParams<K>, TOutput>;
      }
    : {
        body: z.infer<ZodObject<TInput>>;
        query: z.infer<ZodObject<TQuery>>;
        params: RouteParams<K>;
        schema: Schema<TInput, TQuery, RouteParams<K>, TOutput>;
      }
) {
  return fetch(route, {
    ...options,
    method: "post",
    body: JSON.stringify(options.body),
  });
}
