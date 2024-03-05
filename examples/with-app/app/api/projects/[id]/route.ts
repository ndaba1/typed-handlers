import { GetProjectSchema } from "@/lib/schema/projects";
import { NextResponse } from "next/server";
import { createHandler } from "typed-handlers";

export const GET = createHandler(
  async ({ params }) => {
    return NextResponse.json({
      id: params.id,
      name: "My Project",
      title: "My Project",
      slug: "my-project",
      description: "This is my project",
    });
  },
  {
    path: "/api/projects/[id]",
    schema: GetProjectSchema,
  }
);
