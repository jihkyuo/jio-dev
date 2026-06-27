import type { MDXRemoteProps } from "next-mdx-remote/rsc";

type Components = NonNullable<MDXRemoteProps["components"]>;

export const mdxComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 border-t border-line pt-6 font-mono text-lg font-semibold text-head">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-3 font-mono text-base font-semibold text-accent">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-body">{children}</p>
  ),
  // 헤드라인 칩(도메인 grounding)·메타 줄(역할·스택·신뢰 고지) = case-study-structure §4 ①·② 요소.
  // 소문자 <p className="chip">는 MDX가 raw HTML 블록으로 흘려보내 매핑을 안 타므로,
  // 대문자 커스텀 컴포넌트로 받아 시각 위계를 보장한다.
  Chip: ({ children }) => (
    <p className="mb-6 inline-block rounded-full border border-line bg-card px-3 py-1 font-mono text-xs text-muted">
      {children}
    </p>
  ),
  Meta: ({ children }) => (
    <p className="mb-8 font-mono text-xs leading-relaxed text-muted">
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
    <blockquote className="mb-8 rounded-xl border-l-4 border-accent bg-card px-5 py-4 text-body [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-line bg-card px-3 py-2 text-left align-top font-mono text-xs text-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-line px-3 py-2 align-top leading-relaxed text-body">
      {children}
    </td>
  ),
};
