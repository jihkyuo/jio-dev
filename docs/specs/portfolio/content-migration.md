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
| **vd-front** | VDOC PRO PC (데스크톱, Electron) | ★**포트폴리오 작성 허브** — `docs/portfolio/`, 브랜치 `docs/pp`. 문진빌더 코드(`src/features/custom`)도 여기. |
| **vd-web** | VDOC PRO WEB (환자용 AI 문진 웹) | 자가복구·문진 V2 등 PRO WEB 작업. |
| **vd-cs-web** | (작업 착수 시 역할 확인) | 사용자 지정 핵심 프로젝트. |
| **vdoc-component** | (작업 착수 시 역할 확인 — 공통 컴포넌트로 추정) | 사용자 지정 핵심 프로젝트. |
| 기타 다수 | vd-front-common · vd-backend · vd-ds2style · vd-system-admin-web · vdoc_pro-pc-front · vdoc_pro-web-front 등 | 후보가 나오면 그때 해당 repo 코드/git 분석. |

> ⚠️ 저장소 역할 매핑은 `vd-front/docs/portfolio/aitrics/_backlog.md`(소스 repo) 기준 + 일부 추정. **작업 착수 시 해당 repo를 직접 확인**해 보강할 것.

## 2. 현재 콘텐츠 위치 (vd-front)

- **작성 허브**: `vd-front/docs/portfolio/` (브랜치 `docs/pp`)
  - `aitrics/`, `theswing/` — 회사별 프로젝트 문서(기존 STAR 형식, ~2026.03 미러).
  - `aitrics/_backlog.md` — ★**미작성 후보 목록**. 2026.04~ 신규 작업 후보(A 문진빌더 · B 테스트/품질 인프라 · C 무인 코드사이닝 CI · D 문진 UI 현대화 · F QR 접수).
- 이 후보들이 **jio.dev로 옮길 1차 대상**이다. (소스의 STAR 형식은 jio.dev 골격으로 재작성됨)

## 3. 이식 파이프라인 (후보 1건당)

각 후보를 아래 7단계로 처리한다.

```
1. 후보 선택        — _backlog.md에서 1건. 대표작/조연 티어 확인(배치 모델 §3 of case-study-structure).
2. 코드·git 파악    — 해당 repo에서 구조·커밋 분석 → §9.1 원자료 폼의 '코드로 알 수 있는 칸' 채움.
3. 심층 인터뷰      — 코드로 모르는 칸(대안 근거·검증/배포 방식·인과 귀속·나 vs 팀)을 사용자에게 질문.
                      질문지 = case-study-structure.md §7 + §9.1 빈칸.
4. 골격대로 작성    — case-study-structure.md 5층 골격으로 재작성.
5. 자가검증        — §9.2 루브릭(6항목 1~5점) + §8 30초 스킴 테스트 통과 확인. 미달이면 4로.
6. 소스에 커밋      — vd-front `docs/pp`에 작성본 커밋. ⛔ push 금지(개인정보 포함).
7. jio.dev로 이식   — content/projects/<slug>.mdx 작성(frontmatter + 본문) → jio.dev 정상 커밋.
```

- **2와 3의 분담**: 코드가 답하는 건 코드에서(2), 코드가 모르는 판단·맥락은 인터뷰에서(3). 인터뷰 없이 4로 가지 않는다.
- **5의 게이트**: 루브릭 평균 4점↑ + 어느 항목도 2점 이하 없음. 통과 못 하면 발행하지 않는다.

## 4. 저장소 규칙·경계

- **콘텐츠 원본 생성 = 소스(vd-front docs/pp)**. 그 repo에 프로젝트 지식·git 이력이 있기 때문.
- **최종 발행 = jio.dev** (`content/projects/*.mdx`).
- ⛔ **vd-front `docs/portfolio/`는 절대 push 금지** — 개인정보(인적사항·연락처) 포함. `git commit`만 허용. (vd-front README 규칙)
- ✅ **jio.dev는 정상 커밋** — 공개 포트폴리오 사이트. 비공개 사내 정보는 글에서 일반화(case-study-structure §9.1 '공개 불가 정보').

## 5. 진행 현황

| 후보 | 소스 repo | 원자료 | 인터뷰 | 작성(docs/pp) | jio.dev 이식 |
|---|---|---|---|---|---|
| **문진빌더 (A)** | vd-front | ☐ | ☐ | ☐ | ☐ |
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
