import { getProfile } from "@/content";

export function Hero() {
  const p = getProfile();
  const snapshotLine = `${p.snapshot.years}년차 · ${p.snapshot.domains.join(" · ")} · ${p.snapshot.headline}`;

  return (
    <section className="scroll-mt-24 py-24">
      <p className="font-mono text-sm text-accent">{p.eyebrow}</p>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-head">
        {p.name}
      </h1>
      <p className="mt-2 text-xl text-body">{p.role}</p>
      <p className="mt-4 max-w-xl text-body">{p.tagline}</p>
      <p className="mt-3 font-mono text-xs text-muted">{snapshotLine}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={p.resumePdf}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
        >
          이력서 PDF ↓
        </a>
        <a
          href="#contact"
          className="rounded border border-line px-4 py-2 font-mono text-sm text-muted transition-colors hover:text-head"
        >
          연락하기
        </a>
        <a
          href={p.links.github}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-line px-4 py-2 font-mono text-sm text-muted transition-colors hover:text-head"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
