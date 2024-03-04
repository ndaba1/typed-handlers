import { ZodObject, ZodRawShape } from "zod";

export type Schema<
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TParams extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
> = {
  input?: ZodObject<TInput>;
  query?: ZodObject<TQuery>;
  output?: ZodObject<TOutput>;
  params?: ZodObject<TParams>;
};

export type RouteParams<K extends string> =
  K extends `/${infer Prefix}/${infer Rest}`
    ? Prefix extends `[${infer Param}]`
      ? {
          [key in Param | keyof RouteParams<`/${Rest}/`>]: string;
        }
      : RouteParams<`/${Rest}`>
    : {};

type _ = RouteParams<"/api/[name]/hello/[id]/[again]">;
//   ^?
