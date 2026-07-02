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

⚠️ **캐시 함정(codex #1, 반드시 지킬 것):** Vercel Blob 객체는 **기본 cache-control 1개월**이다. `fetch(url,{cache:"no-store"})`는 *Next의* fetch 캐시만 우회하지 blob **CDN edge 캐시는 못 건드린다** — 덮어써도 최대 한 달간 옛본이 서빙된다. 따라서 업로드 시 **`cacheControlMaxAge: 60`을 반드시 지정**해 blob TTL 자체를 60s로 낮춘다. 이게 "재빌드 0"이 실제로 성립하는 조건.

**정직한 경계:**
- "재빌드 0"은 *콘텐츠* 변경 한정. **스키마 version 증가**(`GRAPH_SCHEMA_VERSION`, 현재 4)는 npm-pinned 뷰어 업데이트 + jio.dev 재빌드가 필요한 조율 릴리스다.
- 덮어쓰기는 단일 수동 발행자 기준 **last-write-wins**다("원자적"이 아님 — codex #2). 동시 발행자가 없어 `ifMatch` 동시성 가드는 불필요(YAGNI).

## 파일 구조 (FSD — 최소 추가)

```
src/app/api/graph/resolve.ts      # 순수 로직: resolveGraph(url, fetchFn, timeoutMs) — next/server 미import (테스트용)
src/app/api/graph/route.ts        # 얇은 GET 래퍼: resolveGraph → NextResponse (Node runtime)
src/app/api/graph/resolve.test.ts # RED-first: 버전 거부 · shape 거부 · 에러≠빈그래프 · 타임아웃
src/app/brain/page.tsx            # server page: metadata + <BrainGraphClient/>
src/app/brain/BrainGraphClient.tsx # "use client" 경계: <BrainGraph graphUrl="/api/graph"/> + styles.css
docs/how-to/publish-brain-graph.md # 수동 발행 절차 (sb export → blob 업로드)
```

- **client 경계 분리(codex #6/#8):** page는 server 컴포넌트(metadata 가능), `"use client"`는 별도 `BrainGraphClient`에 둔다. npm 뷰어가 top-level `"use client"`를 갖든 안 갖든 안전 — 패키지 내부 계약에 의존하지 않는다.
- **테스트/로직 분리(codex #10):** 순수 `resolveGraph`는 `resolve.ts`(next 미import)에, route handler는 `route.ts`에. 테스트는 `resolve.ts`만 로드해 `next/server` 모듈 로드 리스크를 없앤다.
- `/brain`은 얇은 래퍼. 별도 widget 슬라이스를 만들지 않는다(YAGNI).

## `/api/graph` 라우트 계약 (핵심)

서버가 요청마다 public blob URL을 `no-store`로 fetch → 검증 → 통제된 헤더로 재서빙:

| 상황 | 응답 | 의도 |
|---|---|---|
| 정상 + 지원 스키마(`version === 4`) + `nodes`/`edges` 배열 | `200` + graph JSON, `Cache-Control: s-maxage=60, stale-while-revalidate=300` | CDN edge 캐시를 **서버가** 통제 |
| 스키마 version 미지원 | `409` + `{ error: "unsupported schema version" }` | 뷰어가 건드리기 전 하드 거부 (뷰어 loader는 warn-and-continue라 서버가 유일한 하드 게이트) |
| version은 맞지만 `nodes`/`edges` 배열 아님 | `409` + `{ error: "graph missing nodes/edges arrays" }` | 얕은 shape 검증(codex #3) — malformed를 뷰어로 넘기지 않음 |
| bucket 실패/404/malformed JSON/타임아웃 | `502` + `{ error: ... }` | 로드 실패를 **빈 그래프로 오인시키지 않음** (뷰어가 load-error UI로 구분) |

- **버전 상수:** `SUPPORTED_GRAPH_SCHEMA = 4`(뷰어 `GRAPH_SCHEMA_VERSION` 미러). graph.json 최상위 `version` 필드와 비교.
- **얕은 shape 검증(codex #3):** version 통과 후 `nodes`/`edges`가 배열인지 확인. 아니면 409. (깊은 노드 검증은 뷰어 몫 — 여기선 malformed 차단만.)
- **fetch 타임아웃(codex #4):** `AbortSignal.timeout(5000)` — 행 걸린 blob/CDN 연결이 라우트를 platform timeout까지 붙잡지 않게.
- **URL 가드(codex #5):** `GRAPH_BLOB_URL`은 env-only(사용자 SSRF 아님)지만, `https:` 프로토콜만 허용해 오설정 footgun 차단.
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
- `BLOB_READ_WRITE_TOKEN` — 발행 시 업로드용. Blob 스토어 연결 시 프로젝트에 주입된다(요즘 Vercel은 `BLOB_STORE_ID`·`VERCEL_OIDC_TOKEN` 등도 함께 붙지만, 이 스크립트는 `BLOB_READ_WRITE_TOKEN`만 쓰면 로컬 동작 — codex #12).

## 발행 흐름 (수동, 문서화 — CI 승격은 YAGNI로 연기)

```bash
# 1) personal brain에서 public-only graph.json 뽑기
uv run sb --brain ~/Desktop/private/second-brain-personal export-graph --out /tmp/graph.json
# 2) 덮어쓰기 업로드 (cacheControlMaxAge:60 필수 — 스크립트에 내장)
node scripts/upload-graph.mjs /tmp/graph.json
```
→ jio.dev 재빌드 0. 다음 방문자 로드에 최신본 반영(blob TTL 60s + 프록시 s-maxage 60s).

## 샘플 데이터 (이번 세션 검증용)

진짜 public graph.json은 §4 콘텐츠 검토 후. 그 전까진 **synthetic 샘플**로 `/brain` 렌더를 검증한다 — 안전의 본체는 grep이 아니라 **애초에 실데이터를 안 쓰는 것**(codex #14 반박). 소스: second-brain repo의 dev fixture `apps/host/public/graph.fixture.json`(v4 스키마, `thesis-0` 등 synthetic, `confidentiality:"public"`, 회사명 없음). `/tmp`에 복사해 쓰고 repo엔 두지 않는다(codex #13). 업로드 전 회사 제품명 부재를 grep으로 belt-and-suspenders 확인.

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
- **[결정]** 이번 세션 = 인프라 + synthetic 샘플. 실제 public 발행은 §4 콘텐츠 검토 후 게이트.
- **[연기]** ask · auth 티어 · CI 자동 발행 승격 · 홈 진입점 네비 링크.

## codex 교차검증 반영 (2026-07-02)

codex consult 리뷰 15건 중 반영:
- **#1 (critical)** blob CDN 캐시 → 업로드 `cacheControlMaxAge:60`. 안 하면 "재빌드 0"이 거짓(최대 1개월 stale).
- **#6/#8 (high)** client 경계 → server page + `BrainGraphClient`("use client"). 설계/플랜 모순 해소 + 패키지 내부 계약 비의존.
- **#10 (high)** 테스트 커플링 → `resolveGraph`를 `resolve.ts`(next 미import)로 분리.
- **#3/#4/#5** shape 검증 · fetch 타임아웃 · https 가드 추가.
- **#2/#12/#13/#15** 워딩 정정("원자적"→last-write-wins, env 주입, 샘플 `/tmp`, 성공기준 체크박스).
- **반박 #14** 콘텐츠 게이트 — 이번 범위는 synthetic 샘플이라 grep이 아니라 "실데이터 미사용"이 안전 본체.
