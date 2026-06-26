"use client";

import { useEffect, useRef } from "react";

/**
 * 커서를 따라오는 저강도 배경 광원. 콘텐츠 뒤(z-0)에서 은은하게.
 * (pointer: fine) + reduced-motion 비활성 환경에서만 동작. 터치/모션최소화에서 미동작.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const okMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const forced = window.matchMedia("(forced-colors: active)").matches;
    if (!fine || !okMotion || forced) return;

    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(560px circle at var(--mx, 50%) var(--my, -20%), color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)",
      }}
    />
  );
}
