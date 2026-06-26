# Plan 2 — 코어 렌더링 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Plan 1의 타입 안전 콘텐츠를 실제 화면으로 렌더한다 — 홈 단일 컬럼(Hero·About·Experience·Skills·Projects·Contact) + `/projects/[slug]` MDX 상세 + 메타데이터·sitemap. Grain·Steel 비주얼 토큰까지 적용(인터랙션·a11y·검증은 Plan 3).

**Architecture:** App Router 서버 컴포넌트가 `@/content` 로더에서 데이터를 읽어 정적 렌더한다. 프로젝트 상세 본문은 로더가 추출한 MDX 문자열을 `next-mdx-remote/rsc`로 컴파일해 렌더한다(번들러 동적 import 회피 → 안정적). Grain·Steel은 `globals.css`의 CSS 변수 + Tailwind4 `@theme`로 단일 출처화한다.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind 4 · next-mdx-remote(RSC) · remark-gfm.

## Global Constraints
- pnpm ONLY. 커밋: gitmoji + Conventional Commits 한국어.
- Next 코드 작성 전 `node_modules/next/dist/docs/` 관련 가이드 확인.
- 경로 별칭 `@/*` → `./src/*`. tsconfig strict.
- **다크 전용**(라이트 모드 없음). 비주얼 토큰(spec rev1):
  `--bg:#101216` · `--head:#f1f3f6` · `--body:#aab1bd` · `--muted:#7e8593` · `--ac:#7e9cd4` · `--card:#15181e` · `--line:#1e222a`.
- 레이아웃 A: 중앙 단일 컬럼(본문 max-w ≈ 40rem), 상단 nav.
- 본문 텍스트 AAA 대비 유지.
- **인터랙션(커서 글로우·스크롤 reveal)·reduced-motion·print·forced-colors·키보드 a11y·최종 검증은 Plan 3** — 이 Plan에서는 정적 구조/토큰/라우팅/메타까지만.
- 콘텐츠 텍스트는 샘플 placeholder(사용자가 추후 교체). 이력서 파일 `public/resume.pdf`는 사용자가 추후 추가(이 Plan은 링크만).
- 데이터는 항상 `@/content` 배럴을 통해 읽는다(개별 파일 직접 import 금지).

## File Structure
- `src/content/projects.ts` — 수정: `getProjectContent(slug)` 추가(메타+본문 문자열), `getProjectBySlug(slug)` 추가.
- `src/content/index.ts` — 수정: 신규 함수 re-export.
- `src/app/globals.css` — 교체: Grain·Steel 다크 토큰 + `@theme` + 그레인 오버레이.
- `src/app/layout.tsx` — 수정: 다크 고정, 폰트 유지.
- `src/components/SiteHeader.tsx` — 교체: Layout A nav + 이력서.
- `src/components/Hero.tsx` — 신규.
- `src/components/About.tsx` — 교체.
- `src/components/Experience.tsx` — 신규.
- `src/components/Skills.tsx` — 신규.
- `src/components/Projects.tsx` — 교체: `@/content` + 상세 링크.
- `src/components/Contact.tsx` — 교체: 토큰화 + 이력서.
- `src/app/page.tsx` — 교체: Layout A 조립.
- `src/app/projects/[slug]/page.tsx` — 신규: 상세(메타 TL;DR + MDX 본문) + `generateStaticParams`·`dynamicParams=false`·`generateMetadata`.
- `src/components/mdx.tsx` — 신규: MDX 컴포넌트 매핑(토큰 스타일).
- `src/app/sitemap.ts` — 신규.
- `src/data/projects.ts` — 삭제(구 샘플, Projects 교체 후 고아).

---

### Task 1: MDX 인프라 스파이크 + 본문 로더 (DE-RISK FIRST)

