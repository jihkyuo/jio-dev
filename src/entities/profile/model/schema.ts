import { z } from "zod";

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
    /** 선택 — 없으면 링크를 렌더하지 않는다. */
    linkedin: z.string().url().optional(),
  }),
});

export type Profile = z.infer<typeof profileSchema>;
