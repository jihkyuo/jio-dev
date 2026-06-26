# FSD 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 `app`/`components`/`content`/`config` 구조를 Feature-Sliced Design(app·widgets·features·entities·shared)으로 재편하고 steiger로 경계를 강제한다. 동작은 불변.

**Architecture:** 빅뱅 단일 PR을 레이어 단위 태스크로 분해한다. 기존 vitest 스위트가 안전망이다 — 각 태스크는 **파일 이동 + import 갱신 → `pnpm test`·`pnpm build` 그린**으로 닫는다(리팩터이므로 RED-first 대신 기존 테스트 유지가 검증 기준). 의존은 `app → widgets → entities → shared` 하향만. 마지막에 steiger를 켜 위반 0을 확인한다.

**Tech Stack:** Next.js 16(App Router) · React 19 · TypeScript · vitest 4 · zod 4 · steiger(신규) · server-only(신규).

## Global Constraints

- 패키지 매니저는 **pnpm** 전용 (npm/yarn 금지).
- Next.js 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다.
- 동작·UI·콘텐츠 **불변** — 구조 이전만. 변경된 모든 라인은 마이그레이션에 직접 추적되어야 한다.
- 네이밍: 슬라이스/세그먼트 폴더 **kebab-case**, React 컴포넌트 파일 **PascalCase**, 데이터/로직 파일 **camelCase**.
- 의존 방향 하향만(`app → widgets → entities → shared`), 가로 import 0, 슬라이스는 public API(`index.ts`)로만 노출. `shared`는 세그먼트라 통배럴 없음 — `@/shared/ui/*`는 파일 직접 import.
- 커밋 규약: `{이모지} type: 한국어 요약` (예: `🔧 chore: …`, `♻️ refactor: …`). 이 플랜은 `♻️ refactor`/`🔧 chore` 위주.
- 경로 별칭 `@/*` → `./src/*` (tsconfig + vitest.config 양쪽에 이미 설정됨, 변경 불필요).

## File Structure (최종)

```
src/
  app/                  layout.tsx page.tsx projects/[slug]/page.tsx
                        sitemap.ts sitemap.test.ts opengraph-image.tsx globals.css smoke.test.ts
  widgets/
    sidebar/  ui/Sidebar.tsx ui/RailNav.tsx   index.ts
    about/    ui/About.tsx                     index.ts
    experience/ ui/Experience.tsx              index.ts
    skills/   ui/Skills.tsx                     index.ts
    projects/ ui/Projects.tsx                   index.ts
    contact/  ui/Contact.tsx                     index.ts
  features/   .gitkeep
  entities/
    profile/    model/schema.ts api/getProfile.ts api/getProfile.test.ts             index.ts
    experience/ model/schema.ts model/schema.test.ts api/getExperience.ts api/getExperience.test.ts index.ts
    skills/     model/schema.ts api/getSkills.ts api/getSkills.test.ts               index.ts
    project/    model/schema.ts model/schema.test.ts api/getProjects.ts api/getProjects.test.ts index.ts
  shared/
    ui/      CursorGlow.tsx Reveal.tsx mdx.tsx        (배럴 없음)
    config/  site.ts index.ts
```

기존 `src/content/`·`src/config/`·`src/components/`는 마이그레이션 후 사라진다. 제거되는 파일: `src/content/index.ts`(전역 배럴) 및 `src/content/index.test.ts`(배럴 테스트 — 배럴 제거로 고아). `src/content/__tests__/smoke.test.ts`는 `src/app/smoke.test.ts`로 이동(삭제 아님).

---

### Task 1: 의존성 추가 + features 빈 레이어

**Files:**
- Modify: `package.json` (devDependencies/dependencies)
- Create: `src/features/.gitkeep`

**Interfaces:**
- Produces: `steiger` CLI 사용 가능, `server-only` 모듈 import 가능, `src/features/` 디렉터리 존재.

- [ ] **Step 1: server-only 런타임 가드 패키지 설치**

`entities/project` API가 `node:fs`를 쓰므로 클라이언트 import 시 빌드 실패시킬 가드가 필요하다.

Run: `pnpm add server-only`
Expected: `dependencies`에 `server-only` 추가, 설치 성공.

