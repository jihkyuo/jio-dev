# 코드베이스 지도 (architecture)

> 이 파일은 에이전트가 "어디를 봐야 하는지" 빠르게 찾기 위한 수동 지도다.
> **구조가 바뀌면 이 파일도 갱신한다.**

## 스택
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm.
콘텐츠 검증 `zod`, frontmatter 파싱 `gray-matter`, 프로젝트 본문 렌더 `next-mdx-remote/rsc` + `remark-gfm`, 테스트 `vitest`.

## 레이아웃·톤(한눈에)
- **레이아웃 B — 2단**: 좌측 고정 레일(`Sidebar`, Blueprint 도트 그리드 + 번호 틱 nav) + 우측 스크롤 콘텐츠. 모바일에선 레일이 위로 쌓임.
- **톤**: Grain·Steel **다크 전용**. 토큰은 `globals.css`의 CSS 변수 + Tailwind `@theme`로 단일 출처(`bg/head/body/muted/accent/card/line`).
- **인터랙션**: 커서 글로우·스크롤 reveal·nav 스크롤 스파이 — 전부 reduced-motion/터치/고대비에서 비활성.

## 디렉터리

### `src/content/` — 타입 안전 콘텐츠 레이어(단일 출처)
- `schema.ts` — zod 스키마 + 추론 타입(`Profile`·`Experience`·`Skills`·`ProjectMeta`). 모든 콘텐츠는 로드 시 `.parse`로 검증(잘못되면 빌드 실패).
- `profile.ts` — Hero/사이드바용 프로필(`getProfile`). 이름·링크는 `@/config/site` 재사용.
- `experience.ts` — 경력 타임라인(`getExperience`, 최신순 정렬).
- `skills.ts` — 스킬 분류(`getSkills`: Core/Comfortable/Production).
- `projects.ts` — 프로젝트 로더: `getProjects`·`getProjectSlugs`·`getProjectBySlug`·`getProjectContent`. `content/projects/*.mdx`의 frontmatter를 gray-matter로 읽고 zod로 검증, 본문 문자열 반환. slug 경로 트래버설 가드.
- `index.ts` — 콘텐츠 API 배럴. **컴포넌트는 항상 `@/content`를 통해 데이터를 읽는다.**
- `content/projects/*.mdx` (저장소 루트) — 프로젝트 상세 본문 + frontmatter(title·slug·period·role·teamSize·stack·impact·summary·links·order).

### `src/app/` — App Router(라우팅·레이아웃·메타)
- `layout.tsx` — 루트 레이아웃(폰트·다크 고정·그레인 위 콘텐츠 래퍼·`<CursorGlow/>`·Analytics).
- `page.tsx` — 홈. 2단 그리드(좌 `Sidebar` + 우 섹션들), 우측 섹션을 `<Reveal>`로 감싸 스크롤 등장.
- `projects/[slug]/page.tsx` — 프로젝트 상세(MDX). `generateStaticParams`·`dynamicParams=false`·`generateMetadata`, TL;DR 스트립 + `<MDXRemote>` 본문.
- `sitemap.ts` — 홈 + 모든 프로젝트 상세 URL.
- `opengraph-image.tsx` — OG 이미지(Grain·Steel 색).
- `globals.css` — 토큰·그레인·`.rail-grid`·focus-visible·reduced-motion·print·forced-colors·no-JS 폴백.

### `src/components/` — UI
- **서버 섹션**: `Sidebar`(좌측 레일, `RailNav` 포함) · `About` · `Experience` · `Skills` · `Projects`(상세 링크) · `Contact`.
- **클라이언트 인터랙션 islands**(`"use client"`): `CursorGlow`(커서 추적 광원) · `Reveal`(스크롤 등장) · `RailNav`(nav 스크롤 스파이 활성 인디케이터).
- `mdx.tsx` — 프로젝트 MDX 본문의 요소 매핑(토큰 스타일 h2/h3/p/ul/li/a/code/pre).

### 기타
- `src/config/site.ts` — 사이트 메타(제목·설명·링크) 단일 소스(OG·메타데이터·프로필 링크가 참조).

## 데이터 흐름
`content/projects/*.mdx` + `src/content/*.ts`(zod 검증) + `src/config/site.ts`
→ `src/content/index.ts`(배럴)
→ `src/components/*`(서버 렌더) + 클라이언트 islands(인터랙션)
→ `src/app/page.tsx`·`projects/[slug]/page.tsx`(조립·라우팅) → 렌더.

## 어디를 바꾸나
- 프로필·경력·스킬 → `src/content/{profile,experience,skills}.ts`.
- 프로젝트 추가 → `content/projects/<slug>.mdx`(frontmatter + 본문) 한 개 추가.
- 콘텐츠 스키마/필수 필드 → `src/content/schema.ts`.
- 사이트 제목·설명·링크 → `src/config/site.ts`.
- 섹션 디자인 → 해당 `src/components/*.tsx`.
- 디자인 토큰·전역 효과(그레인·접근성·print) → `src/app/globals.css`.
- 인터랙션 동작 → `src/components/{CursorGlow,Reveal,RailNav}.tsx`.
- 페이지 구성(섹션 순서·2단 배치) → `src/app/page.tsx`.
- 상세 페이지 레이아웃/메타 → `src/app/projects/[slug]/page.tsx`.

## 설계 기록
방향·IA·비주얼·구현 분할은 `docs/specs/portfolio/`(spec + plan-1/2/3)에 있다.

> ⚠️ **현재 콘텐츠는 전부 목업 샘플이다.** 실제 내용 채우기는
> `docs/specs/portfolio/content-handoff.md`(어디를 채울지·목업 경계·형식 규칙)를 먼저 읽는다.
