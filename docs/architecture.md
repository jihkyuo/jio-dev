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

구조는 **Feature-Sliced Design(FSD)** 5레이어를 따른다. 레이어 간 의존 방향은 `app → widgets → entities → shared`(하향만, 가로 import 0). 경계는 **steiger**(`pnpm lint:fsd`)가 강제한다.

### `src/app/` — App Router(라우팅·레이아웃·메타)
- `layout.tsx` — 루트 레이아웃(폰트·다크 고정·그레인 위 콘텐츠 래퍼·`<CursorGlow/>`·Analytics).
- `page.tsx` — 홈. 2단 그리드(좌 `Sidebar` + 우 섹션들), 우측 섹션을 `<Reveal>`로 감싸 스크롤 등장.
- `projects/[slug]/page.tsx` — 프로젝트 상세(MDX). `generateStaticParams`·`dynamicParams=false`·`generateMetadata`. chrome는 ← 백링크 + 제목 h1까지만 제공하고, 헤드라인 칩·요약표(PAAR)·콜아웃·본문·딥다이브는 `<MDXRemote>`가 5층 골격(`case-study-structure.md` §4)으로 소유한다.
- `sitemap.ts` / `sitemap.test.ts` — 사이트맵 생성 + 테스트.
- `opengraph-image.tsx` — OG 이미지(Grain·Steel 색).
- `globals.css` — 토큰·그레인·`.rail-grid`·focus-visible·reduced-motion·print·forced-colors·no-JS 폴백.

### `src/widgets/` — 페이지 섹션(entity를 읽어 렌더)
각 슬라이스는 `ui/` + `index.ts`(public API). 슬라이스 내부 컴포넌트는 외부에 노출하지 않는다.
- `sidebar/` — `ui/Sidebar.tsx` + `ui/RailNav.tsx`(슬라이스 비공개, nav 스크롤 스파이).
- `about/` — `ui/About.tsx`.
- `experience/` — `ui/Experience.tsx`.
- `skills/` — `ui/Skills.tsx`.
- `projects/` — `ui/Projects.tsx`.
- `contact/` — `ui/Contact.tsx`.

### `src/features/` — 빈 레이어(`.gitkeep`)
현재 사용자 유스케이스(상태 변경·인터랙션 비즈니스 로직)가 0개인 정적 사이트. 다크모드 토글·연락 폼 등 실제 feature가 생기면 채운다.

### `src/entities/` — 도메인 모델 + 데이터 API
각 슬라이스: `model/schema.ts`(zod 스키마 + 추론 타입) + `api/get*.ts`(+test) + `index.ts`(public API). fs 기반 API에는 `import "server-only"` 명시(빌드타임 클라이언트 혼입 방지).
- `profile/` — `Profile` 타입, `getProfile`.
- `experience/` — `Experience` 타입, `getExperience`(최신순).
- `skill/` — `Skills` 타입, `getSkills`(Core/Comfortable/Production). *(슬라이스명 singular — steiger `inconsistent-naming` 규칙; 사용자 승인)*
- `project/` — `ProjectMeta` 타입, `getProjects`·`getProjectSlugs`·`getProjectBySlug`·`getProjectContent`. slug 경로 트래버설 가드 포함.

### `src/shared/` — 도메인 무관 재사용
- `ui/` — `CursorGlow.tsx`(커서 광원, `"use client"`) · `Reveal.tsx`(스크롤 등장, `"use client"`) · `mdx.tsx`(MDX 요소 매핑). **통배럴 없음 — 직접 경로로 import**(`@/shared/ui/CursorGlow` 등). RSC/클라이언트 경계 혼입 방지.
- `config/` — `site.ts`(사이트 메타 단일 소스: 제목·설명·링크) + `index.ts`.

### `src/__mocks__/` — 테스트 전용
- `server-only.ts` — vitest 환경에서 `"server-only"` 패키지 모킹.

### `content/projects/*.mdx` (저장소 루트)
프로젝트 상세 본문 + frontmatter. 필수: title·slug·period·role·stack·impact·summary. 선택: teamSize·links·order·featured. `entities/project`가 읽어 검증(필수 누락 시 빌드 throw). `impact`는 홈 카드(`widgets/projects`) 훅 줄, 그리고 상세 페이지 H1 아래 아웃컴 deck(0초 스캐너용 결과 verdict — PAAR R행은 방어가능 디테일, deck는 압축 결론으로 해상도가 갈린다)로 쓰인다. 본문은 `content:check`(=`vitest run src/entities`) 가드레일이 "콘텐츠-not-코드"를 강제한다 — 산문에 코드(`import`/`export`·JSX 식 `={`·`style=`/`className=`·이벤트 핸들러 `on*=`·위험 raw HTML 소문자 태그 `script`/`iframe`/`object`/`embed`/`style`/`link`/`base`/`form`/`meta`·허용목록 밖 대문자 컴포넌트) 금지(허용: `Callout`/`Pullquote`/`Chip`/`Meta`/`References`/`Reference`), MDX 사전 컴파일로 깨진 글을 빌드 전 차단(`src/entities/project/api/content-guardrail.test.ts`). 펜스/인라인 코드는 검사에서 strip돼 코드 인용은 자유.

## 데이터 흐름
`content/projects/*.mdx` + `src/entities/*/api/*.ts`(zod 검증)
→ `src/widgets/*`(서버 렌더) + 클라이언트 islands(`shared/ui/`)
→ `src/app/page.tsx`·`projects/[slug]/page.tsx`(조립·라우팅) → 렌더.

## 어디를 바꾸나
- 프로필 → `src/entities/profile/api/getProfile.ts`.
- 경력 → `src/entities/experience/api/getExperience.ts`.
- 스킬 → `src/entities/skill/api/getSkills.ts`.
- 프로젝트 추가 → `content/projects/<slug>.mdx`(frontmatter + 본문) 한 개 추가.
- 콘텐츠 스키마/필수 필드 → 해당 `src/entities/*/model/schema.ts`.
- 사이트 제목·설명·링크 → `src/shared/config/site.ts`.
- 섹션 디자인 → 해당 `src/widgets/<slice>/ui/*.tsx`.
- 디자인 토큰·전역 효과(그레인·접근성·print) → `src/app/globals.css`.
- 인터랙션 동작 → `src/shared/ui/{CursorGlow,Reveal}.tsx` / `src/widgets/sidebar/ui/RailNav.tsx`.
- 페이지 구성(섹션 순서·2단 배치) → `src/app/page.tsx`.
- 상세 페이지 레이아웃/메타 → `src/app/projects/[slug]/page.tsx`.

## 설계 기록
FSD 마이그레이션 설계 → `docs/superpowers/specs/2026-06-26-fsd-migration-design.md`.
방향·IA·비주얼·구현 분할 → `docs/specs/portfolio/`(spec + plan-1/2/3).

> ⚠️ **콘텐츠는 대부분 목업 샘플이다.** 단 `content/projects/dnd-fractional-indexing.mdx`는
> 5층 골격으로 작성·발행된 **실제 케이스 스터디 1편**이다(나머지 2개 프로젝트 mdx + 홈/About/Contact는 목업).
> 홈/프로필/경력 등 목업 교체는 `docs/specs/portfolio/content-handoff.md`(어디를 채울지·목업 경계·형식 규칙),
> 케이스 스터디 작성·이식은 `docs/specs/portfolio/content-migration.md`(파이프라인)를 먼저 읽는다.
