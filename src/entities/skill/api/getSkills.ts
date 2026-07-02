import { skillsSchema, type Skills } from "../model/schema";

// 태그는 이력서 스택 기반(사실). 티어 분류(core/comfortable/production)는 자가평가 초안 — 사용자 조정 대상.
const skills: Skills = skillsSchema.parse({
  core: ["React", "TypeScript", "Electron", "Zustand", "TanStack Query"],
  comfortable: [
    "Vite",
    "Emotion",
    "React Hook Form",
    "Zod",
    "TanStack Router",
    "STOMP",
  ],
  production: [
    "D3.js",
    "CKEditor",
    "Vitest",
    "Playwright",
    "Storybook",
    "GraphQL",
    "Naver / Google Maps",
  ],
});

export function getSkills(): Skills {
  return skills;
}
