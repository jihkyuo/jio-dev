import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { getProjectContent } from "./getProjects";

// 콘텐츠 가드레일: 포트폴리오 본문이 "콘텐츠"에 머무르고 코드로 드리프트하지 않도록
// content:check(vitest run src/entities) 단계에서 차단한다. 두 축:
//   R1 — 본문 산문에 금지 패턴(import/export/<script>/style=/className=/JSX식)·
//        미허용 대문자 컴포넌트가 새는 것을 잡는다.
//   R2 — 본문을 빌드와 같은 MDX 파서로 사전 컴파일해, 깨진 글을 배포 빌드가 아니라
//        여기서 먼저 잡는다.

const PROJECTS_DIR = join(process.cwd(), "content", "projects");

const slugsFromDisk = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.replace(/\.mdx$/, ""))
  .sort();

// 본문의 화이트리스트 컴포넌트. 그 외 대문자 태그는 코드 드리프트로 간주한다.
const ALLOWED_COMPONENTS = new Set(["Callout", "Chip", "Meta"]);

// 위험 raw HTML 태그. 외부 붙여넣기로 새어 들어오면 MDX가 그대로 렌더하므로 명시
// 차단한다. **소문자만** 매칭한다 — raw HTML 붙여넣기는 소문자고, 대문자 태그는
// JSX 컴포넌트(`<Meta>` 등 허용목록 포함)라 아래 대문자 컴포넌트 규칙이 따로 처리한다
// (case-insensitive면 `<Meta>` 컴포넌트가 `<meta>` 태그와 충돌). `img`는 정당한
// 인바운드 요소라 태그 자체는 허용하고, 위험은 이벤트 핸들러(on*=)로 따로 막는다.
const DANGEROUS_TAGS =
  /<\/?(script|iframe|object|embed|style|link|base|form|meta)\b/;

// 코드 영역(펜스 블록·인라인 코드)을 제거한다. 케이스 스터디는 코드를 인용하므로
// 코드블럭 안의 import/<Tag>/={ 는 정당한 콘텐츠다 — 가드레일은 코드가 "산문"으로
// 새는 것만 잡아야 오탐이 없다.
function stripCode(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, "") // 펜스 코드블럭
    .replace(/`[^`]*`/g, ""); // 인라인 코드
}

// 산문에 코드가 새는 패턴을 찾아 위반 라벨 배열로 반환(없으면 빈 배열).
function findViolations(body: string): string[] {
  const prose = stripCode(body);
  const out: string[] = [];
  if (/^\s*import\s/m.test(prose)) out.push("import 문");
  if (/^\s*export\s/m.test(prose)) out.push("export 문");
  if (/\sstyle=/.test(prose)) out.push("style= 속성");
  if (/\sclassName=/.test(prose)) out.push("className= 속성");
  if (/=\{/.test(prose)) out.push("JSX 표현식(={)");
  if (/\son[a-z]+\s*=/.test(prose)) out.push("이벤트 핸들러 속성(on*=)");
  const dangerous = prose.match(DANGEROUS_TAGS);
  if (dangerous) out.push(`위험 raw HTML <${dangerous[1].toLowerCase()}>`);
  for (const m of prose.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (!ALLOWED_COMPONENTS.has(m[1])) out.push(`미허용 컴포넌트 <${m[1]}>`);
  }
  return out;
}

const compileBody = (body: string) =>
  compile(body, { remarkPlugins: [remarkGfm] });

describe("content guardrail — 실제 콘텐츠(R1·R2)", () => {
  it("검사할 콘텐츠가 1개 이상 발견된다(가드레일 무력화 방지)", () => {
    // it.each([])는 0개 테스트를 등록해 공허하게 통과한다 — 글롭/경로가 깨져
    // 본문을 하나도 못 찾으면 가드레일이 조용히 no-op이 되는 걸 막는다.
    expect(slugsFromDisk.length).toBeGreaterThan(0);
  });

  it.each(slugsFromDisk)("'%s' 본문에 금지 패턴이 없다", (slug) => {
    const { content } = getProjectContent(slug);
    expect(findViolations(content)).toEqual([]);
  });

  it.each(slugsFromDisk)("'%s' 본문이 MDX로 컴파일된다", async (slug) => {
    const { content } = getProjectContent(slug);
    await expect(compileBody(content)).resolves.toBeTruthy();
  });
});

describe("content guardrail — 위반 검출 증명(R1)", () => {
  const violators: [label: string, body: string][] = [
    ["import 문", "import x from 'y'\n\n본문"],
    ["export 문", "export const a = 1\n\n본문"],
    ["위험 raw HTML <script>", "본문\n\n<script>alert(1)</script>"],
    ["위험 raw HTML <iframe>", '본문\n\n<iframe src="//evil"></iframe>'],
    ["이벤트 핸들러 속성(on*=)", '본문\n\n<img src="x" onerror="alert(1)">'],
    ["style= 속성", '본문\n\n<Callout type="note" style="color:red">x</Callout>'],
    ["className= 속성", '본문\n\n<Chip className="x">태그</Chip>'],
    ["JSX 표현식(={)", "본문\n\n<Callout type={kind}>x</Callout>"],
    ["미허용 컴포넌트 <Foo>", "본문\n\n<Foo>임의 컴포넌트</Foo>"],
  ];

  it.each(violators)("위반(%s)을 잡는다", (label, body) => {
    expect(findViolations(body)).toContain(label);
  });

  it("펜스 코드블럭 안의 코드는 위반이 아니다(오탐 방지)", () => {
    const body = "본문\n\n```ts\nimport x from 'y'\nconst el = <Foo bar={1} />\n```";
    expect(findViolations(body)).toEqual([]);
  });

  it("인라인 코드 안의 태그는 위반이 아니다(오탐 방지)", () => {
    expect(findViolations("`<Foo>`를 설명하는 산문")).toEqual([]);
  });
});

describe("content guardrail — 깨진 본문 검출 증명(R2)", () => {
  it("닫히지 않은 JSX 태그는 컴파일에 실패한다", async () => {
    await expect(compileBody("## 제목\n\n<Callout type=\"note\">닫지 않음")).rejects.toThrow();
  });
});
