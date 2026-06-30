import type { TocHeading } from "@/shared/lib/extractHeadings";
import { TocSidebar } from "./TocSidebar";
import { groupHeadings } from "../lib/groupHeadings";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  // h3만 있는 글(h2 없음)은 groupHeadings가 빈 배열 → 빈 카드 껍데기 방지.
  const sections = groupHeadings(headings);
  if (sections.length === 0) return null;

  return (
    <>
      {/* 좁은 화면: 카드 밖 '목차' 헤더(.cs-h2 = 본문 h2와 동일 바·크기) + 글래스 카드 인덱스 */}
      <nav aria-label="목차" className="no-print mb-10 xl:hidden">
        <p className="cs-h2 mb-4 text-2xl font-bold tracking-[-0.02em] text-head">목차</p>
        <div className="cs-toc rounded-2xl px-6 py-5">
          <ul>
            {sections.map((s, i) => {
              const hasChildren = s.children.length > 0;
              const divider = i < sections.length - 1;
              return (
                <li key={s.heading.id}>
                  <a
                    href={`#${s.heading.id}`}
                    className={
                      (i === 0 ? "pb-2.5 pt-0.5" : "py-2.5") +
                      " block text-[16.5px] font-semibold tracking-[-0.01em] text-body transition-colors hover:text-accent" +
                      (divider ? " border-b border-white/8" : "")
                    }
                  >
                    {s.heading.text}
                  </a>
                  {hasChildren && (
                    <ul className="mt-2 mb-3 ml-0.5 flex flex-col gap-2.5 border-l border-accent/20 pl-4">
                      {s.children.map((c) => (
                        <li key={c.id}>
                          <a
                            href={`#${c.id}`}
                            className="block text-sm leading-snug text-muted transition-colors hover:text-accent"
                          >
                            {c.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* xl+: 좌측 여백 sticky 사이드(본문 중앙 정렬 유지, fixed로 흐름 이탈) */}
      <aside className="no-print fixed top-24 left-[min(calc(50%+23rem),calc(100vw-14rem))] hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block">
        <TocSidebar headings={headings} />
      </aside>
    </>
  );
}
