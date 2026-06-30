import type { ReactNode } from "react";

// 단어 하이라이트(A Marker). 기본은 accent, c로 시맨틱 색 지정.
// 콜아웃 색 체계와 호응: decision(보라)·warning(앰버)·tip(그린).
const COLOR_CLASS: Record<string, string> = {
  decision: "dc",
  warning: "wn",
  tip: "tp",
};

export function Hl({ c, children }: { c?: string; children: ReactNode }) {
  // 알 수 없는 c는 기본(accent)으로 폴백 — 잘못된 입력이 렌더를 깨지 않게.
  const mod = c ? COLOR_CLASS[c] : undefined;
  return <mark className={mod ? `cs-mark ${mod}` : "cs-mark"}>{children}</mark>;
}
