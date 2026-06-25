# 레포 내장 에이전트 하네스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** jio.dev 레포에 AI 코딩 에이전트용 하네스(진입 라우터 + 코드지도 + ADR + spec 템플릿)와 포트폴리오용 README를 구축한다.

**Architecture:** `AGENTS.md`를 얇은 진입 라우터(source of truth)로 두고 `CLAUDE.md`가 `@AGENTS.md`로 import한다. 상세 문서는 `docs/`(architecture·decisions·specs)에 두고 progressive disclosure로 필요할 때만 읽는다. 코드(src/) 기능 변경은 없다 — 문서·하네스 한정.

**Tech Stack:** Markdown only. 검증은 `grep`/`wc`(마커 보존, 줄 수, 필수 내용)로 한다. 테스트 프레임워크 불필요.

## Global Constraints

- 문서 언어: **한국어** (모든 산출물).
- 템플릿 메타: **날짜 O(`YYYY-MM-DD`), 작성자 X**.
- 패키지 매니저: **pnpm** (npm/yarn 금지).
- `AGENTS.md`의 `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:nextjs-agent-rules -->` **마커 블록은 내용을 수정하지 않는다.** 우리 콘텐츠는 마커 **바깥**에만 추가한다.
- `AGENTS.md`는 **<150줄**, 명령어·하드 제약·링크만. 일반론 설교·쇼케이스 카피 금지.
- 시드 ADR은 **1개**(`0001`)만. 추가 ADR은 진짜 결정이 생길 때.
- `src/` 코드 기능 변경 금지.
- 설계 출처: `docs/superpowers/specs/2026-06-25-agent-harness-design.md`.

---

### Task 1: 브랜치 생성 + AGENTS.md 라우터화 (+ CLAUDE.md 확인)

**Files:**
- Modify: `AGENTS.md` (마커 블록 보존, 바깥에 라우터 콘텐츠 추가)
- Verify (no change): `CLAUDE.md` (`@AGENTS.md` 한 줄 유지)

**Interfaces:**
- Produces: `docs/architecture.md`, `docs/decisions/`, `docs/specs/`로의 링크 경로 (후속 태스크가 이 경로에 파일을 만든다).

- [ ] **Step 1: 작업 브랜치 생성**

현재 `main` 브랜치이므로 먼저 분기한다.

```bash
git checkout -b harness-setup
```

- [ ] **Step 2: 현재 AGENTS.md의 마커 블록 확인**

Run: `cat AGENTS.md`
Expected: 아래 마커 블록이 존재(이 내용은 보존 대상).

```
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
```

- [ ] **Step 3: AGENTS.md를 라우터로 작성 (마커 블록 보존 + 바깥에 추가)**

`AGENTS.md` 전체를 아래 내용으로 만든다. 상단 마커 블록은 기존 그대로, 그 아래에 라우터 콘텐츠를 둔다.

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# jio.dev 에이전트 가이드

이 파일은 진입 라우터다. 상세는 `docs/`를 **필요할 때만** 읽는다.

## 항시 룰
- **Next.js**: 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다(위 마커 블록).
- **패키지 매니저**: pnpm. npm/yarn 쓰지 않는다.

## 명령어
- `pnpm install` — 의존성 설치
- `pnpm dev` — 개발 서버
- `pnpm lint` — ESLint
- `pnpm build` — 프로덕션 빌드

## 문서 인덱스 (필요할 때 읽기)
- 코드베이스 지도 → `docs/architecture.md`
- 결정 기록(ADR) → `docs/decisions/`
- 기능 스펙 → `docs/specs/`

## 작업 흐름
- 새 기능: `docs/specs/<feature>/`에 spec → plan → tasks 작성 후 구현.
- 구조적 결정: `docs/decisions/`에 ADR(Nygard) 추가.
- **문서 생략**: 카피 수정·스타일 조정·1파일 픽스·의존성 범프·자명한 버그픽스는 spec/ADR 없이 진행.
```

- [ ] **Step 4: 마커 블록 보존 + 줄 수 검증**

Run: `grep -c "BEGIN:nextjs-agent-rules\|END:nextjs-agent-rules" AGENTS.md && wc -l < AGENTS.md && grep -c "pnpm dev" AGENTS.md`
Expected: 첫 줄 `2`(BEGIN/END 둘 다 존재), 둘째 줄 `< 150`, 셋째 줄 `1`(명령어 포함).

- [ ] **Step 5: CLAUDE.md가 @AGENTS.md 그대로인지 확인**

Run: `cat CLAUDE.md`
Expected: `@AGENTS.md` 한 줄. (다르면 `@AGENTS.md`로 되돌린다. 같으면 변경 없음.)

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md CLAUDE.md
git commit -m "docs: AGENTS.md를 얇은 진입 라우터로 재구성"
```

