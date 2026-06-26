import { describe, it, expect } from "vitest";
import { getSkills } from "@/content/skills";

describe("getSkills", () => {
  it("returns grouped skills with a non-empty core", () => {
    const s = getSkills();
    expect(s.core.length).toBeGreaterThan(0);
    expect(Array.isArray(s.comfortable)).toBe(true);
    expect(Array.isArray(s.production)).toBe(true);
  });
});
