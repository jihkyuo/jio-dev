# 콘텐츠 핸드오프 — 목업 → 실제 내용 채우기

> **이 문서를 읽는 다음 세션에게:** 지금 화면에 보이는 **모든 수치·회사명·프로젝트·문구·링크는 목업용 샘플(placeholder)** 이다. 정본이 아니다. 디자인·레이아웃·구조를 채우려고 임시로 넣은 값이다. 아래 표의 위치를 **사용자의 실제 내용으로 교체**하라. 구조/스키마/컴포넌트 마크업은 바꾸지 말고 **값만** 바꾼다.

작성 2026-06-26 · 기준 커밋: Plan 1·2·3 머지 완료 상태.

## TL;DR — 목업 경계
- **실제로 추정되는 값**: 이름 `지오현`(git author)뿐. *사용자 확인 필요.*
- **나머지 전부 목업**: 직함·태그라인·경력연차·회사명(`某 핀테크`·`某 커머스`)·기간·임팩트 수치(`LCP 4.2s→1.1s`·`전환 +12%` 등)·스킬 목록·프로젝트 2건(frontmatter+본문)·About/Contact 문단·이메일(`hello@jio.dev`)·GitHub/LinkedIn 링크(빈 베이스 URL)·도메인.
- **누락(반드시 추가)**: `public/resume.pdf` 파일이 아직 없다(링크만 존재).

## 콘텐츠는 두 종류다
1. **구조화 콘텐츠 (entities 레이어, zod 검증됨)** — `src/entities/*/api/get*.ts` + `content/projects/*.mdx` + `src/shared/config/site.ts`. 값만 바꾸면 화면 자동 반영. 형식 틀리면 **빌드 실패**(아래 규칙 참고).
2. **하드코딩 카피 (위젯 컴포넌트 안 JSX)** — `src/widgets/about/ui/About.tsx`·`src/widgets/contact/ui/Contact.tsx`의 문단. 콘텐츠 데이터가 아니라 컴포넌트 파일을 직접 편집. (`{/* 사용자가 ... 교체 */}` 주석 표시되어 있음.)

---

## 채울 위치 체크리스트

### ☐ 1. 사이트 메타·연락처 — `src/shared/config/site.ts`
| 필드 | 현재(목업) | 채울 것 |
|---|---|---|
| `name` | `지오현` | 실제 이름(맞으면 유지) |
| `role` | `프론트엔드 엔지니어` | 실제 직함 |
| `description` | 포트폴리오 한 줄 설명 | 실제 메타 설명(검색·OG에 노출) |
| `url` | `https://jio.dev` | 실제 배포 도메인 |
| `links.email` | `hello@jio.dev` | 실제 이메일 |
| `links.github` | `https://github.com/`(빈 베이스) | 실제 GitHub 프로필 URL |
| `links.linkedin` | `https://www.linkedin.com/in/`(빈 베이스) | 실제 LinkedIn URL |
> 이름·링크는 `profile`·`Contact`·OG·메타데이터가 모두 여기서 가져간다(단일 출처).

### ☐ 2. 프로필 / Hero / Career Snapshot — `src/entities/profile/api/getProfile.ts`
| 필드 | 현재(목업) | 채울 것 |
|---|---|---|
| `eyebrow` | `Frontend Engineer` | 상단 라벨(직함 영문 등) |
| `tagline` | `복잡한 UI를 단순한 시스템으로. 성능과 DX를…` | 실제 한 줄 소개 |
| `snapshot.years` | `8` | 실제 경력 연차(양의 정수) |
| `snapshot.domains` | `["결제·정산", "디자인 시스템"]` | 실제 핵심 도메인(1개 이상) |
| `snapshot.headline` | `대규모 결제 플로우 LCP 4.2s→1.1s · 전환 +12%` | **대표 성과 1줄**(우측 컬럼 최상단 lead로도 노출 — 5초 스캔 핵심) |
| `resumePdf` | `/resume.pdf` | 경로 유지 + **실제 PDF를 `public/resume.pdf`에 추가**(아래 §6) |

### ☐ 3. 경력 타임라인 — `src/entities/experience/api/getExperience.ts`
`raw` 배열 **전체가 목업(2건)**. 실제 경력으로 교체(개수 자유). 항목당 필드:
| 필드 | 목업 예 | 형식 규칙 |
|---|---|---|
| `company` | `某 핀테크` / `某 커머스` | 실제 회사명 |
| `role` | `프론트엔드 리드` | 실제 역할 |
| `period.start` | `2022.01` | **`YYYY.MM` 필수** |
| `period.end` | `NOW` / `2021.12` | `YYYY.MM` 또는 재직중 `NOW` |
| `teamSize` | `5명` | 자유 문자열 |
| `scope` | `결제·정산 웹 프론트 챕터 리드` | 본인 역할·기여 범위 |
| `impact` | 불릿 배열 | **2개 이상 필수**(정량 우선) |
| `leadership` | 배열 | 리더십 시그널(설계·리뷰·멘토링·장애대응 등). 없으면 `[]` |
| `stack` | `["Next.js", ...]` | **1개 이상** |

