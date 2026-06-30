import { extractExternalLinks } from "./extractExternalLinks";

export type Reference = { url: string; title: string; description?: string };
type ReferenceMeta = { url: string; title: string; description?: string };

// frontmatter url과 본문 url의 끝 슬래시 차이는 같은 자원으로 본다 — 매칭 키만 정규화하고
// 표시 url은 본문에 쓰인 그대로 유지한다.
function matchKey(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * 본문 외부 링크를 자동 레퍼런스로 만들고, frontmatter references와 url로 병합해
 * title/description을 보강한다. 카드는 본문에 실제로 등장한 링크에서만 만든다
 * (frontmatter에만 있는 url은 카드가 생기지 않음 — 의도된 동작).
 */
export function mergeReferences(content: string, frontmatter: ReferenceMeta[] = []): Reference[] {
  const metaByUrl = new Map(frontmatter.map((r) => [matchKey(r.url), r]));
  return extractExternalLinks(content).map((link) => {
    const m = metaByUrl.get(matchKey(link.url));
    return { url: link.url, title: m?.title ?? link.text, description: m?.description };
  });
}
