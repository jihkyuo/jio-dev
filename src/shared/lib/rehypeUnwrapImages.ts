/**
 * 이미지 단독 문단(`<p>` 안에 `<img>` 하나뿐)을 풀어 img를 문단 밖으로 올린다.
 * 마크다운 `![](…)`는 remark가 문단으로 감싸는데, mdx에서 img를 블록 `<figure>`로
 * 매핑하면 `<p><figure>` 중첩(무효 HTML → React 하이드레이션 미스매치)이 된다.
 * hast 단계에서 그 불필요한 문단을 제거해 figure가 유효한 위치에 오게 한다.
 *
 * 외부 의존 없는 로컬 rehype 플러그인(unist-util-visit 미사용 — 직접 순회).
 */
type HNode = { type: string; tagName?: string; value?: string; children?: HNode[] };

const isBlankText = (n: HNode) => n.type === "text" && (n.value ?? "").trim() === "";

export function rehypeUnwrapImages() {
  return (tree: HNode) => {
    const walk = (node: HNode) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === "element" && child.tagName === "p" && child.children) {
          const significant = child.children.filter((c) => !isBlankText(c));
          if (significant.length === 1 && significant[0].type === "element" && significant[0].tagName === "img") {
            return significant[0];
          }
        }
        return child;
      });
      node.children.forEach(walk);
    };
    walk(tree);
    return tree;
  };
}
