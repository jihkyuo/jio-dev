---
name: portfolio-next-content
description: jio.dev 포트폴리오의 "다음 컨텐츠를 파악·작성·발행"하는 전체 파이프라인의 진입점. 지시를 받으면 진행표에서 다음 글을 정해 작성→자가검증→커밋→발행 순서로 실행한다. 트리거(대상 ∩ 동작): 대상=포트폴리오·컨텐츠/콘텐츠·글·케이스 스터디·프로젝트 글·raw-material / 동작=다음(next)·작성·써·쓰자·이어서·진행·"뭐 쓰지". 예: "다음 (작성할) 컨텐츠 파악해", "다음 글 쓰자", "다음 케이스 스터디 작성", "포트폴리오 이어서/다음 거 진행", "이제 뭐 쓰지?", 특정 토픽 지명("DraftStore 글 쓰자"), "raw-material 기반으로 글 써". 인터뷰만이면 portfolio-deep-interview, 글 골격만 물으면 case-study-structure.md.
---

# 포트폴리오 다음 컨텐츠 파이프라인

## 왜 이 스킬

"다음 컨텐츠 파악/작성" 류 지시를 받으면, 문서를 운으로 더듬어 §5.1을 찾는 **확률적 경로** 대신 이 순서를 **결정적으로** 실행한다. 상세는 [`docs/specs/portfolio/content-migration.md`](../../../docs/specs/portfolio/content-migration.md)가 정본 — 이 스킬은 *순서와 정본 위치*만 못박는다.

## 0. 다음 글의 정본 — 진행표다, `_backlog`가 아니다

**가장 흔한 미스: `_backlog.md`로 가서 후보를 새로 고른다.** 그러지 마라.

- **다음 글 = `content-migration.md` §5 진행표 + §5.1(1순위 확정).** 글 단위(후보 아님)로 다음을 고른다.
- `_backlog.md`는 **신규 후보 발굴 시에만** 본다. "다음 글" 출처가 아니다.
- **드리프트 점검(필수):** §5 표의 ☐/☑가 실제 파일과 맞는지 `content/projects/`를 직접 본다. 초안 `.mdx`가 이미 있는데 표가 작성 ☐일 수 있다 — 그러면 처음부터 쓰지 말고 **그 초안의 진척부터 확인**한다.

## 파이프라인 순서 (지시받으면 이대로)

```
0. 다음 글 확정   — §5 진행표 + §5.1 읽고 다음 글 1편 선택. content/projects/ 드리프트 점검.
1. 단계 위치 파악 — 그 글의 원자료/인터뷰 ☑ 여부로 어느 단계부터 진입할지 결정.
2. 코드·git 파악  — (원자료 ☐일 때만) 소스 repo 분석 → raw-material/<slug>.md 코드칸. ★마스킹.
3. 심층 인터뷰    — (인터뷰 ☐일 때만) → 스킬 `portfolio-deep-interview`로 위임.
4. 골격대로 작성  — case-study-structure.md 5층 골격으로 content/projects/<slug>.mdx 작성. 지배 메커니즘이 그림감이면 그 자리에 자리표시.
4.5 다이어그램     — §4.6대로 그림 필요/불필요 **최종 판단**(불필요도 1급 출력, §9.1에 근거). 필요하면 diagram-style.md 하우스 스타일 SVG 제작(public/projects/<slug>-<개념>.svg) → 산문 옆 삽입. **매 글이 판단을 거친다.**
5. 자가검증       — §5 체크리스트 + §9.2 루브릭(평균 4↑, 2점 이하 0, 그림 항목 포함) + content:check(R3 그림 자산) + /codex 교차검증. 미달이면 4로.
6. jio.dev 커밋   — 마스킹/일반화 확인 후 정상 커밋.
7. 발행·반영 확인 — frontmatter·라우팅·목업 교체(→ content-handoff.md) → 사이트 확인.
```

- **건너뛰기 규칙:** 원자료·인터뷰가 이미 ☑면 2·3을 스킵하고 **4단계(작성)부터** 진입한다(§5.1이 1순위로 그렇게 지정).
- **게이트 3개:** ① 인터뷰 없이 4로 가지 않는다. ② 4.5의 그림 판정(필요/불필요)을 건너뛰지 않는다. ③ 5의 루브릭 미통과면 발행하지 않는다.

## 위임 포인터 (각 단계의 정본)

| 단계 | 정본 / 위임 |
|---|---|
| 0·1 다음 글·위치 | [`content-migration.md`](../../../docs/specs/portfolio/content-migration.md) §5·§5.1 |
| 2 코드 정찰·마스킹 | content-migration.md §3·§4.1 |
| 3 인터뷰 | 스킬 **`portfolio-deep-interview`** |
| 4 작성(5층 골격) | [`case-study-structure.md`](../../../docs/specs/portfolio/case-study-structure.md) |
| 4.5 다이어그램 | case-study-structure.md §4.6 + [`diagram-style.md`](../../../docs/specs/portfolio/diagram-style.md) |
| 5 검증 루브릭 | case-study-structure.md §9.2 + content:check(R3) + `/codex` |
| 7 발행·목업 교체 | [`content-handoff.md`](../../../docs/specs/portfolio/content-handoff.md) |

## 쓰지 않을 때

- **인터뷰만** 콕 집은 지시 → `portfolio-deep-interview` 직행.
- **글 구조/루브릭만** 물음 → `case-study-structure.md` 레퍼런스(파이프라인 실행 아님).
- 단순 카피 수정·스타일 조정·1파일 픽스 → 파이프라인 대상 아님.