목표: 한 개 프로젝트의 MDX 본문이 `/projects/[slug]`에서 실제 렌더되어 **빌드가 그린**이 되는 것. 스타일은 최소(Plan에서 나중에). 이게 안 되면 BLOCKED로 보고(접근법 교체).

**Files:**
- Modify: `src/content/projects.ts`, `src/content/index.ts`
- Create: `src/app/projects/[slug]/page.tsx`
- Test: `src/content/projects.test.ts` (확장)

**Interfaces:**
- Produces: `getProjectContent(slug: string): { meta: ProjectMeta; content: string }` (slug 없으면 throw), `getProjectBySlug(slug: string): ProjectMeta | undefined`.

- [ ] **Step 1: 의존성 설치**
```bash
pnpm add next-mdx-remote remark-gfm
```

- [ ] **Step 2: 실패 테스트(로더 확장)**
`src/content/projects.test.ts`에 추가:
```ts
import { getProjectContent } from "@/content/projects";

describe("getProjectContent", () => {
  it("returns meta and raw mdx body for a known slug", () => {
    const { meta, content } = getProjectContent("payment-widget-rearchitecture");
    expect(meta.slug).toBe("payment-widget-rearchitecture");
    expect(content).toContain("##"); // 본문 마크다운 존재
    expect(content).not.toContain("---\ntitle"); // frontmatter는 제거됨
  });
  it("throws for an unknown slug", () => {
    expect(() => getProjectContent("nope")).toThrow("nope");
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**
Run: `pnpm test src/content/projects.test.ts` → FAIL (getProjectContent 없음).

- [ ] **Step 4: 로더 확장**
`src/content/projects.ts`에 추가(기존 코드 유지, gray-matter는 이미 import됨):
```ts
import { existsSync } from "node:fs";

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectContent(slug: string): { meta: ProjectMeta; content: string } {
  const file = join(PROJECTS_DIR, `${slug}.mdx`);
  if (!existsSync(file)) {
    throw new Error(`[content] 프로젝트를 찾을 수 없음: ${slug}`);
  }
  const raw = readFileSync(file, "utf8");
  const { content } = matter(raw);
  const meta = parseProjectFile(raw, `${slug}.mdx`);
  return { meta, content };
}
```
`src/content/index.ts`에 추가:
```ts
export { getProjects, getProjectSlugs, getProjectBySlug, getProjectContent } from "@/content/projects";
```

- [ ] **Step 5: 테스트 통과 확인**
Run: `pnpm test src/content/projects.test.ts` → PASS.

- [ ] **Step 6: 최소 상세 라우트(본문 렌더)**
Create `src/app/projects/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getProjectSlugs, getProjectContent } from "@/content";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data;
  try {
    data = getProjectContent(slug);
  } catch {
    notFound();
  }
  const { meta, content } = data!;
  return (
    <main>
      <h1>{meta.title}</h1>
      <MDXRemote
        source={content}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </main>
  );
}
```

- [ ] **Step 7: 빌드로 검증(스파이크 게이트)**
Run: `pnpm build`
Expected: 성공, 그리고 출력에 `/projects/[slug]`가 **2개 정적 경로**(payment-widget-rearchitecture, design-system-v2)로 prerender됨. 빌드 로그에서 확인.
실패 시(예: next-mdx-remote가 Next16 RSC에서 깨짐): **BLOCKED 보고**. 대체안 메모 — `@next/mdx` + `remark-frontmatter`(Turbopack는 문자열 플러그인) + `@content/*` tsconfig alias 동적 import. 컨트롤러가 접근법 교체 후 재지시.

- [ ] **Step 8: 커밋**
```bash
git add src/content/projects.ts src/content/index.ts src/content/projects.test.ts "src/app/projects/[slug]/page.tsx" package.json pnpm-lock.yaml
git commit -m "✨ feat: MDX 상세 렌더 인프라 + 본문 로더"
```

---

### Task 2: Grain·Steel 비주얼 토큰 + 레이아웃 베이스

**Files:**
- Modify: `src/app/globals.css`(교체), `src/app/layout.tsx`

- [ ] **Step 1: globals.css 교체**
```css
@import "tailwindcss";

:root {
  --bg: #101216;
  --head: #f1f3f6;
  --body: #aab1bd;
  --muted: #7e8593;
  --accent: #7e9cd4;
  --card: #15181e;
  --line: #1e222a;
}

@theme inline {
  --color-bg: var(--bg);
  --color-head: var(--head);
  --color-body: var(--body);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-card: var(--card);
  --color-line: var(--line);
  --font-sans: var(--font-noto-kr);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--bg);
  color: var(--body);
  font-family: var(--font-sans), system-ui, sans-serif;
  position: relative;
}

/* 정적 미세 그레인 오버레이 (인터랙티브 커서 글로우는 Plan 3) */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: layout.tsx 다크 고정**
`<html lang="ko" ...>`에서 폰트 변수는 유지. body를 `relative z-0` 콘텐츠가 그레인 위에 오도록: `<body className="min-h-full flex flex-col">` 유지하되, 페이지 콘텐츠 래퍼에 `relative z-[1]`을 주는 건 각 페이지에서 처리(또는 main에 부여). 라이트/다크 미디어쿼리는 globals에서 제거됨. Analytics/SpeedInsights 유지.

