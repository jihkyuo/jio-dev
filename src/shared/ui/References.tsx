import type { ReactNode } from "react";

// MDX 콘텐츠는 런타임 데이터라 잘못된 URL이 들어올 수 있다.
// 도메인 도출 실패 시 빈 문자열로 폴백해 렌더를 깨뜨리지 않는다.
function hostnameOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function References({ children }: { children: ReactNode }) {
  return (
    <section className="mt-12 mb-8">
      <h2 className="cs-h2 mb-4 text-2xl font-bold text-head">레퍼런스</h2>
      <div className="cs-refs flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function Reference({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children?: ReactNode;
}) {
  const host = hostnameOf(href);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cs-ref group flex items-start gap-4 rounded-2xl px-5 py-4 no-underline"
    >
      <span className="cs-ref-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        {host ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
            alt=""
            width={18}
            height={18}
          />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1 font-semibold text-head">
          {title}
          <span aria-hidden className="cs-ref-arrow">
            ↗
          </span>
        </span>
        {children ? <span className="text-sm leading-relaxed text-body">{children}</span> : null}
        {host ? <span className="font-mono text-xs text-muted">{host}</span> : null}
      </span>
    </a>
  );
}
