import { describe, it, expect } from "vitest";
import { getExperience } from "./getExperience";

describe("getExperience", () => {
  it("returns schema-valid entries sorted most-recent first", () => {
    const xs = getExperience();
    expect(xs.length).toBeGreaterThan(0);
    // 첫 항목은 재직중이거나 가장 최근 시작
    const first = xs[0];
    expect(first.impact.length).toBeGreaterThanOrEqual(2);
    // NOW-first 불변식 직접 단언: 재직중 항목이 존재하면 맨 앞이어야 한다.
    const hasNow = xs.some((e) => e.period.end === "NOW");
    if (hasNow) {
      expect(xs[0].period.end).toBe("NOW");
    }
    // 정렬: NOW/비-NOW 같은 그룹 안에서는 start 가 내림차순
    const startOf = (e: (typeof xs)[number]) => e.period.start;
    for (let i = 1; i < xs.length; i++) {
      const prevNow = xs[i - 1].period.end === "NOW";
      const currNow = xs[i].period.end === "NOW";
      if (prevNow === currNow) {
        expect(startOf(xs[i - 1]) >= startOf(xs[i])).toBe(true);
      }
    }
  });
});
