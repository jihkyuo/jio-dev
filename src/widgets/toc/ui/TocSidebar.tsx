"use client";

import { useMemo } from "react";
import type { TocHeading } from "@/shared/lib/extractHeadings";
import { groupHeadings, findOwnerId } from "../lib/groupHeadings";
import { useActiveHeading } from "../lib/useActiveHeading";

export function TocSidebar({ headings }: { headings: TocHeading[] }) {
  const sections = useMemo(() => groupHeadings(headings), [headings]);
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useActiveHeading(ids);
  const ownerId = findOwnerId(sections, activeId);

  return (
    <nav aria-label="목차" className="font-mono text-sm">
      <p className="mb-4 pl-1 text-xs uppercase tracking-wide text-muted">목차</p>
      <ul>
        {sections.map((s) => {
          const isOwner = s.heading.id === ownerId;
          const hasChildren = s.children.length > 0;
          const expanded = isOwner && hasChildren;
          return (
            <li
              key={s.heading.id}
              className={"transition-opacity duration-300 " + (isOwner ? "opacity-100" : "opacity-70")}
            >
              <a
                href={`#${s.heading.id}`}
                aria-current={activeId === s.heading.id ? "location" : undefined}
                className={
                  "flex items-start gap-2 border-l-2 pl-2.5 py-1.5 leading-snug transition-colors " +
                  (isOwner ? "border-accent text-head" : "border-transparent text-body hover:text-head")
                }
              >
                {hasChildren ? (
                  <svg
                    viewBox="0 0 8 10"
                    aria-hidden
                    className={
                      "mt-1.5 h-2.5 w-2 flex-none transition-transform duration-300 " +
                      (expanded ? "rotate-90 text-accent" : "text-muted")
                    }
                  >
                    <path d="M0 0l8 5-8 5z" fill="currentColor" />
                  </svg>
                ) : (
                  <span className="mt-1.5 h-2.5 w-2 flex-none" aria-hidden />
                )}
                <span className="flex-1">{s.heading.text}</span>
              </a>

              {hasChildren && (
                <div
                  inert={!expanded ? true : undefined}
                  className={
                    "grid overflow-hidden pl-[18px] transition-[grid-template-rows] duration-300 ease-out " +
                    (expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr] pointer-events-none")
                  }
                >
                  <ul className="min-h-0">
                    {s.children.map((c) => {
                      const active = activeId === c.id;
                      return (
                        <li key={c.id}>
                          <a
                            href={`#${c.id}`}
                            aria-current={active ? "location" : undefined}
                            className={
                              "block border-l py-1.5 pl-[10px] text-[12.8px] leading-snug transition-colors " +
                              (active ? "border-accent text-head" : "border-line text-body hover:text-head")
                            }
                          >
                            {c.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
