import { schema } from "typed-handlers";
import { z } from "zod";

export const GetProjectSchema = schema({
  output: z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
  }),
});
