import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { projectFrontmatterSchema, type ProjectMeta } from "../model/schema";

const PROJECTS_DIR = join(process.cwd(), "content", "projects");

/** 이미 파싱된 frontmatter data를 검증해 ProjectMeta로 변환. 실패 시 파일명을 담아 throw. */
function validateFrontmatter(data: unknown, file: string): ProjectMeta {
  const parsed = projectFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `[project] 잘못된 프로젝트 frontmatter: ${file}\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}

/** frontmatter를 검증해 ProjectMeta로 변환. 실패 시 파일명을 담아 throw. */
export function parseProjectFile(raw: string, file: string): ProjectMeta {
  return validateFrontmatter(matter(raw).data, file);
}

function loadAll(): ProjectMeta[] {
  const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) =>
    parseProjectFile(readFileSync(join(PROJECTS_DIR, file), "utf8"), file),
  );
}

export function getProjects(): ProjectMeta[] {
  return loadAll().sort((a, b) => {
    const byOrder =
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER);
    // 같은 order면 slug로 결정적 정렬(파일시스템 순서 의존 제거).
    return byOrder !== 0 ? byOrder : a.slug.localeCompare(b.slug);
  });
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectContent(slug: string): { meta: ProjectMeta; content: string } {
  // public 서버 함수라 임의 입력 방어: 경로 트래버설 차단.
  if (slug.includes("/") || slug.includes("..")) {
    throw new Error(`[project] 잘못된 slug: ${slug}`);
  }
  const file = join(PROJECTS_DIR, `${slug}.mdx`);
  if (!existsSync(file)) {
    throw new Error(`[project] 프로젝트를 찾을 수 없음: ${slug}`);
  }
  const raw = readFileSync(file, "utf8");
  const { data, content } = matter(raw); // 한 번만 파싱해 frontmatter·본문을 함께 추출
  const meta = validateFrontmatter(data, `${slug}.mdx`);
  return { meta, content };
}
