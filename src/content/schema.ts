import { z } from "zod";

/** 경력 기간 한 조각: "YYYY.MM" 형식 */
const periodMonth = z.string().regex(/^\d{4}\.\d{2}$/, "YYYY.MM 형식이어야 함");
/** 종료 시점: "YYYY.MM" 또는 재직중 "NOW" */
const periodEnd = z.union([periodMonth, z.literal("NOW")]);

export const profileSchema = z.object({
  /** eyebrow 라벨 (예: "Frontend Engineer") */
  eyebrow: z.string().min(1),
  /** 이름 */
  name: z.string().min(1),
  /** 역할 한 줄 (예: "Senior Frontend Engineer") */
  role: z.string().min(1),
  /** 태그라인 */
  tagline: z.string().min(1),
  /** Career Snapshot — 5초 스캔용 */
  snapshot: z.object({
    years: z.number().int().positive(),
    domains: z.array(z.string()).min(1),
    headline: z.string().min(1),
  }),
  /** 이력서 PDF 경로 (public 기준, 예: "/resume.pdf") */
  resumePdf: z.string().startsWith("/"),
  links: z.object({
    email: z.string().email(),
    github: z.string().url(),
    linkedin: z.string().url(),
  }),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.object({ start: periodMonth, end: periodEnd }),
  teamSize: z.string().min(1),
  /** 본인 역할·기여 범위 */
  scope: z.string().min(1),
  /** 핵심 임팩트 불릿 (2개 이상) */
  impact: z.array(z.string()).min(2),
  /** 리더십 시그널(설계 주도·리뷰·멘토링·장애 대응 등) */
  leadership: z.array(z.string()),
  stack: z.array(z.string()).min(1),
});

export const skillsSchema = z.object({
  core: z.array(z.string()).min(1),
  comfortable: z.array(z.string()),
  production: z.array(z.string()),
});

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case 여야 함"),
  /** 연도 또는 기간 (예: "2024", "2023–2024") */
  period: z.string().min(1),
  role: z.string().min(1),
  teamSize: z.string().min(1),
  stack: z.array(z.string()).min(1),
  /** 정량 임팩트 한 줄 (TL;DR) */
  impact: z.string().min(1),
  summary: z.string().min(1),
  links: z.object({
    live: z.string().url().optional(),
    repo: z.string().url().optional(),
  }),
  /** 노출 순서 (작을수록 먼저) */
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type ProjectMeta = z.infer<typeof projectFrontmatterSchema>;
