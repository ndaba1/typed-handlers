import type { NextResponse } from "next/server";
import type { z } from "zod";

declare global {
  interface RoutesConfig {}
}

export type Awaitable<T> = T | Promise<T>;
export type NextContext = {
  params: Record<string, string | string[]>;
};
export type ValidationFunction<T extends z.ZodType> = (args: {
  source: "body" | "query";
  error: z.ZodError;
}) => Awaitable<NextResponse<z.output<T>> | Response>;
export type HandlerFunction<TOutput extends z.ZodType> = Awaitable<
  NextResponse<z.output<TOutput>> | Response
>;

export type Schema<
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
> = {
  body?: TInput;
  query?: TQuery;
  output?: TOutput;
  error?: TError;
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

export type Result<
  R extends Response,
  TData extends z.ZodType,
  TError extends z.ZodType
> =
  | {
      success: true;
      data: z.infer<TData>;
      response: R;
    }
  | {
      success: false;
      error: z.infer<TError>;
      response: R;
    };

export type RefinedRequestInit<
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
> = Omit<RequestInit, "method" | "body"> & {
  schema: Schema<TInput, TQuery, TOutput, TError>;
  query?: z.output<TQuery>;
};

export type RefinedRequestInitWithBody<
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
> = Omit<RequestInit, "method" | "body"> & {
  body: z.output<TInput>;
  schema: Schema<TInput, TQuery, TOutput, TError>;
  query?: z.output<TQuery>;
};
