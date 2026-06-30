import { describe, it, expect } from "vitest";
import { extractExternalLinks } from "./extractExternalLinks";

describe("extractExternalLinks", () => {
  it("http/https 인라인 링크를 {url, text}로 뽑는다", () => {
    expect(extractExternalLinks("본문 [Next.js](https://nextjs.org/) 링크")).toEqual([
      { url: "https://nextjs.org/", text: "Next.js" },
    ]);
  });

  it("내부·앵커 링크는 제외하고 외부(http/https)만 뽑는다", () => {
    const md = "[다른 글](/projects/x) [앵커](#h) [외부](http://example.com)";
    expect(extractExternalLinks(md)).toEqual([
      { url: "http://example.com", text: "외부" },
    ]);
  });

  it("같은 url은 첫 등장 텍스트로 dedupe한다", () => {
    const md = "[첫](https://a.com) 그리고 [둘](https://a.com)";
    expect(extractExternalLinks(md)).toEqual([
      { url: "https://a.com", text: "첫" },
    ]);
  });

  it("코드펜스 안의 URL은 제외한다", () => {
    const md = "[진짜](https://real.com)\n```\n[가짜](https://fake.com)\n```";
    expect(extractExternalLinks(md)).toEqual([
      { url: "https://real.com", text: "진짜" },
    ]);
  });

  it("인라인 코드 안의 URL은 제외한다", () => {
    expect(extractExternalLinks("`[가짜](https://fake.com)` 설명")).toEqual([]);
  });

  it("이미지 링크(![alt](url))는 레퍼런스로 뽑지 않는다", () => {
    expect(extractExternalLinks("![다이어그램](https://img.example.com/x.png)")).toEqual([]);
  });

  it("이미지 링크 옆의 일반 링크는 정상 추출한다", () => {
    const md = "![그림](https://img.example.com/x.png) 그리고 [출처](https://src.example.com)";
    expect(extractExternalLinks(md)).toEqual([
      { url: "https://src.example.com", text: "출처" },
    ]);
  });

  it("URL 안의 균형 괄호를 끝까지 포함한다(위키피디아식)", () => {
    const md = "[Disambiguation](https://en.wikipedia.org/wiki/Mercury_(planet))";
    expect(extractExternalLinks(md)).toEqual([
      { url: "https://en.wikipedia.org/wiki/Mercury_(planet)", text: "Disambiguation" },
    ]);
  });
});
