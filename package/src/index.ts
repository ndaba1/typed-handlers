import type { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodObject, ZodRawShape, z } from "zod";
import { Awaitable, RouteParams, Schema } from "./types";

export function schema<
  TInput extends z.ZodRawShape = {},
  TQuery extends z.ZodRawShape = {},
  TOutput extends z.ZodRawShape = {}
>(schema: Schema<TInput, TQuery, TOutput>) {
  return schema;
}

export function handler<
  K extends keyof RoutesConfig,
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  handler: (args: {
    request: Request;
    context: { params: { [key: string]: string } };
    body: z.infer<ZodObject<TInput>>;
    query: z.infer<ZodObject<TQuery>>;
    params: RouteParams<K>;
  }) => Awaitable<NextResponse<z.infer<ZodObject<TOutput>>>> | Response,
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
    request: NextRequest,
    context: { params: { [key: string]: string } }
  ) => {
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

    if (schema.input) {
      try {
        body = schema.input.parse(initBody);
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

function handleError(
  error: ZodError,
  {
    source,
    message,
    onValidationError,
  }: {
    source: "body" | "query";
    message?: string;
    onValidationError?: (args: {
      source: "body" | "query";
      error: ZodError;
    }) => Awaitable<NextResponse> | Response;
  }
) {
  if (onValidationError) {
    return onValidationError({ source, error });
  }

  const { fieldErrors } = error.flatten();
  const firstField = Object.keys(fieldErrors)[0];

  return Response.json(
    {
      message: message ?? "Request validation failed",
      description: firstField
        ? fieldErrors[firstField]?.[0]
        : "An error occurred",
    },
    {
      status: 400,
    }
  );
}
