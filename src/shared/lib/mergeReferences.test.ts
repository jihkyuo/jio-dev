import { describe, it, expect } from "vitest";
import { mergeReferences } from "./mergeReferences";

describe("mergeReferences", () => {
  it("본문 링크 텍스트가 기본 title이 된다(frontmatter 없음)", () => {
    expect(mergeReferences("[Next.js](https://nextjs.org)")).toEqual([
      { url: "https://nextjs.org", title: "Next.js", description: undefined },
    ]);
  });

  it("frontmatter title·description으로 본문 링크를 보강한다", () => {
    const refs = [{ url: "https://nextjs.org", title: "Next.js 공식", description: "프레임워크" }];
    expect(mergeReferences("[next](https://nextjs.org)", refs)).toEqual([
      { url: "https://nextjs.org", title: "Next.js 공식", description: "프레임워크" },
    ]);
  });

  it("끝 슬래시 차이가 있어도 frontmatter 보강이 붙는다", () => {
    const refs = [{ url: "https://immerjs.github.io/immer", title: "Immer", description: "설명" }];
    const out = mergeReferences("[immer](https://immerjs.github.io/immer/)", refs);
    expect(out).toEqual([
      { url: "https://immerjs.github.io/immer/", title: "Immer", description: "설명" },
    ]);
  });

  it("본문에 없는 frontmatter 레퍼런스는 카드로 만들지 않는다", () => {
    const refs = [{ url: "https://only-in-frontmatter.com", title: "안 씀" }];
    expect(mergeReferences("본문에 링크 없음", refs)).toEqual([]);
  });

  it("같은 url 중복 링크는 하나로 dedupe된다", () => {
    const out = mergeReferences("[a](https://x.com) 그리고 [b](https://x.com)");
    expect(out).toEqual([{ url: "https://x.com", title: "a", description: undefined }]);
  });
});
