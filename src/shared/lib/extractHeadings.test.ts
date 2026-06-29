import { describe, it, expect } from "vitest";
import { extractHeadings } from "./extractHeadings";

describe("extractHeadings", () => {
  it("h2·h3만 뽑고 h1·h4는 제외한다", () => {
    const md = "# 제목\n## 문제\n### 원인\n#### 세부\n본문";
    expect(extractHeadings(md)).toEqual([
      { id: "문제", text: "문제", level: 2 },
      { id: "원인", text: "원인", level: 3 },
    ]);
  });

  it("한글 헤딩의 공백을 하이픈으로, github-slugger 규칙으로 slug한다", () => {
    expect(extractHeadings("## 형제 범위 rank 재계산")).toEqual([
      { id: "형제-범위-rank-재계산", text: "형제 범위 rank 재계산", level: 2 },
    ]);
  });

  it("헤딩 텍스트의 인라인 마크다운(**bold**·`code`·링크)을 벗겨 slug·text를 만든다", () => {
    expect(extractHeadings("## **Sibling-scoped** `rank`")).toEqual([
      { id: "sibling-scoped-rank", text: "Sibling-scoped rank", level: 2 },
    ]);
  });

  it("중복 헤딩에 -1, -2 접미사를 붙인다(rehype-slug와 동일)", () => {
    expect(extractHeadings("## 검증\n## 검증")).toEqual([
      { id: "검증", text: "검증", level: 2 },
      { id: "검증-1", text: "검증", level: 2 },
    ]);
  });

  it("코드펜스 안의 ## 라인은 헤딩으로 보지 않는다", () => {
    const md = "## 진짜\n```\n## 가짜\n```\n본문";
    expect(extractHeadings(md)).toEqual([
      { id: "진짜", text: "진짜", level: 2 },
    ]);
  });
});
