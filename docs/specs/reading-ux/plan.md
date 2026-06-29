# 케이스 스터디 읽기 UX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 케이스 스터디(`/projects/[slug]`)의 읽기 가독성을 끌어올린다 — 타이포 위계 재정비(제목 Sans 통일), 헤딩↔URL 앵커, 반응형 목차(TOC), 콜아웃 4종.

**Architecture:** 공유 MDX 렌더러([src/shared/ui/mdx.tsx](../../../src/shared/ui/mdx.tsx))를 SSOT로 수정해 케이스 스터디 3편 전체에 적용한다. 헤딩 id는 `rehype-slug`가 부여하고, 목차는 같은 `github-slugger`로 서버에서 추출한 헤딩 데이터로 만든다. 스크롤스파이·클립보드 복사만 클라이언트 컴포넌트, 나머지는 서버 컴포넌트.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · next-mdx-remote(RSC) · rehype-slug · github-slugger · vitest.

## Global Constraints
- **pnpm ONLY**. npm/yarn 금지.
- 커밋: `{이모지} type: 한국어 요약` (gitmoji + Conventional Commits). 타입: ✨ feat / 🐛 fix / 🩹 patch / 📝 docs / 🔧 chore.
- **Next 코드 작성 전** `node_modules/next/dist/docs/`의 관련 가이드와 next-mdx-remote의 rehype 옵션 사용법을 확인한다(AGENTS.md 항시 룰).
- 경로 별칭 `@/*` → `./src/*`. tsconfig strict.
- **FSD 레이어 규칙 준수**(steiger `pnpm lint:fsd` 통과): 위젯은 `index.ts` 배럴로 공개(`@/widgets/toc`), shared는 deep import(`@/shared/ui/Callout`, `@/shared/lib/extractHeadings`). import 방향 app→widgets→…→shared 단방향.
- **다크 전용**. 팔레트·배경 `#101216`·본문 폭 `max-w-2xl` 유지(본문색 토큰 1개만 미세 조정).
- 본문 텍스트 AAA 대비 유지.
- reduced-motion·print·forced-colors 기존 규칙([globals.css:59-86](../../../src/app/globals.css#L59-L86))을 깨지 않는다.

## File Structure
- `src/app/globals.css` — 수정: 본문색 토큰 미세조정, 콜아웃 시맨틱 토큰 4개(+@theme 매핑), `html{scroll-behavior:smooth}`.
- `src/shared/ui/mdx.tsx` — 수정: h2/h3/h4/p 타이포 재정비(Sans·크기·앵커), `Callout` 매핑.
- `src/shared/ui/HeadingAnchor.tsx` — 신규(client): hover `#` 앵커 + URL 클립보드 복사.
- `src/shared/ui/Callout.tsx` — 신규: 콜아웃 4종(note/tip/warning/decision).
- `src/shared/lib/extractHeadings.ts` — 신규: MDX 문자열 → `{id,text,level}[]` 순수 파서(github-slugger).
- `src/shared/lib/extractHeadings.test.ts` — 신규: vitest 단위 테스트.
- `src/widgets/toc/ui/TableOfContents.tsx` — 신규(server): 상단 인라인(`<details>`) + 사이드(`TocSidebar`) 동시 렌더.
- `src/widgets/toc/ui/TocSidebar.tsx` — 신규(client): xl+ sticky 사이드 + 스크롤스파이.
- `src/widgets/toc/index.ts` — 신규: 배럴.
- `src/app/projects/[slug]/page.tsx` — 수정: rehype-slug 추가, 헤딩 추출, TOC 배치.
- `content/projects/dnd-fractional-indexing.mdx` — 수정: decision/warning 콜아웃 적재적소 배치.
- 신규 의존성: `rehype-slug`, `github-slugger`.

---

### Task 1: 타이포 위계 재정비 + 본문색·스크롤 토큰

가독성의 핵심. 제목을 Sans로 통일하고 모듈러 스케일로 본문과 분리한다. 앵커(Task 4) 전이므로 이 태스크에선 `id`/`scroll-mt`까지만 넣고 `#` 링크는 Task 4에서 단다.

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/shared/ui/mdx.tsx:6-18`

**Interfaces:**
- Produces: `mdxComponents`의 h2/h3/h4/p가 Sans·신규 크기로 렌더. h4 신규 매핑.

- [ ] **Step 1: globals.css — 본문색 미세조정 + smooth scroll**

[src/app/globals.css:6](../../../src/app/globals.css#L6) `--body` 값을 교체하고, `@import "tailwindcss";` 바로 아래에 smooth scroll을 추가한다.

```css
/* :root 안 */
  --body: #b7bdc8;   /* was #aab1bd — 장문 체감 선명도 ↑ (대비는 여전히 AAA) */
```

`@import "tailwindcss";`(1행) 다음에 추가:

```css
html { scroll-behavior: smooth; }
/* reduced-motion일 때 scroll-behavior:auto는 기존 :59 규칙이 이미 강제함 */
```

- [ ] **Step 2: mdx.tsx — h2/h3/p 교체 + h4 신규**

[src/shared/ui/mdx.tsx:6-18](../../../src/shared/ui/mdx.tsx#L6-L18)의 h2·h3·p를 아래로 교체하고, p 위에 h4를 추가한다. (앵커는 Task 4에서 추가하므로 지금은 순수 타이포만.)

```tsx
  h2: ({ children }) => (
    <h2 className="mt-12 mb-4 scroll-mt-24 border-t border-line pt-8 text-2xl font-bold text-head">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 scroll-mt-24 text-xl font-semibold text-head [h2+&]:mt-4">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 scroll-mt-24 text-base font-semibold text-head">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-[1.0625rem] leading-[1.75] text-body">{children}</p>
  ),
```

- [ ] **Step 3: 타입체크·린트·빌드**

```bash
pnpm typecheck && pnpm lint && pnpm lint:fsd && pnpm build
```
Expected: 모두 통과. 빌드 시 `/projects/dnd-fractional-indexing` 정적 생성 성공.

- [ ] **Step 4: 육안 확인**

```bash
pnpm dev
```
`http://localhost:3000/projects/dnd-fractional-indexing` 열어: h2가 본문보다 확연히 크고(1.5rem) Sans, h3(1.25rem)도 본문과 크기로 구분, 본문 줄간격이 넉넉(1.75)한지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/app/globals.css src/shared/ui/mdx.tsx
git commit -m "✨ feat: 케이스 스터디 타이포 위계 재정비 — 제목 Sans 통일·모듈러 스케일·본문 줄간격"
```

---

### Task 2: 콜아웃 4종 컴포넌트

`<Callout type="note|tip|warning|decision">`를 MDX에서 쓸 수 있게 한다.

**Files:**
- Modify: `src/app/globals.css` (시맨틱 토큰)
- Create: `src/shared/ui/Callout.tsx`
- Modify: `src/shared/ui/mdx.tsx` (매핑 추가)

**Interfaces:**
- Produces: `export function Callout({ type, children }: { type: "note"|"tip"|"warning"|"decision"; children: React.ReactNode })`. MDX 매핑 키 `Callout`.

- [ ] **Step 1: globals.css — 콜아웃 시맨틱 토큰 4개**

`:root`(3-11행)에 추가:

```css
  --note: var(--accent);   /* 블루 — 정보 */
  --tip: #6fbf8e;          /* 그린 — 권장 */
  --warning: #d4a45c;      /* 앰버 — 주의 */
  --decision: #a98fd4;     /* 보라 — 설계 결정 */
```

`@theme inline`(13-23행) 안 `--color-line` 다음에 추가(Tailwind `text-note`/`border-note` 등 사용 가능하게):

```css
  --color-note: var(--note);
  --color-tip: var(--tip);
  --color-warning: var(--warning);
  --color-decision: var(--decision);
```

- [ ] **Step 2: Callout 컴포넌트 작성**

Create `src/shared/ui/Callout.tsx`:

```tsx
import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "decision";

const STYLES: Record<CalloutType, { border: string; text: string; icon: string; label: string }> = {
  note:     { border: "border-note",     text: "text-note",     icon: "ℹ", label: "NOTE" },
  tip:      { border: "border-tip",      text: "text-tip",      icon: "✦", label: "TIP" },
  warning:  { border: "border-warning",  text: "text-warning",  icon: "▲", label: "WARNING" },
  decision: { border: "border-decision", text: "text-decision", icon: "◆", label: "DECISION" },
};

export function Callout({ type, children }: { type: CalloutType; children: ReactNode }) {
  const s = STYLES[type];
  return (
    <div className={`mb-8 rounded-lg border-l-4 bg-card px-5 py-4 ${s.border}`}>
      <div className={`mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wide ${s.text}`}>
        <span aria-hidden>{s.icon}</span>
        {s.label}
      </div>
      <div className="text-body [&>p]:mb-0 [&>p+p]:mt-3">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: mdx.tsx 매핑에 Callout 추가**

[src/shared/ui/mdx.tsx](../../../src/shared/ui/mdx.tsx) 상단에 import 추가, 매핑 객체에 `Callout` 키 추가.

```tsx
import { Callout } from "@/shared/ui/Callout";
// ...
  Callout,
```

- [ ] **Step 4: 임시 렌더 확인**

`content/projects/dnd-fractional-indexing.mdx` 맨 아래에 임시로 4종을 추가해 렌더 확인 후 되돌린다:

```mdx
<Callout type="note">정보 콜아웃 테스트</Callout>
<Callout type="tip">팁 콜아웃 테스트</Callout>
<Callout type="warning">주의 콜아웃 테스트</Callout>
<Callout type="decision">설계 결정 콜아웃 테스트</Callout>
```

```bash
pnpm dev
```
4종이 각기 다른 좌측 보더 색·아이콘·라벨로 렌더되는지 확인 후, 추가한 4줄을 **삭제**(실제 배치는 Task 6).

- [ ] **Step 5: 타입체크·린트·빌드·커밋**

```bash
pnpm typecheck && pnpm lint && pnpm lint:fsd && pnpm build
git add src/app/globals.css src/shared/ui/Callout.tsx src/shared/ui/mdx.tsx
git commit -m "✨ feat: MDX 콜아웃 4종(note/tip/warning/decision) 추가"
```

---

### Task 3: 헤딩 추출 유틸 (TDD)

MDX 문자열에서 h2·h3를 뽑아 `rehype-slug`와 동일한 slug을 부여한다. **순수 함수 → 단위 테스트 선행.**

**Files:**
- Create: `src/shared/lib/extractHeadings.ts`
- Test: `src/shared/lib/extractHeadings.test.ts`

**Interfaces:**
- Produces: `export type TocHeading = { id: string; text: string; level: 2 | 3 }` 및 `export function extractHeadings(mdx: string): TocHeading[]`. Task 4의 rehype-slug와 **동일 slug**을 보장해야 함(둘 다 github-slugger를 문서 순서로 1회 인스턴스 사용).

- [ ] **Step 1: 의존성 설치**

```bash
pnpm add rehype-slug github-slugger
```

- [ ] **Step 2: 실패 테스트 작성**

Create `src/shared/lib/extractHeadings.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { extractHeadings } from "./extractHeadings";

describe("extractHeadings", () => {
  it("h2·h3만 뽑고 h1·h4는 제외한다", () => {
    const md = "# 제목\n## 문제\n### 원인\n#### 세부\n본문";
    expect(extractHeadings(md)).toEqual([
      { id: "문제", text: "문제", level: 2 },
      { id: "원인", text: "원인", level: 3 },
    ]);
  });

  it("한글 헤딩의 공백을 하이픈으로, github-slugger 규칙으로 slug한다", () => {
    expect(extractHeadings("## 형제 범위 rank 재계산")).toEqual([
      { id: "형제-범위-rank-재계산", text: "형제 범위 rank 재계산", level: 2 },
    ]);
  });

  it("헤딩 텍스트의 인라인 마크다운(**bold**·`code`·링크)을 벗겨 slug·text를 만든다", () => {
    expect(extractHeadings("## **Sibling-scoped** `rank`")).toEqual([
      { id: "sibling-scoped-rank", text: "Sibling-scoped rank", level: 2 },
    ]);
  });

  it("중복 헤딩에 -1, -2 접미사를 붙인다(rehype-slug와 동일)", () => {
    expect(extractHeadings("## 검증\n## 검증")).toEqual([
      { id: "검증", text: "검증", level: 2 },
      { id: "검증-1", text: "검증", level: 2 },
    ]);
  });

  it("코드펜스 안의 ## 라인은 헤딩으로 보지 않는다", () => {
    const md = "## 진짜\n```\n## 가짜\n```\n본문";
    expect(extractHeadings(md)).toEqual([
      { id: "진짜", text: "진짜", level: 2 },
    ]);
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
pnpm test src/shared/lib/extractHeadings.test.ts
```
Expected: FAIL — `extractHeadings` 모듈 없음.

- [ ] **Step 4: 구현**

Create `src/shared/lib/extractHeadings.ts`:

```ts
import GithubSlugger from "github-slugger";

export type TocHeading = { id: string; text: string; level: 2 | 3 };

/** 헤딩 텍스트에서 인라인 마크다운 토큰을 벗긴다(rehype-slug가 보는 렌더 텍스트에 근접). */
function stripInline(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1")           // `code`
    .replace(/\*\*([^*]+)\*\*/g, "$1")      // **bold**
    .replace(/\*([^*]+)\*/g, "$1")          // *em*
    .replace(/_([^_]+)_/g, "$1")            // _em_
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url)
    .trim();
}

export function extractHeadings(mdx: string): TocHeading[] {
  const slugger = new GithubSlugger();
  const out: TocHeading[] = [];
  let inFence = false;

  for (const line of mdx.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    const text = stripInline(m[2]);
    out.push({ id: slugger.slug(text), text, level });
  }
  return out;
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
pnpm test src/shared/lib/extractHeadings.test.ts
```
Expected: PASS (5 tests).

- [ ] **Step 6: 커밋**

```bash
git add src/shared/lib/extractHeadings.ts src/shared/lib/extractHeadings.test.ts package.json pnpm-lock.yaml
git commit -m "✨ feat: MDX 헤딩 추출 유틸 — github-slugger로 목차 slug 생성"
```

---

### Task 4: 헤딩 ↔ URL 앵커 (rehype-slug + 복사)

`rehype-slug`로 실제 헤딩에 `id`를 부여하고, hover 시 `#` 링크 + 클릭하면 URL 복사.

**Files:**
- Modify: `src/app/projects/[slug]/page.tsx:5-7,59-63`
- Create: `src/shared/ui/HeadingAnchor.tsx`
- Modify: `src/shared/ui/mdx.tsx` (h2/h3/h4가 `id`를 받아 앵커 렌더)

**Interfaces:**
- Consumes: rehype-slug가 헤딩 컴포넌트에 `id` prop을 전달.
- Produces: `export function HeadingAnchor({ id }: { id: string })` (client).

- [ ] **Step 1: page.tsx에 rehype-slug 연결**

[src/app/projects/[slug]/page.tsx:5](../../../src/app/projects/[slug]/page.tsx#L5) import 추가:

```tsx
import rehypeSlug from "rehype-slug";
```

[src/app/projects/[slug]/page.tsx:62](../../../src/app/projects/[slug]/page.tsx#L62) options 교체:

```tsx
        options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
```

- [ ] **Step 2: HeadingAnchor 작성**

Create `src/shared/ui/HeadingAnchor.tsx`:

```tsx
"use client";

import { useState } from "react";

export function HeadingAnchor({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <a
      href={`#${id}`}
      onClick={copy}
      aria-label="이 섹션 링크 복사"
      className="no-print ml-2 align-middle font-mono text-sm text-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
    >
      {copied ? "복사됨" : "#"}
    </a>
  );
}
```

- [ ] **Step 3: mdx.tsx 헤딩에 id·앵커 적용**

import 추가 후, Task 1에서 만든 h2/h3/h4를 `id`를 받아 `group`과 `HeadingAnchor`를 포함하도록 교체.

```tsx
import { HeadingAnchor } from "@/shared/ui/HeadingAnchor";
// ...
  h2: ({ id, children }) => (
    <h2 id={id} className="group mt-12 mb-4 scroll-mt-24 border-t border-line pt-8 text-2xl font-bold text-head">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3 id={id} className="group mt-8 mb-3 scroll-mt-24 text-xl font-semibold text-head [h2+&]:mt-4">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h3>
  ),
  h4: ({ id, children }) => (
    <h4 id={id} className="group mt-6 mb-2 scroll-mt-24 text-base font-semibold text-head">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h4>
  ),
```

- [ ] **Step 4: 빌드·육안 확인**

```bash
pnpm typecheck && pnpm lint && pnpm lint:fsd && pnpm build && pnpm dev
```
확인: 각 헤딩에 `id`가 붙고(개발자도구), 주소창에 `…#<slug>` 직접 입력 시 해당 섹션으로 스크롤. 헤딩 hover 시 `#` 노출, 클릭 시 "복사됨" 표시 + 클립보드에 URL.

- [ ] **Step 5: 커밋**

```bash
git add src/app/projects/[slug]/page.tsx src/shared/ui/HeadingAnchor.tsx src/shared/ui/mdx.tsx
git commit -m "✨ feat: 헤딩 URL 앵커 — rehype-slug id + hover 링크·복사"
```

---

### Task 5: 반응형 목차 (TOC)

좁은 화면은 상단 인라인, xl+는 좌측 여백 sticky 사이드 + 스크롤스파이.

**Files:**
- Create: `src/widgets/toc/ui/TableOfContents.tsx` (server)
- Create: `src/widgets/toc/ui/TocSidebar.tsx` (client)
- Create: `src/widgets/toc/index.ts`
- Modify: `src/app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `TocHeading[]` (Task 3), 헤딩 `id` (Task 4).
- Produces: `export function TableOfContents({ headings }: { headings: TocHeading[] })`.

- [ ] **Step 1: TocSidebar (client, 스크롤스파이) 작성**

Create `src/widgets/toc/ui/TocSidebar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/shared/lib/extractHeadings";

export function TocSidebar({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="목차" className="font-mono text-sm">
      <p className="mb-3 text-xs uppercase tracking-wide text-muted">목차</p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${h.id}`}
              className={
                "block leading-snug transition-colors " +
                (activeId === h.id ? "text-accent" : "text-muted hover:text-body")
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: TableOfContents (server, 인라인+사이드) 작성**

Create `src/widgets/toc/ui/TableOfContents.tsx`:

```tsx
import type { TocHeading } from "@/shared/lib/extractHeadings";
import { TocSidebar } from "./TocSidebar";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (headings.length === 0) return null;

  return (
    <>
      {/* 좁은 화면: 글 초입 접이식 인라인 목차 */}
      <details
        open
        className="no-print mb-10 rounded-lg border border-line bg-card px-5 py-4 xl:hidden"
      >
        <summary className="cursor-pointer font-mono text-sm font-semibold text-head">
          목차
        </summary>
        <ul className="mt-3 space-y-2 font-mono text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a href={`#${h.id}`} className="text-muted hover:text-body">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </details>

      {/* xl+: 좌측 여백 sticky 사이드(본문 중앙 정렬 유지, fixed로 흐름 이탈) */}
      <aside className="no-print fixed top-24 left-[max(1.5rem,calc(50%-34rem))] hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block">
        <TocSidebar headings={headings} />
      </aside>
    </>
  );
}
```

- [ ] **Step 3: 배럴**

Create `src/widgets/toc/index.ts`:

```ts
export { TableOfContents } from "./ui/TableOfContents";
```

- [ ] **Step 4: page.tsx에 배치**

import 추가:

```tsx
import { extractHeadings } from "@/shared/lib/extractHeadings";
import { TableOfContents } from "@/widgets/toc";
```

`const { meta, content } = data;` 다음 줄에 추출:

```tsx
  const headings = extractHeadings(content);
```

[src/app/projects/[slug]/page.tsx:57](../../../src/app/projects/[slug]/page.tsx#L57) `<h1>` 다음(MDXRemote 위)에 인라인+사이드 렌더:

```tsx
      <h1 className="mb-4 text-3xl font-extrabold leading-tight text-head">{meta.title}</h1>

      <TableOfContents headings={headings} />

      <MDXRemote
```

- [ ] **Step 5: 빌드·반응형 확인**

```bash
pnpm typecheck && pnpm lint && pnpm lint:fsd && pnpm build && pnpm dev
```
확인:
- 창 폭 < 1280px: 글 초입에 접이식 "목차" 카드, 항목 클릭 시 해당 섹션 스크롤.
- 창 폭 ≥ 1280px: 좌측 여백에 sticky 목차, 스크롤하면 현재 섹션이 accent로 하이라이트. 본문은 여전히 중앙 정렬.
- slug 불일치로 깨지는 링크 없는지(목차 링크 클릭 → 정확한 섹션 도달) 확인.

- [ ] **Step 6: 커밋**

```bash
git add src/widgets/toc src/app/projects/[slug]/page.tsx
git commit -m "✨ feat: 반응형 케이스 스터디 목차 — 상단 인라인 + xl 사이드 스크롤스파이"
```

---

### Task 6: DnD 글 리터핑 + 3편 회귀

기존 글에 콜아웃을 적재적소(1~3곳) 배치해 "완성된 예시"를 만들고, 케이스 스터디 3편 전체 회귀를 확인한다.

**Files:**
- Modify: `content/projects/dnd-fractional-indexing.mdx`

- [ ] **Step 1: 글을 읽고 콜아웃 적재적소 식별**

```bash
pnpm dev
```
[content/projects/dnd-fractional-indexing.mdx](../../../content/projects/dnd-fractional-indexing.mdx)를 읽고, 다음 기준으로 **1~3곳만** 고른다(도배 금지):
- `decision`: "팀의 정수 순번 기본안을 버리고 fractional-indexing 채택" 같은 **설계 결정·버린 대안·왜**가 드러나는 단락.
- `warning`: fractional-indexing의 **함정**(예: 정밀도 고갈/동시편집 충돌 등 글에 실제 언급된 주의점)이 있으면 그 단락.

- [ ] **Step 2: 콜아웃 배치**

해당 단락을 `<Callout type="decision">…</Callout>` / `<Callout type="warning">…</Callout>`로 감싼다. 새 주장·사실을 지어내지 말고 **기존 문장을 옮겨 담기만** 한다(case-study-structure 사실 보존 원칙).

- [ ] **Step 3: 3편 전체 회귀 빌드**

```bash
pnpm typecheck && pnpm lint && pnpm lint:fsd && pnpm test && pnpm build
```
Expected: 모두 통과. 빌드 로그에 3개 프로젝트 슬러그 정적 생성 확인.

- [ ] **Step 4: 3편 육안 확인**

```bash
pnpm dev
```
`dnd-fractional-indexing`, `design-system-v2`, `payment-widget-rearchitecture` 세 글 모두:
- 타이포 위계·목차·앵커가 정상 동작하고 깨진 부분 없음.
- DnD 글에 콜아웃이 자연스럽게 배치됨(과하지 않음).

- [ ] **Step 5: 커밋**

```bash
git add content/projects/dnd-fractional-indexing.mdx
git commit -m "📝 docs: DnD 케이스 스터디에 설계결정·주의 콜아웃 배치"
```

---

## Self-Review (작성자 체크)

**Spec coverage:**
- R1 타이포 위계·제목 Sans → Task 1. ✓
- R2 본문색·시맨틱 토큰 → Task 1(본문색)·Task 2(토큰). ✓
- R3 앵커(rehype-slug·hover·복사·scroll-margin) → Task 4 + Task 1(scroll-mt). ✓
- R4 반응형 TOC(서버 추출·인라인·xl 사이드·스크롤스파이) → Task 3 + Task 5. ✓
- R5 콜아웃 4종 → Task 2. ✓
- R6 DnD 리터핑 → Task 6. ✓
- Acceptance "3편 회귀" → Task 6 Step 3-4. ✓

**Placeholder scan:** 모든 코드 스텝에 실제 코드·명령·기대결과 포함. TODO/TBD 없음. ✓

**Type consistency:** `TocHeading{id,text,level}`가 Task 3 정의 → Task 5(TocSidebar·TableOfContents)에서 동일 사용. `extractHeadings`·`HeadingAnchor`·`Callout` 시그니처가 정의 태스크와 사용 태스크에서 일치. rehype-slug(Task 4)와 extractHeadings(Task 3)는 둘 다 github-slugger 문서순 1회 인스턴스 → slug 일치(Task 3 테스트가 규칙 검증, Task 5 Step 5가 실제 링크 도달로 통합 검증). ✓

## 알려진 리스크
- **slug 일치**: extractHeadings의 `stripInline`이 rehype-slug의 렌더 텍스트 추출과 100% 동형은 아니다(복잡한 인라인 마크다운 헤딩에서 어긋날 수 있음). 케이스 스터디 헤딩은 단순(대부분 순수 텍스트)하므로 실무상 안전. Task 5 Step 5에서 링크 도달로 직접 검증하고, 어긋나면 해당 헤딩을 순수 텍스트로 단순화한다.
