# personal brain → jio.dev 그래프 발행

personal brain의 public 지식을 jio.dev `/brain`에 반영하는 수동 절차. **재빌드 0** — blob 덮어쓰기만.

> ⚠️ 최초 실제 발행 전: second-brain repo의 공개 전 콘텐츠 검토(회사 내부 제품명 노출 점검, phase-e 스펙 §4)를 완료할 것. 그 전까진 synthetic 샘플만 서빙한다.

## 사전 준비 (1회)

1. Vercel 대시보드 → jio.dev 프로젝트 → **Storage → Create Database → Blob** → 생성 후 연결.
   연결 시 `BLOB_READ_WRITE_TOKEN`이 프로젝트 env에 주입된다.
2. 로컬 업로드용 토큰 확보: `vercel env pull .env.local` (또는 대시보드에서 복사). `.env.local`은 gitignore됨.
3. 최초 업로드로 나온 공개 URL을 프로젝트 env `GRAPH_BLOB_URL`(production)에 등록.

## 발행 절차 (매번)

1. personal brain에서 public-only graph.json 뽑기:
   ```bash
   cd ~/Desktop/private/second-brain
   uv run sb --brain ~/Desktop/private/second-brain-personal export-graph --out /tmp/graph.json
   ```
   (`--include-private`는 절대 쓰지 말 것 — 기본이 public-only fail-closed.)

2. jio.dev에서 덮어쓰기 업로드:
   ```bash
   cd ~/Desktop/private/jio.dev
   node scripts/upload-graph.mjs /tmp/graph.json   # BLOB_READ_WRITE_TOKEN이 .env.local에 있어야 함
   ```
   스크립트는 `cacheControlMaxAge:60`을 박아 blob CDN TTL을 60s로 낮춘다. 이게 없으면 blob 기본 캐시가 1개월이라 덮어써도 갱신되지 않는다.

3. 확인: `/brain` 새로고침(최대 ~60s CDN 지연). jio.dev 재배포 불필요.

## 스키마 version이 오르면 (조율 릴리스)

`GRAPH_SCHEMA_VERSION`이 4→5로 오르면 `/api/graph`가 409로 거부한다. 순서:

1. 뷰어(`@secondbrain-jio/graph-viewer`) 새 스키마 지원 버전 npm 배포.
2. jio.dev `pnpm add @secondbrain-jio/graph-viewer@latest` + `src/app/api/graph/resolve.ts`의 `SUPPORTED_GRAPH_SCHEMA` 갱신 + 재배포.
3. 새 graph.json 업로드.

## 관련

- 설계: [docs/superpowers/specs/2026-07-02-brain-garden-on-jiodev-design.md](../superpowers/specs/2026-07-02-brain-garden-on-jiodev-design.md)
- 플랜: [docs/superpowers/plans/2026-07-02-brain-garden-on-jiodev.md](../superpowers/plans/2026-07-02-brain-garden-on-jiodev.md)
