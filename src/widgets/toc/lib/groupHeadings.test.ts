import { describe, it, expect } from "vitest";
import { groupHeadings, findOwnerId } from "./groupHeadings";
import type { TocHeading } from "@/shared/lib/extractHeadings";

const H = (id: string, level: 2 | 3): TocHeading => ({ id, text: id, level });

describe("groupHeadings", () => {
  it("h2 아래 연속된 h3를 자식으로 묶는다", () => {
    const out = groupHeadings([H("a", 2), H("b", 2), H("b1", 3), H("b2", 3), H("c", 2)]);
    expect(out.map((s) => s.heading.id)).toEqual(["a", "b", "c"]);
    expect(out[0].children).toEqual([]);
    expect(out[1].children.map((c) => c.id)).toEqual(["b1", "b2"]);
    expect(out[2].children).toEqual([]);
  });

  it("h2 이전에 나온 h3는 버린다(방어)", () => {
    expect(groupHeadings([H("x", 3), H("a", 2)])).toEqual([
      { heading: H("a", 2), children: [] },
    ]);
  });

  it("빈 입력은 빈 배열", () => {
    expect(groupHeadings([])).toEqual([]);
  });
});

describe("findOwnerId", () => {
  const secs = groupHeadings([H("a", 2), H("b", 2), H("b1", 3), H("b2", 3)]);
  it("자식 id면 부모 h2 id를 돌려준다", () => {
    expect(findOwnerId(secs, "b2")).toBe("b");
  });
  it("h2 id면 자기 자신", () => {
    expect(findOwnerId(secs, "a")).toBe("a");
  });
  it("없는 id면 null", () => {
    expect(findOwnerId(secs, "zzz")).toBeNull();
  });
});
