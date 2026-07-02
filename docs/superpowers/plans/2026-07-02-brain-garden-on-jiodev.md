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
src/app/api/graph/resolve.ts      # 순수 로직: resolveGraph(url, fetchFn, timeoutMs) — next/server 미import
src/app/api/graph/route.ts        # 얇은 GET 래퍼: resolveGraph → NextResponse (Node runtime)
src/app/api/graph/resolve.test.ts # resolveGraph 단위 테스트 (fetch 주입)
src/app/brain/page.tsx            # server page: metadata + <BrainGraphClient/>
src/app/brain/BrainGraphClient.tsx # "use client" 경계: <BrainGraph graphUrl="/api/graph" locale="ko"> + styles.css
scripts/upload-graph.mjs          # @vercel/blob put(addRandomSuffix:false, allowOverwrite, cacheControlMaxAge:60)
docs/how-to/publish-brain-graph.md # personal brain → blob 발행 절차
```

---

## Task 1: `/api/graph` 프록시 라우트 (TDD)

**Files:**
- Create: `src/app/api/graph/resolve.ts` (순수 로직, next 미import)
- Create: `src/app/api/graph/route.ts` (얇은 GET 래퍼)
- Test: `src/app/api/graph/resolve.test.ts`

**Interfaces:**
- Produces: `resolveGraph(url: string | undefined, fetchFn?: typeof fetch, timeoutMs?: number): Promise<GraphResult>` — 순수·주입가능 코어. `SUPPORTED_GRAPH_SCHEMA: number` 상수. `GET(): Promise<Response>` — Next route handler.
- `GraphResult = { status: 200; body: unknown; cache: string } | { status: 409 | 502; body: { error: string } & Record<string, unknown> }`
- 테스트는 `resolve.ts`만 import한다(next/server 미접촉 — codex #10).

- [ ] **Step 1: 실패 테스트 작성**

`src/app/api/graph/resolve.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveGraph, SUPPORTED_GRAPH_SCHEMA } from "./resolve";

// 최소 Response 더블 — resolveGraph는 ok/status/json()만 본다.
const fakeResponse = (body: unknown, ok = true, status = 200): Response =>
  ({ ok, status, json: async () => body }) as unknown as Response;

const OK_URL = "https://store.public.blob.vercel-storage.com/graph.json";

