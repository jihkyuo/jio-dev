# 지오현

프론트엔드 엔지니어 지오현의 포트폴리오. 만든 것들과 연락처를 모았습니다.

## 기술 스택
- Next.js 16 (App Router) · React 19
- Tailwind CSS v4 · TypeScript
- 배포/계측: Vercel Analytics · Speed Insights

## 로컬 실행
```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint
pnpm build
```

## 구조
2단 Blueprint 레이아웃(좌측 고정 레일 + 우측 스크롤) · Grain·Steel 다크 톤.
- `src/content/` — 타입 안전 콘텐츠 레이어(zod 검증). 프로필·경력·스킬·프로젝트 로더 + `@/content` 배럴
- `content/projects/*.mdx` — 프로젝트 상세 본문 + frontmatter
- `src/app/` — App Router(홈 2단·`/projects/[slug]` MDX 상세·sitemap·OG)
- `src/components/` — 서버 섹션(Sidebar/About/Experience/Skills/Projects/Contact) + 클라이언트 인터랙션(CursorGlow/Reveal/RailNav)
- `src/config/site.ts` — 사이트 메타
- 자세한 지도: [docs/architecture.md](docs/architecture.md)

## AI 하네스
이 레포는 AI 코딩 에이전트용 하네스를 내장한다.
- 진입 라우터: [AGENTS.md](AGENTS.md) (`CLAUDE.md`가 `@AGENTS.md`로 import)
- 결정 기록: [docs/decisions/](docs/decisions/)
- 기능 스펙: [docs/specs/](docs/specs/)
