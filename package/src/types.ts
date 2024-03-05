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
  input?: z.ZodObject<TInput>;
  query?: z.ZodObject<TQuery>;
  output?: z.ZodObject<TOutput>;
};

export type RouteParams<K extends string> =
  K extends `/${infer Prefix}/${infer Rest}`
    ? Prefix extends `[${infer Param}]`
      ? {
          [key in Param | keyof RouteParams<`/${Rest}/`>]: string;
        }
      : Rest extends `/[${infer Param}]`
      ? {
          [key in Param]: string;
        }
      : RouteParams<`/${Rest}`>
    : K extends `/${infer Rest}`
    ? Rest extends `[${infer Param}]`
      ? {
          [key in Param]: string;
        }
      : {}
    : {};
