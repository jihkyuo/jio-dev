import { getSkills } from "@/content";

const GROUPS: { label: string; key: "core" | "comfortable" | "production" }[] =
  [
    { label: "Core", key: "core" },
    { label: "Comfortable", key: "comfortable" },
    { label: "Production", key: "production" },
  ];

export function Skills() {
  const skills = getSkills();
  return (
    <section id="skills" className="scroll-mt-24 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Stack
      </p>
      <hr className="mt-2 mb-8 border-line" />
      <div className="space-y-6">
        {GROUPS.map(({ label, key }) => (
          <div key={key}>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">
              {label}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills[key].map((tag) => (
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
