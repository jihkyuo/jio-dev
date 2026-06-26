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
};
