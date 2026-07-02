# brain garden를 jio.dev에 올리기 — 설계

> 상태: **설계 승인, 구현 전** · 날짜 2026-07-02
> 상위 정본: second-brain repo `docs/superpowers/specs/2026-07-02-phase-e-public-surface-design.md` §1–2(전달·서빙 아키텍처), §126–131(배포/타-repo 영역). 이 문서는 그 스펙의 **jio.dev 쪽 슬라이스**를 구체화한다.
> 뷰어: `@secondbrain-jio/graph-viewer@0.1.0` (npm, public) — 이미 배포됨.

## 목적 & 범위

이미 npm에 배포된 그래프 뷰어를 실제 포트폴리오 사이트 jio.dev의 `/brain` 페이지에 띄운다.
**뷰어(코드)와 데이터(graph.json)를 분리**해, personal brain에서 발행할 때 jio.dev **재빌드 0**으로 갱신되게 한다.

**이번 세션 범위 = 인프라 + 샘플 데이터.**
- 빌드: `/api/graph` 프록시 라우트 · `/brain` 페이지 · Vercel Blob bucket 배선 · 발행 절차 문서.
- 검증: **검열된 샘플 graph.json**을 blob에 올려 `/brain`이 실제로 뜨는지 배포·확인.
- **게이트:** 진짜 public graph.json 업로드는 second-brain repo의 §4 콘텐츠 검토(회사 내부 제품명 노출 점검) 완료 후. 이번 세션에선 실제 노출 0.

**범위 밖(연기):** ask(`/api/ask`) · auth 신원 티어 · CI 자동 발행 승격 · 홈 진입점 네비 링크.

## 아키텍처 — 뷰어 + 데이터 분리, 재빌드 0

```
  [second-brain repo]                        [jio.dev repo — 이 문서]
  packages/graph-viewer ──npm publish──►  npm i @secondbrain-jio/graph-viewer  ✅ 완료
                                                 │
                                          /brain: <BrainGraph graphUrl="/api/graph" />
                                                 ▲
  personal brain ──sb export-graph──► graph.json ─┘  (public-only, Vercel Blob에)
```

**"재빌드 0"의 원리:** graph.json을 jio.dev 빌드에 굽지 않고, 외부 mutable 저장소(Vercel Blob)에 두고 런타임에 읽는다. 발행 = blob의 파일 하나 덮어쓰기 → 다음 방문자 로드에 반영.

**정직한 경계:** "재빌드 0"은 *콘텐츠* 변경 한정. **스키마 version 증가**(`GRAPH_SCHEMA_VERSION`, 현재 4)는 npm-pinned 뷰어 업데이트 + jio.dev 재빌드가 필요한 조율 릴리스다.

## 파일 구조 (FSD — 최소 추가)

```
src/app/brain/page.tsx            # "use client", <BrainGraph graphUrl="/api/graph" /> + styles.css import
src/app/api/graph/route.ts        # 프록시: blob 읽기 → 검증 → 통제 헤더로 재서빙 (Node runtime, GET)
src/app/api/graph/route.test.ts   # RED-first: 버전 거부 · 에러≠빈그래프
docs/how-to/publish-brain-graph.md # 수동 발행 절차 (sb export → blob 업로드)
```

`/brain`은 얇은 client 래퍼. 별도 widget 슬라이스를 만들지 않는다(YAGNI) — npm 뷰어를 직접 렌더한다.

## `/api/graph` 라우트 계약 (핵심)

서버가 요청마다 public blob URL을 `no-store`로 fetch → 검증 → 통제된 헤더로 재서빙:

| 상황 | 응답 | 의도 |
|---|---|---|
| 정상 + 지원 스키마(`version === 4`) | `200` + graph JSON, `Cache-Control: s-maxage=60, stale-while-revalidate=300` | CDN edge 캐시를 **서버가** 통제 |
| 스키마 version 미지원 | `409` + `{ error: "unsupported schema version" }` | 뷰어가 건드리기 전 하드 거부 (뷰어 loader는 warn-and-continue라 서버가 유일한 하드 게이트) |
| bucket 실패/404/malformed JSON | `502` + `{ error: ... }` | 로드 실패를 **빈 그래프로 오인시키지 않음** (뷰어가 load-error UI로 구분) |

