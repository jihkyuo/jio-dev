import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "decision";

const STYLES: Record<CalloutType, { mod: string; icon: string; label: string }> = {
  note:     { mod: "cs-note",     icon: "ℹ", label: "NOTE" },
  tip:      { mod: "cs-tip",      icon: "✦", label: "TIP" },
  warning:  { mod: "cs-warning",  icon: "▲", label: "WARNING" },
  decision: { mod: "cs-decision", icon: "◆", label: "DECISION" },
};

export function Callout({ type, children }: { type: CalloutType; children: ReactNode }) {
  const s = STYLES[type];
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
