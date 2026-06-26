import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { projectFrontmatterSchema, type ProjectMeta } from "@/content/schema";

const PROJECTS_DIR = join(process.cwd(), "content", "projects");

/** frontmatter를 검증해 ProjectMeta로 변환. 실패 시 파일명을 담아 throw. */
export function parseProjectFile(raw: string, file: string): ProjectMeta {
  const { data } = matter(raw);
  const parsed = projectFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `[content] 잘못된 프로젝트 frontmatter: ${file}\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}

function loadAll(): ProjectMeta[] {
  const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) =>
    parseProjectFile(readFileSync(join(PROJECTS_DIR, file), "utf8"), file),
  );
}

export function getProjects(): ProjectMeta[] {
  return loadAll().sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER),
  );
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}
