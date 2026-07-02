import type { ReactNode } from "react";

type Options = {
  /** 핵심구를 감쌀 클래스(예: 스윕 하이라이트). */
  highlightClassName: string;
  /** 나머지 조각을 감쌀 클래스. 없으면 base는 색 상속 평문으로 렌더. */
  baseClassName?: string;
};

// 텍스트를 highlight 기준으로 [앞·핵심구·뒤] 형제 조각으로 쪼갠다.
// 핵심구는 highlightClassName span, 나머지는 baseClassName span(없으면 평문).
// 형제 구조라 부모 clip 중첩이 없어 배경-clip 텍스트의 가장자리 프린징이 생기지 않는다.
// highlight가 없거나 text에서 못 찾으면 통째로 한 조각(baseClassName 있으면 span, 없으면 평문).
// baseClassName을 안 주면(카드·프리뷰) 기본 글자는 크리스프하게 유지되고 핵심구만 시그니처로 뜬다.
export function renderHighlightedText(
  text: string,
  highlight: string | undefined,
  { highlightClassName, baseClassName }: Options,
): ReactNode {
  const at = highlight ? text.indexOf(highlight) : -1;
  const base = (part: string): ReactNode =>
    baseClassName ? <span className={baseClassName}>{part}</span> : part;
  if (at === -1) return base(text);
  const before = text.slice(0, at);
  const after = text.slice(at + highlight!.length);
  return (
    <>
      {before && base(before)}
      <span className={highlightClassName}>{highlight}</span>
      {after && base(after)}
    </>
  );
}
