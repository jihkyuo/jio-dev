# 포트폴리오 사이트 리디자인 — Spec

> 작성일 2026-06-26 · Codex 교차검증 반영(rev1)

## 무엇을 (What)
시니어 프론트엔드 엔지니어 지오현의 **국내 채용용 포트폴리오**. 현재 샘플 화면(About/Projects/Contact)을 확정된 디자인·정보구조로 교체한다. 홈(단일 스크롤) + 프로젝트 상세 페이지(MDX) 구조.

## 왜 (Why)
시니어 이직 시 면접관은 포트폴리오를 **선형으로 읽지 않고 위에서 스캔하다 흥미가 생기면 드릴다운**한다. 따라서 임팩트·경력·기술 의사결정이 **빠르게 스캔되고**, 톤은 **양산 AI풍을 벗어난 절제된 노련함**을 줘야 한다. 화려함이 아니라 **"측정 가능한 임팩트 + 시니어 증거(리더십·오너십·규모)"** 로 신뢰를 만든다.

## 핵심 결정 (Design Decisions)
브레인스토밍 + Codex 교차검증으로 확정한 방향 — 이후 작업의 단일 출처.

- **방향**: 하이브리드 — 명료한 구조 + 절제된 마이크로 인터랙션(효과가 주인공이 아니라 분위기가 주인공).
- **타깃**: 국내 채용, 시니어(4년+). 경력 타임라인 전면, 프로젝트는 선별 깊이.
- **레이아웃**: **B — 2단 (좌측 고정 레일 + 우측 스크롤 콘텐츠).** 좌측 레일은 **Blueprint**(옅은 도트 그리드 + 번호 틱 nav)로 흔한 사이드바 클론에서 차별화. CURRENTLY/상태줄은 유지보수 부담으로 미채택. (초기 결정은 A 단일컬럼이었으나 실물 확인 후 B로 변경.)
- **비주얼 톤**: **Grain · Steel — 다크 전용.**
  - 토큰: `--bg:#101216` · `--head:#f1f3f6` · `--body:#aab1bd`(본문 AAA 대비) · `--muted:#7e8593` · `--ac:#7e9cd4`(steel blue) · `--card:#15181e` · `--line:#1e222a`
  - 전면 **미세 필름 그레인** 오버레이(opacity ≈ 0.045, "거의 안 보일" 수준 — 가독성 우선) + **커서 추적 배경 광원**(radial, 저강도).
  - 악센트는 단일 색, 작은 순간에만(eyebrow·nav·임팩트 수치·링크).
- **콘텐츠 관리**: 프로젝트 상세는 **MDX 파일**(긴 서술·딥다이브·코드블록). 경력/프로젝트 메타(요약·태그·기간·링크·역할·팀규모)는 **타입 강제 데이터/frontmatter**로.
- **이력서**: 사이트(인터랙티브 탐색) + **PDF 이력서(채용 프로세스용 정식 문서)** 둘 다 제공. PDF는 `public/`에 두고 Hero·nav·Contact에서 CTA로 노출.

## 정보구조 (IA)

### 홈 — 단일 스크롤, 중앙 컬럼
1. **Hero** — eyebrow(직함) · 이름 · 역할 · 태그라인 + **Career Snapshot 한 줄**(총 경력 N년차 · 핵심 도메인 · 대표 성과 1줄) + **CTA 2개**: `이력서 PDF ↓`(primary) · `Contact/GitHub`(secondary).
2. **About** — 어떤 엔지니어인가, 강점·관점 2~3문단(간결). 
3. **Experience** — 경력 타임라인(전면 강조). 항목별: 회사 · **재직기간(`YYYY.MM – YYYY.MM`)** · **본인 역할 · 팀 규모 · 리드/기여 범위** · 핵심 임팩트 불릿(2+) · **리더십 시그널**(설계 주도·리뷰·멘토링·장애 대응·의사결정 중 해당) · 스택 태그. (×N)
4. **Selected Projects** — 2~4개 카드, **임팩트 수치 우선** 노출 → 클릭 시 상세 페이지.
5. **Skills / Stack** — **분류 기준 명시**: `Core`(주력·깊이) / `Comfortable`(실무 가능) / `Used in production`(투입 경험). 나열 지양.
6. **Contact** — 이메일 CTA + `이력서 PDF` + GitHub/LinkedIn.
7. Footer.