- [ ] **Step 2: steiger(FSD 린터) devDependency 설치**

Run: `pnpm add -D steiger`
Expected: `devDependencies`에 `steiger` 추가.

- [ ] **Step 3: features 빈 레이어 생성**

Run: `mkdir -p src/features && printf '' > src/features/.gitkeep`
Expected: `src/features/.gitkeep` 존재(빈 파일).

- [ ] **Step 4: 기존 스위트가 여전히 그린인지 확인(회귀 없음)**

Run: `pnpm test`
Expected: PASS (코드 이동 전이라 전부 통과).

- [ ] **Step 5: 커밋**

```bash
git add package.json pnpm-lock.yaml src/features/.gitkeep
git commit -m "🔧 chore: FSD 준비 — server-only·steiger 추가, features 빈 레이어"
```

---

### Task 2: shared 레이어 (config + ui 이동)

**Files:**
- Move: `src/config/site.ts` → `src/shared/config/site.ts`
- Create: `src/shared/config/index.ts`
- Move: `src/components/CursorGlow.tsx` → `src/shared/ui/CursorGlow.tsx`
- Move: `src/components/Reveal.tsx` → `src/shared/ui/Reveal.tsx`
- Move: `src/components/mdx.tsx` → `src/shared/ui/mdx.tsx`
- Modify (import 갱신): `src/content/profile.ts`, `src/app/layout.tsx`, `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/page.tsx`, `src/app/projects/[slug]/page.tsx`

**Interfaces:**
- Produces: `@/shared/config`(public API, `siteConfig` 재노출), `@/shared/ui/CursorGlow`·`@/shared/ui/Reveal`·`@/shared/ui/mdx`(파일 직접).

- [ ] **Step 1: config·ui 파일을 git mv로 이동(히스토리 보존)**

```bash
mkdir -p src/shared/config src/shared/ui
git mv src/config/site.ts src/shared/config/site.ts
git mv src/components/CursorGlow.tsx src/shared/ui/CursorGlow.tsx
git mv src/components/Reveal.tsx src/shared/ui/Reveal.tsx
git mv src/components/mdx.tsx src/shared/ui/mdx.tsx
rmdir src/config 2>/dev/null || true
```

- [ ] **Step 2: shared/config public API 작성**

Create `src/shared/config/index.ts`:

```ts
export { siteConfig } from "./site";
```

- [ ] **Step 3: `@/config/site` import를 `@/shared/config`로 갱신**

다음 4개 파일에서 `@/config/site` → `@/shared/config`로 교체(이름 `siteConfig` 동일):
- `src/content/profile.ts:1` — `import { siteConfig } from "@/config/site";` → `import { siteConfig } from "@/shared/config";`
- `src/app/layout.tsx` — 동일 교체
- `src/app/opengraph-image.tsx` — 동일 교체
- `src/app/sitemap.ts` — 동일 교체

확인: `grep -rn '@/config/site' src` → 결과 0건이어야 함.

- [ ] **Step 4: shared/ui import 경로 갱신**

- `src/app/layout.tsx` — `import { CursorGlow } from "@/components/CursorGlow";` → `import { CursorGlow } from "@/shared/ui/CursorGlow";`
- `src/app/page.tsx` — `import { Reveal } from "@/components/Reveal";` → `import { Reveal } from "@/shared/ui/Reveal";`
- `src/app/projects/[slug]/page.tsx` — `import { mdxComponents } from "@/components/mdx";` → `import { mdxComponents } from "@/shared/ui/mdx";`

확인: `grep -rn '@/components/\(CursorGlow\|Reveal\|mdx\)' src` → 0건.

- [ ] **Step 5: 테스트·빌드 그린 확인**

