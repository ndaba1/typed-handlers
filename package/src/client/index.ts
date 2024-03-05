import { z } from "zod";
import {
  RefinedRequestInit,
  RefinedRequestInitWithBody,
  RouteParams,
} from "../types";
import { generateEndpoint, transformResponse } from "./utils";

type RequestParams<K extends keyof RoutesConfig> =
  keyof RouteParams<K> extends never ? {} : { params: RouteParams<K> };

async function apiFetch<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  route: K,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  {
    schema,
    query,
    ...options
  }: (
    | RefinedRequestInitWithBody<TInput, TQuery, TOutput, TError>
    | RefinedRequestInit<TInput, TQuery, TOutput, TError>
  ) &
    RequestParams<K>
) {
  const endpoint = generateEndpoint(route, {
    params: (options as any).params,
    query,
  });

  console.log("resolved endpoint", endpoint);

  const response = await fetch(endpoint, {
    ...options,
    method,
    body: (options as any).body
      ? JSON.stringify((options as any).body)
      : undefined,
  });

  return transformResponse({ path: route, schema, response });
}

export async function post<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  route: K,
  options: RefinedRequestInitWithBody<TInput, TQuery, TOutput, TError> &
    RequestParams<K>
) {
  return apiFetch(route, "POST", options);
}

export async function get<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  route: K,
  options: RefinedRequestInit<TInput, TQuery, TOutput, TError> &
    RequestParams<K>
) {
  return apiFetch(route, "GET", options);
}

export async function put<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  route: K,
  options: RefinedRequestInitWithBody<TInput, TQuery, TOutput, TError> &
    RequestParams<K>
) {
  return apiFetch(route, "PUT", options);
}

export async function del<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  route: K,
  options: RefinedRequestInit<TInput, TQuery, TOutput, TError> &
    RequestParams<K>
) {
  return apiFetch(route, "DELETE", options);
}

export async function patch<
  K extends keyof RoutesConfig,
  TInput extends z.ZodType,
  TQuery extends z.ZodType,
  TOutput extends z.ZodType,
  TError extends z.ZodType
>(
  route: K,
  options: RefinedRequestInitWithBody<TInput, TQuery, TOutput, TError> &
    RequestParams<K>
) {
  return apiFetch(route, "PATCH", options);
}
