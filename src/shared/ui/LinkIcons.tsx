// 링크 표식 아이콘(decorative) — 인라인 링크(mdx)와 레퍼런스 카드가 공유한다.
// 크기·색·여백·hover는 사용처의 className이 정한다.
type IconProps = { className?: string };

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// 외부 사이트(새 탭) — 박스 밖으로 나가는 화살표.
export const ExternalLinkIcon = ({ className }: IconProps) => (
  <svg aria-hidden className={className} {...svgProps}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// 같은 사이트 다른 글(새 탭) — 문서.
export const ArticleIcon = ({ className }: IconProps) => (
  <svg aria-hidden className={className} {...svgProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="9" y2="13" />
    <line x1="16" y1="17" x2="9" y2="17" />
  </svg>
);

// 글 내부 앵커(같은 탭) — 체인.
export const AnchorIcon = ({ className }: IconProps) => (
  <svg aria-hidden className={className} {...svgProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
