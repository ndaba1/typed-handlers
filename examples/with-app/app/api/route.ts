import { NextResponse } from "next/server";
import { handler, schema } from "typed-handlers";
import { z } from "zod";

export const POST = handler(
  async ({ body, query }) => {
    return NextResponse.json({
      message: `Hello, ${body.name}!`,
    });
  },
  {
    schema: schema({
      input: z.object({
        name: z.string({ required_error: "Name is required" }),
      }),
      //   query: z.object({
      //     page: z.coerce.number({
      //       required_error: "Provide a page number",
      //       invalid_type_error: "Page number must be a number",
      //     }),
      //   }),
      output: z.object({
        message: z.string(),
      }),
    }),
    // onValidationError({ source }) {
    //   return NextResponse.json(
    //     {
    //       message: `Invalid ${source}`,
    //     },
    //     {
    //       status: 422,
    //     }
    //   );
    // },
  }
);
