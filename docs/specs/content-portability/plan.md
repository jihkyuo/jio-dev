# 콘텐츠 이식성·거버넌스 (B안) — Plan

> 작성일 2026-06-30 · 핸드오프(다른 세션 실행용, 콜드 스타트 가능하게 자립 기술)

## 접근 (Approach) — 2단계, 단계별로 멈출 수 있게

**Phase 1 — 가드레일 (빠른 안전망, MDX 유지).** 포맷은 그대로 두고, 콘텐츠가 코드로 드리프트하는 걸 CI/로컬 체크로 차단. 즉효·저위험. 여기까지만 해도 R1·R2 충족.

**Phase 2 — 디렉티브 이행 (소스 포맷 교체).** MDX→Markdown+remark-directive. 인바운드 견고성·이식성·편집기 토대 확보(R3·R4·R6). G2 시각은 동일 유지(R5).

> 권장: Phase 1 먼저 머지(즉시 안전), 그 다음 Phase 2. 소유자가 Phase 1만으로 멈춰도 정합적.

---

## Phase 1 — 가드레일

### 영향 파일
- `package.json` — `content:check` 스크립트 확장(현재 `vitest run src/entities`).
- `src/entities/project/api/__tests__/content-guardrail.test.ts` (신규) — 모든 `content/projects/*` 본문을 스캔하는 테스트.
- (선택) `.github/workflows/*` 또는 기존 CI에 `pnpm content:check` 추가. CI 없으면 생략하고 pre-commit 훅 안내만.

### 구현 골자
1. 콘텐츠 로더에 본문 접근 헬퍼가 이미 있음: `getProjectContent(slug)` → `{ meta, content }` ([getProjects.ts](../../../src/entities/project/api/getProjects.ts)). frontmatter는 gray-matter가 분리하므로 `content`는 순수 본문.
2. 가드레일 테스트: 각 파일 본문에 대해 **금지 패턴**이 없음을 단언.
   - 정규식 금지: `^\s*import\s`, `^\s*export\s`, `<script`, ` style=`, ` className=`, JSX 표현식 컨테이너 `{` … `}`(텍스트 중괄호 오탐 주의 → "태그 속성/식" 문맥만; 보수적으로 `={` 패턴부터).
   - **대문자 컴포넌트 허용목록**: `Callout`, `Chip`, `Meta`, `Hl`. 그 외 `<[A-Z]\w+` 출현 시 실패.
3. **사전 컴파일 검증(R2):** 각 본문을 빌드와 동일 파서로 컴파일 시도(현재 MDX면 `@mdx-js/mdx`의 `compile`). 던지면 테스트 실패 → 깨진 글이 배포 전 단계에서 걸림.
4. `package.json`에 `"content:check": "vitest run src/entities"` 유지하되, 신규 테스트가 `src/entities` 아래 오게 두면 그대로 포함됨.

### Phase 1 검증
- 위반 픽스처(예: 본문에 `import x from 'y'`)를 임시로 넣어 `pnpm content:check` 실패 확인 → 제거.
- `pnpm build` 정상.

---

## Phase 2 — Markdown + remark-directive 이행

### 의존성
- 추가: `remark-directive`, `rehype-raw`, `rehype-sanitize`. (이미 있음: `remark-gfm`, `rehype-slug`.)
- 렌더: `next-mdx-remote`(MDX 전용)에서 **순수 마크다운 파이프라인**으로 교체. 두 길 중 택1:
  - (권장) `react-markdown` + `remark-gfm` + `remark-directive` + `rehype-raw` + `rehype-sanitize` + `rehype-slug`, `components`에 기존 `mdxComponents` 스타일 맵 재사용.
  - 또는 `unified` 파이프라인 직접 구성 후 `rehype-react`.

