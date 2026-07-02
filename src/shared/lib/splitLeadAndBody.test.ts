import { describe, it, expect } from "vitest";
import { splitLeadSummaryBody } from "./splitLeadAndBody";

describe("splitLeadSummaryBody", () => {
  it("첫 h2 앞(도입)·첫 h2 섹션(요약)·둘째 h2부터(본문) 셋으로 나눈다", () => {
    const md = "<Chip>도메인</Chip>\n\n도입 단락.\n\n## 요약\n표\n\n## 핵심 원인\n콜아웃\n\n## 본문\n내용";
    expect(splitLeadSummaryBody(md)).toEqual({
      lead: "<Chip>도메인</Chip>\n\n도입 단락.\n\n",
      summary: "## 요약\n표\n\n",
      body: "## 핵심 원인\n콜아웃\n\n## 본문\n내용",
    });
  });

  it("h2로 시작하면 도입은 빈 문자열, 요약은 첫 h2 섹션, 본문은 둘째 h2부터", () => {
    const md = "## 요약\n표\n\n## 본문\n내용";
    expect(splitLeadSummaryBody(md)).toEqual({
      lead: "",
      summary: "## 요약\n표\n\n",
      body: "## 본문\n내용",
    });
  });

  it("h2가 하나뿐이면 요약이 끝까지, 본문은 빈 문자열", () => {
    const md = "도입\n\n## 요약\n표";
    expect(splitLeadSummaryBody(md)).toEqual({
      lead: "도입\n\n",
      summary: "## 요약\n표",
      body: "",
    });
  });

  it("h2가 없으면 도입·요약은 빈 문자열, 본문은 전체", () => {
    const md = "<Chip>도메인</Chip>\n\n도입만 있는 글.";
    expect(splitLeadSummaryBody(md)).toEqual({ lead: "", summary: "", body: md });
  });

  it("코드펜스 안의 ## 라인은 경계로 보지 않는다", () => {
    const md = "도입\n\n```\n## 가짜\n```\n\n## 진짜1\n본문\n\n## 진짜2\n끝";
    expect(splitLeadSummaryBody(md)).toEqual({
      lead: "도입\n\n```\n## 가짜\n```\n\n",
      summary: "## 진짜1\n본문\n\n",
      body: "## 진짜2\n끝",
    });
  });

  it("### h3는 경계가 아니다 — 첫 두 ## h2만 경계", () => {
    const md = "도입\n\n### 소제목\n\n## 요약\n본문\n\n## 둘째\n끝";
    expect(splitLeadSummaryBody(md)).toEqual({
      lead: "도입\n\n### 소제목\n\n",
      summary: "## 요약\n본문\n\n",
      body: "## 둘째\n끝",
    });
  });
});
