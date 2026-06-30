"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { computePreviewPosition } from "@/shared/lib/previewPosition";

type Preview = { title: string; impact: string; stack: string[]; period: string };

type Props = {
  href: string;
  className: string;
  icon: ReactNode;
  preview: Preview;
  children: ReactNode;
};

const OPEN_DELAY = 100;
const CLOSE_DELAY = 150;

const HOVER_MQ = "(hover: hover) and (pointer: fine)";
const noopSubscribe = () => () => {};
// 클라이언트에서만 true: 포털 마운트 게이트(SSR snapshot=false라 hydration mismatch 없음).
const useClientReady = () => useSyncExternalStore(noopSubscribe, () => true, () => false);
// 포인터 종류(데스크톱 hover 가능 여부). 서버 snapshot=false(터치 가정).
const useCanHover = () =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(HOVER_MQ);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(HOVER_MQ).matches,
    () => false,
  );

export function ArticlePreviewLink({ href, className, icon, preview, children }: Props) {
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 카드가 뜰 기준점(뷰포트 좌표). hover=마우스 위치, focus=링크 첫 줄, touch=탭 위치.
  const anchorRef = useRef({ x: 0, y: 0 });

  const mounted = useClientReady();
  const canHover = useCanHover();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  // 위치 계산은 순수 함수(previewPosition)에 위임 — 단위 테스트로 엣지(flip·clamp) 커버.
  // 크기는 offsetWidth/Height로: 등장 애니메이션의 transform(scale)이 getBoundingClientRect를 왜곡하는 걸 피한다.
  const place = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    setPos(
      computePreviewPosition(
        anchorRef.current,
        { width: card.offsetWidth, height: card.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
      ),
    );
  }, []);

  // 카드가 portal로 마운트된 뒤 실측해 위치 확정(첫 프레임 점프 방지).
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTimers();
        setOpen(false);
        // 포커스를 트리거로 되돌리지 않는다: hover로 열린 카드에서 focus()가 onFocus를 다시 발화시켜
        // 카드가 곧장 재오픈되는 버그(한 번 더 Esc를 눌러야 닫힘). 키보드로 연 경우엔 이미 포커스라 불필요.
      }
    };
    // 앵커가 마우스/탭 위치에 고정돼 있어, 스크롤·리사이즈 시엔 따라가기보다 닫는다(일시적 카드).
    const onDismiss = () => {
      clearTimers();
      setOpen(false);
    };
    // 단, 카드 내부 스크롤(overflow-y, 뷰포트보다 큰 카드)은 닫지 않는다 — 페이지 스크롤만 dismiss.
    const onScroll = (e: Event) => {
      if (cardRef.current?.contains(e.target as Node)) return;
      onDismiss();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onDismiss);
    // 터치: 트리거·카드 바깥 탭하면 닫기.
    const onOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || cardRef.current?.contains(target)) return;
      setOpen(false);
    };
    if (!canHover) document.addEventListener("pointerdown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onDismiss);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open, canHover, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const scheduleOpen = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  const triggerHandlers = canHover
    ? {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType === "mouse") {
            anchorRef.current = { x: e.clientX, y: e.clientY };
            scheduleOpen();
          }
        },
        onPointerMove: (e: React.PointerEvent) => {
          // 열리기 전(대기 중)엔 앵커를 커서로 갱신 → 커서가 멈춘 위치에 뜬다. 열린 뒤엔 따라가지 않음.
          if (!open && e.pointerType === "mouse") anchorRef.current = { x: e.clientX, y: e.clientY };
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType === "mouse") scheduleClose();
        },
        onFocus: () => {
          // 키보드: 마우스 좌표가 없으니 링크 첫 줄 박스를 앵커로.
          const r = triggerRef.current?.getClientRects()[0] ?? triggerRef.current?.getBoundingClientRect();
          if (r) anchorRef.current = { x: r.left, y: r.bottom };
          clearTimers();
          setOpen(true);
        },
        onBlur: (e: React.FocusEvent) => {
          if (!cardRef.current?.contains(e.relatedTarget as Node)) scheduleClose();
        },
      }
    : {
        onClick: (e: React.MouseEvent) => {
          // 키보드 Enter는 synthetic click(detail 0) — 카드 안 열고 그대로 내비게이션(터치 탭만 2단계).
          if (e.detail === 0) return;
          if (!open) {
            e.preventDefault();
            anchorRef.current = { x: e.clientX, y: e.clientY };
            clearTimers();
            setOpen(true);
          }
        },
      };

  return (
    <>
      <Link
        ref={triggerRef}
        href={href}
        className={className}
        aria-expanded={open}
        {...triggerHandlers}
      >
        {icon}
        {children}
      </Link>
      {mounted &&
        open &&
        createPortal(
          <Link
            ref={cardRef}
            href={href}
            aria-label={preview.title}
            className="cs-preview no-print"
            style={{ top: pos.top, left: pos.left }}
            onPointerEnter={canHover ? clearTimers : undefined}
            onPointerLeave={canHover ? scheduleClose : undefined}
          >
            <span className="cs-preview-kicker">다른 글</span>
            <span className="cs-preview-title">{preview.title}</span>
            <span className="cs-preview-impact">{preview.impact}</span>
            {preview.stack.length > 0 && (
              <span className="cs-preview-stack">
                {preview.stack.slice(0, 4).map((s) => (
                  <span key={s} className="cs-preview-pill">
                    {s}
                  </span>
                ))}
              </span>
            )}
            <span className="cs-preview-meta">
              <span>{preview.period}</span>
              <span className="cs-preview-cta">보기 →</span>
            </span>
          </Link>,
          document.body,
        )}
    </>
  );
}
