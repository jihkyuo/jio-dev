# TOC 사이드바 F2W 적용 — Plan

> 작성일 2026-06-30
> **에이전트 실행용:** 이 계획은 task 단위로 구현한다. 각 step은 체크박스(`- [ ]`)로 추적. 순수 함수는 TDD(Vitest), 레이아웃/스크롤 의존부는 구현 + 브라우저 수동 검증(컴포넌트 테스트 하니스 없음 — 새 의존성 추가 안 함).

**목표:** 케이스 스터디 `xl+` 사이드 목차를 확정 시안 **F2W**(아코디언 + 포커스 디밍 + 채움 삼각형 + 상·하위 활성 색 통일=흰색, accent는 구조 표식)로 교체하되, **기존 반응형 분기(모바일 인라인 `<details>`)는 그대로 보존**한다.

**접근(Approach):** 평탄한 `TocHeading[]`을 h2 섹션 + h3 자식으로 묶는 순수 함수(`groupHeadings`)와 스크롤 위치 기반 활성 추적 훅(`useActiveHeading`)을 신설하고, `TocSidebar`를 이 둘을 소비하는 F2W 아코디언으로 재작성한다. `TableOfContents`는 2-렌더 분기를 유지한 채 `xl+` `<aside>`만 **좌→우 이동 + 본문과 ~4rem 간격**으로 조정한다. 모바일 인라인 분기는 손대지 않는다.

**Tech Stack:** Next 16.2.9 (App Router, RSC), React 19.2.4(`inert` 지원), Tailwind v4(arbitrary value), Vitest 4.

## Global Constraints

- 패키지 매니저 **pnpm**. 명령: `pnpm test` / `pnpm typecheck` / `pnpm lint` / `pnpm build`.
- 다크 테마 토큰(globals.css): `--head #f1f3f6`(흰=현재위치) · `--muted #7e8593` · `--body #b7bdc8` · `--accent #7e9cd4`(구조 표식) · `--line #1e222a`. Tailwind 매핑: `text-head/text-muted/text-body`, `border-line/border-accent`, `text-accent`.
- 모션: globals.css의 `prefers-reduced-motion` 블록이 모든 transition을 무력화 → 별도 처리 불필요(애니메이션은 자동으로 즉시 전환됨, 콘텐츠 표시/숨김은 유지).
- FSD 경계 준수(`pnpm lint:fsd`/steiger). 신규 파일은 `widgets/toc/lib/`에 둔다.

## 영향 파일 (Files)

- **신설** `src/widgets/toc/lib/groupHeadings.ts` — `TocSection` 타입 + `groupHeadings()` + `findOwnerId()`. 순수.
- **신설** `src/widgets/toc/lib/groupHeadings.test.ts` — Vitest 단위 테스트.
- **신설** `src/widgets/toc/lib/useActiveHeading.ts` — 스크롤 위치 기반 활성 헤딩 훅(client).
- **수정/재작성** `src/widgets/toc/ui/TocSidebar.tsx` — F2W 아코디언 사이드바.
- **수정** `src/widgets/toc/ui/TableOfContents.tsx` — `xl+` `<aside>` 우측 이동 + 간격. 모바일 `<details>` 분기 **무변경**.

> `index.ts` 공개 API 변경 없음(여전히 `TableOfContents`만 노출).

## 반응형 처리 (놓치지 말 것)

| 브레이크포인트 | 렌더 | 처리 |
|---|---|---|
| `< xl` (모바일/태블릿) | 글 상단 인라인 `<details open>` 평면 목록 | **보존 — 무변경.** 사이드바가 sticky로 항상 보이지 않으므로 스크롤스파이·아코디언·포커스 디밍은 의미 없음(YAGNI). |
| `xl+` (데스크톱) | fixed sticky `<aside>` → `TocSidebar` | **F2W 적용** + 좌→우 이동 + 본문과 ~4rem 간격. |

근거: 아코디언/포커스/스크롤스파이는 "읽는 동안 계속 보이는 사이드바"에서만 성립한다. 모바일 인라인 TOC는 글 초입의 정적 네비이므로 평면 목록이 옳다. → 이렇게 분기를 유지하는 것이 곧 기존 반응형을 보존하는 것.

---

### Task 1: 헤딩 그룹핑 순수 함수 (`groupHeadings`, `findOwnerId`)

**Files:**
- Create: `src/widgets/toc/lib/groupHeadings.ts`
- Test: `src/widgets/toc/lib/groupHeadings.test.ts`

