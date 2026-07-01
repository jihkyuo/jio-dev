import { describe, it, expect } from "vitest";
import { rehypeUnwrapImages } from "./rehypeUnwrapImages";

// 최소 hast 노드 헬퍼
const el = (tagName: string, children: unknown[] = []) => ({ type: "element", tagName, properties: {}, children });
const txt = (value: string) => ({ type: "text", value });
const img = () => el("img", []);

const run = (tree: unknown) => rehypeUnwrapImages()(tree as never);

describe("rehypeUnwrapImages", () => {
  it("이미지 단독 문단을 풀어 img를 문단 밖으로 올린다", () => {
    const tree = { type: "root", children: [el("p", [img()])] };
    run(tree);
    expect(tree.children[0]).toMatchObject({ type: "element", tagName: "img" });
  });

  it("공백 텍스트만 함께 있는 이미지 문단도 푼다", () => {
    const tree = { type: "root", children: [el("p", [txt("\n"), img(), txt("  ")])] };
    run(tree);
    expect(tree.children[0]).toMatchObject({ tagName: "img" });
  });

  it("텍스트가 있는 문단은 건드리지 않는다", () => {
    const tree = { type: "root", children: [el("p", [txt("설명")])] };
    run(tree);
    expect(tree.children[0]).toMatchObject({ tagName: "p" });
  });

  it("이미지와 실제 텍스트가 섞인 문단은 풀지 않는다(단독 아님)", () => {
    const tree = { type: "root", children: [el("p", [img(), txt("캡션")])] };
    run(tree);
    expect(tree.children[0]).toMatchObject({ tagName: "p" });
  });

  it("중첩된 문단(blockquote 안)도 재귀로 푼다", () => {
    const tree = { type: "root", children: [el("blockquote", [el("p", [img()])])] };
    run(tree);
    const bq = tree.children[0] as { children: { tagName: string }[] };
    expect(bq.children[0]).toMatchObject({ tagName: "img" });
  });
});
