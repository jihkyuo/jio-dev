"use client";

import { useState } from "react";

export function HeadingAnchor({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <a
      href={`#${id}`}
      onClick={copy}
      aria-label="이 섹션 링크 복사"
      className="no-print ml-2 align-middle font-mono text-sm text-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
    >
      {copied ? "복사됨" : "#"}
    </a>
  );
}
