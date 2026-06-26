import { getExperience } from "@/content";

export function Experience() {
  const entries = getExperience();
  return (
    <section id="experience" className="scroll-mt-24 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Experience
      </p>
      <hr className="mt-2 mb-8 border-line" />
      <div className="space-y-12">
        {entries.map((e) => (
          <div
            key={`${e.company}-${e.period.start}`}
            className="border-l-2 border-transparent pl-4 hover:border-accent"
          >
            <p className="font-mono text-xs text-muted">
              {e.period.start} — {e.period.end}
            </p>
            <h3 className="mt-1 text-base font-semibold text-head">
              {e.company} — {e.role}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              팀 {e.teamSize} · {e.scope}
            </p>
            <ul className="mt-3 space-y-1">
              {e.impact.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-body">
                  <span className="mt-0.5 shrink-0 text-accent">▹</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {e.leadership.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {e.leadership.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-muted">
                    <span className="mt-0.5 shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {e.stack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
