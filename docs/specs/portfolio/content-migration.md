# 포트폴리오 콘텐츠 이식 파이프라인 (소스 프로젝트 → jio.dev)

> 작성 2026-06-27
>
> 📍 **포트폴리오 콘텐츠 작업의 진입점.** 새 세션은 여기서 시작한다. **읽는 순서**: ① 이 문서(파이프라인·소스 위치) → ② [`case-study-structure.md`](./case-study-structure.md)(글 골격·루브릭) → ③ 필요 시 [`spec.md`](./spec.md)(사이트 IA).
>
> 🎯 **"다음 컨텐츠/글 파악·작성" 지시는 진입 스킬 `portfolio-next-content`가 받는다** — 그 스킬이 아래 §3 파이프라인을 결정적 순서로 실행하고, **다음 글은 §5 진행표가 정본**(`_backlog`는 후보 풀일 뿐)임을 못박는다. 이 문서는 그 상세 정본이다.
>
> 핵심 프로젝트들(vd-front 등)에 흩어진 포트폴리오 후보를 **하나씩 jio.dev로 옮기는** 절차의 단일 출처. 다른 세션도 이 문서만 보고 같은 절차로 작업할 수 있어야 한다.
>
> **옮기는 이유**: jio.dev가 정의한 글 구조([`case-study-structure.md`](./case-study-structure.md))에 맞춰 **재작성**하기 위함이다. 단순 복사가 아니라, 소스의 원자료를 jio.dev 골격으로 다시 쓰는 작업이다.

---

## 1. 저장소 지도 (`~/Desktop/projects/` 하위)

포트폴리오 소스가 되는 핵심 프로젝트.

| 저장소 | 역할 | 비고 |
|---|---|---|
| **vd-front** | VDOC PRO PC (데스크톱, Electron) | **소스코드 읽기 참조 전용** — 코드 `src/features/custom`. ⛔ **포트폴리오 산출물(원자료·인터뷰·작성·발행)은 절대 여기 두지 않는다 — 전부 jio.dev** (→ §4 SSOT). |
| **vd-web** | VDOC PRO WEB (환자용 AI 문진 웹) | 자가복구·문진 V2 등 PRO WEB 작업. |
| **vd-cs-web** | (작업 착수 시 역할 확인) | 사용자 지정 핵심 프로젝트. |
| **vdoc-component** | (작업 착수 시 역할 확인 — 공통 컴포넌트로 추정) | 사용자 지정 핵심 프로젝트. |
| 기타 다수 | vd-front-common · vd-backend · vd-ds2style · vd-system-admin-web · vdoc_pro-pc-front · vdoc_pro-web-front 등 | 후보가 나오면 그때 해당 repo 코드/git 분석. |

> ⚠️ 저장소 역할 매핑은 `vd-front/docs/portfolio/aitrics/_backlog.md`(소스 repo) 기준 + 일부 추정. **작업 착수 시 해당 repo를 직접 확인**해 보강할 것.

## 2. 산출물·소스 위치

- **모든 포트폴리오 산출물 = jio.dev** (원자료·인터뷰 원문·작성·발행). 한 곳 SSOT → §4 위치 표.
- **vd-front = 소스코드 읽기 참조 전용** (`docs/portfolio/`에 기존 STAR 미러·`_backlog.md`만 존재 — 이력 자료). ⚠️ vd-front `docs/pp`는 임시 브랜치라 지속 문서작업 불가 + README상 push 금지 → **여기에 새 산출물을 만들지 않는다.**
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
                      질문지 = case-study-structure.md §7 + §9.1 빈칸.
                      산출 ▶ ① jio.dev `raw-material/<slug>.md` 빈칸 채움(합성)
                           + ② jio.dev `raw-material/<slug>-interview.md` 사용자 답변 원문(verbatim) 저장  ★마스킹 필수(§4.1)
