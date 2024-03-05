import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { NextResponse } from "next/server";
import { ZodError, ZodObject, ZodRawShape, z } from "zod";
import { Awaitable, RouteParams, Schema } from "./types";
import { handleError } from "./utils";

export function createHandler<
  K extends keyof RoutesConfig,
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  handler: (args: {
    request: Omit<NextApiRequest, keyof z.infer<ZodObject<TInput>>> &
      z.infer<ZodObject<TInput>>;
    response: NextApiResponse<z.infer<ZodObject<TOutput>>>;
    body: z.infer<ZodObject<TInput>>;
    query: z.infer<ZodObject<TQuery>>;
    params: RouteParams<K>;
  }) => ReturnType<NextApiHandler>,
  {
    schema,
    onValidationError,
  }: {
    path?: K;
    schema: Schema<TInput, TQuery, TOutput>;
    onValidationError?: (args: {
      source: "body" | "query";
      error: ZodError;
    }) => Awaitable<NextResponse> | Response;
  }
) {
  return async (
    request: Omit<NextApiRequest, keyof z.infer<ZodObject<TInput>>> &
      z.infer<ZodObject<TInput>>,
    response: NextApiResponse<z.infer<ZodObject<TOutput>>>
  ) => {
    let body: any = {};
    let query: any = {};
    let params: any = {};

    const initQuery = request.query;
    const initBody = request.body ?? {};

    if (schema.body) {
      try {
        body = schema.body.parse(initBody);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleError(error, {
            source: "body",
            onValidationError,
            message: "Invalid request body",
          });
        }
      }
    }

    if (schema.query) {
      try {
        query = schema.query.parse(initQuery);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleError(error, {
            source: "query",
            onValidationError,
            message: "Invalid query parameters",
          });
        }
      }
    }

    params = (initQuery ?? {}) as RouteParams<K>;

    return handler({ request, response, body, query, params });
  };
}
