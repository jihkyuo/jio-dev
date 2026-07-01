import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { getProjectSlugs, getProjectContent, getProjectBySlug, type ProjectMeta } from "@/entities/project";
import { mdxComponents } from "@/shared/ui/mdx";
import { References, Reference } from "@/shared/ui/References";
import { extractHeadings } from "@/shared/lib/extractHeadings";
import { mergeReferences } from "@/shared/lib/mergeReferences";
import { splitLeadSummaryBody } from "@/shared/lib/splitLeadAndBody";
import { rehypeUnwrapImages } from "@/shared/lib/rehypeUnwrapImages";
import { TableOfContents } from "@/widgets/toc";
import { BackLink } from "./BackLink";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

// 제목을 titleHighlight 기준으로 [앞·핵심구·뒤] 형제 span으로 쪼갠다.
// 핵심구는 스윕 하이라이트(.cs-title-hl), 나머지는 기존 그라데(.cs-title-g).
// 형제 구조라 부모 clip 중첩이 없어 글자 가장자리 프린징이 생기지 않는다.
// titleHighlight가 없거나 title에서 못 찾으면 통째로 그라데 한 조각(현 동작과 동일).
function renderTitle(title: string, highlight?: string) {
  const at = highlight ? title.indexOf(highlight) : -1;
  if (at === -1) return <span className="cs-title-g">{title}</span>;
  const before = title.slice(0, at);
  const after = title.slice(at + highlight!.length);
  return (
    <>
      {before && <span className="cs-title-g">{before}</span>}
      <span className="cs-title-hl">{highlight}</span>
      {after && <span className="cs-title-g">{after}</span>}
    </>
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getProjectBySlug(slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: { title: meta.title, description: meta.summary, type: "article" },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data: { meta: ProjectMeta; content: string };
  try {
    data = getProjectContent(slug);
  } catch {
    return notFound();
  }
  const { meta, content } = data;
  const headings = extractHeadings(content);
  // 본문 외부 링크를 자동 레퍼런스로. frontmatter references와 url로 병합해
  // title/description을 보강한다(없으면 링크 텍스트가 title).
  const references = mergeReferences(content, meta.references);
  // 도입 훅(칩·도입 단락)·요약표·본문(핵심원인~)을 첫 두 h2에서 갈라 요약표 "뒤"에 목차를 끼운다.
  // 모바일 인라인 목차(xl:hidden)가 요약표 앞을 막던 문제를 없앤다 — 5초 스캔 페이로드(요약표)가
  // 목차보다 먼저 온다. 데스크톱 목차는 fixed 사이드바라 주입 위치와 무관.
  // 단일 MDX 패스를 유지하려고 둘로 쪼개 렌더하지 않고 <Toc/> 컴포넌트를 주입한다 —
  // 그래야 rehype-slug 헤딩 id·각주·참조링크가 문서 전체 범위로 일관되게 해석된다.
  const { lead, summary, body } = splitLeadSummaryBody(content);
  const source = headings.length === 0 ? content : `${(lead + summary).trimEnd()}\n\n<Toc />\n\n${body}`;
  const components = { ...mdxComponents, Toc: () => <TableOfContents headings={headings} /> };
  const mdxOptions: MDXRemoteProps["options"] = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeUnwrapImages, rehypeSlug, [rehypePrettyCode, { theme: "one-dark-pro" }]],
    },
  };
  return (
    <main className="relative z-1 mx-auto max-w-2xl px-6 py-16">
      <BackLink />

      {/*
        제목만 chrome가 제공하고, 그 아래 헤드라인 칩·요약표(PAAR)·콜아웃·본문·딥다이브는
        MDX가 5층 골격(case-study-structure.md §4)으로 소유한다. 역할·스택·신뢰 고지는
        글의 메타 줄에 녹는다 — chrome가 따로 strip으로 중복 렌더하지 않는다.
      */}
      <h1 className="cs-title mb-3 text-[clamp(1.75rem,5vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.02em]">{renderTitle(meta.title, meta.titleHighlight)}</h1>

      {/*
        impact 아웃컴 deck — 0초 스캐너가 제목(토픽) 다음 결과 verdict를 바로 잡게 한다.
        의도적으로 눈에 띄게: 카드의 작은 mono 캡션 스타일을 따르지 않고, H1 아래 부제(dek)답게
        크고 읽기 좋은 한 줄로 둔다(작게 두면 어필 장치가 어필을 못 한다). 크기가 H1에 종속돼
        위계는 유지. PAAR의 R행은 5초 방어가능 디테일(Before→After), deck는 압축 결론 —
        역피라미드라 해상도가 다르지 같은 문장 재탕이 아니다.
      */}
      <p className="mb-8 text-lg font-medium leading-snug text-accent sm:text-xl">{meta.impact}</p>

      {/* 도입 훅(칩·도입 단락) → 요약표 → 목차(<Toc/> 주입) → 본문(핵심원인~). */}
      <MDXRemote source={source} components={components} options={mdxOptions} />

      {references.length > 0 && (
        <References>
          {references.map((r) => (
            <Reference key={r.url} href={r.url} title={r.title}>
              {r.description}
            </Reference>
          ))}
        </References>
      )}
    </main>
  );
}
