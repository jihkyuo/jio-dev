// 프리뷰 카드 위치 계산(순수·테스트 가능). 앵커(마우스/링크/탭 위치) 기준으로
// 기본 아래 배치, 아래 공간 부족하고 위 공간 있으면 위로 flip, 양축을 뷰포트 안으로 clamp.
// 카드가 뷰포트보다 큰 경우 max(min,...)이 min을 우선해 위/왼 가장자리에 붙인다(높이는 CSS max-height로 내부 스크롤).
export const PREVIEW_GAP = 8;
export const PREVIEW_MARGIN = 8;

type Point = { x: number; y: number };
type Size = { width: number; height: number };

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, max));
}

export function computePreviewPosition(
  anchor: Point,
  card: Size,
  viewport: Size,
): { top: number; left: number } {
  const below = viewport.height - anchor.y;
  const needsFlip =
    below < card.height + PREVIEW_GAP + PREVIEW_MARGIN &&
    anchor.y > card.height + PREVIEW_GAP + PREVIEW_MARGIN;
  const rawTop = needsFlip ? anchor.y - card.height - PREVIEW_GAP : anchor.y + PREVIEW_GAP;
  return {
    top: clamp(rawTop, PREVIEW_MARGIN, viewport.height - card.height - PREVIEW_MARGIN),
    left: clamp(anchor.x, PREVIEW_MARGIN, viewport.width - card.width - PREVIEW_MARGIN),
  };
}