### 디렉티브 스키마(저작 문법)
- 컨테이너 `:::callout{type="decision"} … :::` → `Callout`
- 리프 `::chip[🩺 도메인 한 줄]` → `Chip`
- 컨테이너 `:::meta … :::` → `Meta`
- 인라인 `:hl[강조 단어]` / `:hl[단어]{c="decision"}` → 하이라이트(`<mark class="cs-mark …">`)
  - 디렉티브→컴포넌트 변환: remark 플러그인 한 개가 `containerDirective`/`leafDirective`/`textDirective` 노드를 `hName`/`hProperties`로 매핑(공식 remark-directive 예제 패턴).

### 영향 파일
- `src/app/projects/[slug]/page.tsx` — MDXRemote 제거, 마크다운 렌더러로 교체. **rehype-slug 유지(헤딩 id 동일 → TOC 보존)**. options에 remark-directive/rehype-raw/rehype-sanitize 추가.
- `src/shared/ui/mdx.tsx` — 컴포넌트 맵은 거의 재사용. `Chip`/`Meta`/`Callout`은 디렉티브가 만들어내는 노드에 매핑되도록 연결. 누락 표준 요소(em·ol·hr·img·del·태스크) 매핑 추가(인바운드 톤 일관성, R4·R5).
- `src/shared/ui/Callout.tsx` — 그대로 재사용(이미 `type:string` 가드 적용됨).
- `src/app/globals.css` — `cs-mark`(하이라이트) 추가. 나머지 `cs-*` 동일.
- `src/entities/project/api/getProjects.ts` — `.mdx` → `.md`(또는 둘 다 허용) 확장자 처리.
- `content/projects/*.mdx` → `*.md`로 리네임 + 본문의 `<Callout|Chip|Meta>` JSX를 디렉티브로 치환(3개: dnd-fractional-indexing, design-system-v2, payment-widget-rearchitecture).
- 가드레일 테스트(Phase 1)의 "컴파일 검증"을 MDX 컴파일 → 마크다운 파이프라인 파스로 교체. 허용 컴포넌트 검사는 "허용 디렉티브명" 검사로 전환.

### rehype-sanitize 주의
- 기본 스키마는 `class`/`style` 등을 떨궈 G2 클래스가 날아갈 수 있음. **커스텀 sanitize 스키마**로 우리 `class`(cs-*) 및 디렉티브 산출 속성 허용. 보안(인바운드 raw HTML)과 스타일 보존의 균형을 여기서 잡는다.

### 트레이드오프 / 리스크
- **포기:** 본문 내 free-form JSX/임의 React 컴포넌트. → 완화: 인터랙티브는 **명명 디렉티브**(`:::demo{id=dnd-sort}`)로 화이트리스트 매핑하면 살아남음.
- **리스크(중요):** Phase 2가 렌더 파이프라인을 건드림. **TOC는 불가침**이므로:
  - `rehype-slug`를 **반드시 유지**해 헤딩 slug가 동일하게 생성되도록(=TOC `getElementById` 일치).
  - `extractHeadings.ts`는 raw 마크다운 기반이라 `.md`에서도 그대로 동작 → **건드리지 말 것**. (codex가 지적한 "extractHeadings vs rehype-slug 이중화"는 알려진 한계로 남김 — 이번 범위 밖.)
  - 헤딩 렌더러의 `id`·`scroll-mt-24`·`group`·`HeadingAnchor` 보존.
- **리스크:** rehype-raw + 외부 HTML = XSS 표면 → rehype-sanitize 필수, 스키마 리뷰.
- **마이그레이션 비용:** 콘텐츠 3개뿐이라 작음. 파이프라인 배선이 주 작업.

### Phase 2 검증
- 이행 후 `/projects/dnd-fractional-indexing`가 **G2와 픽셀 동일**(콜아웃 배지·표 라운드·h2 바·주황 코드·하이라이트). 기존 시안: `scratchpad/design-variants/`(G2, highlight.html) 또는 이전 커밋 렌더와 대조.
- 외부 마크다운 샘플(생 HTML `<details>`, `x < y`, `{foo}` 포함)을 임시 `.md`로 넣어 빌드 통과 확인.
- `pnpm lint && pnpm build && pnpm test` 그린.
- **TOC 회귀 확인(필수):** 활성 하이라이트·클릭 점프(scroll-mt 오프셋)·헤딩 hover `#`.

