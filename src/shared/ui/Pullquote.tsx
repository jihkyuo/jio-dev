import type { ReactNode } from "react";

/**
 * 에디토리얼 풀쿼트 — 가운데 정렬 대형 문구를 양옆의 대형 accent 장식 따옴표(“ ”)로 감싼다.
 * 박스·바 없음. 박스형 인용구(마크다운 `>` → `.cs-blockquote`, 핵심원인 블록이 공유)와 분리된 별도 표현.
 * 사용: <Pullquote>한 줄 문구</Pullquote>  ← 따옴표는 장식 글리프가 대신하므로 문구만.
 */
export function Pullquote({ children }: { children: ReactNode }) {
  return (
    <figure className="cs-pullquote my-12 flex items-center justify-center gap-2 text-center sm:gap-3">
      <span
        aria-hidden
        className="select-none font-serif text-5xl leading-none text-accent/60 sm:text-6xl"
      >
        &ldquo;
      </span>
      <blockquote className="bg-[linear-gradient(100deg,#8fb0ec,#7e9cd4_58%,#a9c0e6)] bg-clip-text pr-[0.25em] text-2xl font-semibold italic leading-snug text-transparent sm:text-3xl">
        {children}
      </blockquote>
      <span
        aria-hidden
        className="select-none font-serif text-5xl leading-none text-accent/60 sm:text-6xl"
      >
        &rdquo;
      </span>
    </figure>
  );
}
