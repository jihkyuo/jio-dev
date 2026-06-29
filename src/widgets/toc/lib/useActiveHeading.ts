"use client";

import { useEffect, useState } from "react";

/**
 * 스크롤 위치 기반 활성 헤딩 추적.
 * 뷰포트 상단 30% 선(probe)을 마지막으로 지난 헤딩을 활성으로 본다.
 * - 긴 인트로: 다음 헤딩이 probe를 넘기 전까지 부모가 유지됨.
 * - 최상단: probe 위에 아무것도 없으면 첫 항목으로 폴백.
 */
export function useActiveHeading(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const probe = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute(); // 초기 1회
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return activeId;
}
