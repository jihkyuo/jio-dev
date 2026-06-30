import { describe, it, expect } from "vitest";
import { computePreviewPosition, PREVIEW_GAP, PREVIEW_MARGIN } from "./previewPosition";

const VP = { width: 1000, height: 800 };
const CARD = { width: 320, height: 200 };

describe("computePreviewPosition", () => {
  it("아래 공간 충분하면 앵커 아래(+GAP)에 둔다", () => {
    expect(computePreviewPosition({ x: 400, y: 100 }, CARD, VP)).toEqual({
      top: 100 + PREVIEW_GAP,
      left: 400,
    });
  });

  it("아래 공간 부족하고 위 공간 있으면 위로 flip한다", () => {
    const { top } = computePreviewPosition({ x: 400, y: 780 }, CARD, VP);
    expect(top).toBe(780 - CARD.height - PREVIEW_GAP); // 572
  });

  it("앵커가 오른쪽 가장자리면 left를 뷰포트 안으로 clamp한다", () => {
    const { left } = computePreviewPosition({ x: 980, y: 100 }, CARD, VP);
    expect(left).toBe(VP.width - CARD.width - PREVIEW_MARGIN); // 672
  });

  it("앵커 x가 0 근처면 left를 MARGIN으로 clamp한다", () => {
    const { left } = computePreviewPosition({ x: 2, y: 100 }, CARD, VP);
    expect(left).toBe(PREVIEW_MARGIN);
  });

  it("바닥 근처 flip 결과도 뷰포트 세로 안에 완전히 들어온다", () => {
    const tall = { width: 320, height: 300 };
    const { top } = computePreviewPosition({ x: 100, y: 750 }, tall, VP);
    expect(top).toBe(750 - 300 - PREVIEW_GAP); // 442 (flip)
    expect(top + tall.height).toBeLessThanOrEqual(VP.height - PREVIEW_MARGIN);
  });

  it("카드가 뷰포트보다 높으면 top을 상단 MARGIN에 고정한다(아래로 안 넘침)", () => {
    const huge = { width: 320, height: 900 };
    const { top } = computePreviewPosition({ x: 100, y: 400 }, huge, VP);
    expect(top).toBe(PREVIEW_MARGIN);
  });

  it("좁은 뷰포트에서 left가 음수로 안 가고 MARGIN을 유지한다", () => {
    const narrow = { width: 320, height: 700 };
    const wide = { width: 312, height: 200 };
    const { left } = computePreviewPosition({ x: 200, y: 100 }, wide, narrow);
    expect(left).toBe(PREVIEW_MARGIN);
  });
});
