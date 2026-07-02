# brain garden on jio.dev — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** npm 배포된 `@secondbrain-jio/graph-viewer`를 jio.dev `/brain`에 띄우고, `/api/graph` 프록시가 외부 Vercel Blob의 graph.json을 검증·서빙해 personal 발행 시 재빌드 0으로 갱신되게 한다.

**Architecture:** `/brain`(server page) → `<BrainGraph graphUrl="/api/graph">`(client, npm). `/api/graph`(Node route)가 요청마다 `GRAPH_BLOB_URL`(public Vercel Blob)을 `no-store`로 fetch → 스키마 `version` 검증 → 200/409/502로 통제 서빙. 데이터는 빌드에 굽지 않고 blob 덮어쓰기로 갱신.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, vitest, pnpm, Vercel Blob (`@vercel/blob`, 업로드용 devDep), `@secondbrain-jio/graph-viewer@0.1.0`.

## Global Constraints

- Next.js **16.2.9** / React **19.2.4** — 뷰어 peerDeps는 `next ^15 / react ^18`이라 install 시 **peer 경고**가 뜨지만 무해(뷰어는 client 컴포넌트, 런타임 정상). 경고 이유로 install을 막지 말 것.
- **FSD 아키텍처** — 라우트는 `src/app/`. `/brain`엔 별도 widget 슬라이스를 만들지 않는다(YAGNI). steiger(`pnpm lint:fsd`) 통과 유지.
- 그래프 스키마 지원 버전 = **4** (`GRAPH_SCHEMA_VERSION`, 뷰어 `graph-loader.ts` 미러). graph.json 최상위 `version` 필드로 검증.
- 새 주석·문서 산문은 **한국어**, 기술 용어(fetch·route·blob·schema 등)는 영어 원어 유지.
- graph.json은 **public-only** — 진짜 데이터 업로드는 second-brain repo §4 콘텐츠 검토 후 게이트. 이 플랜은 **검열 샘플**(`graph.fixture.json`)까지만 실제 노출.
- 게이트: 각 코드 태스크 종료 시 `pnpm test && pnpm typecheck` 통과.

---

## File Structure

```
src/app/api/graph/route.ts        # 프록시: resolveGraph(url, fetchFn) 순수 로직 + GET 얇은 래퍼
src/app/api/graph/route.test.ts   # resolveGraph 단위 테스트 (fetch 주입)
src/app/brain/page.tsx            # server page: metadata + <BrainGraph graphUrl="/api/graph" locale="ko"> + styles.css
scripts/upload-graph.mjs          # @vercel/blob put(addRandomSuffix:false, allowOverwrite) 업로드 (발행/샘플 공용)
docs/how-to/publish-brain-graph.md # personal brain → blob 발행 절차
```

---

## Task 1: `/api/graph` 프록시 라우트 (TDD)

**Files:**
- Create: `src/app/api/graph/route.ts`
- Test: `src/app/api/graph/route.test.ts`

**Interfaces:**
- Produces: `resolveGraph(url: string | undefined, fetchFn?: typeof fetch): Promise<GraphResult>` — 순수·주입가능 코어. `SUPPORTED_GRAPH_SCHEMA: number` 상수. `GET(): Promise<Response>` — Next route handler.
- `GraphResult = { status: 200; body: unknown; cache: string } | { status: 409 | 502; body: { error: string } & Record<string, unknown> }`

- [ ] **Step 1: 실패 테스트 작성**

`src/app/api/graph/route.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveGraph, SUPPORTED_GRAPH_SCHEMA } from "./route";

// 최소 Response 더블 — resolveGraph는 ok/status/json()만 본다.
const fakeResponse = (body: unknown, ok = true, status = 200): Response =>
  ({ ok, status, json: async () => body }) as unknown as Response;

describe("resolveGraph", () => {
  it("지원 버전 그래프를 200으로 통과시킨다", async () => {
    const doc = { version: SUPPORTED_GRAPH_SCHEMA, nodes: [], edges: [] };
    const r = await resolveGraph("https://x/graph.json", async () => fakeResponse(doc));
    expect(r.status).toBe(200);
    expect(r.body).toEqual(doc);
  });

  it("미지원 스키마 버전을 409로 하드 거부한다 (빈 그래프 아님)", async () => {
    const doc = { version: 999, nodes: [], edges: [] };
    const r = await resolveGraph("https://x/graph.json", async () => fakeResponse(doc));
    expect(r.status).toBe(409);
    expect(r.body).not.toHaveProperty("nodes");
  });

  it("bucket fetch 실패를 502로 매핑한다 (빈 그래프 아님)", async () => {
    const r = await resolveGraph("https://x/graph.json", async () => {
      throw new Error("network");
    });
    expect(r.status).toBe(502);
    expect((r.body as { error: string }).error).toBeTruthy();
  });

  it("bucket 비-200 응답을 502로 매핑한다", async () => {
    const r = await resolveGraph("https://x/graph.json", async () => fakeResponse({}, false, 404));
    expect(r.status).toBe(502);
  });

  it("malformed JSON을 502로 매핑한다", async () => {
    const bad = {
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("bad json");
      },
    } as unknown as Response;
    const r = await resolveGraph("https://x/graph.json", async () => bad);
    expect(r.status).toBe(502);
  });

  it("GRAPH_BLOB_URL 미설정을 502로 매핑한다", async () => {
    const r = await resolveGraph(undefined, async () => fakeResponse({}));
    expect(r.status).toBe(502);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd ~/Desktop/private/jio.dev && pnpm vitest run src/app/api/graph/route.test.ts`
