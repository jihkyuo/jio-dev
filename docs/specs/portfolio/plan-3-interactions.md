# Plan 3 — 인터랙션·접근성·검증 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 정적인 2단 Blueprint 사이트에 절제된 인터랙션(커서 글로우·스크롤 reveal·nav 활성 인디케이터)을 입히고, 접근성·reduced-motion·print·forced-colors를 갖춘 뒤 검증한다. "효과가 주인공이 아니라 분위기가 주인공" 원칙 유지.

**Architecture:** 인터랙션은 작은 클라이언트 컴포넌트(`"use client"`)로 격리한다 — 나머지 트리는 RSC 유지. 각 인터랙션은 `prefers-reduced-motion: reduce`와 `pointer: coarse`(커서계열)에서 자동 비활성된다. 접근성/print/forced-colors는 globals.css 미디어쿼리로.

**Tech Stack:** Next.js 16 App Router · React 19 (client islands) · Tailwind 4. 신규 런타임 의존성 없음(브라우저 API: pointer events, IntersectionObserver, matchMedia).

## Global Constraints
- pnpm ONLY. 커밋: gitmoji + Conventional Commits 한국어.
- Next 코드 작성 전 `node_modules/next/dist/docs/` 관련 가이드 확인(특히 client/server 경계).
- 경로 별칭 `@/*` → `./src/*`. strict.
- 다크 전용. 토큰: `--bg:#101216 --head:#f1f3f6 --body:#aab1bd --muted:#7e8593 --accent:#7e9cd4 --card:#15181e --line:#1e222a`.
- **모든 인터랙션은 `(prefers-reduced-motion: reduce)`에서 비활성/즉시표시.** 커서 글로우는 `(pointer: coarse)`(터치)에서도 비활성.
- 인터랙션은 절제(저강도·은은). 효과가 콘텐츠 가독성을 해치면 안 됨.
- 클라이언트 컴포넌트는 최소 표면적으로(필요한 부분만 `"use client"`). 데이터는 계속 `@/content` 경유.
- 본문 AAA 대비 유지. 키보드 포커스 가시화.

## File Structure
- `src/components/CursorGlow.tsx` — 신규(client): 커서 추적 배경 광원.
- `src/components/Reveal.tsx` — 신규(client): IntersectionObserver 기반 스크롤 reveal 래퍼.
- `src/components/RailNav.tsx` — 신규(client): 사이드바 nav + 스크롤 스파이 활성 인디케이터(Skills 포함).
- `src/components/Sidebar.tsx` — 수정: 인라인 nav를 `<RailNav/>`로 교체.
- `src/app/layout.tsx` — 수정: `<CursorGlow/>` 마운트.
- `src/app/page.tsx` — 수정: 우측 섹션을 `<Reveal>`로 감싸기.
- `src/components/{About,Experience,Skills,Projects,Contact}.tsx` — 수정: 섹션 라벨 `<p>` → `<h2>`(시맨틱).
- `src/app/globals.css` — 수정: focus-visible · reduced-motion · print · forced-colors 미디어쿼리.
- `src/app/opengraph-image.tsx` — 수정: Grain·Steel 토큰 색으로(Plan 1 잔재 정리).

---

### Task 1: 접근성·모션·print 기반 (globals.css) + 시맨틱 헤딩

**Files:** Modify `src/app/globals.css`; Modify `src/components/{About,Experience,Skills,Projects,Contact}.tsx`.

- [ ] **Step 1: globals.css에 추가**(기존 토큰/그레인/.rail-grid 유지, 아래 블록 append)
```css
/* 키보드 포커스 가시화 */
:where(a, button):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 2px;
}

/* 모션 최소화 — 모든 트랜지션/애니메이션 무력화 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

/* 인쇄/이력서 공유 — 다크·그레인·글로우 제거, 잉크 절약 */
@media print {
  body { background: #fff; color: #111; }
  body::before { display: none; }       /* 그레인 */
  .rail-grid { background-image: none; }
  .no-print { display: none !important; }
}
```

- [ ] **Step 2: 섹션 라벨 시맨틱 헤딩으로** — `About`·`Experience`·`Skills`·`Projects`·`Contact` 각 컴포넌트에서 섹션 라벨 `<p className="font-mono text-xs uppercase tracking-widest text-accent">…</p>` 를 **`<h2 className="font-mono text-xs uppercase tracking-widest text-accent">…</h2>`** 로 교체(클래스 동일, 태그만). h1(사이드바 이름) → h2(섹션) → h3(항목) 아웃라인 복구.

