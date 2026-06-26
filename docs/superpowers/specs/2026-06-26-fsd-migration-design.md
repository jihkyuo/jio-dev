# FSD 마이그레이션 설계

> 상태: 구현 완료
> 날짜: 2026-06-26

## 목표

현재 관용적 Next.js 구조(`app`/`components`/`content`/`config`)를 **Feature-Sliced Design**으로
재편한다. 이 포트폴리오는 "프론트엔드 베스트 프랙티스를 보여주는" 산출물이므로, FSD를 정석대로
적용하고 **steiger**(FSD 공식 린터)로 경계를 강제한다.

검증 가능한 성공 기준(완료 게이트):
1. `pnpm build` 성공 (Next 프로덕션 빌드, RSC 경계 보존)
2. `pnpm test`(vitest) 전체 그린 — 테스트는 슬라이스로 코로케이트
3. `pnpm lint`(ESLint) 그린
4. `pnpm lint:fsd`(steiger) 그린 — 레이어/경계 위반 0
5. 런타임 스모크: 홈(`/`) + 프로젝트 상세(`/projects/[slug]`) 정상 렌더

## 레이어 결정

`app · widgets · features · entities · shared` (5레이어).

- **pages 레이어 없음** — Next.js `app/`이 라우팅·레이아웃·메타데이터·페이지 조합 역할을 한다.
- **features는 빈 레이어** (`.gitkeep`만) — 상태/비즈니스 로직을 바꾸는 사용자 유스케이스가 현재
  0개다(정적 콘텐츠 표시 사이트). 다크모드 토글·연락 폼 같은 진짜 feature가 생기면 그때 채운다.
- 의존 방향: `app → widgets → entities → shared` (하향만, 가로 import 0).

## 네이밍 컨벤션

- 슬라이스/세그먼트 폴더: **kebab-case** (`widgets/about/`, `entities/project/`)
- React 컴포넌트 파일: **PascalCase** (`Sidebar.tsx`)
- 데이터/로직 파일: **camelCase** (`getProfile.ts`)

## 목표 디렉터리 구조

```
src/
  app/                              # Next App Router (= pages 역할, 변경 최소)
    layout.tsx  page.tsx
    projects/[slug]/page.tsx
    sitemap.ts  sitemap.test.ts
    opengraph-image.tsx  globals.css

  widgets/                          # 페이지 섹션 (entity를 읽어 렌더)
    sidebar/    ui/Sidebar.tsx  ui/RailNav.tsx   index.ts   # RailNav는 슬라이스 비공개
    about/      ui/About.tsx                      index.ts
    experience/ ui/Experience.tsx                 index.ts
    skills/     ui/Skills.tsx                      index.ts
    projects/   ui/Projects.tsx                    index.ts
    contact/    ui/Contact.tsx                     index.ts

  features/                         # 빈 레이어 (.gitkeep)

  entities/                         # 도메인 모델 + 데이터 API
    profile/     model/schema.ts  api/getProfile.ts(+test)         index.ts
    experience/  model/schema.ts  api/getExperience.ts(+test)      index.ts
    skill/       model/schema.ts  api/getSkills.ts(+test)          index.ts
    project/     model/schema.ts  api/getProjects.ts(+test)        index.ts

  shared/
    ui/      CursorGlow.tsx  Reveal.tsx  mdx.tsx     # 통배럴 없음 — 직접 경로 import
    config/  site.ts  index.ts
```

> **네이밍 결정 (구현 중 변경):** 설계 스펙 초안은 `entities/skills`(복수)로 작성했으나, steiger `fsd/inconsistent-naming` 규칙이 엔티티 슬라이스 이름의 문법 수를 일관되게 요구하므로(profile/experience/project가 단수) `entities/skill`(단수)로 변경했다 — 사용자 승인 완료.

## 핵심 이동 매핑

| 현재 | → 이동 | 비고 |
|---|---|---|
| `content/schema.ts` (단일) | **4개 `entities/*/model/schema.ts`로 분리** | 각 엔티티가 자기 모델 소유 |
| `content/{profile,experience,skills}.ts` | `entities/*/api/get*.ts` | getter들 |
| `content/projects.ts` | `entities/project/api/getProjects.ts` | fs 로더 묶음(경로 트래버설 가드 포함) |
| `content/index.ts` (전역 배럴) | **제거** → 슬라이스별 `index.ts` | 소비자는 `@/entities/profile` 등으로 직접 |
| `components/{섹션 6종}` | `widgets/<kebab>/ui/` | About·Experience·Skills·Projects·Contact·Sidebar(+RailNav) |
| `components/{CursorGlow,Reveal,mdx}` | `shared/ui/` | 도메인 무관 재사용 UI |
| `config/site.ts` | `shared/config/` | 사이트 전역 상수 |
| 각 `*.test.ts` + `content/__tests__/smoke.test.ts` | 해당 슬라이스에 코로케이트 | 배럴 테스트(`index.test.ts`)는 슬라이스 public API 테스트로 대체 |

