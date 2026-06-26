import { describe, it, expect } from "vitest";
import {
  getProjects,
  getProjectSlugs,
  parseProjectFile,
} from "@/content/projects";

describe("getProjects", () => {
  it("loads sample projects sorted by order", () => {
    const ps = getProjects();
    expect(ps.length).toBeGreaterThanOrEqual(2);
    expect(ps[0].slug).toBe("payment-widget-rearchitecture");
    const orders = ps.map((p) => p.order ?? Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i - 1] <= orders[i]).toBe(true);
    }
  });

  it("exposes slugs", () => {
    expect(getProjectSlugs()).toContain("design-system-v2");
  });
});

describe("parseProjectFile", () => {
  it("throws when required frontmatter is missing", () => {
    const raw = `---\ntitle: 누락 테스트\n---\n본문`;
    // 빌드 로그가 actionable하도록 에러 메시지에 파일명이 포함되어야 한다.
    expect(() => parseProjectFile(raw, "broken.mdx")).toThrow("broken.mdx");
  });
});