---

## 근거 (왜 이 방향인가 — 콜드 스타트용 요약)
- 마크다운의 이식성 = "커스텀 의미를 못 싣는다"는 표준성 그 자체. 이식성과 커스텀 표현력은 1:1 교환. MDX는 표현력에 치우쳐 이식성·편집기·거버넌스를 희생.
- 디렉티브는 **닫힌 구조 어휘** → 코드 못 담음(거버넌스 보장) + 다른 툴에서 텍스트로 우아하게 격하(이식) + 편집기 노드로 1:1 매핑(WYSIWYG 토대). 세 우선순위(a·b·c)를 한 번에.
- codex consult 합의: "MDX는 명시 우선순위 기준 장기적으로 틀린 소스 포맷; Markdown+remark-directive가 적합."

## 하이라이트 (R7) — 디자인 확정 + **시각·컴포넌트는 이미 구현됨**

5라운드 시안 비교 후 **A Marker 확정**(소유자). **이미 적용된 상태**(디자인 세션): `.cs-mark` CSS + `--code:#e0966b`(주황 인라인코드) + `<Hl>` 컴포넌트(`src/shared/ui/Hl.tsx`, mdx.tsx 등록)가 현행 MDX에 들어가 있음. 즉 다른 커스텀 컴포넌트(Callout/Chip/Meta)와 **동일 패턴**으로 존재.

→ **B 세션의 하이라이트 작업 = `<Hl>` → `:hl` 인라인 디렉티브 이행 하나뿐**(Callout→:::callout과 동일하게 일괄 처리). 시각/색/토큰은 손댈 필요 없음.

### 확정 사양
- **하이라이트 스타일 = A Marker:** accent 풀하이트 틴트 마커, 보더 없음, 흰 글자, 라운드. 인라인코드(보더+모노)·링크(밑줄)·볼드(흰색)와 색·형태로 명확히 구분됨.
- **저작:** 인라인 디렉티브 `:hl[단어]` (기본 accent) / `:hl[단어]{c="decision"}` (시맨틱). 색 키: `accent`(기본)·`decision`·`warning`·`tip` — 콜아웃 색 체계와 호응.
- **인라인코드 분리:** `--code: #e0966b`(코랄-오렌지) 토큰 신설, `.cs-code`를 accent→`--code`로. (앰버 `#d4a45c`는 warning과 충돌해 비채택.)

### CSS (globals.css 추가)
```css
--code:#e0966b;  /* :root 토큰 */
/* .cs-code 의 accent → var(--code) 로 교체(배경·보더·글자) */
.cs-mark{background:color-mix(in srgb,var(--accent) 24%,transparent);color:var(--head);border-radius:5px;padding:.05em .3em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.cs-mark.dc{background:color-mix(in srgb,var(--decision) 24%,transparent)}
.cs-mark.wn{background:color-mix(in srgb,var(--warning) 24%,transparent)}
.cs-mark.tp{background:color-mix(in srgb,var(--tip) 24%,transparent)}
/* print/forced-colors: cs-mark 은 배경만이라 텍스트 보존됨(추가 폴백 불필요), 단 인쇄 잉크 절약 위해 배경 제거 권장 */
```
디렉티브→`<mark class="cs-mark {dc|wn|tp}">` 매핑(`c` prop → 클래스). 프로토타입 동작 레퍼런스: `scratchpad/design-variants/highlight.html` (세그먼트 A · Marker, 코드색 토글 = 코랄).

### Phase 배치
- 인라인코드 코랄(`--code`)·`.cs-mark` CSS·`<Hl>` 컴포넌트 = **이미 적용됨**(별도 작업 불필요).
- 가드레일(Phase 1) 컴포넌트 허용목록에 **`Hl` 포함**(Callout/Chip/Meta/Hl).
- Phase 2에서 `<Hl>` → `:hl[…]{c=…}` 디렉티브로 이행(다른 컴포넌트와 동일하게).
