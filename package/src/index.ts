import type { NextRequest } from "next/server";
import { ZodError, z } from "zod";
import {
  HandlerFunction,
  NextContext,
  RouteParams,
  Schema,
  ValidationFunction,
} from "./types";
import { handleError } from "./utils";

export function schema<
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(schema: Schema<TInput, TQuery, TOutput, TError>) {
  return schema;
}

export function createHandler<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  handler: (args: {
    request: Request;
    context: NextContext;
    body: z.output<TInput>;
    query: z.output<TQuery>;
    params: RouteParams<K>;
  }) => HandlerFunction<TOutput>,
  {
    schema,
    onValidationError,
  }: {
    path?: K;
    schema: Schema<TInput, TQuery, TOutput, TError>;
    onValidationError?: ValidationFunction<TError>;
  }
) {
  return async (request: NextRequest, context: NextContext) => {
    let body: any = {};
    let query: any = {};
    let params: any = {};

    const contentType = request.headers.get("content-type");
    const contentLength = request.headers.get("content-length");

    const hasContentLength = contentLength && Number(contentLength) > 0;
    const hasJSONBody = hasContentLength && contentType === "application/json";
    const hasFormBody =
      hasContentLength && contentType === "application/x-www-form-urlencoded";

    const initQuery = request.nextUrl.searchParams;
    const initParams = context.params;
    const initBody = hasJSONBody
      ? await request.json()
      : hasFormBody
      ? Object.fromEntries((await request.formData()).entries())
      : {};

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
        query = schema.query.parse(Object.fromEntries(initQuery.entries()));
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

    params = (initParams ?? {}) as RouteParams<K>;

    return handler({ request, context, body: body, query, params });
  };
}
