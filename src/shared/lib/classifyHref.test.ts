import { describe, it, expect } from "vitest";
import { classifyHref } from "./classifyHref";

describe("classifyHref", () => {
  it("절대 내부 경로(/…)는 internal", () => {
    expect(classifyHref("/projects/foo")).toBe("internal");
    expect(classifyHref("/about")).toBe("internal");
  });

  it("프래그먼트(#…)는 anchor", () => {
    expect(classifyHref("#section")).toBe("anchor");
  });

  it("http/https는 external", () => {
    expect(classifyHref("https://x.com")).toBe("external");
    expect(classifyHref("http://x.com")).toBe("external");
  });

  it("mailto·tel·protocol-relative는 internal로 오분류하지 않고 external", () => {
    expect(classifyHref("mailto:a@b.com")).toBe("external");
    expect(classifyHref("tel:+123")).toBe("external");
    expect(classifyHref("//cdn.example.com")).toBe("external");
  });

  it("빈 값·undefined는 external(폴백)", () => {
    expect(classifyHref("")).toBe("external");
    expect(classifyHref(undefined)).toBe("external");
  });
});
