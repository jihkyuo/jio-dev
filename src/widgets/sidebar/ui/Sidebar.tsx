import { getProfile } from "@/entities/profile";
import { RailNav } from "./RailNav";

/**
 * 좌측 고정 레일(Blueprint). 도트 그리드 배경 + 틱 번호 nav로 흔한
 * 사이드바 클론에서 벗어난다. 데스크탑에서 sticky, 모바일에서 콘텐츠 위로 쌓인다.
 */
export function Sidebar() {
  const p = getProfile();
  const snapshot = `${p.snapshot.years}년차 · ${p.snapshot.domains.join(" · ")}`;

  return (
    <header className="rail-grid flex flex-col justify-between border-b border-line px-6 py-12 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-10 lg:py-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {p.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-head">
          {p.name}
        </h1>
        <p className="mt-2 text-lg text-head/90">{p.role}</p>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-body">
          {p.tagline}
        </p>
        <p className="mt-3 font-mono text-xs text-muted">{snapshot}</p>

        <RailNav />
      </div>

      <div className="mt-10">
        <a
          href={p.resumePdf}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
        >
          이력서 PDF ↓
        </a>
        <div className="mt-6 flex gap-4 font-mono text-xs text-muted">
          <a
            href={p.links.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <a
            href={p.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${p.links.email}`}
            className="transition-colors hover:text-accent"
          >
            Email
          </a>
        </div>
      </div>
    </header>
  );
}