엔티티↔위젯 이름 겹침(`entities/project` vs `widgets/projects`)은 FSD 정석(데이터 슬라이스 ≠
표현 슬라이스). `profile`은 전용 위젯 없이 Sidebar·About·Contact가 공유한다.

## RSC·경계 세부 결정 (codex 교차검증 반영)

설계의 큰 골격은 codex가 "sound"로 확인했고, 아래 3개를 실질 수정으로 반영한다.

1. **fs 기반 API에 `import "server-only"` 명시.**
   `entities/project/api/getProjects.ts`는 `node:fs`·`node:path`·`gray-matter`를 쓰는 서버 전용
   모듈이다. 최상단에 `import "server-only"`를 둬, 클라이언트 컴포넌트가 실수로 import하면
   **빌드타임에 즉시 실패**시킨다(런타임 늦은 실패 방지).

2. **shared/ui 단일 배럴 금지 — 직접 경로 import.**
   `CursorGlow`·`Reveal`은 `"use client"` 아일랜드, `mdx`는 RSC 매핑이다. 셋을 한 `index.ts`로
   묶으면 서버 파일이 클라이언트 코드를(또는 그 반대를) 끌고 오는 "attractive nuisance"가 된다.
   `shared`는 FSD에서 슬라이스가 아니라 세그먼트이므로 통배럴 의무가 없다.
   → `@/shared/ui/CursorGlow`, `@/shared/ui/Reveal`, `@/shared/ui/mdx`로 **파일 직접** import.

3. **steiger 튜닝에 테스트 규칙 포함.**
   콜로케이트 테스트는 **같은 슬라이스 내부는 상대경로**(`./getProfile`, FSD상 합법)로, 타 슬라이스
   참조는 public API로만 import한다. steiger가 그래도 트집잡으면 `*.test.ts`에 한해 해당 규칙
   override.

### 보류한 codex 지적 (의도적)

- **site.ts는 `shared/config`에 유지.** codex는 "app 메타데이터가 shared로 위장" 가능성을 지적했으나,
  사이트 전역 상수(제목·설명·링크)는 `shared/config`의 정확한 용도이고 `entities → shared`는 합법적
  하향 의존이며 순환이 없다. `profile`이 도메인 필드를 자체 소유하도록 쪼개는 것은 이 규모에선
  오버엔지니어링(단순함 우선)이라 적용하지 않는다.
- `mdx.tsx`는 확인 결과 프로젝트 무관한 순수 타이포그래피 매핑(h2/h3/p/ul/li/a/code/pre, 토큰
  스타일)이라 `shared/ui` 배치가 정당하다.

## 의존 규칙 (steiger가 강제)

```
app → widgets → entities → shared      (하향만, 가로 import 0, 슬라이스는 public API로만)
```

마이그레이션 후 위반 0 — 현재 의존 그래프(`app→components,content,config` / `components→content`
/ `content→schema,config`)가 이미 이 방향이라 그대로 떨어진다.

### steiger 셋업

- `steiger` devDependency 추가, `package.json`에 `"lint:fsd": "steiger ./src"` 스크립트.
- `steiger.config.ts`: 구조 규칙(`forbidden-imports`·`no-public-api-sidestep`·`no-cross-imports`·
  `public-api`)은 켜고, 소규모에서 노이즈인 휴리스틱(`insignificant-slice`·`excessive-slicing`)은
  끈다. 테스트 콜로케이션이 public-API 규칙에 걸리면 `*.test.ts` override를 추가한다.

## 마이그레이션 전략

**빅뱅 단일 PR.** 규모가 작아(~30파일·~1369줄) 점진 이전은 신·구 구조 공존으로 steiger가 내내
빨갛다. 한 번에 옮기고 위 5개 게이트를 모두 그린으로 닫는다. 위험 지점은 파일 이동이 아니라 **RSC
경계 보존**과 **서버/클라 혼합 배럴 회피**이므로, 위 세부 결정 1~2가 그 방어선이다.

## 범위 밖 (Out of scope)

- 기능 추가·UI 변경·콘텐츠 변경 (구조 이전만; 동작은 불변)
- `app/` 내부 라우팅 구조 변경
- 실제 features 슬라이스 작성 (빈 레이어만 생성)
- site.ts 도메인 분해 (위 "보류" 참고)