**Interfaces:**
- Consumes: `TocHeading` (`{ id: string; text: string; level: 2 | 3 }`) from `@/shared/lib/extractHeadings`.
- Produces:
  - `type TocSection = { heading: TocHeading; children: TocHeading[] }`
  - `groupHeadings(headings: TocHeading[]): TocSection[]`
  - `findOwnerId(sections: TocSection[], activeId: string): string | null`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// src/widgets/toc/lib/groupHeadings.test.ts
import { describe, it, expect } from "vitest";
import { groupHeadings, findOwnerId } from "./groupHeadings";
import type { TocHeading } from "@/shared/lib/extractHeadings";

const H = (id: string, level: 2 | 3): TocHeading => ({ id, text: id, level });

describe("groupHeadings", () => {
  it("h2 아래 연속된 h3를 자식으로 묶는다", () => {
    const out = groupHeadings([H("a", 2), H("b", 2), H("b1", 3), H("b2", 3), H("c", 2)]);
    expect(out.map((s) => s.heading.id)).toEqual(["a", "b", "c"]);
    expect(out[0].children).toEqual([]);
    expect(out[1].children.map((c) => c.id)).toEqual(["b1", "b2"]);
    expect(out[2].children).toEqual([]);
  });

  it("h2 이전에 나온 h3는 버린다(방어)", () => {
    expect(groupHeadings([H("x", 3), H("a", 2)])).toEqual([
      { heading: H("a", 2), children: [] },
    ]);
  });

  it("빈 입력은 빈 배열", () => {
    expect(groupHeadings([])).toEqual([]);
  });
});