Run: `pnpm test && pnpm build`
Expected: 둘 다 PASS. (`CursorGlow`/`Reveal`은 `"use client"`, `mdx`는 RSC — 위치만 바뀌고 동작 동일.)

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "♻️ refactor: shared 레이어 분리 — config·ui 이동"
```

---

### Task 3: entities 레이어 (schema 분리 + API 이동 + 배럴 제거)

**Files:**
- Create: `src/entities/{profile,experience,skills,project}/model/schema.ts`
- Create: `src/entities/experience/model/schema.test.ts`, `src/entities/project/model/schema.test.ts`
- Move: `src/content/profile.ts` → `src/entities/profile/api/getProfile.ts` (+ test)
- Move: `src/content/experience.ts` → `src/entities/experience/api/getExperience.ts` (+ test)
- Move: `src/content/skills.ts` → `src/entities/skills/api/getSkills.ts` (+ test)
- Move: `src/content/projects.ts` → `src/entities/project/api/getProjects.ts` (+ test)
- Create: `src/entities/{profile,experience,skills,project}/index.ts`
- Move: `src/content/__tests__/smoke.test.ts` → `src/app/smoke.test.ts`
- Delete: `src/content/schema.ts`, `src/content/schema.test.ts`(분리됨), `src/content/index.ts`(배럴), `src/content/index.test.ts`(고아)
- Modify (import 갱신): `src/components/{Contact,Experience,Skills,Projects,Sidebar}.tsx`, `src/app/page.tsx`, `src/app/sitemap.ts`, `src/app/projects/[slug]/page.tsx`, `package.json`(content:check 스크립트)

**Interfaces:**
- Produces:
  - `@/entities/profile` → `getProfile(): Profile`, type `Profile`
  - `@/entities/experience` → `getExperience(): Experience[]`, type `Experience`
  - `@/entities/skills` → `getSkills(): Skills`, type `Skills`
  - `@/entities/project` → `getProjects(): ProjectMeta[]`, `getProjectSlugs(): string[]`, `getProjectBySlug(slug): ProjectMeta | undefined`, `getProjectContent(slug): { meta: ProjectMeta; content: string }`, type `ProjectMeta`

- [ ] **Step 1: 디렉터리 생성 + API 파일 git mv**

```bash
mkdir -p src/entities/profile/{model,api} src/entities/experience/{model,api} \
         src/entities/skills/{model,api} src/entities/project/{model,api}
git mv src/content/profile.ts     src/entities/profile/api/getProfile.ts
git mv src/content/experience.ts  src/entities/experience/api/getExperience.ts
git mv src/content/skills.ts      src/entities/skills/api/getSkills.ts
git mv src/content/projects.ts    src/entities/project/api/getProjects.ts
git mv src/content/profile.test.ts     src/entities/profile/api/getProfile.test.ts
git mv src/content/experience.test.ts  src/entities/experience/api/getExperience.test.ts
git mv src/content/skills.test.ts      src/entities/skills/api/getSkills.test.ts
git mv src/content/projects.test.ts    src/entities/project/api/getProjects.test.ts
git mv src/content/__tests__/smoke.test.ts src/app/smoke.test.ts
```

- [ ] **Step 2: 엔티티별 model/schema.ts 작성(단일 schema.ts 분리)**

Create `src/entities/profile/model/schema.ts`:

```ts
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
    linkedin: z.string().url(),
  }),
});

export type Profile = z.infer<typeof profileSchema>;
```

Create `src/entities/experience/model/schema.ts` (experience 전용 period 헬퍼 동봉):

```ts
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
```

Create `src/entities/skills/model/schema.ts`:

```ts
import { z } from "zod";

export const skillsSchema = z.object({
  core: z.array(z.string()).min(1),
  comfortable: z.array(z.string()),
  production: z.array(z.string()),
});

