import { siteConfig } from "@/config/site";

const NAV = [
  { href: "#about", label: "소개" },
  { href: "#projects", label: "프로젝트" },
  { href: "#contact", label: "연락처" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-background/80 backdrop-blur dark:border-white/10">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono text-sm font-medium">
          {siteConfig.name}
        </a>
        <ul className="flex gap-5 text-sm text-foreground/70">
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
