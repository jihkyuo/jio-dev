import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { Callout } from "@/shared/ui/Callout";
import { Hl } from "@/shared/ui/Hl";
import { References, Reference } from "@/shared/ui/References";
import { HeadingAnchor } from "@/shared/ui/HeadingAnchor";

type Components = NonNullable<MDXRemoteProps["components"]>;

export const mdxComponents: Components = {
  Callout,
  Hl,
  References,
  Reference,
  h2: ({ id, children }) => (
    <h2 id={id} className="cs-h2 group mt-12 mb-4 scroll-mt-24 text-2xl font-bold tracking-[-0.02em] text-head">
      {children}
      {id && <HeadingAnchor id={id} />}
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3 id={id} className="group mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-[-0.02em] text-head [h2+&]:mt-4">
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
    <p className="mb-6.5 text-[1.0625rem] leading-[1.75] text-body">{children}</p>
  ),
  // 헤드라인 칩(도메인 grounding)·메타 줄(역할·스택·신뢰 고지) = case-study-structure §4 ①·② 요소.
  // 소문자 <p className="chip">는 MDX가 raw HTML 블록으로 흘려보내 매핑을 안 타므로,
  // 대문자 커스텀 컴포넌트로 받아 시각 위계를 보장한다.
  Chip: ({ children }) => (
    <p className="cs-chip mb-4 inline-block rounded-full px-3 py-1.5 font-mono text-sm leading-5">
      {children}
    </p>
  ),
  Meta: ({ children }) => (
    <p className="mb-10 font-mono text-sm leading-relaxed text-body">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 space-y-2">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 text-[1.0625rem] leading-[1.75] text-body">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent">▹</span>
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline underline-offset-2 visited:text-accent/70"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-head">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="cs-code rounded px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded bg-card p-4 font-mono text-sm text-body">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="cs-blockquote mb-8 rounded-2xl px-5 py-4 text-head [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="cs-table-wrap mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  // 표 시각(빈 헤더 숨김·첫 열 모노 강조 포함)은 globals.css .cs-table-wrap 자손 규칙이 담당.
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
};