export type Skills = z.infer<typeof skillsSchema>;
```

Create `src/entities/project/model/schema.ts`:

```ts
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
```

- [ ] **Step 3: 분리된 schema.test.ts를 엔티티별 model 테스트로 작성**

Create `src/entities/experience/model/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { experienceSchema } from "./schema";

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

  it("rejects a malformed period (valid impact count)", () => {
    const bad = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022", end: "NOW" },
      teamSize: "5명",
      scope: "리드",
      impact: ["a", "b"],
      leadership: [],
      stack: ["Next.js"],
    });
    expect(bad.success).toBe(false);
  });

  it("rejects fewer than 2 impacts (valid period)", () => {
    const bad = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022.01", end: "NOW" },
      teamSize: "5명",
      scope: "리드",
      impact: ["하나뿐"],
      leadership: [],
      stack: ["Next.js"],
    });
    expect(bad.success).toBe(false);
  });
});
```

Create `src/entities/project/model/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { projectFrontmatterSchema } from "./schema";

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

  it("rejects a non-kebab-case slug", () => {
    const bad = projectFrontmatterSchema.safeParse({
      title: "결제 위젯 리아키텍처",
      slug: "Bad_Slug",
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

  it("accepts valid project frontmatter", () => {
    const ok = projectFrontmatterSchema.safeParse({
      title: "결제 위젯 리아키텍처",
      slug: "valid-slug",
      period: "2024",
      role: "프론트 리드",
      teamSize: "5명",
      stack: ["Next.js"],
      impact: "번들 −38%",
      summary: "요약",
      links: {},
    });
    expect(ok.success).toBe(true);
  });
});
```

- [ ] **Step 4: 이동한 API 파일의 schema/config import를 슬라이스 상대경로로 갱신**

- `src/entities/profile/api/getProfile.ts` 상단 2줄을:
  ```ts
  import { siteConfig } from "@/shared/config";
  import { profileSchema, type Profile } from "../model/schema";
  ```
  로 교체(기존 `@/content/schema` 제거, `@/shared/config`는 Task 2에서 이미 갱신됐다면 유지).
- `src/entities/experience/api/getExperience.ts:1` — `import { experienceSchema, type Experience } from "@/content/schema";` → `import { experienceSchema, type Experience } from "../model/schema";`
- `src/entities/skills/api/getSkills.ts:1` — `@/content/schema` → `../model/schema`
- `src/entities/project/api/getProjects.ts:4` — `import { projectFrontmatterSchema, type ProjectMeta } from "@/content/schema";` → `import { projectFrontmatterSchema, type ProjectMeta } from "../model/schema";`

- [ ] **Step 5: project API에 server-only 가드 추가**

`src/entities/project/api/getProjects.ts` 최상단(첫 줄)에 추가:

```ts
import "server-only";
```

이로써 클라이언트 컴포넌트가 이 모듈을 import하면 빌드타임에 실패한다(node:fs 누수 방지).

- [ ] **Step 6: API 테스트의 import 경로 갱신(같은 슬라이스 상대경로)**

- `src/entities/profile/api/getProfile.test.ts` — `@/content/profile` → `./getProfile`
- `src/entities/experience/api/getExperience.test.ts` — `@/content/experience` → `./getExperience`
- `src/entities/skills/api/getSkills.test.ts` — `@/content/skills` → `./getSkills`
- `src/entities/project/api/getProjects.test.ts` — `@/content/projects` → `./getProjects`

- [ ] **Step 7: 엔티티 public API(index.ts) 작성**

Create `src/entities/profile/index.ts`:
```ts
export { getProfile } from "./api/getProfile";
export type { Profile } from "./model/schema";
```
Create `src/entities/experience/index.ts`:
```ts
export { getExperience } from "./api/getExperience";
export type { Experience } from "./model/schema";
```
Create `src/entities/skills/index.ts`:
```ts
export { getSkills } from "./api/getSkills";
export type { Skills } from "./model/schema";
```
Create `src/entities/project/index.ts`:
```ts
export {
  getProjects,
  getProjectSlugs,
  getProjectBySlug,
  getProjectContent,
} from "./api/getProjects";
export type { ProjectMeta } from "./model/schema";
```

- [ ] **Step 8: 구 schema/배럴/고아 테스트 제거**

```bash
git rm src/content/schema.ts src/content/schema.test.ts src/content/index.ts src/content/index.test.ts
rmdir src/content/__tests__ src/content 2>/dev/null || true
```
`index.test.ts`(배럴 테스트)는 `@/content` 배럴을 검증하던 것으로 배럴 제거에 따라 고아가 되어 삭제한다. 동등 커버리지는 각 엔티티 api 테스트가 이미 보유한다.

- [ ] **Step 9: 소비자 import를 엔티티 public API로 갱신**

`@/content`(배럴) 및 `@/content/<x>` 사용처를 전부 교체:
- `src/app/page.tsx` — `import { getProfile } from "@/content";` → `import { getProfile } from "@/entities/profile";`
- `src/app/sitemap.ts` — `import { getProjectSlugs } from "@/content";` → `import { getProjectSlugs } from "@/entities/project";`
- `src/app/projects/[slug]/page.tsx` — `import { getProjectSlugs, getProjectContent, getProjectBySlug, type ProjectMeta } from "@/content";` → `... from "@/entities/project";`
- `src/components/Contact.tsx` — `@/content` (`getProfile`) → `@/entities/profile`
- `src/components/Experience.tsx` — `@/content` (`getExperience`) → `@/entities/experience`
- `src/components/Skills.tsx` — `@/content` (`getSkills`) → `@/entities/skills`
- `src/components/Projects.tsx` — `@/content` (`getProjects`) → `@/entities/project`
- `src/components/Sidebar.tsx` — `@/content` (`getProfile`) → `@/entities/profile`

확인: `grep -rn '@/content' src` → 0건.

- [ ] **Step 10: content:check 스크립트를 entities로 갱신**

`package.json`의 `"content:check": "vitest run src/content"` → `"content:check": "vitest run src/entities"`.

- [ ] **Step 11: 테스트·빌드 그린 확인**

Run: `pnpm test && pnpm build`
Expected: 둘 다 PASS. (`getProjects.ts`의 `import "server-only"`는 서버/테스트(node) 환경에서 정상; 빌드 시 클라이언트 번들에 포함되지 않음.)

- [ ] **Step 12: 커밋**

```bash
git add -A
git commit -m "♻️ refactor: entities 레이어 분리 — schema 엔티티별 분리·API 이동·배럴 제거"
```

---

### Task 4: widgets 레이어 (섹션 컴포넌트 이동)

**Files:**
- Move: `src/components/Sidebar.tsx` → `src/widgets/sidebar/ui/Sidebar.tsx`
- Move: `src/components/RailNav.tsx` → `src/widgets/sidebar/ui/RailNav.tsx`
- Move: `src/components/About.tsx` → `src/widgets/about/ui/About.tsx`
- Move: `src/components/Experience.tsx` → `src/widgets/experience/ui/Experience.tsx`
- Move: `src/components/Skills.tsx` → `src/widgets/skills/ui/Skills.tsx`
- Move: `src/components/Projects.tsx` → `src/widgets/projects/ui/Projects.tsx`
- Move: `src/components/Contact.tsx` → `src/widgets/contact/ui/Contact.tsx`
- Create: `src/widgets/{sidebar,about,experience,skills,projects,contact}/index.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `@/widgets/sidebar`(`Sidebar`)·`@/widgets/about`(`About`)·`@/widgets/experience`(`Experience`)·`@/widgets/skills`(`Skills`)·`@/widgets/projects`(`Projects`)·`@/widgets/contact`(`Contact`). `RailNav`는 sidebar 슬라이스 비공개(미노출).

- [ ] **Step 1: 위젯 디렉터리 생성 + git mv**

```bash
mkdir -p src/widgets/sidebar/ui src/widgets/about/ui src/widgets/experience/ui \
         src/widgets/skills/ui src/widgets/projects/ui src/widgets/contact/ui
git mv src/components/Sidebar.tsx    src/widgets/sidebar/ui/Sidebar.tsx
git mv src/components/RailNav.tsx     src/widgets/sidebar/ui/RailNav.tsx
git mv src/components/About.tsx       src/widgets/about/ui/About.tsx
git mv src/components/Experience.tsx  src/widgets/experience/ui/Experience.tsx
git mv src/components/Skills.tsx      src/widgets/skills/ui/Skills.tsx
git mv src/components/Projects.tsx    src/widgets/projects/ui/Projects.tsx
git mv src/components/Contact.tsx     src/widgets/contact/ui/Contact.tsx
rmdir src/components 2>/dev/null || true
```

`Sidebar.tsx`의 `import { RailNav } from "./RailNav";`는 같은 슬라이스 내 상대경로라 그대로 유효(수정 불필요).

- [ ] **Step 2: 위젯 public API(index.ts) 작성**

```bash
printf 'export { Sidebar } from "./ui/Sidebar";\n'       > src/widgets/sidebar/index.ts
printf 'export { About } from "./ui/About";\n'            > src/widgets/about/index.ts
printf 'export { Experience } from "./ui/Experience";\n'  > src/widgets/experience/index.ts
printf 'export { Skills } from "./ui/Skills";\n'          > src/widgets/skills/index.ts
printf 'export { Projects } from "./ui/Projects";\n'      > src/widgets/projects/index.ts
printf 'export { Contact } from "./ui/Contact";\n'        > src/widgets/contact/index.ts
```

(`RailNav`는 의도적으로 미노출 — Sidebar 내부 전용.)

- [ ] **Step 3: app/page.tsx의 위젯 import를 public API로 갱신**

`src/app/page.tsx`에서 다음 6줄을 교체:
```ts
import { Sidebar } from "@/components/Sidebar";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
```
→
```ts
import { Sidebar } from "@/widgets/sidebar";
import { About } from "@/widgets/about";
import { Experience } from "@/widgets/experience";
import { Skills } from "@/widgets/skills";
import { Projects } from "@/widgets/projects";
import { Contact } from "@/widgets/contact";
```

확인: `grep -rn '@/components/' src` → 0건. `src/components/` 디렉터리 부재 확인.

- [ ] **Step 4: 테스트·빌드 그린 확인**

Run: `pnpm test && pnpm build`
Expected: 둘 다 PASS. 홈·상세 페이지 렌더 변화 없음.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "♻️ refactor: widgets 레이어 분리 — 섹션 컴포넌트 슬라이스화"
```

---

### Task 5: steiger 경계 강제

**Files:**
- Create: `steiger.config.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `pnpm lint:fsd` 명령, steiger 위반 0.

- [ ] **Step 1: 설치된 steiger의 설정 API 확인**

steiger는 버전별로 설정 형식이 다를 수 있다. 정확한 API를 먼저 확인한다:

Run: `cat node_modules/steiger/package.json | grep '"version"'` 및 `ls node_modules/steiger` 후 `node_modules/steiger/README.md`에서 "config"/"defineConfig" 섹션 확인.
Expected: `defineConfig` export와 FSD 룰셋(`@feature-sliced/steiger-plugin` 또는 내장) 사용법 파악.

- [ ] **Step 2: steiger.config.ts 작성**

아래는 steiger ≥0.5 표준 형식이다. Step 1에서 확인한 실제 API와 다르면 그에 맞춘다(특히 플러그인 import 경로·룰 ID 접두어).

Create `steiger.config.ts`:

```ts
import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // 30파일 규모 포트폴리오에선 노이즈인 휴리스틱 비활성화
    rules: {
      "fsd/insignificant-slice": "off",
      "fsd/excessive-slicing": "off",
    },
  },
]);
```

- [ ] **Step 3: lint:fsd 스크립트 추가**

`package.json` scripts에 추가:
```json
"lint:fsd": "steiger ./src"
```

- [ ] **Step 4: steiger 실행 + 위반 해소 루프**

Run: `pnpm lint:fsd`
Expected: 최종적으로 위반 0("No problems found" 류).

위반이 나오면 유형별 처리:
- **public-API sidestep**(슬라이스 내부 직접 import) → 소비자를 슬라이스 `index.ts` 경유로 수정. 단 **같은 슬라이스 내부 상대경로**(테스트·Sidebar→RailNav)는 정당하므로 룰이 이를 오탐하면 해당 파일 패턴 예외 추가.
- **segmentless slice** → 해당 슬라이스가 `ui`/`model`/`api` 세그먼트를 갖는지 확인(이미 충족 설계).
- **테스트가 내부 import** 경고 → `*.test.ts`를 룰 ignore에 추가하거나 public API 경유로 변경.
- **app 레이어 경고**(Next 프레임워크 소유) → steiger가 `app`을 FSD pages로 오인하면 config에서 `app` 관련 룰 완화.

각 수정 후 `pnpm lint:fsd` 재실행. `node_modules/next/dist/docs/`의 RSC 가이드는 변경 불필요(코드 이동만).

- [ ] **Step 5: 회귀 없음 확인**

Run: `pnpm test && pnpm build && pnpm lint`
Expected: 전부 PASS(steiger 추가가 기존 파이프라인에 영향 없음).

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "🔧 chore: steiger FSD 경계 린트 도입 — lint:fsd 추가"
```

---

### Task 6: 문서 갱신 + 최종 검증

**Files:**
- Modify: `docs/architecture.md`
- Modify: `docs/superpowers/specs/2026-06-26-fsd-migration-design.md` (상태 갱신)

**Interfaces:**
- Consumes: 전 태스크 완료 상태.

- [ ] **Step 1: architecture.md를 FSD 구조로 갱신**

`docs/architecture.md`의 "## 디렉터리" 섹션(현재 `src/content/`·`src/app/`·`src/components/`·기타 구조 설명)을 새 레이어 구조(app·widgets·features·entities·shared)로 교체한다. AGENTS.md 규칙("구조가 바뀌면 이 파일도 갱신") 준수. 스택·레이아웃·톤 섹션은 불변이므로 건드리지 않는다(외과적 변경).

갱신 핵심: 콘텐츠 레이어 → `entities/*`(model+api), 섹션 컴포넌트 → `widgets/*`, 효과/MDX/사이트설정 → `shared/{ui,config}`, 경계는 steiger(`pnpm lint:fsd`)가 강제함을 명시.

- [ ] **Step 2: 설계 스펙 상태 갱신**

`docs/superpowers/specs/2026-06-26-fsd-migration-design.md` 상단 상태 줄을 `상태: 구현 완료`로 갱신.

- [ ] **Step 3: 전체 게이트 최종 검증**

```bash
pnpm test && pnpm build && pnpm lint && pnpm lint:fsd
```
Expected: 4개 전부 PASS.

- [ ] **Step 4: 런타임 스모크(수동)**

Run: `pnpm dev` 후 브라우저에서 `http://localhost:3000/`(홈: 사이드바+섹션) 및 `http://localhost:3000/projects/<slug>`(상세 MDX) 확인. `<slug>`는 `pnpm exec node -e "console.log(require('fs').readdirSync('content/projects'))"` 또는 `content/projects/*.mdx` 파일명에서 확인(예: `payment-widget-rearchitecture`).
Expected: 두 페이지 정상 렌더, 커서 글로우·reveal·nav 스파이 동작. 콘솔 에러 0.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "📝 docs: architecture를 FSD 구조로 갱신 + 스펙 상태 마감"
```

---

## Self-Review (작성자 체크 결과)

**1. Spec coverage:**
- 5레이어(app·widgets·features빈·entities·shared) → Task 1(features)·2(shared)·3(entities)·4(widgets) ✓
- steiger 강제 + lint:fsd + 휴리스틱 off → Task 5 ✓
- 네이밍(폴더 kebab/컴포넌트 Pascal/로직 camel) → 전 태스크 경로에 반영 ✓
- codex 델타 ①server-only → Task 3 Step 5 ✓ / ②shared/ui 무배럴 직접 import → Task 2(배럴 미생성, 직접 경로) ✓ / ③steiger 테스트 튜닝 → Task 5 Step 4 ✓
- site.ts shared/config 유지(보류) → Task 2 ✓ / mdx shared/ui 유지 → Task 2 ✓
- 배럴 제거·schema 분리·테스트 코로케이트 → Task 3 ✓
- 빅뱅 단일 PR·게이트 5개(build·test·lint·steiger·런타임) → Task 6 Step 3-4 ✓
- architecture.md 갱신(AGENTS.md 규칙) → Task 6 ✓

**2. Placeholder scan:** 코드 스텝은 전부 실제 내용(schema 4분할·index.ts·테스트 전문 포함). steiger.config.ts만 버전 의존성으로 "Step 1에서 실제 API 확인 후 조정" 가드를 둠 — 이는 플레이스홀더가 아니라 외부 도구 버전 차이에 대한 검증 루프(실제 표준 코드 제공 + 확인 절차).

**3. Type consistency:** `Profile`/`Experience`/`Skills`/`ProjectMeta` 타입명, `getProfile`/`getExperience`/`getSkills`/`getProjects`/`getProjectSlugs`/`getProjectBySlug`/`getProjectContent` 함수명이 model/api/index/소비자 전반에서 일치. `siteConfig` 이름 불변. RailNav 미노출 일관.

> 주의: Task 2 Step 3에서 `src/content/profile.ts`의 config import를 갱신하지만, 같은 파일이 Task 3 Step 1에서 `getProfile.ts`로 이동한다. Task 2에서 갱신한 `@/shared/config` import는 이동 후에도 유효하므로 Task 3 Step 4는 schema import만 상대경로화하면 된다(config import 유지).