4. 골격대로 작성    — case-study-structure.md 5층 골격으로 재작성.  산출 ▶ jio.dev `content/projects/<slug>.mdx`(처음부터 일반화)
5. 자가검증        — ★**제목·구조 안을 §5 체크리스트·§9.2 루브릭 자가검증 + `/codex` 교차검증**(제목 숫자·과대명명 금지, 결과 방어력 필수). + §8 30초 스킴. 미달이면 4로.
6. jio.dev 커밋     — 초안을 jio.dev 정상 커밋(공개 — 마스킹/일반화 확인).
7. 발행·반영 확인   — frontmatter·라우팅·목업 교체(→ content-handoff.md), 사이트에서 확인.
```

- **2와 3의 분담**: 코드가 답하는 건 코드에서(2), 코드가 모르는 판단·맥락은 인터뷰에서(3). 인터뷰 없이 4로 가지 않는다.
- **5의 게이트**: 루브릭 평균 4점↑ + 어느 항목도 2점 이하 없음. 통과 못 하면 발행하지 않는다.

## 4. 산출물 위치·저장소 규칙 (SSOT)

각 단계 산출물이 **어디 살고 어떤 커밋 규칙인지의 단일 출처.** 다른 절(§2·§3·§5)은 이 표를 가리킨다. 위치가 빈 단계가 없어야 한다 — 빈칸을 다른 문장으로 추론해 채우지 말 것.

> **★ SSOT 원칙 (절대): 모든 포트폴리오 산출물 — 원자료·인터뷰 원문·작성·발행 — 은 jio.dev에만 둔다. vd-front는 소스코드 읽기 참조 전용이며 어떤 산출물도 두지 않는다(docs/pp는 임시 브랜치라 유실 위험). 산출물을 vd-front에 만들면 규칙 위반이다.**

| 단계 | 산출물 | 위치 | 커밋/푸시 | 내부 식별자 |
|---|---|---|---|---|
| **2 원자료** | §9.1 폼(코드칸) | **jio.dev** `docs/specs/portfolio/raw-material/<slug>.md` | 정상 커밋 | ★**마스킹 필수**(§4.1) |
| **3 인터뷰** | 위 파일 빈칸 채움 | 〃 같은 파일 | 정상 커밋 | ★마스킹 필수 |
| **4·6·7 작성·발행** | 5층 골격 MDX | **jio.dev** `content/projects/<slug>.mdx` | 정상 커밋 | **일반화**(공개) |
| **3 인터뷰 원문** | 사용자 답변 verbatim | **jio.dev** `docs/specs/portfolio/raw-material/<slug>-interview.md` | 정상 커밋 | ★**마스킹 필수**(§4.1) |

- **모든 산출물 작업은 jio.dev에서** (원자료·인터뷰·작성·발행). 단 jio.dev는 공개 repo라 **마스킹/일반화가 입장 조건**(§4.1). ⚠️ vd-front `docs/pp`는 임시 브랜치라 지속 문서작업 불가 → 글을 거기 쓰지 않는다.
- **vd-front의 역할 = 소스코드 읽기 참조 전용**. 어떤 포트폴리오 산출물(원자료·인터뷰·작성·발행)도 두지 않는다. (`docs/portfolio/`의 기존 STAR 미러·`_backlog.md`는 이력 자료일 뿐.)
- ✅ **jio.dev는 정상 커밋** — 공개 포트폴리오 사이트.

### 4.1 마스킹 규칙 (jio.dev에 두는 원자료·인터뷰 — MUST)

공개 repo 입장 조건. **커밋 전 아래를 전부 통과**해야 한다(case-study-structure §9.1 '공개 불가 정보'의 운영 절차).

- **제거/일반화**: 커밋해시 · 정확한 `파일:라인` · 내부 티켓번호 · 타 직원명(→"팀원") · 병원명(→"특정 병원") · 백엔드 클래스/경로(→"백엔드")
- **유지**(PII 아님 = 포트폴리오 자산): 규모 수치(LOC·테스트 수·diff 크기·%) · 메커니즘 이름 · 분석 구조 · 본인 이름
- **검증**: 커밋 전 `grep -nE "<티켓패턴>|<동료명>|<병원명>|<BE클래스>|[0-9a-f]{8}|\.(ts|tsx|kt):[0-9]"` → **0건**이어야 한다.

### 4.2 정본 규칙

- **모든 정본은 jio.dev.** 합성·요약본(`<slug>.md`) + 인터뷰 원문(`<slug>-interview.md`) 둘 다 jio.dev `raw-material/`에 **마스킹**으로 둔다.
- 정확한 코드 인용(파일:라인·커밋·티켓)이 필요하면 **그때 소스 repo(vd-front)를 직접 재-grep**한다 — 인용을 파일로 vd-front에 박지 않는다(임시 브랜치 유실 위험).

## 5. 진행 현황

표 단위 = **글 1편**(후보가 아님). 한 후보가 여러 글을 낳으므로 글 단위로 추적한다. 원자료·인터뷰는 후보 단위로 한 번 채우면 그 후보의 모든 글이 공유한다(예: 문진빌더 5토픽은 [`raw-material/questionnaire-builder.md`](./raw-material/questionnaire-builder.md) 하나에서 나온다).

| 글 | 소스(후보·토픽) | 원자료 | 인터뷰 | 작성 | 발행 |
|---|---|---|---|---|---|
| **DnD Sibling-scoped Fractional Rank** | 문진빌더(A)·토픽② | ☑ | ☑ | ☑ | ☑ |
| DraftStore 엔진 교체(RHF→Zustand+immer) | 문진빌더(A)·토픽① | ☑ | ☑ | ☑ | ☐ |
| 후속연결 순환탐지(제품 예측+검증 전략) | 문진빌더(A)·토픽③ | ☑ | ☑ | ☐ | ☐ |
| air-gap 문진 이관·배포 lifecycle | 문진빌더(A)·토픽④ | ☑ | ☑ | ☐ | ☐ |
| 테스트/품질 인프라 (B) | vd-front·vd-web | ☐ | ☐ | ☐ | ☐ |
| 무인 코드사이닝 CI (C) | vd-front | ☐ | ☐ | ☐ | ☐ |
| 문진 UI 현대화 (D) | vd-web | ☐ | ☐ | ☐ | ☐ |
| QR 접수 (F) | vd-web | ☐ | ☐ | ☐ | ☐ |

> 단계 완료 시 ☑로 갱신. 글 추가 시 행 추가.
> **모바일 미리보기 이식·DTO/nanoId**(토픽⑤)는 독립 글이 아님 — AI 네이티브 관통 테마의 증거로 overview·bullet에 녹인다(raw-material §0 C4·§9.2 결정).

### 5.1 ★ 다음 글 1순위 — DraftStore 엔진 교체 (토픽①)

확정 다음 작업 = **RHF→Zustand+immer DraftStore 엔진 교체** 글. 근거:
- raw-material §7·§9.2가 이 토픽을 **"설계·검증 깊이가 AI 생산성의 상한"** 관통 테마의 **#1 증명처**로 지목.
- 코드 방어력이 가장 두껍다: 14,000줄 폼 엔진 청산(179파일 +711/−14,172) · 동등성 하니스로 회귀 0 보증 · `temporal(persist(immer))` undo/redo · 실시간 에러와 저장 차단이 동일 13룰 공유.
- 지배 질문 = 레거시 전환형("한 번에 갈아엎지 않고 위험을 어떻게 쪼갰나") — 평행 재구현+QA 게이트 컷오버 서사가 강함.
- 진입: 파이프라인 4단계(골격대로 작성)부터. 원자료·인터뷰는 [`raw-material/questionnaire-builder.md`](./raw-material/questionnaire-builder.md) §1·§7·§9에 확정(☑) — 바로 쓸 수 있다.

## 6. 첫 케이스 — 문진빌더

이 가이드에 따른 **첫 적용**은 **문진빌더**(vd-front, PRO PC).

- 소스: `vd-front` · 코드 `src/features/custom`(~57k LOC) · 백로그 [A] 항목.
- 티어: **대표작(주연)** — 깊은 상세 글 1편.
- 시작점: 위 파이프라인 2단계(코드·git 파악)부터. 원자료 폼의 코드칸을 먼저 채우고 → 인터뷰 질문지를 추린다.

## 참고

- 글 구조(어떻게 쓰나): [`case-study-structure.md`](./case-study-structure.md)
- 사이트 IA·디자인: [`spec.md`](./spec.md)
- jio.dev 콘텐츠 채우기(목업→실제): [`content-handoff.md`](./content-handoff.md)
