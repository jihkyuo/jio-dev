import type { TocHeading } from "@/shared/lib/extractHeadings";
import { TocSidebar } from "./TocSidebar";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (headings.length === 0) return null;

  return (
    <>
      {/* 좁은 화면: 글 초입 접이식 인라인 목차 */}
      <details
        open
        className="no-print mb-10 rounded-lg border border-line bg-card px-5 py-4 xl:hidden"
      >
        <summary className="cursor-pointer font-mono text-sm font-semibold text-head">
          목차
        </summary>
        <ul className="mt-3 space-y-2 font-mono text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a href={`#${h.id}`} className="text-muted hover:text-body">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </details>

      {/* xl+: 좌측 여백 sticky 사이드(본문 중앙 정렬 유지, fixed로 흐름 이탈) */}
      <aside className="no-print fixed top-24 left-[max(1.5rem,calc(50%-34rem))] hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block">
        <TocSidebar headings={headings} />
      </aside>
    </>
  );
}
