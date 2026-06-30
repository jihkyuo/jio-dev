import type { ReactNode } from "react";
import { ExternalLinkIcon } from "@/shared/ui/LinkIcons";

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
  return <div className="cs-refs mb-8 flex flex-col gap-3">{children}</div>;
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
          <ExternalLinkIcon className="cs-ref-arrow" />
        </span>
        {children ? <span className="text-sm leading-relaxed text-body">{children}</span> : null}
        {host ? <span className="font-mono text-xs text-muted">{host}</span> : null}
      </span>
    </a>
  );
}
