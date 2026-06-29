import GithubSlugger from "github-slugger";

export type TocHeading = { id: string; text: string; level: 2 | 3 };

/** 헤딩 텍스트에서 인라인 마크다운 토큰을 벗긴다(rehype-slug가 보는 렌더 텍스트에 근접). */
function stripInline(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1")           // `code`
    .replace(/\*\*([^*]+)\*\*/g, "$1")      // **bold**
    .replace(/\*([^*]+)\*/g, "$1")          // *em*
    .replace(/_([^_]+)_/g, "$1")            // _em_
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url)
    .trim();
}

export function extractHeadings(mdx: string): TocHeading[] {
  const slugger = new GithubSlugger();
  const out: TocHeading[] = [];
  let inFence = false;

  for (const line of mdx.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    const text = stripInline(m[2]);
    out.push({ id: slugger.slug(text), text, level });
  }
  return out;
}
