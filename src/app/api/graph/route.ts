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
