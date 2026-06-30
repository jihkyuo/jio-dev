"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

// rehype-pretty-code가 생성한 <pre>(shiki span 토큰)를 글래스 컨테이너로 감싸고
// 복사 버튼을 얹는다. 복사 원본은 pre의 textContent(=토큰 원문)에서 읽는다.
export function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [copied, setCopied] = useState(false);

  // 언마운트(2초 내 라우트 이동 등) 시 대기 중인 리셋 타이머 정리.
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copy() {
    const text = ref.current?.textContent ?? "";
    try {
      // clipboard 미지원(비보안 컨텍스트)·권한 거부 시 throw → 성공 표시하지 않는다.
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="cs-codeblock mb-4">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "복사됨" : "코드 복사"}
        data-copied={copied || undefined}
        className="cs-codeblock-copy no-print"
      >
        {copied ? (
          // 복사됨: 체크
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          // 기본: 클립보드
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      <pre ref={ref} {...props} />
    </div>
  );
}
