import { describe, it, expect } from "vitest";
import { projectFrontmatterSchema } from "./schema";

describe("projectFrontmatterSchema", () => {
  it("rejects when a required field is missing", () => {
    const bad = projectFrontmatterSchema.safeParse({
      title: "결제 위젯 리아키텍처",
      // slug 누락
      period: "2024",
      role: "프론트 리드",
      teamSize: "5명",
      stack: ["Next.js"],
      impact: "번들 −38%",
      summary: "요약",
      links: {},
    });
    expect(bad.success).toBe(false);
  });

  it("rejects a non-kebab-case slug", () => {
    const bad = projectFrontmatterSchema.safeParse({
      title: "결제 위젯 리아키텍처",
      slug: "Bad_Slug",
      period: "2024",
      role: "프론트 리드",
      teamSize: "5명",
      stack: ["Next.js"],
      impact: "번들 −38%",
      summary: "요약",
      links: {},
    });
    expect(bad.success).toBe(false);
  });

  it("accepts valid project frontmatter", () => {
    const ok = projectFrontmatterSchema.safeParse({
      title: "결제 위젯 리아키텍처",
      slug: "valid-slug",
      period: "2024",
      role: "프론트 리드",
      teamSize: "5명",
      stack: ["Next.js"],
      impact: "번들 −38%",
      summary: "요약",
      links: {},
    });
    expect(ok.success).toBe(true);
  });
});
