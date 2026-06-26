import { describe, it, expect } from "vitest";
import { getExperience } from "@/content/experience";

describe("getExperience", () => {
  it("returns schema-valid entries sorted most-recent first", () => {
    const xs = getExperience();
    expect(xs.length).toBeGreaterThan(0);
    // 첫 항목은 재직중이거나 가장 최근 시작
    const first = xs[0];
    expect(first.impact.length).toBeGreaterThanOrEqual(2);
    // 정렬: NOW 또는 최신 start 가 맨 앞
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
