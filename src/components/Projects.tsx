import { projects } from "@/data/projects";

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight">프로젝트</h2>
      <ul className="mt-8 flex flex-col gap-6">
        {projects.map((project) => {
          const card = (
            <article className="rounded-xl border border-black/10 p-6 transition-colors hover:border-black/25 dark:border-white/10 dark:hover:border-white/25">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-medium">{project.title}</h3>
                <span className="shrink-0 font-mono text-sm text-foreground/50">
                  {project.period}
                </span>
              </div>
              <p className="mt-2 text-foreground/75">{project.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-foreground/5 px-3 py-1 font-mono text-xs text-foreground/70"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          );

          return (
            <li key={project.slug}>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  {card}
                </a>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