Expected: FAIL — `route.ts`가 없어 import 에러 / `resolveGraph is not defined`.

- [ ] **Step 3: 최소 구현**

`src/app/api/graph/route.ts`:

```ts
import { NextResponse } from "next/server";

// Vercel serverless(Node) — edge 아님. blob을 서버에서 읽어 재서빙한다.
export const runtime = "nodejs";

// 뷰어 graph-loader.ts의 GRAPH_SCHEMA_VERSION 미러. 이 값과 다른 version은 하드 거부.
export const SUPPORTED_GRAPH_SCHEMA = 4;

type GraphResult =
  | { status: 200; body: unknown; cache: string }
  | { status: 409 | 502; body: { error: string } & Record<string, unknown> };

// 순수·주입가능 코어 — IO(fetch)를 인자로 받아 테스트 가능하게 한다.
export async function resolveGraph(
  url: string | undefined,
  fetchFn: typeof fetch = fetch,
): Promise<GraphResult> {
  if (!url) return { status: 502, body: { error: "GRAPH_BLOB_URL not configured" } };

  let res: Response;
  try {
    // no-store: 프록시가 항상 최신 blob을 읽고, 캐시는 응답 헤더로 통제한다.
    res = await fetchFn(url, { cache: "no-store" });
  } catch {
    return { status: 502, body: { error: "failed to reach graph store" } };
  }
  if (!res.ok) {
    return { status: 502, body: { error: `graph store returned ${res.status}` } };
  }

  let doc: unknown;
  try {
    doc = await res.json();
  } catch {
    return { status: 502, body: { error: "graph store returned malformed JSON" } };
  }

  const version = (doc as { version?: unknown } | null)?.version;
  if (version !== SUPPORTED_GRAPH_SCHEMA) {
    // 뷰어 loader는 warn-and-continue라 서버가 유일한 하드 게이트.
    return {
      status: 409,
      body: { error: "unsupported schema version", expected: SUPPORTED_GRAPH_SCHEMA, got: version ?? null },
    };
  }

  return { status: 200, body: doc, cache: "s-maxage=60, stale-while-revalidate=300" };
}

export async function GET(): Promise<Response> {
  const result = await resolveGraph(process.env.GRAPH_BLOB_URL);
  if (result.status === 200) {
    return NextResponse.json(result.body, {
      status: 200,
      headers: { "Cache-Control": result.cache },
    });
  }
  return NextResponse.json(result.body, { status: result.status });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/app/api/graph/route.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: 게이트 + 커밋**

```bash
pnpm test && pnpm typecheck && pnpm lint:fsd
git add src/app/api/graph/route.ts src/app/api/graph/route.test.ts
git commit -m "✨ feat(brain): /api/graph 프록시 — blob 검증·버전 하드거부·에러≠빈그래프"
```

---

## Task 2: 뷰어 install + `/brain` 페이지

**Files:**
- Modify: `package.json` (deps: `@secondbrain-jio/graph-viewer`)
- Create: `src/app/brain/page.tsx`

**Interfaces:**
- Consumes: `/api/graph` (Task 1). npm `BrainGraph` 컴포넌트 — props `graphUrl: string`, `locale?: "ko" | ...`.

- [ ] **Step 1: 뷰어 install**

```bash
cd ~/Desktop/private/jio.dev && pnpm add @secondbrain-jio/graph-viewer
```
Expected: 설치 성공. `next ^15 / react ^18` peer 경고가 출력됨 — **무시(정상)**. `package.json` dependencies에 `@secondbrain-jio/graph-viewer` 추가 확인.

- [ ] **Step 2: `/brain` 페이지 작성**

`src/app/brain/page.tsx` (server component — BrainGraph가 내부적으로 "use client"라 자식으로 렌더 가능. host `apps/host/app/memory/page.tsx`와 동일 패턴 + npm 소비라 styles.css 명시 import):

```tsx
import type { Metadata } from "next";
import { BrainGraph } from "@secondbrain-jio/graph-viewer";
// npm 소비 시 CSS 토큰 필수 — 안 넣으면 스타일 깨짐(host는 workspace라 불필요).
import "@secondbrain-jio/graph-viewer/styles.css";

