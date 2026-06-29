import type { TocHeading } from "@/shared/lib/extractHeadings";

export type TocSection = { heading: TocHeading; children: TocHeading[] };

/** 평탄한 헤딩 목록을 h2 섹션 + 그 아래 h3 자식으로 묶는다. h2 이전 h3는 버린다. */
export function groupHeadings(headings: TocHeading[]): TocSection[] {
  const sections: TocSection[] = [];
  for (const h of headings) {
    if (h.level === 2) sections.push({ heading: h, children: [] });
    else if (sections.length > 0) sections[sections.length - 1].children.push(h);
  }
  return sections;
}

/** activeId(= h2 자신이거나 어떤 h2의 자식)를 소유한 h2 id를 찾는다. */
export function findOwnerId(sections: TocSection[], activeId: string): string | null {
  for (const s of sections) {
    if (s.heading.id === activeId) return s.heading.id;
    if (s.children.some((c) => c.id === activeId)) return s.heading.id;
  }
  return null;
}
