import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getProjectBySlug } from "@/entities/project";
import { ArticlePreviewLink } from "@/shared/ui/ArticlePreviewLink";
import { classifyHref } from "@/shared/lib/classifyHref";
import { Callout } from "@/shared/ui/Callout";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { Hl } from "@/shared/ui/Hl";
import { References, Reference } from "@/shared/ui/References";
import { HeadingAnchor } from "@/shared/ui/HeadingAnchor";

type Components = NonNullable<MDXRemoteProps["components"]>;

// 인라인 링크 타입별 표식 아이콘(decorative). 크기·여백·hover는 globals.css .cs-link-ic.
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// 외부 사이트(새 탭) — 박스 밖으로 나가는 화살표.
const ExternalIcon = () => (
  <svg aria-hidden className="cs-link-ic cs-link-ic--trail" {...iconProps}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// 같은 사이트 다른 글(새 탭) — 문서.
const ArticleIcon = () => (
  <svg aria-hidden className="cs-link-ic cs-link-ic--lead" {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="9" y2="13" />
    <line x1="16" y1="17" x2="9" y2="17" />
  </svg>
);

// 글 내부 앵커(같은 탭) — 체인.
const AnchorIcon = () => (
  <svg aria-hidden className="cs-link-ic cs-link-ic--lead" {...iconProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

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
  // 인라인 링크 3종 — href 접두로 분기.
  // 외부(http) = 박스화살표(뒤)·새 탭 / 같은 사이트 다른 글(/…) = 문서(앞)·새 탭 /
  // 글 내부 앵커(#…) = 체인(앞)·같은 탭(부드러운 스크롤).
  a: ({ href, children }) => {
    const h = href ?? "";
    const kind = classifyHref(href);
    const className = `cs-link cs-link--${kind} text-accent underline underline-offset-2 visited:text-accent/70`;
    // 같은 사이트 다른 글 = next/link 소프트 내비게이션(같은 탭). 문서 아이콘(앞).
    // 대상 글 메타가 있으면 hover 프리뷰 카드로 감싼다(추가 fetch 0 — frontmatter 재사용).
    if (kind === "internal") {
      const slug = h.replace(/^\/projects\//, "").split(/[#?]/)[0];
      const meta = getProjectBySlug(slug);
      if (meta) {
        return (
          <ArticlePreviewLink
            href={h}
            className={className}
            icon={<ArticleIcon />}
            preview={{ title: meta.title, impact: meta.impact, stack: meta.stack, period: meta.period }}
          >
            {children}
          </ArticlePreviewLink>
        );
      }
      return (
        <Link href={h} className={className}>
          <ArticleIcon />
          {children}
        </Link>
      );
    }
    // 외부(http) = 새 탭·박스화살표(뒤) / 글 내부 앵커(#) = 같은 탭·체인(앞).
    return (
      <a
        href={href}
        className={className}
        target={kind === "external" ? "_blank" : undefined}
        rel={kind === "external" ? "noopener noreferrer" : undefined}
      >
        {kind === "anchor" && <AnchorIcon />}
        {children}
        {kind === "external" && <ExternalIcon />}
      </a>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-head">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="cs-code rounded px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>
  ),
  pre: CodeBlock,
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
