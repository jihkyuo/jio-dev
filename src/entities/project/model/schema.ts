import { z } from "zod";

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  /** 제목 중 강조할 부분 문자열. title 안에 그대로 들어 있어야 스윕 하이라이트가 입혀짐(없으면 무강조). */
  titleHighlight: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case 여야 함"),
  /** 연도 또는 기간 (예: "2024", "2023–2024") */
  period: z.string().min(1),
  role: z.string().min(1),
  /** 팀 규모. 개인 프로젝트엔 없을 수 있어 선택. */
  teamSize: z.string().min(1).optional(),
  stack: z.array(z.string()).min(1),
  /** 홈 카드 훅 한 줄(TL;DR). 결과 숫자 강제 아님 — 메커니즘·상태 전환도 허용. */
  impact: z.string().min(1),
  summary: z.string().min(1),
  links: z
    .object({
      live: z.string().url().optional(),
      repo: z.string().url().optional(),
    })
    .optional(),
  /** 노출 순서 (작을수록 먼저) */
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
  /** 본문 외부 링크에 description·표시 title을 보강한다(url 일치 시). 없으면 링크 텍스트가 title이 된다. */
  references: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export type ProjectMeta = z.infer<typeof projectFrontmatterSchema>;
