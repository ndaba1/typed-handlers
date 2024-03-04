import { NextResponse } from "next/server";
import { ZodError, ZodObject, ZodRawShape, z } from "zod";
import { Schema } from "../types";

type Awaitable<T> = T | Promise<T>;

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
  }) => Awaitable<NextResponse<z.infer<ZodObject<TOutput>>>>,
  {
    schema,
    formatError,
  }: {
    schema: Schema<TInput, TQuery, {}, TOutput>;
    formatError?: (error: ZodError) => Record<string, any>;
  }
) {
  return async (
    request: Request,
    context: { params: { [key: string]: string } }
  ) => {
    let body: any = {};
    let query: any = {};
    let params: any = {};

    try {
      const contentLength = request.headers.get("content-length");
      const hasBody = contentLength && Number(contentLength) > 0;
      const initBody = hasBody ? await request.json() : {};
      const initQuery = new URL(request.url).searchParams;
      const initParams = context.params;

      if (schema.input) {
        body = schema.input.parse(initBody);
      }

      if (schema.query) {
        query = schema.query.parse(Object.fromEntries(initQuery.entries()));
      }

      return handler({ request, context, body: body, query });
    } catch (error) {
      console.log(`typeof error`, typeof error, error instanceof ZodError);
      if (error instanceof ZodError) {
        const { fieldErrors } = error.flatten();
        const firstField = Object.keys(fieldErrors)[0];

        return NextResponse.json(
          formatError
            ? formatError(error)
            : {
                error: "Request validation failed",
                message: fieldErrors[firstField]?.[0],
              },
          {
            status: 400,
          }
        );
      }

      throw error;
    }
  };
}
