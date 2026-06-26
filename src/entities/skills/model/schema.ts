import { z } from "zod";

export const skillsSchema = z.object({
  core: z.array(z.string()).min(1),
  comfortable: z.array(z.string()),
  production: z.array(z.string()),
});

export type Skills = z.infer<typeof skillsSchema>;
