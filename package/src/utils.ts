import { ZodError, ZodType } from "zod";
import { ValidationFunction } from "./types";

export const logger = (...args: any[]) => {
  if (process.env.TYPED_HANDLERS_DEBUG_MODE === "true") {
    console.log("typed-handlers:", ...args);
  }
};

export function handleError<T extends ZodType>(
  error: ZodError,
  {
    source,
    message,
    onValidationError,
  }: {
    source: "body" | "query";
    message?: string;
    onValidationError?: ValidationFunction<T>;
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