- [ ] **Step 3: 빌드 + 시각 확인**
Run: `pnpm build` (성공). `pnpm lint` (클린).

- [ ] **Step 4: 커밋**
```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "✨ feat: Grain·Steel 다크 토큰·레이아웃 베이스"
```

---

### Task 3: SiteHeader (Layout A nav) + Hero + About

**Files:**
- Modify: `src/components/SiteHeader.tsx`, `src/components/About.tsx`
- Create: `src/components/Hero.tsx`

**Interfaces:** Consumes `getProfile()` from `@/content`.

- [ ] **Step 1: SiteHeader 교체** — 상단 sticky, 중앙 정렬. 좌측 이름(`#top`), 우측 nav(About/Experience/Projects/Contact) + 이력서 PDF 링크(`profile.resumePdf`, 새 탭). 토큰 클래스 사용(`text-muted hover:text-head`, `border-line`, `bg-bg/80 backdrop-blur`). nav 항목: `#about·#experience·#projects·#contact`.
```tsx
import { getProfile } from "@/content";
const NAV = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];
export function SiteHeader() {
  const p = getProfile();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono text-sm font-medium text-head">{p.name}</a>
        <ul className="flex items-center gap-5 font-mono text-xs uppercase tracking-wide text-muted">
          {NAV.map((i) => (
            <li key={i.href}><a href={i.href} className="transition-colors hover:text-head">{i.label}</a></li>
          ))}
          <li><a href={p.resumePdf} target="_blank" rel="noreferrer" className="rounded border border-accent px-3 py-1 text-accent transition-colors hover:bg-accent/10">이력서 PDF</a></li>
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Hero.tsx 신규** — eyebrow(직함, 악센트·모노), 이름(대형 `text-5xl font-extrabold text-head`), 역할, 태그라인(`text-body`), Career Snapshot 한 줄(`{years}년차 · {domains.join(" · ")} · {headline}` → muted/mono), CTA 2개: `이력서 PDF ↓`(accent border) + `연락하기`(→ `#contact`) + GitHub(`links.github`). `id="top"`. 섹션 `scroll-mt-24`.

- [ ] **Step 3: About.tsx 교체** — `id="about"`, 섹션 라벨(`stitle` 스타일: 모노·악센트·구분선), placeholder 2~3문단(`text-body`, 사용자 교체용 주석). 토큰 사용.

- [ ] **Step 4: 빌드 확인** `pnpm build` 성공, `pnpm lint` 클린.

