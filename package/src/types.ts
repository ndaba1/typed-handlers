declare global {
  interface RoutesConfig {}
}

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

export type SearchParamsInit =
  | string
  | URLSearchParams
  | Record<string, string | readonly string[]>
  | Iterable<[string, string]>
  | readonly [string, string][]
  | undefined;
