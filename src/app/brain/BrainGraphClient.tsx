"use client";

import dynamic from "next/dynamic";
// npm 소비 시 CSS 토큰 필수 — 안 넣으면 스타일 깨짐(host는 workspace라 불필요).
import "@secondbrain-jio/graph-viewer/styles.css";

// 뷰어는 three.js/WebGL 기반이라 SSR-safe하지 않다(prerender 시 dynamic require 실패).
// ssr:false로 client-only 로드 → 서버 렌더 경로에서 완전히 빠진다(codex #6/#7).
// loading: 무거운 청크(three.js)를 받는 pre-mount 창의 빈 화면 깜빡임을 메꾼다.
const BrainGraph = dynamic(
  () => import("@secondbrain-jio/graph-viewer").then((m) => m.BrainGraph),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "#888",
          fontSize: "0.9rem",
        }}
      >
        불러오는 중…
      </div>
    ),
  },
);

export function BrainGraphClient() {
  // graphUrl = same-origin 프록시. fixtureUrl은 쓰지 않는다 — blob 실패 시 에러 UI가 의도된 상태.
  // fixed inset-0로 전체 화면 캔버스를 확보하고 root layout의 z-[1]/텍스처/CursorGlow 위로 올린다.
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10 }}>
      <BrainGraph graphUrl="/api/graph" locale="ko" />
    </div>
  );
}