- [ ] **Step 3: 검증** `pnpm build`·`pnpm lint`·`pnpm test`(전부 통과). 빌드 후 헤딩 아웃라인이 h1→h2→h3 인지(섹션 라벨이 h2) 확인.

- [ ] **Step 4: 커밋** `✨ feat: 접근성·모션·print 기반 + 섹션 시맨틱 헤딩`

---

### Task 2: 커서 추적 배경 광원 (CursorGlow)

**Files:** Create `src/components/CursorGlow.tsx`; Modify `src/app/layout.tsx`.

- [ ] **Step 1: CursorGlow 작성**
```tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * 커서를 따라오는 저강도 배경 광원. 콘텐츠 뒤(z-0)에서 은은하게.
 * (pointer: fine) + reduced-motion 비활성 환경에서만 동작. 터치/모션최소화에서 미동작.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const okMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!fine || !okMotion) return;

    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(560px circle at var(--mx, 50%) var(--my, -20%), color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)",
      }}
    />
  );
}
```

- [ ] **Step 2: layout.tsx에 마운트** — `<body>` 안 콘텐츠 래퍼 위/앞에 `<CursorGlow />` 추가(콘텐츠 `z-[1]`/`z-1` 보다 뒤인 `z-0`). 그레인(body::before)과 공존. 예:
```tsx
<body className="relative z-0 min-h-full flex flex-col">
  <CursorGlow />
  <div className="relative z-[1]">{children}</div>
  <Analytics />
  <SpeedInsights />
</body>
```
(import 추가.)

- [ ] **Step 3: 검증** `pnpm build`·`pnpm lint`. 빌드 성공(클라이언트 컴포넌트가 RSC 트리에서 정상 분리). 데스크탑에서 마우스 이동 시 은은한 광원, 터치/`prefers-reduced-motion`에서 미동작(수동 확인 또는 설명).

- [ ] **Step 4: 커밋** `✨ feat: 커서 추적 배경 광원(가드 포함)`

---

### Task 3: 스크롤 reveal (Reveal)

**Files:** Create `src/components/Reveal.tsx`; Modify `src/app/page.tsx`.

- [ ] **Step 1: Reveal 작성**
```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 뷰포트에 들어오면 한 번 페이드+업. reduced-motion이면 즉시 표시(트랜지션 없음).
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: page.tsx 우측 섹션 래핑** — 우측 `<main>`의 lead·About·Experience·Projects·Skills·Contact를 각각 `<Reveal>…</Reveal>`로 감싼다(섹션 단위). 사이드바는 reveal 대상 아님(항상 표시). 서버 섹션을 클라이언트 `Reveal`의 children으로 전달하는 패턴(정상).
- [ ] **Step 3: 검증** `pnpm build`·`pnpm lint`·`pnpm test`. 스크롤 시 섹션이 은은히 떠오름, reduced-motion에서 즉시 표시(트랜지션 없음).
- [ ] **Step 4: 커밋** `✨ feat: 스크롤 reveal(reduced-motion 가드)`

---

### Task 4: nav 활성 인디케이터 (RailNav) + Skills 포함

**Files:** Create `src/components/RailNav.tsx`; Modify `src/components/Sidebar.tsx`.

- [ ] **Step 1: RailNav 작성**(client, 스크롤 스파이) — NAV 배열을 이 컴포넌트로 이동(About 01 / Experience 02 / Projects 03 / Skills 04 / Contact 05). IntersectionObserver로 현재 섹션 추적, 활성 항목은 `text-head` + 틱 번호 accent + 좌측 짧은 바(또는 굵게). reduced-motion이면 트랜지션만 생략(활성 표시는 유지). 마크업은 기존 Sidebar nav와 동일 스타일 유지(`flex justify-between border-t border-line py-3 ...`).
```tsx
"use client";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#about", label: "About", n: "01" },
  { href: "#experience", label: "Experience", n: "02" },
  { href: "#projects", label: "Projects", n: "03" },
  { href: "#skills", label: "Skills", n: "04" },
  { href: "#contact", label: "Contact", n: "05" },
];

