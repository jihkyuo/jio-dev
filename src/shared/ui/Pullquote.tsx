import type { ReactNode } from "react";

/**
 * 미니멀 풀쿼트 — 왼쪽 accent 세로 바 + 큰 문구, 박스 없음.
 * 박스형 인용구(마크다운 `>` → `.cs-blockquote`, 핵심원인 블록이 공유)와 분리된 별도 표현.
 * 사용: <Pullquote>“한 줄 문구”</Pullquote>
 */
export function Pullquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="cs-pullquote my-10 border-l-[3px] border-accent pl-6 text-xl font-medium leading-snug text-head sm:text-2xl">
      {children}
    </blockquote>
  );
}
