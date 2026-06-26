import { describe, it, expect } from "vitest";
import {
  experienceSchema,
  projectFrontmatterSchema,
} from "@/content/schema";

describe("experienceSchema", () => {
  it("accepts a valid experience with YYYY.MM period and 2+ impacts", () => {
    const ok = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022.01", end: "NOW" },
      teamSize: "5명",
      scope: "프론트 챕터 리드",
      impact: ["번들 −38%", "LCP 4.2s→1.1s"],
      leadership: ["디자인 시스템 정착"],
      stack: ["Next.js", "TypeScript"],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects a malformed period (valid impact count)", () => {
    const bad = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022", end: "NOW" },
      teamSize: "5명",
      scope: "리드",
      impact: ["a", "b"],
      leadership: [],
      stack: ["Next.js"],
    });
    expect(bad.success).toBe(false);
  });

  it("rejects fewer than 2 impacts (valid period)", () => {
    const bad = experienceSchema.safeParse({
      company: "某 핀테크",
      role: "프론트엔드 리드",
      period: { start: "2022.01", end: "NOW" },
      teamSize: "5명",
      scope: "리드",
      impact: ["하나뿐"],
      leadership: [],
      stack: ["Next.js"],
    });
    expect(bad.success).toBe(false);
  });
});

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
