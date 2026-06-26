import { getProfile } from "@/content";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const p = getProfile();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono text-sm font-medium text-head">
          {p.name}
        </a>
        <ul className="flex items-center gap-5 font-mono text-xs uppercase tracking-wide text-muted">
          {NAV.map((i) => (
            <li key={i.href}>
              <a href={i.href} className="transition-colors hover:text-head">
                {i.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={p.resumePdf}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-accent px-3 py-1 text-accent transition-colors hover:bg-accent/10"
            >
              이력서 PDF
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
