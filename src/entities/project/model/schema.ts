import { z } from "zod";

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

export type ProjectMeta = z.infer<typeof projectFrontmatterSchema>;