describe("resolveGraph", () => {
  it("지원 버전 + nodes/edges 배열이면 200으로 통과시킨다", async () => {
    const doc = { version: SUPPORTED_GRAPH_SCHEMA, nodes: [], edges: [] };
    const r = await resolveGraph(OK_URL, async () => fakeResponse(doc));
    expect(r.status).toBe(200);
    expect(r.body).toEqual(doc);
  });

  it("미지원 스키마 버전을 409로 하드 거부한다 (빈 그래프 아님)", async () => {
    const doc = { version: 999, nodes: [], edges: [] };
    const r = await resolveGraph(OK_URL, async () => fakeResponse(doc));
    expect(r.status).toBe(409);
    expect(r.body).not.toHaveProperty("nodes");
  });

  it("version은 맞지만 nodes/edges가 배열이 아니면 409로 거부한다", async () => {
    const doc = { version: SUPPORTED_GRAPH_SCHEMA, nodes: "bad", edges: [] };
    const r = await resolveGraph(OK_URL, async () => fakeResponse(doc));
    expect(r.status).toBe(409);
  });

  it("bucket fetch 실패를 502로 매핑한다 (빈 그래프 아님)", async () => {
    const r = await resolveGraph(OK_URL, async () => {
      throw new Error("network");
    });
    expect(r.status).toBe(502);
    expect((r.body as { error: string }).error).toBeTruthy();
  });

  it("bucket 비-200 응답을 502로 매핑한다", async () => {
    const r = await resolveGraph(OK_URL, async () => fakeResponse({}, false, 404));
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
    const r = await resolveGraph(OK_URL, async () => bad);
    expect(r.status).toBe(502);
  });

  it("타임아웃되면 502로 매핑한다", async () => {
    // signal이 abort되면 reject하는 fetchFn → AbortSignal.timeout이 발동한다.
    const hang: typeof fetch = (_u, init) =>
      new Promise((_, rej) => {
        init?.signal?.addEventListener("abort", () => rej(new Error("aborted")));
      });
    const r = await resolveGraph(OK_URL, hang, 5);
    expect(r.status).toBe(502);
  });

  it("GRAPH_BLOB_URL 미설정을 502로 매핑한다", async () => {
    const r = await resolveGraph(undefined, async () => fakeResponse({}));
    expect(r.status).toBe(502);
  });

  it("https가 아닌 URL을 502로 거부한다", async () => {
    const r = await resolveGraph("http://insecure/graph.json", async () => fakeResponse({}));
    expect(r.status).toBe(502);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd ~/Desktop/private/jio.dev && pnpm vitest run src/app/api/graph/resolve.test.ts`
Expected: FAIL — `resolve.ts`가 없어 import 에러.

- [ ] **Step 3: 최소 구현 — 순수 로직**

`src/app/api/graph/resolve.ts`:

```ts
// 순수 로직 — next/server 미import라 vitest가 그대로 로드한다(codex #10).

// 뷰어 graph-loader.ts의 GRAPH_SCHEMA_VERSION 미러. 이 값과 다른 version은 하드 거부.
export const SUPPORTED_GRAPH_SCHEMA = 4;

export type GraphResult =
  | { status: 200; body: unknown; cache: string }
  | { status: 409 | 502; body: { error: string } & Record<string, unknown> };

// version 통과 후 얕은 shape 검증 — malformed를 뷰어로 넘기지 않는다(codex #3).
function hasGraphArrays(doc: unknown): boolean {
  if (typeof doc !== "object" || doc === null) return false;
  const d = doc as Record<string, unknown>;
  return Array.isArray(d.nodes) && Array.isArray(d.edges);
}

// 순수·주입가능 코어 — IO(fetch)와 timeout을 인자로 받아 테스트 가능하게 한다.
export async function resolveGraph(
  url: string | undefined,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 5000,
): Promise<GraphResult> {
  if (!url) return { status: 502, body: { error: "GRAPH_BLOB_URL not configured" } };

  // env-only라 사용자 SSRF는 아니지만, https만 허용해 오설정 footgun을 막는다(codex #5).
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { status: 502, body: { error: "GRAPH_BLOB_URL is not a valid URL" } };
  }
  if (parsed.protocol !== "https:") {
    return { status: 502, body: { error: "GRAPH_BLOB_URL must be https" } };
  }

  let res: Response;
  try {
    // no-store: 프록시가 항상 최신 blob을 읽는다(단, blob CDN 캐시는 업로드 TTL로 통제 — codex #1).
    // AbortSignal.timeout: 행 걸린 연결이 라우트를 붙잡지 않게(codex #4).
    res = await fetchFn(url, { cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
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
  if (!hasGraphArrays(doc)) {
    return { status: 409, body: { error: "graph missing nodes/edges arrays" } };
  }

  return { status: 200, body: doc, cache: "s-maxage=60, stale-while-revalidate=300" };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/app/api/graph/resolve.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: route handler 래퍼 작성**

`src/app/api/graph/route.ts`:

```ts
import { NextResponse } from "next/server";
import { resolveGraph } from "./resolve";

// Vercel serverless(Node) — edge 아님. blob을 서버에서 읽어 재서빙한다.
export const runtime = "nodejs";

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

- [ ] **Step 6: 게이트 + 커밋**

```bash
pnpm test && pnpm typecheck && pnpm lint:fsd
git add src/app/api/graph/resolve.ts src/app/api/graph/route.ts src/app/api/graph/resolve.test.ts
git commit -m "✨ feat(brain): /api/graph 프록시 — 버전·shape 하드거부·타임아웃·에러≠빈그래프"
```

---

## Task 2: 뷰어 install + `/brain` 페이지 (client 경계 분리)

**Files:**
- Modify: `package.json` (deps: `@secondbrain-jio/graph-viewer`)
- Create: `src/app/brain/BrainGraphClient.tsx` ("use client" 경계)
- Create: `src/app/brain/page.tsx` (server page)

**Interfaces:**
- Consumes: `/api/graph` (Task 1). npm `BrainGraph` 컴포넌트 — props `graphUrl: string`, `locale?: "ko" | ...`.

- [ ] **Step 1: 뷰어 install**

```bash
cd ~/Desktop/private/jio.dev && pnpm add @secondbrain-jio/graph-viewer
```
Expected: 설치 성공. `next ^15 / react ^18` peer 경고가 출력됨 — **install 차단 사유 아님**(Task 3에서 실제 mount·console·canvas 검증으로 확정 — codex #7).

- [ ] **Step 2: client 경계 컴포넌트 작성**

`src/app/brain/BrainGraphClient.tsx` — `"use client"`를 우리가 명시해 패키지 내부 계약에 의존하지 않는다(codex #6/#8). fixed inset-0로 전체 화면 캔버스를 확보하고 root layout의 z-[1]/텍스처/CursorGlow 위로 올린다(codex #9):

```tsx
"use client";

import { BrainGraph } from "@secondbrain-jio/graph-viewer";
// npm 소비 시 CSS 토큰 필수 — 안 넣으면 스타일 깨짐(host는 workspace라 불필요).
import "@secondbrain-jio/graph-viewer/styles.css";

export function BrainGraphClient() {
  // graphUrl = same-origin 프록시. fixtureUrl은 쓰지 않는다 — blob 실패 시 에러 UI가 의도된 상태.
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10 }}>
      <BrainGraph graphUrl="/api/graph" locale="ko" />
    </div>
  );
}
```

- [ ] **Step 3: server page 작성**

`src/app/brain/page.tsx` — server 컴포넌트라 metadata export 가능:

```tsx
import type { Metadata } from "next";
import { BrainGraphClient } from "./BrainGraphClient";

export const metadata: Metadata = {
  title: "Brain",
  description: "지식 그래프 — Second Brain 공개 표면",
};

export default function BrainPage() {
  return <BrainGraphClient />;
}
```

- [ ] **Step 4: 로컬 렌더 확인 (에러 상태 = 정상)**

Run: `pnpm dev` → 브라우저 `http://localhost:3000/brain`
Expected: 페이지가 뜨고, `GRAPH_BLOB_URL` 미설정이라 `/api/graph`가 502 → 뷰어가 **load-error UI**를 보인다(빈 그래프 아님). 이게 Task 3 전 정상 상태.
- 그래프 컨테이너가 전체 화면(fixed inset-0)을 채우는지 확인. 뷰어 자체 컨트롤(검색 등)이 flow 레이아웃을 요구해 깨지면 fixed 래퍼를 조정한다.
- **build/SSR 에러가 나면(codex #6):** BrainGraphClient가 `"use client"`라 서버 렌더 경로에서 빠져야 정상. 에러 시 import 경계를 재확인한다.

- [ ] **Step 5: 게이트 + 커밋**

```bash
pnpm typecheck && pnpm lint:fsd && pnpm build
git add package.json pnpm-lock.yaml src/app/brain/page.tsx src/app/brain/BrainGraphClient.tsx
git commit -m "✨ feat(brain): /brain 페이지 — server page + use client 경계 + npm 뷰어"
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

`scripts/upload-graph.mjs` (샘플·실발행 공용):

```js
// 사용: BLOB_READ_WRITE_TOKEN=... node scripts/upload-graph.mjs <graph.json 경로>
// addRandomSuffix:false → URL 안정, allowOverwrite:true → 덮어쓰기(단일 발행자 last-write-wins).
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";

const path = process.argv[2] ?? "graph.json";
const data = await readFile(path);
const { url } = await put("graph.json", data, {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  // ⚠️ 필수(codex #1): 안 주면 blob CDN이 기본 1개월 캐시라 덮어써도 갱신 안 됨.
  cacheControlMaxAge: 60,
});
console.log("uploaded →", url);
```

- [ ] **Step 2: Vercel Blob 스토어 생성 (수동, 대시보드)**

Vercel 대시보드 → jio.dev 프로젝트 → **Storage → Create Database → Blob** → 생성 후 프로젝트에 연결.
→ 연결 시 `BLOB_READ_WRITE_TOKEN`이 프로젝트 env에 **자동 주입**된다.
로컬 업로드용으로 토큰을 가져온다: `vercel env pull .env.local` (또는 대시보드에서 복사). `.env.local`은 이미 gitignore됨.

- [ ] **Step 3: 검열 샘플 그래프 업로드**

second-brain repo의 dev fixture(v4 스키마, synthetic 데이터, 회사명 없음)를 샘플로 쓴다. repo 오염·오커밋 방지로 `/tmp`에 둔다(codex #13):

```bash
cd ~/Desktop/private/jio.dev
cp ~/Desktop/private/second-brain/apps/host/public/graph.fixture.json /tmp/graph.sample.json
# 안전 확인 — 아무것도 안 나와야 함(synthetic이라 belt-and-suspenders):
grep -iE "settlement-admin|ally-admin|vdoc-b2c|swing-taxi" /tmp/graph.sample.json || echo "clean"
node scripts/upload-graph.mjs /tmp/graph.sample.json
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
Expected: 프로덕션 `https://<jio.dev>/brain`이 샘플 그래프를 렌더. 샘플은 `/tmp`에 있어 repo 오염 없음(별도 정리 불필요).

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
2. jio.dev `pnpm add @secondbrain-jio/graph-viewer@latest` + `resolve.ts`의 `SUPPORTED_GRAPH_SCHEMA` 갱신 + 재배포.
3. 새 graph.json 업로드.
```

- [ ] **Step 2: how-to 인덱스에 등록 + 커밋**

`docs/` 인덱스(있으면 `docs/how-to/_README.md` 또는 상위 라우터)에 한 줄 추가해 도달 가능하게 한다. 없으면 생략.

```bash
git add docs/how-to/publish-brain-graph.md
git commit -m "📝 docs(brain): personal→jio.dev 그래프 발행 how-to"
```

---

## 성공 기준 (스펙 대조 — 검증 시 체크)

- [ ] `/brain`이 jio.dev에 뜨고 synthetic 샘플을 렌더 (Task 2·3).
- [ ] `/api/graph`가 미지원 version=409·shape불량=409·bucket실패=502로 하드 거부, 빈 그래프 오인 없음 (Task 1 테스트 green).
- [ ] blob 덮어쓰기 → 재빌드 0으로 반영 (Task 3 Step 7, `cacheControlMaxAge:60` 전제).
- [ ] 진짜 public 발행은 §4 검토까지 게이트 — 이번 노출은 synthetic 샘플뿐 (Global Constraints, Task 4 경고).
- [ ] 로드 실패가 에러로 구분 (Task 1 502 + 뷰어 load-error UI, Task 2 Step 4).
