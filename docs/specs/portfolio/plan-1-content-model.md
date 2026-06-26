# Plan 1 — 콘텐츠 모델 + IA 기반 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 포트폴리오의 타입 강제 콘텐츠 레이어(프로필·경력·스킬·프로젝트 메타)를 빌드타임 검증과 함께 구축한다 — 렌더링은 Plan 2.

**Architecture:** 콘텐츠를 단일 출처로 분리한다. 프로필·경력·스킬은 순수 TS 데이터에 zod 스키마를 적용해 로드 시 검증한다. 프로젝트는 `content/projects/*.mdx`의 YAML frontmatter를 gray-matter로 파싱하고 zod로 검증하는 서버/빌드 전용 로더로 읽는다(잘못된/누락 frontmatter는 throw → 빌드 실패). 스키마에서 타입을 추론해 드리프트를 막는다.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript(strict) · zod(스키마/검증) · gray-matter(frontmatter) · vitest(테스트).

## Global Constraints

- 패키지 매니저는 **pnpm** 만 사용한다(npm/yarn 금지). — AGENTS.md
- 커밋: `{이모지} type: 한국어 요약`(gitmoji + Conventional Commits). 타입 ✨ feat / 🐛 fix / 🩹 patch / 📝 docs / 🔧 chore.
- Next.js 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 확인한다.
- 경로 별칭: `@/*` → `./src/*` (tsconfig).
- `tsconfig` strict 모드. 모든 공개 함수는 명시적 반환 타입.
- 프로젝트 MDX 필수 frontmatter: `title` · `slug` · `period` · `role` · `teamSize` · `stack` · `impact` · `summary` · `links`. 누락 시 검증 throw.
- 경력 기간 형식: `YYYY.MM`(종료는 `YYYY.MM` 또는 `NOW`).
- 이 Plan은 **렌더링/페이지를 만들지 않는다**(Plan 2). 콘텐츠 API와 검증·테스트만 산출.

---

### Task 1: 의존성 + 테스트 러너 셋업

**Files:**
- Modify: `package.json` (deps/scripts)
- Create: `vitest.config.ts`
- Create: `src/content/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `pnpm test`(vitest run), `pnpm test:watch`. zod·gray-matter 런타임 사용 가능.

- [ ] **Step 1: 의존성 설치**

Run:
```bash
pnpm add zod gray-matter
pnpm add -D vitest
```
Expected: `package.json` dependencies에 `zod`·`gray-matter`, devDependencies에 `vitest` 추가.

- [ ] **Step 2: vitest 설정 작성**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: package.json 스크립트 추가**

`package.json`의 `scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest",
"content:check": "vitest run src/content"
```

- [ ] **Step 4: 스모크 테스트 작성(실패 확인용)**

Create `src/content/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("test runner", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `pnpm test`
Expected: PASS (1 passed).

- [ ] **Step 6: 커밋**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/content/__tests__/smoke.test.ts
git commit -m "🔧 chore: 콘텐츠 검증용 zod·gray-matter·vitest 셋업"
```

---

### Task 2: 콘텐츠 스키마 (zod) + 추론 타입

**Files:**
- Create: `src/content/schema.ts`
- Test: `src/content/schema.test.ts`

**Interfaces:**
- Consumes: `zod`
- Produces:
  - `profileSchema`, `experienceSchema`, `skillsSchema`, `projectFrontmatterSchema` (zod 스키마)
  - 타입: `Profile`, `Experience`, `Skills`, `ProjectMeta` (= `z.infer<...>`)
  - `periodPart` 정규식 규칙(`YYYY.MM` | `NOW`)

- [ ] **Step 1: 실패 테스트 작성**

Create `src/content/schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  experienceSchema,
  projectFrontmatterSchema,
} from "@/content/schema";

describe("experienceSchema", () => {
  it("accepts a valid experience with YYYY.MM period and 2+ impacts", () => {
    const ok = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022.01", end: "NOW" },
      teamSize: "5명",
      scope: "프론트 챕터 리드",
      impact: ["번들 −38%", "LCP 4.2s→1.1s"],
      leadership: ["디자인 시스템 정착"],
      stack: ["Next.js", "TypeScript"],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects a malformed period and <2 impacts", () => {
    const bad = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022", end: "NOW" },
      teamSize: "5명",
      scope: "리드",
      impact: ["하나뿐"],
      leadership: [],
      stack: ["Next.js"],
    });
    expect(bad.success).toBe(false);
  });
});

