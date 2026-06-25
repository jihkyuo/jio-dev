# 설계: 레포 내장 에이전트 하네스 (jio.dev)

> 작성일 2026-06-25 · 상태: 승인됨 (구현 대기)

## 1. 목적과 배경

jio.dev는 솔로 개발자의 **포트폴리오 사이트**(Next.js 16, React 19, Tailwind v4, pnpm)다.
이 작업의 목표는 이 레포 안에 **AI 코딩 에이전트용 하네스**(룰·결정기록·스펙·코드지도 문서군)를
구축하는 것이다.

목적은 두 가지:
1. **기능** — 나와 Claude(및 향후 다른 에이전트)가 이 사이트를 일관되고 효율적으로 개발하도록 돕는다.
2. **쇼케이스** — 사이트가 최종 완성되어 공개될 때, 하네스 구조 자체가 "AI-native 엔지니어링을
   제대로 한다"는 신호가 된다.

단, 사이트는 **완성 전까지 비공개**이므로, 지금 당장 외부 관객을 위한 전시용 가짜 산출물은 만들지
않는다. 쇼케이스 가치는 개발하면서 **실제로 누적되는 진짜 산출물**(실제 ADR, 실제 스펙)에서 나온다.

## 2. 설계 원칙

- **Progressive disclosure** — 항상 로드되는 진입 파일(AGENTS.md)은 얇게 유지하고, 항시 지킬
  룰만 본문에 둔다. 상세는 `docs/`로 링크하여 필요할 때만 읽게 한다.
- **표준 우선** — 오픈 표준 경로/포맷을 따른다(AGENTS.md, `docs/decisions/`, Spec Kit 형식).
  표준을 쓰는 것 자체가 쇼케이스 신호다.
- **외과적 변경** — 자동 관리되는 영역은 보존하고 그 바깥에만 추가한다.
- **가짜 산출물 금지** — 전시용 빈 껍데기 스펙을 만들지 않는다. 진짜 결정·진짜 스펙만 기록한다.
- **right-sizing** — 소규모 단일앱이다. 무거운 CLI/툴체인(log4brains, Spec Kit CLI 등)은
  도입하지 않고, 형식만 차용한다.
- **문서 생략 룰(skip docs)** — 사소한 변경은 ADR/spec을 만들지 않는다. 카피 수정, 스타일
  조정, 1파일 픽스, 의존성 범프, 자명한 버그픽스에는 문서 작업이 없다. 이 룰이 없으면 모든
  소소한 수정이 서류작업으로 변질된다(codex critic 지적).
- **라우터는 얇게(<150줄)** — AGENTS.md에는 명령어·하드 제약·링크만. import된 파일도
  컨텍스트에 로드되므로, 일반론적 "단순함" 설교나 쇼케이스 카피를 진입 파일에 넣지 않는다.

## 3. 결정 사항 (확정)

| 항목 | 결정 | 근거 |
|---|---|---|
| 진입 원본(source of truth) | **AGENTS.md** (오픈 표준), CLAUDE.md는 `@AGENTS.md` import 유지 | AGENTS.md는 Linux Foundation(AAIF) 관리 벤더중립 표준. 멀티에이전트 호환 + 쇼케이스 신호 |
| 포함 기둥 | 진입 라우터 + context map + ADR + specs(템플릿) | 풀스택이되 right-sized |
| ADR 포맷 | **Nygard 린 5섹션** (Title/Status/Context/Decision/Consequences) | 솔로·소규모에 캐논·간결 |
| 문서 언어 | **한국어** | 작성·유지 편의 |
| 템플릿 메타 | **날짜 O, 작성자 X** | 작성자는 항상 본인 |
| README | **재작성 포함** | 현재 create-next-app 보일러플레이트 |
| specs 예시 | **만들지 않음** (템플릿만) | 비공개 상태, 가짜 샘플 불필요 |
| 디렉터리 조직 | `docs/` 평면 + 카테고리 폴더 | 표준 경로, 리뷰어에게 즉시 읽힘 |

## 4. 컴포넌트 설계

### 4.1 진입 라우터 — `AGENTS.md`

얇은 라우터(<150줄)로 재구성한다. **중요**: 현재 파일의
`<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:nextjs-agent-rules -->` 블록은
**create-next-app / codemod이 관리하는 마커 블록**이다(런타임이 파일을 변형하는 게 아니라,
`create-next-app` 또는 향후 codemod 실행 시 이 마커 안쪽만 재생성한다 — Next 16.2.9 번들
문서 `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md` 확인). 마커 **바깥**에
프로젝트 지시를 추가하면 향후 업데이트가 덮지 않으므로, 우리 콘텐츠는 블록 바깥에만 둔다.

구성(명령어·하드 제약·링크만):
- 자동 관리 마커 블록(보존)
- **항시 룰(always-on)**: Next.js docs-first(코드 작성 전 `node_modules/next/dist/docs/`
  확인 — 마커 블록 참조), 패키지 매니저는 pnpm
- **에이전트 명령어**: `pnpm install` / `pnpm dev` / `pnpm lint` / `pnpm build`
  (테스트 명령은 도입 시 추가)
- **문서 인덱스**: `docs/architecture.md`(코드지도), `docs/decisions/`(결정), `docs/specs/`(스펙)로의 링크
- **작업 흐름 + 생략 룰**: 새 기능 → `docs/specs/`에 spec 먼저 / 구조적 결정 → `docs/decisions/`에
  ADR / 단, 사소한 변경(카피·스타일·1파일·범프·자명픽스)은 문서 생략

