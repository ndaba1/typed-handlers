import { NextConfig } from "next";
import { ZodRawShape } from "zod";
import { RouteParams, Schema } from "./types";

export function schema<
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TParams extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  schema: Schema<TInput, TQuery, TParams, TOutput>
): Schema<TInput, TQuery, TParams, TOutput>;

export function schema<
  K extends keyof RoutesConfig,
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  path: K,
  schema: Schema<TInput, TQuery, RouteParams<K>, TOutput>
): Schema<TInput, TQuery, RouteParams<K>, TOutput>;

export function schema(pathOrSchema: any, schema?: any) {
  if (schema) {
    return schema;
  } else {
    return pathOrSchema;
  }
}

export function withTypedHandlers(config: NextConfig) {
  if (process.env.NODE_ENV === "production") {
    console.log("Production mode");
  } else {
    console.log("Development mode");
  }

  return config;
}
