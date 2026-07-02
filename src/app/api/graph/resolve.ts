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
