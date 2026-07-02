import type { ReactNode } from "react";

/**
 * 에디토리얼 풀쿼트 — 대형 accent 장식 따옴표 + 기울임체 대형 문구(박스·바 없음).
 * 박스형 인용구(마크다운 `>` → `.cs-blockquote`, 핵심원인 블록이 공유)와 분리된 별도 표현.
 * 사용: <Pullquote>한 줄 문구</Pullquote>  ← 따옴표는 장식 글리프가 대신하므로 문구만.
 */
export function Pullquote({ children }: { children: ReactNode }) {
  return (
    <figure className="cs-pullquote my-12">
      <span
        aria-hidden
        className="block font-serif text-6xl leading-none text-accent/60 sm:text-7xl"
      >
        &ldquo;
      </span>
      <blockquote className="-mt-3 pl-1 text-2xl font-medium italic leading-snug text-head sm:text-3xl">
        {children}
      </blockquote>
    </figure>
  );
}