---

### Task 2: docs/architecture.md (코드베이스 지도)

**Files:**
- Create: `docs/architecture.md`

**Interfaces:**
- Consumes: 없음 (Task 1의 인덱스 링크가 이 파일을 가리킨다).
- Produces: 없음.

- [ ] **Step 1: 실제 코드 책임 확인**

지도가 코드와 어긋나지 않도록 각 파일의 실제 역할을 먼저 읽는다.

Run: `ls -R src && head -40 src/config/site.ts src/data/projects.ts src/app/layout.tsx`
Expected: `src/app`(layout/page/opengraph-image/globals.css/favicon), `src/components`(About/Contact/Projects/SiteHeader), `src/config/site.ts`, `src/data/projects.ts` 확인. 읽은 실제 책임으로 아래 초안의 설명을 보정한다.

- [ ] **Step 2: architecture.md 작성**

아래 초안을 기본으로, Step 1에서 확인한 실제 내용과 다르면 해당 줄을 수정해 작성한다.

```markdown
# 코드베이스 지도 (architecture)

> 이 파일은 에이전트가 "어디를 봐야 하는지" 빠르게 찾기 위한 수동 지도다.
> **구조가 바뀌면 이 파일도 갱신한다.**

## 스택
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm.

## 디렉터리
- `src/app/` — App Router 진입. 라우팅·레이아웃·메타.
  - `layout.tsx` — 루트 레이아웃(폰트·전역 wrapper·메타).
  - `page.tsx` — 홈(포트폴리오 단일 페이지). 섹션 컴포넌트를 조립.
  - `opengraph-image.tsx` — OG 이미지 생성.
  - `globals.css` — Tailwind 전역 스타일.
- `src/components/` — UI 섹션 컴포넌트.
  - `SiteHeader.tsx` — 상단 헤더/내비.
  - `About.tsx` — 소개 섹션.
  - `Projects.tsx` — 프로젝트 목록(데이터는 `src/data/projects.ts`).
  - `Contact.tsx` — 연락처 섹션.
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
```

- [ ] **Step 3: 검증**

Run: `test -f docs/architecture.md && grep -c "어디를 바꾸나\|데이터 흐름" docs/architecture.md`
Expected: 파일 존재, `2`(핵심 섹션 포함).

- [ ] **Step 4: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: 코드베이스 지도(architecture.md) 추가"
```

---

### Task 3: docs/decisions/ (ADR 템플릿 + 시드 ADR 0001)

**Files:**
- Create: `docs/decisions/0000-template.md`
- Create: `docs/decisions/0001-in-repo-agent-harness.md`

**Interfaces:**
- Consumes: 없음.
- Produces: 없음.

- [ ] **Step 1: ADR 템플릿 작성 (Nygard 린 5섹션)**

`docs/decisions/0000-template.md`:

```markdown
# NNNN. <결정 제목>

## Status
Proposed | Accepted (YYYY-MM-DD) | Deprecated | Superseded by NNNN

## Context
<배경·제약·문제. 왜 이 결정이 필요한가.>

## Decision
<무엇을 하기로 했는가.>

## Consequences
<결과. + 좋은 점 / − 트레이드오프.>
```

- [ ] **Step 2: 시드 ADR 0001 작성**

`docs/decisions/0001-in-repo-agent-harness.md`:

```markdown
# 0001. 레포 내장 에이전트 하네스 도입

## Status
Accepted (2026-06-25)

## Context
jio.dev는 Claude Code로 개발하는 솔로 포트폴리오 사이트이며, 최종 완성 시 공개된다.
AI 에이전트가 일관되게 작업하도록 레포에 룰·결정기록·스펙·코드지도를 내장할 필요가 있었다.
진입 파일 후보는 둘이었다: 벤더중립 오픈 표준 AGENTS.md(Linux Foundation/AAIF 관리,
Cursor·Copilot 등이 읽음)와 Claude 전용 CLAUDE.md(Claude Code가 실제로 읽는 파일).
ADR 포맷도 Nygard(린 5섹션)와 MADR(옵션·장단점 기록) 중 선택이 필요했다.