- [ ] **Step 5: 커밋**
```bash
git add src/components/SiteHeader.tsx src/components/Hero.tsx src/components/About.tsx
git commit -m "✨ feat: 헤더·Hero·About 섹션(Layout A)"
```

---

### Task 4: Experience + Skills 섹션

**Files:** Create `src/components/Experience.tsx`, `src/components/Skills.tsx`.
**Interfaces:** Consumes `getExperience()`, `getSkills()`.

- [ ] **Step 1: Experience.tsx** — `id="experience"`, 섹션 라벨 "Experience". `getExperience().map`으로 각 항목: 기간(`{start} — {end}` 모노·muted), `회사 — 역할`(head), `팀 {teamSize} · {scope}`(muted), impact 불릿 리스트(`▹` 악센트 마커, body), leadership 칩/문구(muted), stack 태그(`text-accent bg-accent/10 rounded-full`). 항목 컨테이너 `border-l-2 border-transparent hover:border-accent` 정도(정적; 모션은 Plan 3).
- [ ] **Step 2: Skills.tsx** — `id`는 별도 불필요(About/Experience 사이 또는 Projects 뒤). 3그룹(Core/Comfortable/Production) 각 라벨 + 태그 목록. `getSkills()`.
- [ ] **Step 3: 빌드/린트 확인.**
- [ ] **Step 4: 커밋** `✨ feat: Experience·Skills 섹션`

---

### Task 5: Projects 리스트 섹션 (상세 링크)

**Files:** Modify `src/components/Projects.tsx`(교체).
**Interfaces:** Consumes `getProjects()`; 각 카드는 `next/link`로 `/projects/{slug}`.

- [ ] **Step 1: 교체** — `id="projects"`, 섹션 라벨 "Selected Projects". `getProjects().map` → `<Link href={`/projects/${p.slug}`}>` 카드: 제목(head) + 기간(muted), **임팩트 한 줄 우선 노출**(`p.impact`, 악센트·모노), summary(body), 화살표 `↗`(accent). 카드 `bg-card border border-line rounded-xl p-5 hover:border-accent/50`(정적). `@/data/projects` import 제거.
- [ ] **Step 2: 빌드/린트 확인** (`@/data/projects` 참조 사라짐 확인: `grep -rn "@/data/projects" src` → 없음… 단 page.tsx가 아직 구 컴포넌트 쓰면 Task 6에서 정리).
- [ ] **Step 3: 커밋** `✨ feat: 프로젝트 리스트(상세 링크) 섹션`

---

### Task 6: 홈 조립(page.tsx) + Contact/Footer + 구 데이터 제거

**Files:** Modify `src/app/page.tsx`(교체), `src/components/Contact.tsx`(교체); Delete `src/data/projects.ts`.

- [ ] **Step 1: Contact.tsx 교체** — `id="contact"`, 라벨 "Contact", placeholder 안내문(body), CTA: 이메일(`mailto`) + 이력서 PDF + GitHub/LinkedIn. 토큰화.
- [ ] **Step 2: page.tsx 교체** — Layout A 단일 컬럼:
```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { getProfile } from "@/content";

export default function Home() {
  const p = getProfile();
  return (
    <>
      <SiteHeader />
      <main id="top" className="relative z-[1] mx-auto flex w-full max-w-2xl flex-1 flex-col gap-20 px-6 py-16">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="relative z-[1] border-t border-line">
        <div className="mx-auto max-w-2xl px-6 py-8 font-mono text-xs text-muted">© {new Date().getFullYear()} {p.name}</div>
      </footer>
    </>
  );
}
```
- [ ] **Step 3: 구 샘플 데이터 삭제(고아 정리)**
```bash
grep -rn "@/data/projects" src || echo "no references"
git rm src/data/projects.ts
```
- [ ] **Step 4: 빌드/린트** `pnpm build`·`pnpm lint`·`pnpm test`(전부 통과). 홈이 단일 컬럼으로 렌더되는지 빌드 성공으로 확인.
- [ ] **Step 5: 커밋** `✨ feat: 홈 조립(Layout A)·Contact·구 데이터 제거`

