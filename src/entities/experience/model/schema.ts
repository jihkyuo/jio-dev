import { z } from "zod";

/** 경력 기간 한 조각: "YYYY.MM" 형식 */
const periodMonth = z.string().regex(/^\d{4}\.\d{2}$/, "YYYY.MM 형식이어야 함");
/** 종료 시점: "YYYY.MM" 또는 재직중 "NOW" */
const periodEnd = z.union([periodMonth, z.literal("NOW")]);

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

export type Experience = z.infer<typeof experienceSchema>;
