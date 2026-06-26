import { skillsSchema, type Skills } from "@/content/schema";

const skills: Skills = skillsSchema.parse({
  core: ["React", "Next.js", "TypeScript"],
  comfortable: ["Tailwind", "React Query", "Vitest"],
  production: ["GraphQL", "Webpack", "Node.js"],
});

export function getSkills(): Skills {
  return skills;
}
