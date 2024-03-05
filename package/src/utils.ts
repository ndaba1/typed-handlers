import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Awaitable } from "./types";

export const logger = (...args: any[]) => {
  if (process.env.TYPED_HANDLERS_DEBUG_MODE === "true") {
    console.log("typed-handlers:", ...args);
  }
};

export function handleError(
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