## Decision
- 레포 내장 하네스를 도입한다: `AGENTS.md`(진입 라우터) + `docs/`(architecture·decisions·specs).
- 룰의 원본(source of truth)은 **AGENTS.md**에 두고, `CLAUDE.md`는 `@AGENTS.md` import만 한다.
- ADR 포맷은 **Nygard 린 5섹션**을 쓴다.
- 진입 파일은 progressive disclosure 원칙으로 얇게(<150줄) 유지하고, 상세는 `docs/`로 링크한다.

## Consequences
- + 멀티에이전트 호환(AGENTS.md를 읽는 모든 도구) + 표준 준수 신호.
- + `CLAUDE.md` @import로 추후 Claude 전용 지시를 덧붙일 여지를 남김.
- + Nygard는 솔로·소규모에 작성 부담이 적음.
- − Claude 전용 기능이 필요하면 `CLAUDE.md`에 별도로 둬야 함.
- − 세 결정(하네스·원본위치·포맷)을 한 ADR에 묶었으므로, 개별 재검토 시 분리가 필요할 수 있음.
```

- [ ] **Step 3: 검증**

Run: `ls docs/decisions/ && grep -c "Accepted (2026-06-25)" docs/decisions/0001-in-repo-agent-harness.md`
Expected: `0000-template.md`와 `0001-in-repo-agent-harness.md` 존재, `1`(날짜 포함 Status).

- [ ] **Step 4: Commit**

```bash
git add docs/decisions/
git commit -m "docs: ADR 템플릿 + 시드 ADR 0001(하네스 도입) 추가"
```

---

### Task 4: docs/specs/ (spec/plan/tasks 템플릿 + README)

**Files:**
- Create: `docs/specs/_template/spec.md`
- Create: `docs/specs/_template/plan.md`
- Create: `docs/specs/_template/tasks.md`
- Create: `docs/specs/README.md`

**Interfaces:**
- Consumes: 없음.
- Produces: 없음.

- [ ] **Step 1: spec 템플릿 작성**

`docs/specs/_template/spec.md`:

```markdown
# <기능명> — Spec

> 작성일 YYYY-MM-DD

## 무엇을 (What)
<만들 기능 한 줄 요약>

## 왜 (Why)
<목적·동기>

## 요구사항 (Requirements)
- <사용자 스토리 / 기능 요구>

## 성공 기준 (Acceptance)
- <검증 가능한 완료 조건>

## 범위 밖 (Non-goals)
- <안 하는 것>
```

- [ ] **Step 2: plan 템플릿 작성**

`docs/specs/_template/plan.md`:

```markdown
# <기능명> — Plan

> 작성일 YYYY-MM-DD

## 접근 (Approach)
<구현 전략 2-3문장>

## 영향 파일 (Files)
- <건드릴 파일과 책임>

## 트레이드오프 / 리스크
- <고려한 대안·위험>
```

- [ ] **Step 3: tasks 템플릿 작성**

`docs/specs/_template/tasks.md`:

```markdown
# <기능명> — Tasks

> 작성일 YYYY-MM-DD

- [ ] <단계 1>
- [ ] <단계 2>
- [ ] <단계 3>
```

- [ ] **Step 4: specs README 작성**

`docs/specs/README.md`:

```markdown
# Specs

기능을 추가할 때 여기에 spec-driven 산출물을 둔다(Spec Kit에서 영감받은 경량 컨벤션).

## 흐름
1. `docs/specs/<feature>/spec.md` — 무엇을·왜
2. `docs/specs/<feature>/plan.md` — 어떻게
3. `docs/specs/<feature>/tasks.md` — 단계

템플릿은 `_template/`에 있다.

