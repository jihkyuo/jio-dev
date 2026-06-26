import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getProjectSlugs, getProjectContent, getProjectBySlug, type ProjectMeta } from "@/content";
import { mdxComponents } from "@/shared/ui/mdx";

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
  return (
    <main className="relative z-1 mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/#projects"
        className="mb-10 inline-block font-mono text-sm text-muted transition-colors hover:text-head"
      >
        ← Projects
      </Link>

      <h1 className="mb-3 text-3xl font-extrabold text-head">{meta.title}</h1>
      <p className="mb-8 leading-relaxed text-body">{meta.summary}</p>

      {/* TL;DR strip */}
      <div className="mb-10 rounded-xl border border-line bg-card p-5">
        <p className="mb-3 font-mono text-2xl font-bold text-accent">{meta.impact}</p>
        <p className="mb-4 font-mono text-xs text-muted">
          역할 {meta.role} · {meta.period} · 팀 {meta.teamSize} · {meta.stack.join(" · ")}
        </p>
        {(meta.links.live || meta.links.repo) && (
          <div className="flex gap-4">
            {meta.links.live && (
              <a
                href={meta.links.live}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-accent underline underline-offset-2"
              >
                Live ↗
              </a>
            )}
            {meta.links.repo && (
              <a
                href={meta.links.repo}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-accent underline underline-offset-2"
              >
                Repo ↗
              </a>
            )}
          </div>
        )}
      </div>

      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </main>
  );
}