> nav: About · Experience · Projects · Contact + **이력서 PDF**(상단 고정 접근).

### 프로젝트 상세 — `/projects/[slug]` (MDX), Outcome-First

> ⚠️ **이 섹션의 케이스 스터디 골격은 [`case-study-structure.md`](./case-study-structure.md)로 대체(supersede)됨.** 상세 글은 그 문서의 5층 골격(헤드라인 블록 → 요약 표(PAAR) → 핵심 원인 콜아웃 → 본문(지배 질문) → 딥다이브)을 따른다. 아래 0~6 골격은 초기 안으로, 더 이상 정본이 아니다.

0. **요약 스트립(TL;DR)** — 정량 임팩트 1줄 + 역할/기간/팀규모/스택/링크. (5초 파악)
1. **맥락 & 문제** — 비즈니스/사용자/시스템 제약. 2~3문장 압축.
2. **My Role & Scope** — 내가 오너십 가진 영역, 주도한 의사결정, 협업 경계(혼자/리드/기여). 시니어 핵심.
3. **의사결정 & 접근** — 난제 **딥다이브 1~2개**(접기/펼치기). 각 딥다이브는 형식 강제: **제약 → 버린 선택지 → 채택한 접근 → 결과 → 남긴 트레이드오프.**
4. **임팩트 & 결과** — 정량 지표 우선 + **측정 방법** + **귀속**(팀 성과 vs 본인 주도 명확히 구분).
5. **(선택) 운영 노트** — 롤아웃·모니터링·장애/인시던트(있으면).
6. **회고** — 짧게(한계·다시 한다면·이후 바뀐 것).

## 인터랙션
효과는 전부 "뒤에서 받치는" 역할. 절제.
- 커서 추적 배경 광원(저강도 radial). **React 렌더 루프 밖**에서 pointer 이벤트 → CSS 변수 갱신(rAF 스로틀). `pointer: coarse`·reduced-motion·forced-colors에서 비활성.
- nav 호버: 인디케이터 바가 길어지며 악센트로.
- 프로젝트/경력 카드 호버: 살짝 떠오름 + 화살표 이동.
- 스크롤 reveal(은은하게).
- **`prefers-reduced-motion` 존중** — 모션 최소화 분기.

## 요구사항 (Requirements)
- 홈은 위 IA 순서의 단일 스크롤 페이지로 렌더된다.
- Experience·Projects 메타는 **타입이 강제된** 데이터 소스에서 읽어 자동 렌더된다(새 항목 추가 = 데이터 한 건 + (프로젝트는) MDX 한 개 추가).
- 프로젝트 상세는 slug별 MDX에서 렌더되며, 위 Outcome-First 골격(필수 헤딩)을 따른다.
- 프로젝트 MDX는 **필수 frontmatter**를 가진다: `title` · `slug` · `period` · `role` · `teamSize` · `stack` · `impact` · `summary` · `links`. **누락 시 빌드 실패**(반쯤 깨진 페이지 렌더 금지).
- 이력서 PDF가 `public/`에 존재하고 Hero·nav·Contact에서 접근 가능하다.
- Grain·Steel 토큰을 단일 출처(테마/CSS 변수)로 관리한다.
- 본문·헤딩·muted·링크·카드·focus/hover 상태 텍스트가 모두 가독 대비를 만족한다(본문 AAA ≥7:1).
- 모든 인터랙션은 `prefers-reduced-motion`에서 비활성/완화된다.
- **print 스타일** 제공 — 다크 배경/그레인/글로우 없이 깨지지 않게 출력(이력서 공유·인쇄 대비).
- SEO: 프로젝트별 메타데이터(`title`·`description`·OG·canonical) 생성, `/sitemap.xml`에 `/projects/[slug]` 포함. 전역 메타는 기존 `siteConfig` 단일 출처 유지.
- 반응형: 모바일에서 단일 컬럼이 자연스럽게 좁아진다.
- 키보드 접근성: nav·프로젝트 카드·이력서 링크·연락처에 탭 도달 + **가시적 focus 표시**.