### ☐ 4. 스킬 — `src/entities/skill/api/getSkills.ts`
세 그룹 전부 목업. 실제로 교체:
| 그룹 | 현재(목업) | 의미 |
|---|---|---|
| `core` | `["React","Next.js","TypeScript"]` | 주력·깊이(**1개 이상 필수**) |
| `comfortable` | `["Tailwind","React Query","Vitest"]` | 실무 가능 |
| `production` | `["GraphQL","Webpack","Node.js"]` | 투입 경험 |

### ☐ 5. 프로젝트 — `content/projects/*.mdx` (목업 2건 + 실제 1건)
현재 파일: `payment-widget-rearchitecture.mdx`·`design-system-v2.mdx`(**둘 다 목업**, 옛 Outcome-First 본문) + `dnd-fractional-indexing.mdx`(**실제 케이스 스터디 1편**, 5층 골격). 목업 2건은 실제 프로젝트로 교체하거나 새 `.mdx`를 추가(파일 하나 = 프로젝트 하나).
- **frontmatter — 필수(누락 시 빌드 실패):** `title` · `slug`(kebab-case, **파일명과 일치**) · `period` · `role` · `stack`(배열) · `impact`(홈 카드 훅 1줄 — 결과 숫자 강제 아님, 메커니즘·상태 전환도 허용) · `summary`. **선택:** `teamSize` · `links`(`live`/`repo`) · `order`(작을수록 먼저) · `featured` · `titleHighlight`(제목 중 강조할 부분 문자열 — 그 구간에 핑크→보라→블루 스윕 하이라이트. `title` 안에 그대로 들어 있어야 적용, 없으면 무강조).
- **본문 골격:** 케이스 스터디는 [`case-study-structure.md`](./case-study-structure.md)의 **5층 골격**으로 쓴다(헤드라인 칩 → 요약표(PAAR) → 콜아웃 → 본문 → 딥다이브). 상세 chrome는 제목 h1까지만 제공하고 나머지는 MDX가 소유한다(TL;DR 스트립 없음). (목업 2건의 `## 맥락 & 문제 → ## My Role…` Outcome-First 본문은 폐기 골격 — 교체 시 5층으로.)
- 목업 임팩트 수치(`번들 −38%` 등)·회사 맥락은 실제로 교체.

### ☐ 6. About / Contact 문단 — 컴포넌트 직접 편집
콘텐츠 레이어가 아님. 파일 안 `{/* 교체 */}` 문단을 직접 수정.
- `src/widgets/about/ui/About.tsx` — 3문단(소개). 전부 목업 카피.
- `src/widgets/contact/ui/Contact.tsx` — 안내 1문단(`새로운 기회나 협업…`). 목업 카피. (CTA 링크는 `profile`에서 자동.)

### ☐ 7. 이력서 PDF — `public/resume.pdf`
**파일이 없다.** 실제 이력서 PDF를 `public/resume.pdf`로 추가(파일명 바꾸려면 `profile.ts`의 `resumePdf`도 같이).

### ☐ 8. (선택) OG 이미지 텍스트 — `src/app/opengraph-image.tsx`
SNS 공유 카드. 텍스트는 `siteConfig`(이름·직함)에서 가져오므로 §1만 채우면 대부분 반영. 추가 카피가 있으면 여기 확인.

---

## 형식 규칙 (어기면 `pnpm build` 실패)
스키마는 엔티티별 `src/entities/*/model/schema.ts`(zod). 핵심:
- 경력 `period`: `YYYY.MM`(종료는 `YYYY.MM`|`NOW`). 경력 `impact` ≥ 2, `stack` ≥ 1.
- 프로젝트 frontmatter: 위 필수 필드 전부. `slug` kebab-case + 파일명 일치.
- `snapshot.years` 양의 정수, `snapshot.domains` ≥ 1. `skills.core` ≥ 1.
- `links.email`은 이메일 형식, `github`/`linkedin`/프로젝트 `links`는 URL 형식.

## 검증 방법
```bash
pnpm dev      # 화면 확인(http://localhost:3000)
pnpm build    # 콘텐츠 검증(형식 틀리면 여기서 실패)
pnpm test     # 스키마·로더 테스트
```

## 바꾸지 말 것 (구조)
- `src/entities/*/model/schema.ts`(스키마)·컴포넌트 마크업·레이아웃·토큰·인터랙션. **값만** 바꾼다. 새 필드가 필요하면 스키마부터 합의.

## 참고
- 코드 지도: `docs/architecture.md`
- 설계 결정·IA·비주얼: `docs/specs/portfolio/spec.md` + `plan-1/2/3`