export const metadata: Metadata = {
  title: "Brain",
  description: "지식 그래프 — Second Brain 공개 표면",
};

export default function BrainPage() {
  // graphUrl = same-origin 프록시. fixtureUrl은 쓰지 않는다 — blob 실패 시 에러 UI가 의도된 상태.
  return <BrainGraph graphUrl="/api/graph" locale="ko" />;
}
```

- [ ] **Step 3: 로컬 렌더 확인 (에러 상태 = 정상)**

Run: `pnpm dev` → 브라우저 `http://localhost:3000/brain`
Expected: 페이지가 뜨고, `GRAPH_BLOB_URL` 미설정이라 `/api/graph`가 502 → 뷰어가 **load-error UI**를 보인다(빈 그래프 아님). 이게 Task 3 전 정상 상태. 그래프 컨테이너가 전체 화면을 채우는지 확인.
- **컨테이너가 0-height로 붕괴하면(폴백):** `src/app/brain/page.tsx`의 반환을 `<div style={{ height: "100dvh" }}><BrainGraph graphUrl="/api/graph" locale="ko" /></div>`로 감싼다.
- **portfolio 텍스처/CursorGlow가 그래프와 시각 충돌하면(폴백, 선택):** `src/app/brain/layout.tsx`를 만들어 `<div className="fixed inset-0 z-10">{children}</div>`로 chrome 위에 올린다. 충돌 없으면 만들지 말 것(YAGNI).

- [ ] **Step 4: 게이트 + 커밋**

```bash
pnpm typecheck && pnpm lint:fsd && pnpm build
git add package.json pnpm-lock.yaml src/app/brain/page.tsx
git commit -m "✨ feat(brain): /brain 페이지 — npm 뷰어 embed + styles.css"
```

---

## Task 3: Vercel Blob 프로비저닝 + 샘플 업로드 + env + 배포 검증

**Files:**
- Modify: `package.json` (devDep: `@vercel/blob`)
- Create: `scripts/upload-graph.mjs`

**Interfaces:**
- Consumes: Task 1 라우트(`GRAPH_BLOB_URL` 필요), Task 2 페이지.
- Produces: 안정적 public blob URL `https://<storeid>.public.blob.vercel-storage.com/graph.json`.

- [ ] **Step 1: 업로드 스크립트 작성 + @vercel/blob install**

```bash
pnpm add -D @vercel/blob
```

`scripts/upload-graph.mjs` (샘플·실발행 공용 — 원자적 덮어쓰기):

```js
// 사용: BLOB_READ_WRITE_TOKEN=... node scripts/upload-graph.mjs <graph.json 경로>
// addRandomSuffix:false → URL 안정, allowOverwrite:true → 원자적 덮어쓰기.
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";

const path = process.argv[2] ?? "graph.json";
const data = await readFile(path);
const { url } = await put("graph.json", data, {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
});
console.log("uploaded →", url);
```

- [ ] **Step 2: Vercel Blob 스토어 생성 (수동, 대시보드)**

Vercel 대시보드 → jio.dev 프로젝트 → **Storage → Create Database → Blob** → 생성 후 프로젝트에 연결.
→ 연결 시 `BLOB_READ_WRITE_TOKEN`이 프로젝트 env에 **자동 주입**된다.
로컬 업로드용으로 토큰을 가져온다: `vercel env pull .env.local` (또는 대시보드에서 복사). `.env.local`은 이미 gitignore됨.

- [ ] **Step 3: 검열 샘플 그래프 업로드**

second-brain repo의 dev fixture(v4 스키마, synthetic 데이터, 회사명 없음)를 샘플로 쓴다. 업로드 전 회사 제품명 부재 확인:

```bash
cd ~/Desktop/private/jio.dev
cp ~/Desktop/private/second-brain/apps/host/public/graph.fixture.json ./graph.sample.json
# 안전 확인 — 아무것도 안 나와야 함:
grep -iE "settlement-admin|ally-admin|vdoc-b2c|swing-taxi" graph.sample.json || echo "clean"
node scripts/upload-graph.mjs graph.sample.json
```
Expected: `uploaded → https://<storeid>.public.blob.vercel-storage.com/graph.json` 출력. 이 URL을 복사.

- [ ] **Step 4: GRAPH_BLOB_URL env 설정 (로컬 + Vercel)**

```bash
# 로컬:
echo "GRAPH_BLOB_URL=https://<storeid>.public.blob.vercel-storage.com/graph.json" >> .env.local
# Vercel(프로덕션):
vercel env add GRAPH_BLOB_URL production   # 프롬프트에 같은 URL 붙여넣기
```