---

### Task 7: 프로젝트 상세 스타일 + 메타데이터 + sitemap

**Files:** Modify `src/app/projects/[slug]/page.tsx`; Create `src/components/mdx.tsx`, `src/app/sitemap.ts`.

- [ ] **Step 1: mdx.tsx — MDX 컴포넌트 매핑(토큰 스타일)**
`h2`(섹션 헤딩, head, 상단 여백+구분선), `h3`(딥다이브 소제목, accent), `p`(body, leading-relaxed), `ul/li`(▹ accent 마커), `a`(accent underline), `strong`(head), `code`(mono, bg-card), `pre`(bg-card rounded p-4 overflow). export `mdxComponents`.
- [ ] **Step 2: 상세 페이지 스타일링** — Task 1의 최소 페이지를 확장:
  - 상단 뒤로가기(`← Projects`, `/#projects`).
  - **TL;DR 스트립**: `meta.impact`(대형 accent·mono) + `역할 {role} · {period} · 팀 {teamSize} · {stack.join("·")}` + 링크(`meta.links.live/repo`).
  - 제목(head 대형), summary.
  - `<MDXRemote source={content} components={mdxComponents} options={{ mdxOptions:{ remarkPlugins:[remarkGfm] }}} />` — 본문(Outcome-First 골격).
  - 컨테이너 `mx-auto max-w-2xl px-6 py-16 relative z-[1]`.
- [ ] **Step 3: generateMetadata 추가**(상세 페이지)
```tsx
import type { Metadata } from "next";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = getProjectBySlug(slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: { title: meta.title, description: meta.summary, type: "article" },
  };
}
```
(`getProjectBySlug`를 `@/content`에서 import.)
- [ ] **Step 4: sitemap.ts**
```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProjectSlugs } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...getProjectSlugs().map((slug) => ({
      url: `${base}/projects/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
```
- [ ] **Step 5: sitemap 단위 테스트**
Create `src/app/sitemap.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
describe("sitemap", () => {
  it("includes home and all project detail urls", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/projects/payment-widget-rearchitecture"))).toBe(true);
    expect(urls.length).toBeGreaterThanOrEqual(3);
  });
});
```
- [ ] **Step 6: 전체 게이트** `pnpm test`(전부 통과, sitemap 포함)·`pnpm lint`·`pnpm build`(상세 2경로 prerender, sitemap 생성).
- [ ] **Step 7: 커밋** `✨ feat: 상세 스타일·메타데이터·sitemap`

---

## 후속 (Plan 3 범위)
커서 추적 배경 광원, 스크롤 reveal, nav 활성 인디케이터, `prefers-reduced-motion`·`forced-colors`·`pointer:coarse`·print 분기, 키보드 focus 가시화, 대비/접근성/빌드 최종 검증.

## Self-Review (작성자 점검)
- **Spec 커버리지:** 홈 IA 전 섹션(Hero·About·Experience·Projects·Skills·Contact) + 이력서 CTA(헤더/Hero/Contact) + Career Snapshot(Hero) + 상세 Outcome-First(MDX 본문 + TL;DR 스트립) + frontmatter→메타데이터 + sitemap + 다크 토큰 → 모두 태스크 매핑. 인터랙션·a11y·print·검증은 Plan 3로 명시 분리.
- **위험 격리:** MDX 렌더(Task 1)를 스파이크로 선행, 빌드 그린 게이트 + 실패 시 대체안 명시.
- **고아 정리:** `src/data/projects.ts` 삭제는 소비자(Projects.tsx) 교체(Task 5) 이후(Task 6).
- **타입 일관성:** `getProjectContent`/`getProjectBySlug` 시그니처가 Task 1 정의와 Task 7 사용에서 일치. 데이터는 `@/content` 배럴 경유로 통일.
