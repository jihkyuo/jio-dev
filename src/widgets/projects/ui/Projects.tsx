import Link from "next/link";
import { getProjects } from "@/entities/project";
import { renderHighlightedText } from "@/shared/ui/renderHighlightedText";

export function Projects() {
  const projects = getProjects();
  return (
    <section id="projects" className="scroll-mt-24 py-16">
      <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
        Selected Projects
      </h2>
      <hr className="mt-2 mb-8 border-line" />
      <div className="space-y-4">
        {projects.map((p) => (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="block">
            <article className="bg-card border border-line rounded-xl p-5 transition-colors hover:border-accent/50">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold text-head">
                  {renderHighlightedText(p.title, p.titleHighlight, { highlightClassName: "cs-title-hl" })}
                </h3>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {p.period}
                </span>
              </div>
              <p className="mt-2 font-mono text-sm text-accent">{p.impact}</p>
              <p className="mt-2 text-sm text-body">{p.summary}</p>
              <span className="mt-3 block text-sm text-accent">↗</span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
