import { ZodObject, ZodRawShape, z } from "zod";
import { RouteParams, Schema } from "../types";

type RequestParams<K extends keyof RoutesConfig> =
  keyof RouteParams<K> extends never ? {} : { params: RouteParams<K> };

type PostOptions<
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
> = Omit<RequestInit, "method" | "body"> & {
  body: z.infer<ZodObject<TInput>>;
  schema: Schema<TInput, TQuery, TOutput>;
  query?: z.infer<ZodObject<TQuery>>;
};

type GetOptions<
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
> = Omit<RequestInit, "method" | "body"> & {
  schema: Schema<{}, TQuery, TOutput>;
  query?: z.infer<ZodObject<TQuery>>;
};

export async function post<
  K extends keyof RoutesConfig,
  TInput extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  route: RoutesConfig[K] extends {} ? K : never,
  {
    schema,
    ...options
  }: PostOptions<TInput, TQuery, TOutput> & RequestParams<K>
): Promise<
  Response & keyof z.infer<ZodObject<TOutput>> extends never
    ? {}
    : { data: z.infer<ZodObject<TOutput>> }
> {
  let path: string = "";
  if ((options as any).params) {
    Object.keys((options as any).params).forEach((key) => {
      path = (route as string).replace(
        `[${key}]`,
        (options as any).params[key]
      );
    });
  }

  if (!path) {
    throw new Error(`Could not construct path for ${route}`);
  }

  const response = await fetch(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(options.body),
  });
  const contentType = response.headers.get("content-type");

  // validate output (only for json)
  if (contentType === "application/json" && schema.output) {
    const output = await response.json();
    try {
      const data = schema.output.parse(output);

      return {
        ...response,
        data,
      };
    } catch (error) {
      throw new Error(`Output validation failed for ${path}: ${error}`);
    }
  }

  return {
    ...response,
    data: {} as any,
  };
}

export async function get<
  K extends keyof RoutesConfig,
  TQuery extends ZodRawShape = {},
  TOutput extends ZodRawShape = {}
>(
  route: RoutesConfig[K] extends {} ? K : never,
  { schema, ...options }: GetOptions<TQuery, TOutput> & RequestParams<K>
): Promise<
  Response & keyof z.infer<ZodObject<TOutput>> extends never
    ? {}
    : { data: z.infer<ZodObject<TOutput>> }
> {
  let path: string = "";
  if ((options as any).params) {
    Object.keys((options as any).params).forEach((key) => {
      path = (route as string).replace(
        `[${key}]`,
        (options as any).params[key]
      );
    });
  }

  if (!path) {
    throw new Error(`Could not construct path for ${route}`);
  }

  const response = await fetch(path, {
    ...options,
    method: "GET",
  });
  const contentType = response.headers.get("content-type");

  // validate output (only for json)
  if (contentType === "application/json" && schema.output) {
    const output = await response.json();
    try {
      const data = schema.output.parse(output);

      return {
        ...response,
        data,
      };
    } catch (error) {
      throw new Error(`Output validation failed for ${path}: ${error}`);
    }
  }

  return {
    ...response,
    data: {} as any,
  };
}