## 성공 기준 (Acceptance)
- [ ] Hero에 이름·역할·총 경력·대표 성과 1줄·**이력서 PDF CTA**·보조 CTA(Contact/GitHub)가 보인다.
- [ ] 모든 Experience 항목이 회사·역할·`YYYY.MM – YYYY.MM` 기간·팀 규모·임팩트 불릿 2+·스택 태그를 렌더한다.
- [ ] Selected Projects 카드 클릭 → 상세가 필수 헤딩(`TL;DR`·`맥락`·`My Role`·`의사결정`·`임팩트`·`회고`) 순으로 렌더된다.
- [ ] 프로젝트 MDX의 필수 frontmatter 누락 시 `pnpm build`가 실패한다.
- [ ] `/sitemap.xml`에 모든 프로젝트 상세 URL이 포함된다.
- [ ] 본문·헤딩·muted·링크 대비가 측정상 기준(본문 AAA)을 만족한다.
- [ ] `prefers-reduced-motion: reduce`에서 스크롤 reveal 트랜지션·커서 추적이 제거되고 hover transform이 0ms/비활성이다.
- [ ] `pointer: coarse`(모바일/터치)에서 커서 글로우가 비활성이다.
- [ ] `forced-colors`/`prefers-contrast: more`에서 콘텐츠가 사라지지 않는다.
- [ ] print 출력 시 다크 배경·그레인·글로우 없이 본문이 읽힌다.
- [ ] 키보드 탭 순서가 nav·프로젝트 카드·이력서 링크·연락처에 도달하고 focus가 보인다.
- [ ] 데이터(경력) 1건 또는 MDX(프로젝트) 1개를 추가하면 코드 수정 없이 화면에 반영된다.
- [ ] `pnpm build`·`pnpm lint`·콘텐츠 스키마 검증이 통과한다.

## 범위 밖 (Non-goals)
- 라이트 모드(다크 전용 — print 스타일로 인쇄 대비만).
- 블로그/기술 글 섹션.
- 다국어(i18n) — 한국어 우선.
- CMS·외부 데이터 소스 연동(코드 내 데이터 + MDX로 충분).
- 헤비 WebGL·3D 인터랙션.

## 구현 분할 (Plans)
Codex 권고 반영 — **콘텐츠 모델을 가장 먼저**(콘텐츠가 약하면 나머지가 무의미). 3분할:
1. **콘텐츠 모델 + IA** — 데이터/frontmatter 스키마(타입·필수필드·빌드 검증), 이력서 PDF 배치, 보강된 IA 확정, 실제 샘플 콘텐츠 1~2건. (최고 위험 구간)
2. **코어 구현** — 홈 섹션, 프로젝트 리스트, MDX 라우팅, 메타데이터·sitemap·static params, 타입 콘텐츠 로딩.
3. **비주얼 시스템 + 인터랙션 + 검증** — Grain·Steel 토큰, 반응형, 커서 글로우/reveal(가드레일), reduced-motion·forced-colors·print·키보드 접근성, 대비/빌드/스키마 검증.

## 기술 메모
- Next.js 16 App Router / React 19 / Tailwind 4. **MDX 통합은 구현 시 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인**(이 저장소 Next는 학습데이터와 다를 수 있음 — AGENTS.md 마커).
- 다음 단계: `docs/specs/portfolio/plan.md`(어떻게) → `tasks.md`(단계).
- 브레인스토밍 시안 아카이브: `.superpowers/brainstorm/`(gitignore됨).
