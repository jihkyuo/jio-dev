# 콘텐츠 이식성·거버넌스 (B안) — Tasks

> 작성일 2026-06-30 · 핸드오프 체크리스트

## Phase 1 — 가드레일 (MDX 유지, 즉효) — ✅ 완료(2026-06-30)
- [x] 신규 테스트 `src/entities/project/api/content-guardrail.test.ts`(컨벤션 따라 `__tests__` 없이 sibling 배치): 모든 `content/projects/*` 본문에 금지 패턴(`import`/`export`/`<script`/`style=`/`className=`/`={`)·미허용 대문자 컴포넌트(허용목록 `Callout`/`Chip`/`Meta`) 없음 단언. **펜스/인라인 코드는 strip 후 검사**(코드 인용 오탐 방지).
- [x] 같은 테스트에 "본문 사전 컴파일" 추가(`@mdx-js/mdx` compile + remark-gfm → 실패 시 fail) — 깨진 글을 배포 전 차단(R2). `@mdx-js/mdx` devDep 명시 추가.
- [x] `package.json` `content:check`가 위 테스트를 포함(현재 `vitest run src/entities` → 자동 포함 확인)
- [x] 위반 검출은 **인라인 픽스처로 증명**(임시 파일 churn 없이) — 위반 7종 + 깨진 MDX 컴파일 실패 단언
- [x] 검증: `pnpm content:check` 40 그린 / `pnpm lint`·`typecheck`·`build` 통과
- [ ] (CI 있으면) 파이프라인에 `pnpm content:check` 추가 — **CI 미설정, 보류**
- [ ] 커밋: `🔧 chore: 콘텐츠 가드레일(content:check) 추가` — 사용자 승인 대기

## Phase 2 — Markdown + remark-directive 이행 — ⏸ 보류(YAGNI, 2026-06-30)
> 결정: 콘텐츠는 AI가 생성하며, repo 밖으로 이식할 수요가 현재 없음. 이식성(b)·WYSIWYG(c)가
> Phase 2의 주 동기인데 둘 다 지금 불필요 → 보류. 거버넌스는 Phase 1 가드레일로 이미 확보.
> 재개 조건: 노션/컨플루언스 등 **repo 밖 이식 수요가 실제로 생기면**.

- [ ] 의존성 추가: `remark-directive` `rehype-raw` `rehype-sanitize` (pnpm)
- [ ] 디렉티브→컴포넌트 remark 플러그인 작성(`:::callout{type}` `::chip[]` `:::meta` `:hl[]`)
- [ ] `page.tsx`: MDXRemote → 마크다운 렌더러(react-markdown 등). **rehype-slug 유지**, remark-directive/rehype-raw/rehype-sanitize 추가
- [ ] 커스텀 sanitize 스키마: `class`(cs-*)·디렉티브 산출 속성 허용(스타일 보존 + 보안)
- [ ] `mdx.tsx`: 디렉티브 노드에 Callout/Chip/Meta 연결 + 누락 표준요소(em·ol·hr·img·del·태스크) 매핑 추가
- [ ] `globals.css`: `cs-mark`(하이라이트) 추가 / 필요 시 `--code` 토큰(주황 인라인코드)도 함께
- [ ] `getProjects.ts`: `.md` 확장자 처리
- [ ] 기존 3개 글 `.mdx`→`.md` 리네임 + JSX→디렉티브 치환(dnd / design-system-v2 / payment-widget)
- [ ] Phase 1 가드레일 테스트를 마크다운 파이프라인 기준으로 갱신(컴파일 검증·허용 디렉티브명)
- [x] 하이라이트(R7, A Marker) 시각·컴포넌트 — **이미 구현됨**(디자인 세션): `--code:#e0966b`·`.cs-code` 코랄·`.cs-mark`(+`.dc/.wn/.tp`)·`<Hl>` 컴포넌트
- [ ] 하이라이트 이행: 기존 `<Hl>` → `:hl[…]{c=…}` 인라인 디렉티브로(Callout 등과 동일 패턴). 시각은 그대로 `cs-mark` 재사용
- [ ] 검증: G2 픽셀 동일 대조 / 외부 마크다운(생 HTML·`<`·`{`) 샘플 빌드 통과 / `lint`·`build`·`test` 그린
- [ ] **TOC 회귀 확인**(활성 하이라이트·scroll-mt 점프·hover `#`) — 불가침 영역 무손상
- [ ] 커밋: `✨ feat: 콘텐츠 소스 MDX→Markdown+directive 이행(이식성·편집기 토대)`

## 불가침 (전 단계 공통)
- [ ] `src/widgets/toc/`, `src/shared/lib/extractHeadings.ts`, `src/shared/ui/HeadingAnchor.tsx` 미수정
- [ ] 헤딩 `id`(github-slugger)·`scroll-mt-24`·`group` 보존
- [ ] G2 Tintglass 시각 결과 동일(재디자인 아님)
