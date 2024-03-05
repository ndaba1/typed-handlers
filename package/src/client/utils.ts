import { Result, RouteParams, Schema } from "src/types";
import { ZodError, z } from "zod";

export function generateEndpoint<K extends keyof RoutesConfig>(
  route: K,
  { params, query }: { params?: RouteParams<K>; query?: Record<string, string> }
): string {
  console.log({ route, params, query });
  let path = route as string;
  Object.keys(params ?? {}).forEach((key) => {
    const value = params?.[key as keyof RouteParams<K>] as string | string[];
    if (typeof value === "string") {
      path = path.replace(/\[${key}\]/g, value as string);
    } else {
      path = path
        .replace(/$\//, "")
        .replace(/\[...${key}\]/g, (value as string[]).join("/"))
        .replace(/\[\[...${key}\]\]/g, (value as string[]).join("/"));
    }
  });

  if (query) {
    const searchParams = new URLSearchParams(query);
    const queryString = searchParams.toString();
    path = `${path}?${queryString}`;
  }

  return path;
}

export async function transformResponse<
  R extends Response,
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>({
  path,
  schema,
  response,
}: {
  path: K;
  response: R;
  schema: Schema<TInput, TQuery, TOutput, TError>;
}): Promise<Result<R, TOutput, TError>> {
  let initData: any = null;
  const contentType =
    response.headers.get("content-type") ?? "application/json";

  const contentTypeHandlers = {
    "text/plain": async (r: Response) => await r.text(),
    "application/json": async (r: Response) => await r.json(),
  };

  try {
    const parseFunction =
      contentTypeHandlers[contentType as keyof typeof contentTypeHandlers];

    if (parseFunction) {
      initData = await parseFunction(response);
    }

    console.log("initData", initData, parseFunction, contentType);

    if (response.ok) {
      const data = schema.output ? schema.output.parse(initData) : initData;
      return {
        data,
        response,
        success: true,
      };
    } else {
      const error = schema.error ? schema.error.parse(initData) : initData;
      return {
        error,
        response,
        success: false,
      };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      throw new Error(`Output validation failed for ${path}`);
    }

    throw error;
  }
}