- [ ] **Step 5: 로컬 검증 — 실제 그래프 렌더**

Run: `pnpm dev` → `http://localhost:3000/brain` (env 반영 위해 dev 재시작)
Expected: `/api/graph`가 **200** + 샘플 그래프 반환, 뷰어가 노드/엣지를 **렌더**. `/api/graph` 직접 열어 200 + JSON 확인. malformed 시나리오 확인용으로 잘못된 URL을 잠깐 넣어 502→에러 UI도 확인(원복).

- [ ] **Step 6: 배포 + 프로덕션 검증**

```bash
git add package.json pnpm-lock.yaml scripts/upload-graph.mjs
git commit -m "🔧 chore(brain): Vercel Blob 업로드 스크립트 + 검열 샘플 서빙"
# PR 머지 후(또는 미리보기 배포) 프로덕션 /brain 확인:
```
Expected: 프로덕션 `https://<jio.dev>/brain`이 샘플 그래프를 렌더. `graph.sample.json`은 커밋하지 않는다(derived; gitignore 확인 — `.env*`는 이미 무시되나 `graph.sample.json`은 아니므로 `rm graph.sample.json` 또는 `.gitignore`에 추가).

- [ ] **Step 7: 재빌드 0 검증 (핵심 성공 기준)**

```bash
# graph.sample.json을 살짝 바꿔(예: meta.title) 재업로드:
node scripts/upload-graph.mjs graph.sample.json
```
Expected: **jio.dev 재배포 없이** 프로덕션 `/brain` 새로고침에 변경 반영(s-maxage=60이라 최대 ~60s CDN 지연). 이게 "재빌드 0"의 실증.

---

## Task 4: 발행 how-to 문서

**Files:**
- Create: `docs/how-to/publish-brain-graph.md`

- [ ] **Step 1: 문서 작성**

`docs/how-to/publish-brain-graph.md`:

```markdown
# personal brain → jio.dev 그래프 발행

personal brain의 public 지식을 jio.dev `/brain`에 반영하는 수동 절차. **재빌드 0** — blob 덮어쓰기만.

> ⚠️ 최초 실제 발행 전: second-brain repo의 공개 전 콘텐츠 검토(회사 내부 제품명 노출 점검, phase-e 스펙 §4)를 완료할 것. 그 전까진 샘플만 서빙.

## 절차

1. personal brain에서 public-only graph.json 뽑기:
   \`\`\`bash
   cd ~/Desktop/private/second-brain
   uv run sb --brain ~/Desktop/private/second-brain-personal export-graph --out /tmp/graph.json
   \`\`\`
   (`--include-private` 절대 쓰지 말 것 — 기본이 public-only fail-closed.)

2. jio.dev에서 원자적 덮어쓰기 업로드:
   \`\`\`bash
   cd ~/Desktop/private/jio.dev
   node scripts/upload-graph.mjs /tmp/graph.json   # BLOB_READ_WRITE_TOKEN이 .env.local에 있어야 함
   \`\`\`

3. 확인: `/brain` 새로고침(최대 ~60s CDN 지연). jio.dev 재배포 불필요.

## 스키마 version이 오르면 (조율 릴리스)

`GRAPH_SCHEMA_VERSION`이 4→5로 오르면 `/api/graph`가 409로 거부한다. 순서:
1. 뷰어(`@secondbrain-jio/graph-viewer`) 새 스키마 지원 버전 npm 배포.
2. jio.dev `pnpm add @secondbrain-jio/graph-viewer@latest` + `route.ts`의 `SUPPORTED_GRAPH_SCHEMA` 갱신 + 재배포.
3. 새 graph.json 업로드.
```

- [ ] **Step 2: how-to 인덱스에 등록 + 커밋**

`docs/` 인덱스(있으면 `docs/how-to/_README.md` 또는 상위 라우터)에 한 줄 추가해 도달 가능하게 한다. 없으면 생략.

```bash
git add docs/how-to/publish-brain-graph.md
git commit -m "📝 docs(brain): personal→jio.dev 그래프 발행 how-to"
```

---

## 성공 기준 (스펙 대조)

- [x] `/brain`이 jio.dev에 뜨고 검열 샘플을 렌더 (Task 2·3).
- [x] `/api/graph`가 미지원 version=409·bucket실패=502로 하드 거부, 빈 그래프 오인 없음 (Task 1 테스트 green).
- [x] blob 덮어쓰기 → 재빌드 0으로 반영 (Task 3 Step 7).
- [x] 진짜 public 발행은 §4 검토까지 게이트 — 이번 노출은 synthetic 샘플뿐 (Global Constraints, Task 4 경고).
- [x] 로드 실패가 에러로 구분 (Task 1 502 + 뷰어 load-error UI, Task 2 Step 3).
