# 케이스 스터디 읽기 UX — Spec

> 작성일 2026-06-29

## 무엇을 (What)
케이스 스터디(`/projects/[slug]`) 문서의 가독성을 끌어올린다: 타이포 위계 재정비, 헤딩↔URL 앵커, 반응형 목차(TOC), 콜아웃 4종. 공유 렌더러([src/shared/ui/mdx.tsx](../../../src/shared/ui/mdx.tsx))를 SSOT로 수정하므로 케이스 스터디 3편 전체에 적용된다.

## 왜 (Why)
첫 콘텐츠(5층 트리 DnD) 발행 후 읽기 경험 점검 결과, 가독성을 떨어뜨리는 구조적 원인이 확인됐다:

- **위계 붕괴**: h2=1.125rem, h3=**1.0rem(본문과 동일 크기)**. 긴 글에서 "지금 어느 섹션인지" 스캔이 안 된다.
- **제목 모노스페이스**: 한글+영문 제목을 Geist Mono로 렌더 → 한글 폴백·자간 들쭉날쭉. 본문(Noto Sans KR)과 불일치가 "작아 보이는" 인상을 키운다.
- **딥링크 불가**: 헤딩에 `id` 없음, 목차 메커니즘 없음.
- **의미 구분 부재**: blockquote 하나뿐 — note/주의/설계결정을 시각적으로 구분 못 함.

## 요구사항 (Requirements)

### R1. 타이포 위계 재정비 (제목 폰트 = 본문 Sans 통일)
모듈러 스케일(~1.25배)로 헤딩이 본문에서 확실히 분리된다. 제목은 전부 Noto Sans KR.

| 요소 | 현재 | 목표 |
|---|---|---|
| h1 | 1.875rem extrabold | 유지 (페이지 타이틀) |
| h2 | 1.125rem mono semibold | **1.5rem `font-bold` Sans, head색**, 섹션 구분선(`border-t`) 유지 |
| h3 | 1.0rem mono accent | **1.25rem `font-semibold` Sans, head색** |
| h4 | 미매핑 | **1.0rem `font-semibold` Sans** 신규 매핑 |
| 본문 p | 1rem / lh 1.625 / mb-4 | **1.0625rem / lh 1.75 / mb-5** |

- 모노스페이스는 코드·`Chip`·`Meta`·섹션 라벨 등 "라벨" 용도로만 남긴다(악센트 기능).

### R2. 컬러·간격 미세 조정
- 본문색 `#aab1bd` → `#b7bdc8` (장문 체감 선명도 ↑). 팔레트·다크톤·배경 `#101216`·본문 폭 `max-w-2xl`은 유지.
- 콜아웃용 시맨틱 토큰 추가: note=기존 accent(블루), tip=그린, warning=앰버, decision=보라.

### R3. 헤딩 ↔ URL 앵커
- `rehype-slug`로 h2·h3·h4에 `id` 자동 부여(github-slugger).
- 헤딩 hover 시 `#` 링크 노출 → 클릭하면 해당 섹션 스크롤 + URL 해시 갱신 + 클립보드 복사.
- `scroll-margin-top` + smooth scroll로 스티키 요소에 안 가리게.

### R4. 반응형 목차 (TOC)
- 헤딩(h2·h3)을 서버에서 추출, 같은 github-slugger로 id 일치 보장.
- **좁은 화면(< xl)**: Meta 직후 상단에 접이식 인라인 목차 카드.
- **넓은 화면(xl+)**: 좌측 여백에 sticky 사이드 목차 + 스크롤스파이(현재 섹션 하이라이트, IntersectionObserver).
- xl 기준 근거: 본문 42rem 중앙 정렬 → lg(1024px)는 좌측 여백 ~176px로 빠듯, xl(1280px)는 ~304px로 사이드바 공간 확보.

### R5. 콜아웃 4종
- `<Callout type="note|tip|warning|decision">` MDX 컴포넌트. 아이콘 + 좌측 보더 + 배경 틴트 + 시맨틱 컬러.
- 기존 blockquote 스타일도 통일감 있게 정리.

### R6. 기존 글 리터핑
- [content/projects/dnd-fractional-indexing.mdx](../../../content/projects/dnd-fractional-indexing.mdx)에 decision/warning 콜아웃을 적재적소 배치해 "완성된 예시" 1편을 만든다. (전체를 콜아웃으로 도배하지 않음 — 적재적소 원칙.)

## 성공 기준 (Acceptance)
- [ ] `pnpm build` 통과, `/projects/dnd-fractional-indexing` 렌더 200.
- [ ] h2/h3/h4가 본문과 크기로 명확히 구분된다(h3 ≥ 1.25rem, 본문 ≈ 1.0625rem).
- [ ] 모든 h2·h3 제목에 `id`가 있고, 직접 URL(`...#슬러그`)로 진입 시 해당 섹션으로 스크롤된다.
- [ ] 헤딩 hover 시 앵커가 보이고 클릭하면 URL이 클립보드에 복사된다.
- [ ] xl+ 화면에서 사이드 목차가 sticky로 붙고 스크롤 시 현재 섹션이 하이라이트된다. xl 미만에선 상단 인라인 목차가 보인다.
- [ ] MDX에서 `<Callout type="decision">…</Callout>` 4종이 각기 다른 아이콘·컬러로 렌더된다.
- [ ] DnD 글에 콜아웃이 1~3곳 적재적소 배치돼 "완성된 예시"로 보인다.
- [ ] 케이스 스터디 3편 모두 깨짐 없이 렌더(SSOT 변경 회귀 확인).

## 범위 밖 (Non-goals)
- 전체 디자인 시스템 재설계 / 라이트 모드 / 폰트 교체 / 본문 폭 변경.
- 콜아웃 5종 이상, 접이식 섹션, 각주, 읽기 진행률 바, 댓글.
- DnD 글 외 나머지 2편 본문 리터핑(인프라는 자동 적용되지만 콜아웃 삽입은 다음 턴).

## 구현 노트
- `next-mdx-remote`의 `options.mdxOptions.rehypePlugins`에 `rehype-slug` 추가. (구현 전 `node_modules/next/dist/docs/` 및 next-mdx-remote API를 확인할 것 — AGENTS.md 항시 룰.)
- 스크롤스파이·클립보드 복사는 클라이언트 컴포넌트, 헤딩 추출·TOC 데이터 생성은 서버.
- 신규 의존성(pnpm): `rehype-slug`, `github-slugger`.
