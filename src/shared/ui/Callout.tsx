import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "decision";

const STYLES: Record<CalloutType, { mod: string; icon: string; label: string }> = {
  note:     { mod: "cs-note",     icon: "ℹ", label: "NOTE" },
  tip:      { mod: "cs-tip",      icon: "✦", label: "TIP" },
  warning:  { mod: "cs-warning",  icon: "▲", label: "WARNING" },
  decision: { mod: "cs-decision", icon: "◆", label: "DECISION" },
};

export function Callout({ type, children }: { type: string; children: ReactNode }) {
  // MDX 콘텐츠는 런타임 데이터라 잘못된 type(오타 등)이 들어올 수 있다.
  // 빌드/렌더를 깨뜨리지 않도록 알 수 없는 type은 note 스타일로 폴백한다.
  const s = STYLES[type as CalloutType] ?? STYLES.note;
  return (
    <div className={`mb-8 rounded-2xl px-5 py-4 cs-callout ${s.mod}`}>
      <div className="cs-callout-label mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wide">
        <span className="cs-callout-badge" aria-hidden>{s.icon}</span>
        {s.label}
      </div>
      <div className="text-body [&>p]:mb-0 [&>p+p]:mt-3">{children}</div>
    </div>
  );
}
