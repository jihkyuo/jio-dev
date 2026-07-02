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
