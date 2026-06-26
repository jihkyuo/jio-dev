import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  getProjects,
  getProjectSlugs,
  parseProjectFile,
  getProjectContent,
} from "./getProjects";

const PROJECTS_DIR = join(process.cwd(), "content", "projects");

// 콘텐츠 디렉터리에서 기대 slug를 직접 도출 — 특정 프로젝트명을 하드코딩하지 않아
// 샘플을 추가/이름변경해도 깨지지 않으면서 "파일 ↔ 로더" 정합을 검증한다.
const slugsFromDisk = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.replace(/\.mdx$/, ""))
  .sort();

describe("getProjects", () => {
  it("loads every project file on disk", () => {
    expect(getProjects().length).toBe(slugsFromDisk.length);
  });

  it("is sorted by order (ascending)", () => {
    const orders = getProjects().map((p) => p.order ?? Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i - 1] <= orders[i]).toBe(true);
    }
  });

  it("exposes a unique slug per content file", () => {
    const slugs = getProjectSlugs();
    expect([...slugs].sort()).toEqual(slugsFromDisk); // slug == 파일명
    expect(new Set(slugs).size).toBe(slugs.length); // 유일성
  });
});

describe("parseProjectFile", () => {
  it("throws when required frontmatter is missing", () => {
    const raw = `---\ntitle: 누락 테스트\n---\n본문`;
    // 빌드 로그가 actionable하도록 에러 메시지에 파일명이 포함되어야 한다.
    expect(() => parseProjectFile(raw, "broken.mdx")).toThrow("broken.mdx");
  });
});

describe("getProjectContent", () => {
  it("round-trips meta and body for every discovered slug", () => {
    for (const slug of slugsFromDisk) {
      const { meta, content } = getProjectContent(slug);
      const raw = readFileSync(join(PROJECTS_DIR, `${slug}.mdx`), "utf8");
      expect(meta.slug).toBe(slug);
      expect(content.length).toBeGreaterThan(0);
      // 본문이 frontmatter를 제거한 gray-matter 결과와 정확히 일치(부분문자열 휴리스틱 대신).
      expect(content).toBe(matter(raw).content);
    }
  });
  it("throws for an unknown slug", () => {
    expect(() => getProjectContent("nope")).toThrow("nope");
  });
  it("rejects path-traversal slugs", () => {
    expect(() => getProjectContent("../../etc/passwd")).toThrow("잘못된 slug");
  });
});
