import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderHighlightedText } from "./renderHighlightedText";

// 반환 ReactNode를 정적 HTML로 렌더해 "무엇이 어떤 클래스로 감싸졌나"라는 계약을 본다.
// (엘리먼트 트리 내부 구조가 아니라 관찰 가능한 출력)
const html = (node: ReactNode) =>
  renderToStaticMarkup(createElement(Fragment, null, node));

const HL = "cs-title-hl";
const BASE = "cs-title-g";

describe("renderHighlightedText", () => {
  it("wraps only the highlight phrase when no baseClassName (crisp plain base)", () => {
    expect(
      html(renderHighlightedText("앞 불변 뒤", "불변", { highlightClassName: HL })),
    ).toBe(`앞 <span class="${HL}">불변</span> 뒤`);
  });

  it("wraps base fragments in baseClassName when provided (gradient base)", () => {
    expect(
      html(
        renderHighlightedText("앞 불변 뒤", "불변", {
          highlightClassName: HL,
          baseClassName: BASE,
        }),
      ),
    ).toBe(
      `<span class="${BASE}">앞 </span><span class="${HL}">불변</span><span class="${BASE}"> 뒤</span>`,
    );
  });

  it("omits the leading base fragment when the highlight starts the text", () => {
    expect(
      html(renderHighlightedText("불변 뒤", "불변", { highlightClassName: HL })),
    ).toBe(`<span class="${HL}">불변</span> 뒤`);
  });

  it("omits the trailing base fragment when the highlight ends the text", () => {
    expect(
      html(renderHighlightedText("앞 불변", "불변", { highlightClassName: HL })),
    ).toBe(`앞 <span class="${HL}">불변</span>`);
  });

  // detail H1의 pure-refactor 보장은 baseClassName 경로에 달려 있다 —
  // 그 경로의 경계(맨앞·맨끝) span 생략도 별도로 잠근다.
  it("omits the leading base span at the start even when baseClassName is set", () => {
    expect(
      html(
        renderHighlightedText("불변 뒤", "불변", {
          highlightClassName: HL,
          baseClassName: BASE,
        }),
      ),
    ).toBe(`<span class="${HL}">불변</span><span class="${BASE}"> 뒤</span>`);
  });

  it("omits the trailing base span at the end even when baseClassName is set", () => {
    expect(
      html(
        renderHighlightedText("앞 불변", "불변", {
          highlightClassName: HL,
          baseClassName: BASE,
        }),
      ),
    ).toBe(`<span class="${BASE}">앞 </span><span class="${HL}">불변</span>`);
  });

  it("renders the whole text as plain when highlight is missing and no baseClassName", () => {
    expect(
      html(renderHighlightedText("앞 불변 뒤", undefined, { highlightClassName: HL })),
    ).toBe("앞 불변 뒤");
  });

  it("renders the whole text as one base span when highlight is missing but baseClassName is set", () => {
    expect(
      html(
        renderHighlightedText("앞 불변 뒤", undefined, {
          highlightClassName: HL,
          baseClassName: BASE,
        }),
      ),
    ).toBe(`<span class="${BASE}">앞 불변 뒤</span>`);
  });

  it("falls back to the missing-highlight path when the highlight is not found in the text", () => {
    expect(
      html(renderHighlightedText("앞 불변 뒤", "없는구절", { highlightClassName: HL })),
    ).toBe("앞 불변 뒤");
  });
});
