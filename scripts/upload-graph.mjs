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
