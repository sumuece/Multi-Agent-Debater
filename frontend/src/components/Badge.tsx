import type { ReactNode } from "react";

export function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "ok" | "warn" | "neutral";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/10 text-emerald-300/95 ring-1 ring-emerald-500/25 backdrop-blur-sm"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-200/95 ring-1 ring-amber-500/25 backdrop-blur-sm"
        : "bg-white/[0.05] text-zinc-400 ring-1 ring-white/[0.08] backdrop-blur-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