describe("projectFrontmatterSchema", () => {
  it("rejects when a required field is missing", () => {
    const bad = projectFrontmatterSchema.safeParse({
      title: "결제 위젯 리아키텍처",
      // slug 누락
      period: "2024",
      role: "프론트 리드",
      teamSize: "5명",
      stack: ["Next.js"],
      impact: "번들 −38%",
      summary: "요약",
      links: {},
    });
    expect(bad.success).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm test src/content/schema.test.ts`
Expected: FAIL ("Cannot find module '@/content/schema'").

- [ ] **Step 3: 스키마 구현**

Create `src/content/schema.ts`:
```ts
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
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `pnpm test src/content/schema.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: 커밋**

```bash
git add src/content/schema.ts src/content/schema.test.ts
git commit -m "✨ feat: 콘텐츠 zod 스키마·추론 타입 추가"
```

---

### Task 3: 프로필 데이터 (Career Snapshot + 이력서)

**Files:**
- Create: `src/content/profile.ts`
- Test: `src/content/profile.test.ts`

**Interfaces:**
- Consumes: `profileSchema`, `Profile` (Task 2), `siteConfig` (`@/config/site`)
- Produces: `getProfile(): Profile`

- [ ] **Step 1: 실패 테스트 작성**

Create `src/content/profile.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getProfile } from "@/content/profile";

describe("getProfile", () => {
  it("returns a schema-valid profile with a resume PDF and snapshot", () => {
    const p = getProfile();
    expect(p.resumePdf.startsWith("/")).toBe(true);
    expect(p.snapshot.years).toBeGreaterThan(0);
    expect(p.snapshot.domains.length).toBeGreaterThan(0);
    expect(p.name.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm test src/content/profile.test.ts`
Expected: FAIL ("Cannot find module '@/content/profile'").

- [ ] **Step 3: 프로필 구현 (siteConfig 재사용)**

Create `src/content/profile.ts`:
```ts
import { siteConfig } from "@/config/site";
import { profileSchema, type Profile } from "@/content/schema";

/**
 * Hero/Contact용 프로필. 이름·링크는 siteConfig(메타데이터 단일 출처)를 재사용하고,
 * Hero 전용 카피(eyebrow·tagline·snapshot)와 이력서 경로만 여기서 정의한다.
 * 실제 PDF 파일은 `public{resumePdf}` 에 두어야 한다(별도 준비).
 */
const profile: Profile = profileSchema.parse({
  eyebrow: "Frontend Engineer",
  name: siteConfig.name,
  role: siteConfig.role,
  tagline: "복잡한 UI를 단순한 시스템으로. 성능과 DX를 함께 끌어올립니다.",
  snapshot: {
    years: 8,
    domains: ["결제·정산", "디자인 시스템"],
    headline: "대규모 결제 플로우 LCP 4.2s→1.1s · 전환 +12%",
  },
  resumePdf: "/resume.pdf",
  links: siteConfig.links,
});

export function getProfile(): Profile {
  return profile;
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `pnpm test src/content/profile.test.ts`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/content/profile.ts src/content/profile.test.ts
git commit -m "✨ feat: 프로필(Career Snapshot·이력서) 콘텐츠 추가"
```

---

### Task 4: 경력 데이터 (타임라인)

**Files:**
- Create: `src/content/experience.ts`
- Test: `src/content/experience.test.ts`

**Interfaces:**
- Consumes: `experienceSchema`, `Experience` (Task 2)
- Produces: `getExperience(): Experience[]` (최신순: end="NOW" 먼저, 그다음 start 내림차순)

- [ ] **Step 1: 실패 테스트 작성**

Create `src/content/experience.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getExperience } from "@/content/experience";

describe("getExperience", () => {
  it("returns schema-valid entries sorted most-recent first", () => {
    const xs = getExperience();
    expect(xs.length).toBeGreaterThan(0);
    // 첫 항목은 재직중이거나 가장 최근 시작
    const first = xs[0];
    expect(first.impact.length).toBeGreaterThanOrEqual(2);
    // 정렬: NOW 또는 최신 start 가 맨 앞
    const startOf = (e: (typeof xs)[number]) => e.period.start;
    for (let i = 1; i < xs.length; i++) {
      const prevNow = xs[i - 1].period.end === "NOW";
      const currNow = xs[i].period.end === "NOW";
      if (prevNow === currNow) {
        expect(startOf(xs[i - 1]) >= startOf(xs[i])).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm test src/content/experience.test.ts`
Expected: FAIL ("Cannot find module '@/content/experience'").

- [ ] **Step 3: 경력 구현**

Create `src/content/experience.ts`:
```ts
import { experienceSchema, type Experience } from "@/content/schema";

/** 실제 경력으로 교체할 것. 최신순 정렬은 getExperience가 보장한다. */
const raw: Experience[] = [
  {
    company: "某 핀테크",
    role: "프론트엔드 리드",
    period: { start: "2022.01", end: "NOW" },
    teamSize: "5명",
    scope: "결제·정산 웹 프론트 챕터 리드",
    impact: [
      "결제 위젯 리아키텍처로 번들 −38%, LCP 4.2s→1.1s, 전환 +12%",
      "렌더링 전략(SSR/스트리밍) 표준화로 초기 로딩 일관성 확보",
    ],
    leadership: ["코드 리뷰 문화·디자인 시스템 정착", "주니어 2인 멘토링"],
    stack: ["Next.js", "React", "TypeScript", "Design System"],
  },
  {
    company: "某 커머스",
    role: "프론트엔드 엔지니어",
    period: { start: "2019.03", end: "2021.12" },
    teamSize: "3명",
    scope: "상품 상세·실험 인프라 프론트",
    impact: [
      "상품 상세 성능 최적화·이미지 파이프라인 개선으로 이탈률 −9%",
      "A/B 실험 프론트 구축으로 실험 사이클 2주→3일 단축",
    ],
    leadership: ["실험 가이드 문서화"],
    stack: ["React", "Webpack", "GraphQL"],
  },
];

function rank(e: Experience): string {
  // NOW 를 가장 큰 값으로 처리해 맨 앞에 오게 한다.
  return e.period.end === "NOW" ? "9999.99" : e.period.start;
}

export function getExperience(): Experience[] {
  return raw
    .map((e) => experienceSchema.parse(e))
    .sort((a, b) => (rank(a) < rank(b) ? 1 : rank(a) > rank(b) ? -1 : 0));
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `pnpm test src/content/experience.test.ts`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/content/experience.ts src/content/experience.test.ts
git commit -m "✨ feat: 경력 타임라인 콘텐츠 추가"
```

---

### Task 5: 스킬 데이터 (분류)

**Files:**
- Create: `src/content/skills.ts`
- Test: `src/content/skills.test.ts`

**Interfaces:**
- Consumes: `skillsSchema`, `Skills` (Task 2)
- Produces: `getSkills(): Skills`

- [ ] **Step 1: 실패 테스트 작성**

Create `src/content/skills.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getSkills } from "@/content/skills";

describe("getSkills", () => {
  it("returns grouped skills with a non-empty core", () => {
    const s = getSkills();
    expect(s.core.length).toBeGreaterThan(0);
    expect(Array.isArray(s.comfortable)).toBe(true);
    expect(Array.isArray(s.production)).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm test src/content/skills.test.ts`
Expected: FAIL ("Cannot find module '@/content/skills'").

- [ ] **Step 3: 스킬 구현**

Create `src/content/skills.ts`:
```ts
import { skillsSchema, type Skills } from "@/content/schema";

const skills: Skills = skillsSchema.parse({
  core: ["React", "Next.js", "TypeScript"],
  comfortable: ["Tailwind", "React Query", "Vitest"],
  production: ["GraphQL", "Webpack", "Node.js"],
});

export function getSkills(): Skills {
  return skills;
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `pnpm test src/content/skills.test.ts`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/content/skills.ts src/content/skills.test.ts
git commit -m "✨ feat: 스킬 분류 콘텐츠 추가"
```

---

### Task 6: 프로젝트 MDX 샘플 + 검증 로더

**Files:**
- Create: `content/projects/payment-widget-rearchitecture.mdx`
- Create: `content/projects/design-system-v2.mdx`
- Create: `src/content/projects.ts`
- Test: `src/content/projects.test.ts`

**Interfaces:**
- Consumes: `projectFrontmatterSchema`, `ProjectMeta` (Task 2), `gray-matter`, `node:fs`, `node:path`
- Produces:
  - `getProjects(): ProjectMeta[]` (order 오름차순, order 없으면 뒤로)
  - `getProjectSlugs(): string[]`
  - `parseProjectFile(raw: string, file: string): ProjectMeta` (검증; 실패 시 throw — Plan 2 페이지 빌드 시 빌드 실패의 근거)

- [ ] **Step 1: 샘플 MDX 작성**

Create `content/projects/payment-widget-rearchitecture.mdx`:
```mdx
---
title: 결제 위젯 리아키텍처
slug: payment-widget-rearchitecture
period: "2024"
role: 프론트엔드 리드
teamSize: 5명
stack: [Next.js, React Query, TypeScript]
impact: 번들 −38% · LCP 4.2s→1.1s · 전환 +12%
summary: 모놀리식 결제 위젯을 모듈 경계로 재설계하고 무중단 점진 마이그레이션으로 전환했다.
order: 1
featured: true
links:
  repo: https://github.com/example/payment-widget
---

## 맥락 & 문제

레거시 결제 위젯이 단일 번들로 묶여 초기 로딩이 느렸고, 변경 시 회귀 범위가 넓었다.

## My Role & Scope

프론트 리드로서 모듈 경계 설계와 마이그레이션 전략을 주도했다(팀 5인, 위젯 코어 오너십).

## 의사결정 & 접근

### 딥다이브 — 런타임 분할 vs 빌드타임 분할

- 제약: 무중단 + 기존 결제 흐름 보존
- 버린 선택지: 전면 재작성(리스크 과다)
- 채택: 모듈 경계 기준 점진 분할 + 피처 플래그
- 결과: 번들 −38%, LCP 4.2s→1.1s
- 남긴 트레이드오프: 초기 빌드 복잡도 증가

## 임팩트 & 결과

결제 전환 +12%(팀 지표, 위젯 성능 개선이 본인 주도 기여).

## 회고

플래그 정리 비용을 더 일찍 계획했어야 했다.
```

Create `content/projects/design-system-v2.mdx`:
```mdx
---
title: 디자인 시스템 v2
slug: design-system-v2
period: "2023"
role: 프론트엔드 엔지니어
teamSize: 4명
stack: [React, TypeScript, Tailwind]
impact: 컴포넌트 재사용률 +46% · 핸드오프 −60%
summary: 토큰 기반 테마와 접근성 우선 컴포넌트로 디자인 시스템을 재구축했다.
order: 2
links:
  live: https://example.com/ds
---

## 맥락 & 문제

컴포넌트 파편화로 화면마다 스타일이 어긋났다.

## My Role & Scope

토큰 체계와 핵심 컴포넌트 10종을 설계·구현했다(팀 4인).

## 의사결정 & 접근

### 딥다이브 — 토큰 우선 설계

- 제약: 다크/라이트 + RTL 대비
- 버린 선택지: 컴포넌트별 하드코딩
- 채택: 디자인 토큰 → 컴포넌트 바인딩
- 결과: 재사용률 +46%
- 남긴 트레이드오프: 초기 토큰 정의 비용

## 임팩트 & 결과

디자인-개발 핸드오프 시간 −60%(팀 지표).

## 회고

문서화를 컴포넌트와 동시에 했어야 했다.
```

- [ ] **Step 2: 실패 테스트 작성**

Create `src/content/projects.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  getProjects,
  getProjectSlugs,
  parseProjectFile,
} from "@/content/projects";

describe("getProjects", () => {
  it("loads sample projects sorted by order", () => {
    const ps = getProjects();
    expect(ps.length).toBeGreaterThanOrEqual(2);
    expect(ps[0].slug).toBe("payment-widget-rearchitecture");
    const orders = ps.map((p) => p.order ?? Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i - 1] <= orders[i]).toBe(true);
    }
  });

  it("exposes slugs", () => {
    expect(getProjectSlugs()).toContain("design-system-v2");
  });
});

describe("parseProjectFile", () => {
  it("throws when required frontmatter is missing", () => {
    const raw = `---\ntitle: 누락 테스트\n---\n본문`;
    expect(() => parseProjectFile(raw, "broken.mdx")).toThrow();
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `pnpm test src/content/projects.test.ts`
Expected: FAIL ("Cannot find module '@/content/projects'").

- [ ] **Step 4: 로더 구현**

Create `src/content/projects.ts`:
```ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { projectFrontmatterSchema, type ProjectMeta } from "@/content/schema";

const PROJECTS_DIR = join(process.cwd(), "content", "projects");

/** frontmatter를 검증해 ProjectMeta로 변환. 실패 시 파일명을 담아 throw. */
export function parseProjectFile(raw: string, file: string): ProjectMeta {
  const { data } = matter(raw);
  const parsed = projectFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `[content] 잘못된 프로젝트 frontmatter: ${file}\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}

function loadAll(): ProjectMeta[] {
  const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) =>
    parseProjectFile(readFileSync(join(PROJECTS_DIR, file), "utf8"), file),
  );
}

export function getProjects(): ProjectMeta[] {
  return loadAll().sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER),
  );
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `pnpm test src/content/projects.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 6: 커밋**

```bash
git add content/projects/ src/content/projects.ts src/content/projects.test.ts
git commit -m "✨ feat: 프로젝트 MDX 샘플·검증 로더 추가"
```

---

### Task 7: 콘텐츠 API 배럴 + 기존 샘플 데이터 정리

**Files:**
- Create: `src/content/index.ts`
- Modify: `src/data/projects.ts` (삭제 — 신규 콘텐츠 레이어로 대체됨)
- Test: `src/content/index.test.ts`

**Interfaces:**
- Consumes: Task 3–6의 `getProfile`·`getExperience`·`getSkills`·`getProjects`·`getProjectSlugs`
- Produces: `@/content` 단일 진입점 (위 5개 함수 + 타입 재노출)

- [ ] **Step 1: 실패 테스트 작성**

Create `src/content/index.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  getProfile,
  getExperience,
  getSkills,
  getProjects,
  getProjectSlugs,
} from "@/content";

describe("content barrel", () => {
  it("re-exports all loaders", () => {
    expect(getProfile().name.length).toBeGreaterThan(0);
    expect(getExperience().length).toBeGreaterThan(0);
    expect(getSkills().core.length).toBeGreaterThan(0);
    expect(getProjects().length).toBeGreaterThan(0);
    expect(getProjectSlugs().length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm test src/content/index.test.ts`
Expected: FAIL ("Cannot find module '@/content'").

- [ ] **Step 3: 배럴 구현**

Create `src/content/index.ts`:
```ts
export { getProfile } from "@/content/profile";
export { getExperience } from "@/content/experience";
export { getSkills } from "@/content/skills";
export { getProjects, getProjectSlugs } from "@/content/projects";
export type {
  Profile,
  Experience,
  Skills,
  ProjectMeta,
} from "@/content/schema";
```

- [ ] **Step 4: 구 샘플 데이터 제거 (내 변경이 만든 고아 정리)**

기존 `src/data/projects.ts`는 신규 콘텐츠 레이어로 완전히 대체된다. 다른 곳에서 import하지 않는지 확인 후 삭제:

Run:
```bash
grep -rn "@/data/projects" src || echo "no references"
git rm src/data/projects.ts
```
Expected: "no references" 출력 후 삭제. (참조가 있으면 해당 파일을 `@/content`로 먼저 전환)

- [ ] **Step 5: 전체 테스트 + 린트 + 빌드 확인**

Run:
```bash
pnpm test
pnpm lint
pnpm build
```
Expected: 테스트 PASS(전체), 린트 통과, 빌드 통과(아직 콘텐츠를 페이지에서 쓰지 않으므로 빌드 영향 없음).

- [ ] **Step 6: 커밋**

```bash
git add src/content/index.ts src/content/index.test.ts
git commit -m "✨ feat: 콘텐츠 API 배럴 추가 및 구 샘플 데이터 제거"
```

---

## 후속 플랜 (이 문서 범위 밖)
- **Plan 2 — 코어 구현:** `@next/mdx` 셋업(`mdx-components.tsx`·`next.config` `pageExtensions`·`remark-frontmatter`), 홈 섹션 렌더(Hero·About·Experience·Projects·Skills·Contact), `/projects/[slug]` 동적 렌더(`generateStaticParams`·`dynamicParams=false`), 프로젝트별 `generateMetadata`, `app/sitemap.ts`. 이때 콘텐츠 로더를 페이지가 import하므로 잘못된 frontmatter가 **`pnpm build` 실패**로 이어진다.
- **Plan 3 — 비주얼 시스템 + 인터랙션 + 검증:** Grain·Steel 토큰화, Layout A, 커서 글로우/reveal(가드레일), reduced-motion·forced-colors·coarse-pointer·print 분기, 대비/키보드/빌드 검증.

## Self-Review (작성자 점검 결과)
- **Spec 커버리지:** 이력서 PDF 경로(profile.resumePdf)·Career Snapshot(profile.snapshot)·리더십 시그널(experience.leadership)·기간 `YYYY.MM`(periodMonth)·팀규모/역할(experience)·스킬 분류(skillsSchema)·프로젝트 필수 frontmatter+빌드실패 근거(projectFrontmatterSchema+parseProjectFile throw)·`My Role`/딥다이브 형식(샘플 MDX 본문) 모두 태스크로 매핑됨. 렌더링·sitemap·print·a11y는 의도적으로 Plan 2/3.
- **플레이스홀더:** 모든 코드 스텝에 실제 코드 포함, TBD 없음.
- **타입 일관성:** `Profile/Experience/Skills/ProjectMeta`가 Task 2 정의와 Task 3–7 사용에서 일치. 함수명 `getProfile/getExperience/getSkills/getProjects/getProjectSlugs/parseProjectFile` 일관.