## 생략 룰
사소한 변경은 spec을 만들지 않는다: 카피 수정, 스타일 조정, 1파일 픽스, 의존성 범프,
자명한 버그픽스. (AGENTS.md 작업 흐름과 동일)
```

- [ ] **Step 5: 검증**

Run: `ls docs/specs/_template/ && test -f docs/specs/README.md && grep -c "생략 룰" docs/specs/README.md`
Expected: `spec.md plan.md tasks.md` 존재, README 존재, `1`(생략 룰 포함).

- [ ] **Step 6: Commit**

```bash
git add docs/specs/
git commit -m "docs: spec/plan/tasks 템플릿 + specs README 추가"
```

---

### Task 5: README.md 재작성 (포트폴리오용)

**Files:**
- Modify: `README.md` (create-next-app 보일러플레이트 → 포트폴리오)

**Interfaces:**
- Consumes: Task 1~4가 만든 `docs/` 구조(링크 대상).
- Produces: 없음.

- [ ] **Step 1: 사이트 실제 정보 확인**

README에 들어갈 실제 제목·설명을 코드에서 확인한다.

Run: `cat src/config/site.ts && grep '"name"' package.json`
Expected: 사이트 제목/설명/소유자 정보 확인. 아래 초안의 `<...>` 부분을 실제 값으로 채운다.

- [ ] **Step 2: README.md 작성**

아래 초안에서 `<...>`를 Step 1의 실제 값으로 치환해 작성한다.

```markdown
# <사이트 제목 (site.ts 기준)>

<한 줄 소개 (site.ts description 기준)>의 포트폴리오 사이트.

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
- `src/app/` — App Router(레이아웃·페이지·OG 이미지)
- `src/components/` — 섹션 UI(About / Projects / Contact / SiteHeader)
- `src/config/site.ts` — 사이트 메타
- `src/data/projects.ts` — 프로젝트 데이터
- 자세한 지도: [docs/architecture.md](docs/architecture.md)

## AI 하네스
이 레포는 AI 코딩 에이전트용 하네스를 내장한다.
- 진입 라우터: [AGENTS.md](AGENTS.md) (`CLAUDE.md`가 `@AGENTS.md`로 import)
- 결정 기록: [docs/decisions/](docs/decisions/)
- 기능 스펙: [docs/specs/](docs/specs/)
```

- [ ] **Step 3: 보일러플레이트 잔재 제거 검증**

Run: `grep -ci "bootstrapped with\|create-next-app" README.md && grep -c "AI 하네스" README.md`
Expected: 첫 줄 `0`(보일러플레이트 문구 제거됨), 둘째 줄 `1`(하네스 섹션 포함).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README를 포트폴리오용으로 재작성 + docs/ 링크"
```

---

### Task 6: 최종 검증

**Files:** 없음 (전체 점검).

- [ ] **Step 1: 트리 구조 확인**

Run: `git status && find docs AGENTS.md CLAUDE.md README.md -type f -not -path 'docs/superpowers/*' | sort`
Expected: 아래가 모두 존재 —
```
AGENTS.md
CLAUDE.md
README.md
docs/architecture.md
docs/decisions/0000-template.md
docs/decisions/0001-in-repo-agent-harness.md
docs/specs/README.md
docs/specs/_template/plan.md
docs/specs/_template/spec.md
docs/specs/_template/tasks.md
```

- [ ] **Step 2: 빌드/린트 정상 확인 (문서 변경이 코드에 영향 없음 확인)**

Run: `pnpm lint`
Expected: 통과(또는 변경 전과 동일한 결과). 문서만 바꿨으므로 새 에러가 없어야 한다.

- [ ] **Step 3: 설계 성공 기준 대조**

`docs/superpowers/specs/2026-06-25-agent-harness-design.md`의 §7 성공 기준을 한 줄씩 대조해 모두 충족하는지 확인한다. 미충족 항목이 있으면 해당 태스크로 돌아가 보정한다.

---

## 자기 점검 (작성자 체크 결과)

**1. 스펙 커버리지** — 설계 §4의 5개 컴포넌트(AGENTS.md 라우터 / architecture.md / ADR / specs / README)가 각각 Task 1~5에 대응. §7 성공 기준은 Task 6 Step 3에서 대조. 갭 없음.

**2. Placeholder 스캔** — 모든 파일 내용이 실코드(마크다운)로 제공됨. architecture.md와 README만 "실제 값으로 보정" 단계를 두되, 보정 전 초안 전문을 포함(빈 placeholder 아님). `<...>` 토큰은 site.ts에서 채우는 명시적 치환 지점이며 Step에 출처·방법 명시.

**3. 타입/이름 일관성** — 파일 경로·ADR 번호(0000/0001)·spec 파일명(spec/plan/tasks)·마커 문자열이 모든 태스크와 설계 문서에서 일치. AGENTS.md 인덱스 링크 경로(docs/architecture.md, docs/decisions/, docs/specs/)가 Task 2~4 생성 경로와 일치.
