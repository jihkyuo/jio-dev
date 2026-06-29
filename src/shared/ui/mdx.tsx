import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { Callout } from "@/shared/ui/Callout";
import { HeadingAnchor } from "@/shared/ui/HeadingAnchor";

type Components = NonNullable<MDXRemoteProps["components"]>;

export const mdxComponents: Components = {
  Callout,
  h2: ({ id, children }) => (
    <h2 id={id} className="group mt-12 mb-4 scroll-mt-24 border-t border-line pt-8 text-2xl font-bold text-head">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3 id={id} className="group mt-8 mb-3 scroll-mt-24 text-xl font-semibold text-head [h2+&]:mt-4">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h3>
  ),
  h4: ({ id, children }) => (
    <h4 id={id} className="group mt-6 mb-2 scroll-mt-24 text-base font-semibold text-head">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-[1.0625rem] leading-[1.75] text-body">{children}</p>
  ),
  // 헤드라인 칩(도메인 grounding)·메타 줄(역할·스택·신뢰 고지) = case-study-structure §4 ①·② 요소.
  // 소문자 <p className="chip">는 MDX가 raw HTML 블록으로 흘려보내 매핑을 안 타므로,
  // 대문자 커스텀 컴포넌트로 받아 시각 위계를 보장한다.
  Chip: ({ children }) => (
    <p className="mb-4 inline-block rounded-full border border-line bg-card px-3 py-1.5 font-mono text-sm leading-5 text-body">
      {children}
    </p>
  ),
  Meta: ({ children }) => (
    <p className="mb-10 font-mono text-sm leading-relaxed text-body">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 space-y-1">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 text-body">
      <span className="mt-0.5 shrink-0 text-accent">▹</span>
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline underline-offset-2"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-head">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-body">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded bg-card p-4 font-mono text-sm text-body">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-8 rounded-lg border-l-4 border-accent bg-card px-5 py-4 text-body [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  // PAAR 요약표는 헤더가 비어 있고 첫 열이 라벨(문제·대안·실행·결과)이다.
  // 빈 헤더 셀은 empty:hidden으로 접고, 첫 열은 모노로 라벨답게 구분한다.
  th: ({ children }) => (
    <th className="border border-line bg-card px-4 py-2 text-left align-top font-mono text-xs text-body empty:hidden">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-line px-4 py-3 align-top leading-relaxed text-body first:whitespace-nowrap first:font-mono first:text-head">
      {children}
    </td>
  ),
};