export function RailNav() {
  const [active, setActive] = useState<string>("about");
  useEffect(() => {
    const ids = NAV.map((i) => i.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="mt-10 max-w-xs">
      <ul className="font-mono text-sm">
        {NAV.map((item) => {
          const on = active === item.href.slice(1);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={on ? "true" : undefined}
                className={`flex items-center justify-between border-t border-line py-3 transition-colors ${
                  on ? "text-head" : "text-muted hover:text-head"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-px transition-all ${on ? "w-5 bg-accent" : "w-0 bg-transparent"}`}
                  />
                  {item.label}
                </span>
                <span className={on ? "text-xs text-accent" : "text-xs text-accent/70"}>
                  {item.n}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```
- [ ] **Step 2: Sidebar.tsx 수정** — 인라인 `<nav>…</nav>` 블록을 `<RailNav />`로 교체(import 추가, 기존 NAV 상수 제거). 나머지(이름·역할·태그라인·snapshot·이력서·소셜)는 유지.
- [ ] **Step 3: Skills 섹션 id 확인** — `src/components/Skills.tsx`에 `id="skills"`·`scroll-mt-24`가 있는지 확인(이미 있음). 없으면 추가.
- [ ] **Step 4: 검증** `pnpm build`·`pnpm lint`·`pnpm test`. 스크롤 시 사이드바 nav 활성 항목이 바뀌고 좌측 바가 표시됨.
- [ ] **Step 5: 커밋** `✨ feat: nav 스크롤 스파이 활성 인디케이터 + Skills 포함`

---

### Task 5: OG 이미지 토큰화 + 마감 검증

**Files:** Modify `src/app/opengraph-image.tsx`; (검증).

- [ ] **Step 1: OG 이미지 색 토큰화** — `opengraph-image.tsx`의 하드코딩 색(`#0a0a0a`·`#ededed`·`#888888`·`#bbbbbb` 등)을 Grain·Steel 값으로: 배경 `#101216`, 제목 `#f1f3f6`, 직함/보조 `#aab1bd`/`#7e8593`, 악센트 라인/포인트 `#7e9cd4`. (next/og는 CSS 변수 미지원이라 hex 직접 사용 — 단 토큰 값과 일치시킬 것.) 레이아웃은 유지.
- [ ] **Step 2: 최종 검증 체크리스트**
  - `pnpm test`(전부 통과) · `pnpm lint`(클린) · `pnpm build`(`/`·`/sitemap.xml`·2 `/projects` prerender).
  - 헤딩 아웃라인: 홈이 h1(이름)→h2(섹션)→h3(항목). (빌드된 HTML 또는 컴포넌트로 확인)
  - 키보드: Tab으로 nav·이력서·프로젝트 카드·연락처 도달, focus 링 보임.
  - reduced-motion: 글로우/reveal 미동작(설명 또는 devtools emulate).
  - OG 라우트(`/opengraph-image`) 빌드됨.
- [ ] **Step 3: 커밋** `✨ feat: OG 이미지 Grain·Steel 토큰화 + Plan 3 마감`

---

## Self-Review (작성자 점검)
- **Spec/후속 커버리지:** Plan 2가 남긴 모든 Plan 3 항목 매핑 — 커서 글로우(T2)·스크롤 reveal(T3)·nav 인디케이터(T4)·reduced-motion/print/forced-colors/focus(T1)·시맨틱 헤딩(T1)·Skills nav(T4)·OG 토큰화(T5). 모바일 nav(Codex P2)는 단일 페이지 스크롤에서 콘텐츠 접근에 지장 없어 RailNav가 데스크탑/모바일 모두에서 상단 레일에 존재 — 별도 모바일 sticky 바는 과한 스코프라 제외(필요 시 후속).
- **클라이언트 경계:** 인터랙션 3종만 `"use client"`, 나머지 RSC 유지. 데이터는 RailNav가 DOM(id)으로만 동작(콘텐츠 import 불필요).
- **가드 일관성:** 모든 모션은 reduced-motion 가드, 커서 글로우는 pointer:coarse도 가드. globals의 reduced-motion 전역 무력화가 이중 안전망.
- **플레이스홀더 없음:** 핵심 컴포넌트 전체 코드 포함.