일반론적 설계 설교나 쇼케이스 카피는 넣지 않는다(그건 docs/에).
`CLAUDE.md`는 `@AGENTS.md` 한 줄 그대로 유지한다.

### 4.2 Context map — `docs/architecture.md`

Claude Code는 repo map을 자동 생성하지 않으므로 수동 유지 지도를 둔다. 담을 내용:
- 디렉터리 구조와 각 폴더 책임:
  `src/app`(라우팅·레이아웃·OG 이미지), `src/components`(UI: About/Contact/Projects/SiteHeader),
  `src/config/site.ts`(사이트 메타), `src/data/projects.ts`(프로젝트 데이터)
- 데이터 흐름: data → components → page
- "X를 바꾸려면 어디를 보라" 식 포인터
- 갱신 규칙 한 줄(구조가 바뀌면 이 파일도 갱신)

### 4.3 ADR — `docs/decisions/`

- 파일명 `NNNN-title-with-dashes.md`, 연번
- `0000-template.md`: Nygard 린 5섹션 템플릿. `## Status`에 `Accepted (YYYY-MM-DD)` 형태로 날짜 포함, 작성자 없음
- 시드 ADR은 **1개만**(`0001-in-repo-agent-harness.md`). 이번 세션에서 실제로 내린 결정을
  한 기록에 담는다: 레포 내장 하네스 도입 + 룰 원본 = AGENTS.md(CLAUDE.md @import) + ADR
  포맷으로 Nygard 채택. 이들을 각각 별도 ADR로 쪼개지 않는다 — 독립적으로 재검토될 결정이
  아니므로 쪼개면 process theater다(codex critic 지적). 다음 ADR은 진짜 제품/아키텍처
  결정이 생길 때 작성한다.

### 4.4 Spec/PRD — `docs/specs/`

**Spec Kit에서 영감받은 로컬 경량 컨벤션**이다(Spec Kit/Kiro CLI·슬래시명령·constitution
워크플로 미도입). 파일명 `spec.md/plan.md/tasks.md`는 Spec Kit의 핵심 산출물명과 일치하지만,
Kiro(`requirements.md/design.md/tasks.md`)와는 다르다 — "두 시스템을 그대로 따른다"가 아니라
"의도적으로 단순화한 우리 컨벤션"이다(codex critic 지적 반영).
- `_template/spec.md` · `_template/plan.md` · `_template/tasks.md`: 각 템플릿, 날짜 헤더 포함·작성자 없음
  - spec.md = 무엇을·왜(요구사항/사용자 스토리)
  - plan.md = 어떻게(구현 전략)
  - tasks.md = 단계(할 일 분해)
- `README.md`: "기능 추가 시 `docs/specs/<feature>/`에 spec→plan→tasks를 만든다 / 단,
  사소한 변경은 생략(§2 문서 생략 룰)" 안내
- **예시 스펙은 만들지 않는다.** 진짜 스펙은 향후 실제 기능 개발 시 자연 발생한다.

### 4.5 README.md (사람용, 재작성)

create-next-app 보일러플레이트를 포트폴리오답게 교체:
- 프로젝트 소개, 기술 스택
- 로컬 실행(pnpm)
- 구조 요약
- "이 레포는 레포 내장 AI 하네스를 갖췄다"는 짧은 섹션 + `docs/` 링크(쇼케이스 포인트)

## 5. 최종 디렉터리 트리

```
AGENTS.md          # 라우터 <150줄 (마커블록 보존 + 명령어 + 항시룰 + docs/ 인덱스)
CLAUDE.md          # @AGENTS.md (유지)
README.md          # 포트폴리오답게 재작성
docs/
  architecture.md  # context map (수동 코드베이스 지도)
  decisions/       # ADR — Nygard 린, Status에 날짜
    0000-template.md
    0001-in-repo-agent-harness.md   # 시드 1개 (하네스+AGENTS원본+Nygard 한 기록)
  specs/           # 템플릿만, 가짜 샘플 없음
    _template/
      spec.md
      plan.md
      tasks.md
    README.md
```

## 6. 범위 밖 (Non-goals)

- log4brains / Spec Kit CLI / Kiro 등 외부 툴체인 도입
- 중첩 AGENTS.md(단일앱이라 디렉터리별 구분 실익 없음)
- 전시용 예시 스펙
- 코드(src/) 기능 변경 — 이번 작업은 문서·하네스 한정
- README 외 사람용 문서(기여 가이드 등)

## 7. 성공 기준

- AGENTS.md가 자동 관리 마커 블록을 보존한 채 라우터로 동작한다(마커 안쪽을 덮어쓰지 않고,
  우리 콘텐츠는 마커 바깥에만 둔다). 분량은 <150줄, 명령어·하드 제약·링크만.
- `docs/`의 기둥(architecture, decisions, specs)이 위 트리대로 존재한다.
- 시드 ADR은 1개(`0001`)이며 Nygard 포맷·날짜 포함으로 이번 세션의 실제 결정을 기록한다.
- specs는 템플릿+README만 있고 가짜 예시가 없다. README에 "사소한 변경은 문서 생략" 룰이 있다.
- README가 포트폴리오용으로 재작성되고 `docs/`를 링크한다.
- 모든 문서가 한국어다.
