# 코드베이스 지도 (architecture)

> 이 파일은 에이전트가 "어디를 봐야 하는지" 빠르게 찾기 위한 수동 지도다.
> **구조가 바뀌면 이 파일도 갱신한다.**

## 스택
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm.

## 디렉터리
- `src/app/` — App Router 진입. 라우팅·레이아웃·메타.
  - `layout.tsx` — 루트 레이아웃(폰트·전역 wrapper·메타·Vercel Analytics·SpeedInsights 주입).
  - `page.tsx` — 홈(포트폴리오 단일 페이지). 섹션 컴포넌트를 조립하고 푸터를 인라인 렌더.
  - `opengraph-image.tsx` — OG 이미지 생성.
  - `globals.css` — Tailwind 전역 스타일.
- `src/components/` — UI 섹션 컴포넌트.
  - `SiteHeader.tsx` — 상단 헤더/내비(sticky, `siteConfig.name` 로고 + 앵커 링크).
  - `About.tsx` — 소개 섹션(`siteConfig.role`·`siteConfig.name` 참조).
  - `Projects.tsx` — 프로젝트 목록(데이터는 `src/data/projects.ts`).
  - `Contact.tsx` — 연락처 섹션(`siteConfig.links.*` 참조).
- `src/config/site.ts` — 사이트 메타(제목·설명·링크 등) 단일 소스.
- `src/data/projects.ts` — 프로젝트 데이터(콘텐츠).

## 데이터 흐름
`src/data/projects.ts` (데이터) + `src/config/site.ts` (메타)
→ `src/components/*` (표현)
→ `src/app/page.tsx` (조립) → 렌더.

## 어디를 바꾸나
- 프로젝트 추가/수정 → `src/data/projects.ts`.
- 사이트 제목·설명·메타 → `src/config/site.ts`.
- 섹션 레이아웃/디자인 → 해당 `src/components/*.tsx`.
- 전역 스타일 → `src/app/globals.css`.
- 페이지 구성(섹션 순서) → `src/app/page.tsx`.
