import type { z } from "zod";

declare global {
  interface RoutesConfig {}
}

export type Awaitable<T> = T | Promise<T>;

export type Schema<
  TInput extends z.ZodRawShape = {},
  TQuery extends z.ZodRawShape = {},
  TOutput extends z.ZodRawShape = {}
> = {
  body?: z.ZodObject<TInput>;
  query?: z.ZodObject<TQuery>;
  output?: z.ZodObject<TOutput>;
};

export type ParamType<T extends string> = T extends `...${infer Param}`
  ? {
      [key in Param]: string[];
    }
  : {
      [key in T]: string;
    };

export type RouteParams<K extends string> =
  K extends `/${infer Prefix}/${infer Rest}`
    ? Prefix extends `[${infer Param}]`
      ? Param extends `...${infer InnerParam}`
        ? {
            [key in InnerParam | keyof RouteParams<`/${Rest}/`>]: string[];
          }
        : {
            [key in Param | keyof RouteParams<`/${Rest}/`>]: string;
          }
      : Rest extends `/[${infer Param}]`
      ? ParamType<Param>
      : RouteParams<`/${Rest}`>
    : K extends `/${infer Rest}`
    ? Rest extends `[[${infer Param}]]`
      ? { [key in keyof ParamType<Param>]?: string[] }
      : Rest extends `[${infer Param}]`
      ? ParamType<Param>
      : {}
    : {};