- **버전 상수:** 라우트에 `SUPPORTED_GRAPH_SCHEMA = 4` 하나(뷰어 `GRAPH_SCHEMA_VERSION` 미러). graph.json 최상위 `version` 필드와 비교.
- **읽기엔 토큰 불필요** — blob이 `access:'public'`이라 라우트는 `GRAPH_BLOB_URL`(env)을 그냥 fetch. 쓰기(발행)만 `BLOB_READ_WRITE_TOKEN` 필요.
- **runtime:** `export const runtime = "nodejs"` (edge 아님 — 단순·명확).

## 데이터 흐름

1. 브라우저가 `/brain` 방문 → `<BrainGraph>` 마운트(client) → `useEffect`에서 `/api/graph` fetch.
2. `/api/graph`(서버) → `GRAPH_BLOB_URL` fetch(`no-store`) → `version` 검증 → 200/409/502로 재서빙.
3. 뷰어 loader가 `{doc, status}`로 결과 해석 → 그래프 렌더 or 에러/빈 상태 구분.

graph.json wire 형태: `{ version, generated_at, meta:{title,pillar_colors,pillar_names}, nodes[], edges[] }`. 뷰어는 도메인-무지 — `meta`의 색·제목을 굽힌 값으로 그린다.

## 정직한 경계 — public blob URL 노출

Vercel Blob은 `access:'public'`이라 **raw blob URL을 아는 사람은 `/api/graph`를 우회해 직접 읽을 수 있다.** 그러나 담기는 건 애초에 **public-only export**라 무해하다. `/api/graph`의 값은 "비밀 유지"가 아니라 *뷰어 소비 경로*의 CORS 제거·캐시·버전·에러 통제 — 그 값은 그대로 유효하다. (승인됨.)

## 환경변수 (Vercel 대시보드)

- `GRAPH_BLOB_URL` — 고정 blob 공개 URL(라우트가 읽음). `addRandomSuffix:false`라 URL 안정적.
- `BLOB_READ_WRITE_TOKEN` — 발행 시 업로드용. Vercel Blob 스토어 연결 시 프로젝트에 자동 주입.

## 발행 흐름 (수동, 문서화 — CI 승격은 YAGNI로 연기)

```bash
# 1) personal brain에서 public-only graph.json 뽑기
uv run sb --brain ~/Desktop/private/second-brain-personal export-graph --out graph.json
# 2) 원자적 덮어쓰기 업로드
npx vercel blob put graph.json --force     # 또는 @vercel/blob put(pathname:"graph.json", allowOverwrite:true)
```
→ jio.dev 재빌드 0. 다음 방문자 로드에 최신본 반영.

## 샘플 데이터 (이번 세션 검증용)

진짜 public graph.json은 §4 콘텐츠 검토 후. 그 전까진 **export 스키마와 동일 shape의 작은 검열 샘플**을 blob에 올려 `/brain` 렌더를 검증한다. 노드는 19-key라 손으로 짜면 fragile 하니, second-brain repo의 test fixture brain에 `sb export-graph`를 돌려 실제 shape의 소형 그래프를 얻고, 내부 제품명이 없는지 확인 후 사용한다.

## 테스트 (RED-first, vitest)

`/api/graph`의 순수 로직을 fetch mock으로 먼저 실패 테스트 → 구현:
- `version === 4` → 200 + body 통과.
- `version !== 4` → 409, 빈 그래프 아님.
- bucket fetch 실패 / 비-JSON → 502, 빈 그래프 아님.

`pnpm test && pnpm typecheck`로 게이트.

## 성공 기준

- `/brain`이 jio.dev에 뜨고 검열 샘플 그래프를 렌더한다.
- `/api/graph`가 버전 미지원·bucket 실패를 각각 409·502로 하드 거부하고, 빈 그래프로 오인시키지 않는다(테스트 green).
- blob의 graph.json을 덮어쓰면 jio.dev 재빌드 없이 다음 로드에 반영된다.
- 진짜 public graph.json 업로드는 §4 콘텐츠 검토 완료까지 게이트 — 이번 세션 내부 제품명 노출 0.

## 결정 로그 / 연기

- **[결정]** bucket = Vercel Blob(같은 플랫폼·새 벤더 0·원자적 덮어쓰기). R2/S3는 이 규모엔 설정 과다.
- **[결정]** public blob URL 노출 감수 — 담기는 게 public-only라 무해, `/api/graph`는 소비경로 통제층.
- **[결정]** 이번 세션 = 인프라 + 검열 샘플. 실제 public 발행은 §4 콘텐츠 검토 후 게이트.
- **[연기]** ask · auth 티어 · CI 자동 발행 승격 · 홈 진입점 네비 링크.
