import { describe, it, expect } from "vitest";
import { splitLeadAndBody } from "./splitLeadAndBody";

describe("splitLeadAndBody", () => {
  it("첫 h2 경계에서 도입(앞)과 본문(h2부터)을 나눈다", () => {
    const md = "<Chip>도메인</Chip>\n\n도입 단락.\n\n## 요약\n표\n\n## 본문\n내용";
    expect(splitLeadAndBody(md)).toEqual({
      lead: "<Chip>도메인</Chip>\n\n도입 단락.\n\n",
      body: "## 요약\n표\n\n## 본문\n내용",
    });
  });

  it("h2로 시작하면 도입은 빈 문자열, 본문은 전체", () => {
    const md = "## 요약\n표\n\n## 본문\n내용";
    expect(splitLeadAndBody(md)).toEqual({ lead: "", body: md });
  });

  it("h2가 없으면 도입은 빈 문자열, 본문은 전체", () => {
    const md = "<Chip>도메인</Chip>\n\n도입만 있는 글.";
    expect(splitLeadAndBody(md)).toEqual({ lead: "", body: md });
  });

  it("코드펜스 안의 ## 라인은 경계로 보지 않는다", () => {
    const md = "도입\n\n```\n## 가짜\n```\n\n## 진짜\n본문";
    expect(splitLeadAndBody(md)).toEqual({
      lead: "도입\n\n```\n## 가짜\n```\n\n",
      body: "## 진짜\n본문",
    });
  });

  it("탭으로 구분된 ## 헤딩도 경계로 인식한다(extractHeadings와 일관)", () => {
    const md = "도입\n\n##\t요약\n본문";
    expect(splitLeadAndBody(md)).toEqual({ lead: "도입\n\n", body: "##\t요약\n본문" });
  });

  it("### h3는 경계가 아니다 — 첫 ## h2까지가 도입", () => {
    const md = "도입\n\n### 소제목\n\n## 요약\n본문";
    expect(splitLeadAndBody(md)).toEqual({
      lead: "도입\n\n### 소제목\n\n",
      body: "## 요약\n본문",
    });
  });
});