describe("findOwnerId", () => {
  const secs = groupHeadings([H("a", 2), H("b", 2), H("b1", 3), H("b2", 3)]);
  it("자식 id면 부모 h2 id를 돌려준다", () => {
    expect(findOwnerId(secs, "b2")).toBe("b");
  });
  it("h2 id면 자기 자신", () => {
    expect(findOwnerId(secs, "a")).toBe("a");
  });
  it("없는 id면 null", () => {
    expect(findOwnerId(secs, "zzz")).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm test src/widgets/toc/lib/groupHeadings.test.ts` · Expected: FAIL (`groupHeadings` 모듈 없음)

- [ ] **Step 3: 최소 구현**

```ts
// src/widgets/toc/lib/groupHeadings.ts
import type { TocHeading } from "@/shared/lib/extractHeadings";

export type TocSection = { heading: TocHeading; children: TocHeading[] };

/** 평탄한 헤딩 목록을 h2 섹션 + 그 아래 h3 자식으로 묶는다. h2 이전 h3는 버린다. */
export function groupHeadings(headings: TocHeading[]): TocSection[] {
  const sections: TocSection[] = [];
  for (const h of headings) {
    if (h.level === 2) sections.push({ heading: h, children: [] });
    else if (sections.length > 0) sections[sections.length - 1].children.push(h);
  }
  return sections;
}

/** activeId(= h2 자신이거나 어떤 h2의 자식)를 소유한 h2 id를 찾는다. */
export function findOwnerId(sections: TocSection[], activeId: string): string | null {
  for (const s of sections) {
    if (s.heading.id === activeId) return s.heading.id;
    if (s.children.some((c) => c.id === activeId)) return s.heading.id;
  }
  return null;
}
```

- [ ] **Step 4: 통과 확인** — Run: `pnpm test src/widgets/toc/lib/groupHeadings.test.ts` · Expected: PASS (6 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/widgets/toc/lib/groupHeadings.ts src/widgets/toc/lib/groupHeadings.test.ts
git commit -m "✨ feat: TOC 헤딩 그룹핑·소유자 탐색 순수 함수"
```

---

### Task 2: 스크롤 위치 기반 활성 헤딩 훅 (`useActiveHeading`)

**Files:**
- Create: `src/widgets/toc/lib/useActiveHeading.ts`

**Interfaces:**
- Produces: `useActiveHeading(ids: string[]): string` — 현재 활성 헤딩 id 반환.
- 정책(메모리 toc-sidebar-redesign 반영): 뷰포트 상단 30% 선을 마지막으로 지난 헤딩을 활성으로 본다 → **긴 인트로에도 부모 h2가 유지**되고, 맨 위에서는 첫 항목으로 폴백(stale active 방지), topmost가 자연 선택됨.

- [ ] **Step 1: 구현 작성**

```ts
// src/widgets/toc/lib/useActiveHeading.ts
"use client";

import { useEffect, useState } from "react";

/**
 * 스크롤 위치 기반 활성 헤딩 추적.
 * 뷰포트 상단 30% 선(probe)을 마지막으로 지난 헤딩을 활성으로 본다.
 * - 긴 인트로: 다음 헤딩이 probe를 넘기 전까지 부모가 유지됨.
 * - 최상단: probe 위에 아무것도 없으면 첫 항목으로 폴백.
 */
export function useActiveHeading(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const probe = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute(); // 초기 1회
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return activeId;
}
```

> 호출부에서 `ids`는 `useMemo`로 안정화해 effect 재실행을 막는다(Task 3).

- [ ] **Step 2: 타입 확인** — Run: `pnpm typecheck` · Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/toc/lib/useActiveHeading.ts
git commit -m "✨ feat: 스크롤 위치 기반 활성 헤딩 추적 훅"
```

---

### Task 3: `TocSidebar` F2W 아코디언 재작성

**Files:**
- Modify(전면 재작성): `src/widgets/toc/ui/TocSidebar.tsx`

**Interfaces:**
- Consumes: `TocSection`, `groupHeadings`, `findOwnerId` (Task 1), `useActiveHeading` (Task 2).
- Produces: 동일 시그니처 `TocSidebar({ headings }: { headings: TocHeading[] })`.

**F2W 규칙(시안 확정본):**
- 포커스 디밍: 소유 섹션(현재 읽는 섹션) `opacity-100`, 그 외 `opacity-40`.
- 상위 h2 활성/소유 → `text-head`(흰색), 비활성 → `text-muted`. **자식 유무와 무관하게** 활성은 흰색.
- 채움 삼각형: 자식 있는 h2에만. 펼침 시 `rotate-90` + `text-accent`, 접힘 시 `text-muted`.
- 아코디언: 소유 섹션만 펼침. `grid-template-rows 0fr↔1fr` + `overflow-hidden`(높이 매직넘버 없이 가변 자식 대응). 접힌 그룹은 `inert`로 탭/AX 제외(React 19.2).
- 펼친 그룹의 비활성 자식 `text-body`, **활성 자식 `text-head`(흰색)** + 왼쪽 보더 `border-line→border-accent`(구조 표식).
- 활성 링크 `aria-current="location"`.

- [ ] **Step 1: 전면 재작성**

```tsx
// src/widgets/toc/ui/TocSidebar.tsx
"use client";

import { useMemo } from "react";
import type { TocHeading } from "@/shared/lib/extractHeadings";
import { groupHeadings, findOwnerId } from "../lib/groupHeadings";
import { useActiveHeading } from "../lib/useActiveHeading";

export function TocSidebar({ headings }: { headings: TocHeading[] }) {
  const sections = useMemo(() => groupHeadings(headings), [headings]);
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useActiveHeading(ids);
  const ownerId = findOwnerId(sections, activeId);

  return (
    <nav aria-label="목차" className="font-mono text-sm">
      <p className="mb-4 pl-1 text-xs uppercase tracking-wide text-muted">목차</p>
      <ul>
        {sections.map((s) => {
          const isOwner = s.heading.id === ownerId;
          const hasChildren = s.children.length > 0;
          const expanded = isOwner && hasChildren;
          return (
            <li
              key={s.heading.id}
              className={"transition-opacity duration-300 " + (isOwner ? "opacity-100" : "opacity-40")}
            >
              <a
                href={`#${s.heading.id}`}
                aria-current={activeId === s.heading.id ? "location" : undefined}
                className={
                  "flex items-start gap-2 py-1.5 leading-snug transition-colors " +
                  (isOwner ? "text-head" : "text-muted hover:text-body")
                }
              >
                {hasChildren ? (
                  <svg
                    viewBox="0 0 8 10"
                    aria-hidden
                    className={
                      "mt-1.5 h-2.5 w-2 flex-none transition-transform duration-300 " +
                      (expanded ? "rotate-90 text-accent" : "text-muted")
                    }
                  >
                    <path d="M0 0l8 5-8 5z" fill="currentColor" />
                  </svg>
                ) : (
                  <span className="mt-1.5 h-2.5 w-2 flex-none" aria-hidden />
                )}
                <span className="flex-1">{s.heading.text}</span>
              </a>

              {hasChildren && (
                <div
                  inert={!expanded ? true : undefined}
                  className={
                    "grid overflow-hidden pl-[18px] transition-[grid-template-rows] duration-300 ease-out " +
                    (expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                  }
                >
                  <ul className="min-h-0">
                    {s.children.map((c) => {
                      const active = activeId === c.id;
                      return (
                        <li key={c.id}>
                          <a
                            href={`#${c.id}`}
                            aria-current={active ? "location" : undefined}
                            className={
                              "block border-l py-1.5 pl-[10px] text-[12.8px] leading-snug transition-colors " +
                              (active ? "border-accent text-head" : "border-line text-body hover:text-head")
                            }
                          >
                            {c.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: 타입/린트** — Run: `pnpm typecheck && pnpm lint` · Expected: 에러 없음

- [ ] **Step 3: 브라우저 수동 검증** — Run: `pnpm dev` → `http://localhost:3000/projects/dnd-fractional-indexing` (xl 폭 ≥1280px)
  - 스크롤 시 활성 항목이 따라옴(흰색 강조).
  - 딥다이브 진입 시 그 그룹만 펼쳐지고 삼각형 회전+accent, 나머지 섹션 흐려짐.
  - **딥다이브 제목 클릭 → 딥다이브 헤딩으로 이동**(첫 h3 아님), 긴 인트로 동안 "딥다이브" 활성 유지.
  - 자식 없는 h2(요약 등) 활성 시에도 **흰색**(회색 아님).
  - 활성 자식 = 흰색 + 좌측 accent 보더. 비활성 자식 = body.
  - `prefers-reduced-motion` 켠 상태에서 펼침/회전이 즉시 전환(콘텐츠 정상 표시).

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/toc/ui/TocSidebar.tsx
git commit -m "✨ feat: TOC 사이드바 F2W — 아코디언·포커스·활성색 통일"
```

---

### Task 4: `TableOfContents` 반응형 — 사이드바 우측 이동(모바일 분기 보존)

**Files:**
- Modify: `src/widgets/toc/ui/TableOfContents.tsx`

**Interfaces:**
- Consumes: `TocSidebar` (Task 3). 시그니처 변경 없음.

- [ ] **Step 1: `xl+` `<aside>`만 좌→우 이동 + 간격 확대.** 모바일 `<details>` 블록은 **그대로 둔다.**

기존(좌측):
```tsx
<aside className="no-print fixed top-24 left-[max(1.5rem,calc(50%-34rem))] hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block">
```
변경(우측, 본문 max-w-2xl=32rem 기준 ~4rem 간격, 좁은 xl에서 오버플로 방지 clamp):
```tsx
<aside className="no-print fixed top-24 left-[min(calc(50%+20rem),calc(100vw-14rem))] hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block">
```

> 그 외(`<details ... xl:hidden>` 인라인 모바일 목록, `headings.length===0` 가드)는 무변경.

- [ ] **Step 2: 타입/린트/빌드** — Run: `pnpm typecheck && pnpm lint && pnpm build` · Expected: 성공

- [ ] **Step 3: 반응형 수동 검증** — `pnpm dev`
  - **≥1280px**: 사이드바가 본문 **오른쪽**에 ~4rem 간격으로 뜸. 1280·1440·1920px에서 본문/뷰포트와 겹침 없음.
  - **<1280px**: 사이드바 숨김, 글 상단 인라인 `<details>` 목록이 **이전과 동일하게** 표시·동작.
  - 인쇄 미리보기에서 `.no-print`로 TOC 비표시(회귀 없음).

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/toc/ui/TableOfContents.tsx
git commit -m "🎨 style: TOC 사이드바 우측 배치·간격(모바일 분기 보존)"
```

---

## 트레이드오프 / 리스크

- **스크롤스파이 방식 전환**(IntersectionObserver → 스크롤 probe): 긴 인트로/topmost/최상단 stale 문제를 한 번에 해결(시안에서 검증). 리스크=스크롤 리스너 비용 → `requestAnimationFrame` + `passive`로 완화.
- **`inert` 접힌 그룹**: React 19.2 지원. 미지원 환경에선 링크가 시각적으로만 숨겨지고 탭 도달 가능(점진적 저하) — 모바일 `<details>`가 완전한 접근 가능 목차를 별도 제공하므로 허용.
- **`grid-rows 0fr↔1fr` 아코디언**: max-height 매직넘버 없이 가변 자식 대응. `overflow-hidden`+`min-h-0` 필수. reduced-motion에서 transition 무력화돼 즉시 전환(콘텐츠 표시/숨김은 유지).
- **모바일 정적 유지**: 의도적(인라인 TOC는 sticky가 아니라 스크롤스파이/아코디언이 무의미). 추후 모바일에도 적용하려면 별도 결정.
- **컴포넌트 단위 테스트 부재**: 레이아웃/스크롤 의존부는 jsdom으로 의미 있는 검증 불가, `@testing-library` 신규 도입은 범위 밖(YAGNI). 순수 함수만 TDD, 나머지는 브라우저 수동 검증으로 커버.
- **우측 좌표값**(`50%+20rem`/`100vw-14rem`)은 시작값 — 실제 폭에서 눈으로 미세 조정.
