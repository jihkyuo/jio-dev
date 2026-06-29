import type { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "decision";

const STYLES: Record<CalloutType, { border: string; text: string; icon: string; label: string }> = {
  note:     { border: "border-note",     text: "text-note",     icon: "ℹ", label: "NOTE" },
  tip:      { border: "border-tip",      text: "text-tip",      icon: "✦", label: "TIP" },
  warning:  { border: "border-warning",  text: "text-warning",  icon: "▲", label: "WARNING" },
  decision: { border: "border-decision", text: "text-decision", icon: "◆", label: "DECISION" },
};

export function Callout({ type, children }: { type: CalloutType; children: ReactNode }) {
  const s = STYLES[type];
  return (
    <div className={`mb-8 rounded-lg border-l-4 bg-card px-5 py-4 ${s.border}`}>
      <div className={`mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wide ${s.text}`}>
        <span aria-hidden>{s.icon}</span>
        {s.label}
      </div>
      <div className="text-body [&>p]:mb-0 [&>p+p]:mt-3">{children}</div>
    </div>
  );
}
