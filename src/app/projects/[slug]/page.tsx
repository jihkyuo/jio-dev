import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getProjectSlugs, getProjectContent } from "@/content";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data;
  try {
    data = getProjectContent(slug);
  } catch {
    notFound();
  }
  const { meta, content } = data!;
  return (
    <main>
      <h1>{meta.title}</h1>
      <MDXRemote
        source={content}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </main>
  );
}
