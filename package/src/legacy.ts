import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import { RouteParams, Schema, ValidationFunction } from "./types";
import { handleError } from "./utils";

export function createHandler<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  handler: (args: {
    request: Omit<NextApiRequest, keyof z.output<TInput>> & z.output<TInput>;
    response: NextApiResponse<z.output<TOutput>>;
    body: z.output<TInput>;
    query: z.output<TQuery>;
    params: RouteParams<K>;
  }) => ReturnType<NextApiHandler>,
  {
    schema,
    onValidationError,
  }: {
    path?: K;
    schema: Schema<TInput, TQuery, TOutput, TError>;
    onValidationError?: ValidationFunction<TError>;
  }
) {
  return async (
    request: Omit<NextApiRequest, keyof z.output<TInput>> & z.output<TInput>,
    response: NextApiResponse<z.output<TOutput>>
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
