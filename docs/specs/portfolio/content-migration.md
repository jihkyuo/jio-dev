# 포트폴리오 콘텐츠 이식 파이프라인 (소스 프로젝트 → jio.dev)

> 작성 2026-06-27
>
> 📍 **포트폴리오 콘텐츠 작업의 진입점.** 새 세션은 여기서 시작한다. **읽는 순서**: ① 이 문서(파이프라인·소스 위치) → ② [`case-study-structure.md`](./case-study-structure.md)(글 골격·루브릭) → ③ 필요 시 [`spec.md`](./spec.md)(사이트 IA).
>
> 핵심 프로젝트들(vd-front 등)에 흩어진 포트폴리오 후보를 **하나씩 jio.dev로 옮기는** 절차의 단일 출처. 다른 세션도 이 문서만 보고 같은 절차로 작업할 수 있어야 한다.
>
> **옮기는 이유**: jio.dev가 정의한 글 구조([`case-study-structure.md`](./case-study-structure.md))에 맞춰 **재작성**하기 위함이다. 단순 복사가 아니라, 소스의 원자료를 jio.dev 골격으로 다시 쓰는 작업이다.

---

## 1. 저장소 지도 (`~/Desktop/projects/` 하위)

포트폴리오 소스가 되는 핵심 프로젝트.

| 저장소 | 역할 | 비고 |
|---|---|---|
| **vd-front** | VDOC PRO PC (데스크톱, Electron) | **작성본(4단계)·소스코드** — `docs/portfolio/`·브랜치 `docs/pp`(⛔push금지). *원자료·인터뷰(2~3단계)는 jio.dev `raw-material/`* (→ §4). 문진빌더 코드(`src/features/custom`)도 여기. |
| **vd-web** | VDOC PRO WEB (환자용 AI 문진 웹) | 자가복구·문진 V2 등 PRO WEB 작업. |
| **vd-cs-web** | (작업 착수 시 역할 확인) | 사용자 지정 핵심 프로젝트. |
| **vdoc-component** | (작업 착수 시 역할 확인 — 공통 컴포넌트로 추정) | 사용자 지정 핵심 프로젝트. |
| 기타 다수 | vd-front-common · vd-backend · vd-ds2style · vd-system-admin-web · vdoc_pro-pc-front · vdoc_pro-web-front 등 | 후보가 나오면 그때 해당 repo 코드/git 분석. |

> ⚠️ 저장소 역할 매핑은 `vd-front/docs/portfolio/aitrics/_backlog.md`(소스 repo) 기준 + 일부 추정. **작업 착수 시 해당 repo를 직접 확인**해 보강할 것.

## 2. 현재 콘텐츠 위치 (vd-front)

- **작성본·소스 허브**: `vd-front/docs/portfolio/` (브랜치 `docs/pp`, ⛔push금지) — **4단계 작성본**·소스코드. *원자료·인터뷰(2~3단계)는 jio.dev `raw-material/`에 둔다* (→ §4 위치 표).
  - `aitrics/`, `theswing/` — 회사별 프로젝트 문서(기존 STAR 형식, ~2026.03 미러).
  - `aitrics/_backlog.md` — ★**미작성 후보 목록**. 2026.04~ 신규 작업 후보(A 문진빌더 · B 테스트/품질 인프라 · C 무인 코드사이닝 CI · D 문진 UI 현대화 · F QR 접수).
- 이 후보들이 **jio.dev로 옮길 1차 대상**이다. (소스의 STAR 형식은 jio.dev 골격으로 재작성됨)

## 3. 이식 파이프라인 (후보 1건당)

각 후보를 아래 7단계로 처리한다.

각 단계는 **산출물과 그 위치**를 함께 명시한다(위치 표 = §4). 위치가 빈 단계가 없어야 한다.

```
1. 후보 선택        — _backlog.md에서 1건. 대표작/조연 티어 확인(배치 모델 §3 of case-study-structure).
2. 코드·git 파악    — 소스 repo에서 구조·커밋 분석 → §9.1 원자료 폼의 '코드칸' 채움.
                      산출 ▶ jio.dev `docs/specs/portfolio/raw-material/<slug>.md`  ★마스킹 필수(§4.1)
3. 심층 인터뷰      — 코드로 모르는 칸(대안 근거·검증/배포·인과 귀속·나 vs 팀)을 사용자에게 질문.
                      질문지 = case-study-structure.md §7 + §9.1 빈칸. 산출 ▶ 위 raw-material 파일의 빈칸 채움.
4. 골격대로 작성    — case-study-structure.md 5층 골격으로 재작성.  산출 ▶ vd-front `docs/pp`(작성본)
5. 자가검증        — §9.2 루브릭(6항목 1~5점) + §8 30초 스킴 테스트 통과 확인. 미달이면 4로.
6. 소스에 커밋      — vd-front `docs/pp`에 작성본 커밋. ⛔ push 금지(개인정보 포함).
7. jio.dev로 이식   — content/projects/<slug>.mdx 작성(frontmatter + 본문) → jio.dev 정상 커밋(일반화).
```

