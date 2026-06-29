import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getProjectSlugs, getProjectContent, getProjectBySlug, type ProjectMeta } from "@/entities/project";
import { mdxComponents } from "@/shared/ui/mdx";
import { extractHeadings } from "@/shared/lib/extractHeadings";
import { TableOfContents } from "@/widgets/toc";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
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
  return (
    <main className="relative z-1 mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/#projects"
        className="mb-10 inline-block font-mono text-sm text-muted transition-colors hover:text-head"
      >
        ← Projects
      </Link>

      {/*
        제목만 chrome가 제공하고, 그 아래 헤드라인 칩·요약표(PAAR)·콜아웃·본문·딥다이브는
        MDX가 5층 골격(case-study-structure.md §4)으로 소유한다. 역할·스택·신뢰 고지는
        글의 메타 줄에 녹는다 — chrome가 따로 strip으로 중복 렌더하지 않는다.
      */}
      <h1 className="mb-4 text-3xl font-extrabold leading-tight text-head">{meta.title}</h1>

      <TableOfContents headings={headings} />

      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
      />
    </main>
  );
}
