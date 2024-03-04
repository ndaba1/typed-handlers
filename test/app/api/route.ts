import { handler } from "@/../src/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const POST = handler(
  async ({ body }) => {
    return NextResponse.json({
      message: `Hello, ${body.name}!`,
    });
  },
  {
    schema: {
      input: z.object({
        name: z.string({ required_error: "Name is required" }),
      }),
    },
  }
);