- **2와 3의 분담**: 코드가 답하는 건 코드에서(2), 코드가 모르는 판단·맥락은 인터뷰에서(3). 인터뷰 없이 4로 가지 않는다.
- **5의 게이트**: 루브릭 평균 4점↑ + 어느 항목도 2점 이하 없음. 통과 못 하면 발행하지 않는다.

## 4. 산출물 위치·저장소 규칙 (SSOT)

각 단계 산출물이 **어디 살고 어떤 커밋 규칙인지의 단일 출처.** 다른 절(§2·§3·§5)은 이 표를 가리킨다. 위치가 빈 단계가 없어야 한다 — 빈칸을 다른 문장으로 추론해 채우지 말 것.

| 단계 | 산출물 | 위치 | 커밋/푸시 | 내부 식별자 |
|---|---|---|---|---|
| **2 원자료** | §9.1 폼(코드칸) | **jio.dev** `docs/specs/portfolio/raw-material/<slug>.md` | 정상 커밋 | ★**마스킹 필수**(§4.1) |
| **3 인터뷰** | 위 파일 빈칸 채움 | 〃 같은 파일 | 정상 커밋 | ★마스킹 필수 |
| **4·6 작성** | 5층 골격 글 | **vd-front** `docs/pp` | commit-only ⛔**push 금지** | 원문 OK(미공개) |
| **7 발행** | MDX | **jio.dev** `content/projects/<slug>.mdx` | 정상 커밋 | 일반화 |
| (선택) 상세본 | 정확 인용(파일:라인·커밋·티켓) | **vd-front** `docs/portfolio/<회사>/raw/` | commit-only ⛔ | 원문 OK |

- **왜 원자료가 jio.dev인가**: 원자료·인터뷰는 작성-전 중간물 → 파이프라인 문서 옆(jio.dev)에 둬 한 곳에서 추적한다. 단 jio.dev는 공개 repo라 **마스킹이 입장 조건**(§4.1).
- ⛔ **vd-front `docs/portfolio/`는 절대 push 금지** — 개인정보(인적사항·연락처) 포함. `git commit`만 허용. (vd-front README 규칙)
- ✅ **jio.dev는 정상 커밋** — 공개 포트폴리오 사이트.

### 4.1 마스킹 규칙 (jio.dev에 두는 원자료·인터뷰 — MUST)

공개 repo 입장 조건. **커밋 전 아래를 전부 통과**해야 한다(case-study-structure §9.1 '공개 불가 정보'의 운영 절차).

- **제거/일반화**: 커밋해시 · 정확한 `파일:라인` · 내부 티켓번호 · 타 직원명(→"팀원") · 병원명(→"특정 병원") · 백엔드 클래스/경로(→"백엔드")
- **유지**(PII 아님 = 포트폴리오 자산): 규모 수치(LOC·테스트 수·diff 크기·%) · 메커니즘 이름 · 분석 구조 · 본인 이름
- **검증**: 커밋 전 `grep -nE "<티켓패턴>|<동료명>|<병원명>|<BE클래스>|[0-9a-f]{8}|\.(ts|tsx|kt):[0-9]"` → **0건**이어야 한다.

### 4.2 정본 규칙 (이중 사본 모호함 제거)

- **파이프라인 정본 = jio.dev raw-material 마스킹본.** 인터뷰(3)·작성(4)이 읽는 단일 출처.
- 정확 인용이 필요하면 **선택적으로** vd-front `raw/`에 상세본(마스킹×)을 둘 수 있으나 — **검증 부속(derived), 정본 아님.** 안 만들면 4단계에서 소스 repo를 재-grep한다. 둘이 어긋나면 jio.dev 마스킹본이 정본.

## 5. 진행 현황

| 후보 | 소스 repo | 원자료(jio raw-material/) | 인터뷰(jio raw-material/) | 작성(vd docs/pp) | 발행(jio.dev) |
|---|---|---|---|---|---|
| **문진빌더 (A)** | vd-front | ☑ | ☑ | ☐ | ☐ |
| 테스트/품질 인프라 (B) | vd-front·vd-web | ☐ | ☐ | ☐ | ☐ |
| 무인 코드사이닝 CI (C) | vd-front | ☐ | ☐ | ☐ | ☐ |
| 문진 UI 현대화 (D) | vd-web | ☐ | ☐ | ☐ | ☐ |
| QR 접수 (F) | vd-web | ☐ | ☐ | ☐ | ☐ |

> 단계 완료 시 ☑로 갱신. 후보 추가 시 행 추가.

## 6. 첫 케이스 — 문진빌더

이 가이드에 따른 **첫 적용**은 **문진빌더**(vd-front, PRO PC).

- 소스: `vd-front` · 코드 `src/features/custom`(~57k LOC) · 백로그 [A] 항목.
- 티어: **대표작(주연)** — 깊은 상세 글 1편.
- 시작점: 위 파이프라인 2단계(코드·git 파악)부터. 원자료 폼의 코드칸을 먼저 채우고 → 인터뷰 질문지를 추린다.

## 참고

- 글 구조(어떻게 쓰나): [`case-study-structure.md`](./case-study-structure.md)
- 사이트 IA·디자인: [`spec.md`](./spec.md)
- jio.dev 콘텐츠 채우기(목업→실제): [`content-handoff.md`](./content-handoff.md)
