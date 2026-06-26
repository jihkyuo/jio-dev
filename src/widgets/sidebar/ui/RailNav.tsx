"use client";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#about", label: "About", n: "01" },
  { href: "#experience", label: "Experience", n: "02" },
  { href: "#projects", label: "Projects", n: "03" },
  { href: "#skills", label: "Skills", n: "04" },
  { href: "#contact", label: "Contact", n: "05" },
];

export function RailNav() {
  const [active, setActive] = useState<string>("about");
  useEffect(() => {
    const ids = NAV.map((i) => i.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="mt-10 max-w-xs">
      <ul className="font-mono text-sm">
        {NAV.map((item) => {
          const on = active === item.href.slice(1);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={on ? "true" : undefined}
                className={`flex items-center justify-between border-t border-line py-3 transition-colors ${
                  on ? "text-head" : "text-muted hover:text-head"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-px transition-all ${on ? "w-5 bg-accent" : "w-0 bg-transparent"}`}
                  />
                  {item.label}
                </span>
                <span className={on ? "text-xs text-accent" : "text-xs text-accent/70"}>
                  {item.n}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
