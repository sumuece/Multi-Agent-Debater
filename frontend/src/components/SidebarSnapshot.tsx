import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getLocalActivity } from "../lib/localActivityLog";
import { getLlmSettings, hasStoredLlmKey } from "../lib/llmSettings";

type Snap = {
  hasKey: boolean;
  baseUrlSet: boolean;
  localCount: number;
  lastSummary: string | null;
};

function readSnap(): Snap {
  const llm = getLlmSettings();
  const rows = getLocalActivity();
  const debates = rows.filter((r) => r.event_type === "debate_completed");
  return {
    hasKey: hasStoredLlmKey(),
    baseUrlSet: Boolean(llm.baseUrl.trim()),
    localCount: debates.length,
    lastSummary: debates[0]?.summary ?? null,
  };
}

export function SidebarSnapshot() {
  const [snap, setSnap] = useState<Snap>(readSnap);

  const refresh = useCallback(() => setSnap(readSnap()), []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key?.includes("multi_agent_debater_llm") ||
        e.key?.includes("multi_agent_debater_local_activity")
      ) {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    const onMad = () => refresh();
    window.addEventListener("mad-local-storage", onMad);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mad-local-storage", onMad);
    };
  }, [refresh]);

  return (
    <div className="mt-auto rounded-xl border border-white/[0.06] bg-surface-0/50 p-3 space-y-3 shadow-inset">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">This device</p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-zinc-500">LLM key</span>
          <span className={snap.hasKey ? "text-emerald-400/90 font-medium" : "text-amber-400/85 font-medium"}>
            {snap.hasKey ? "Saved" : "None"}
          </span>
        </div>
        {snap.baseUrlSet && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500">API base</span>
            <span className="text-violet-300/80 font-medium truncate max-w-[120px]" title={getLlmSettings().baseUrl}>
              Custom
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-zinc-500">Local debates</span>
          <span className="text-zinc-200 font-medium tabular-nums">{snap.localCount}</span>
        </div>
        {snap.lastSummary && (
          <p className="text-zinc-500 leading-snug line-clamp-2 border-t border-white/[0.05] pt-2" title={snap.lastSummary}>
            Last: {snap.lastSummary}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 pt-1 border-t border-white/[0.06]">
        <NavLink
          to="/settings"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          LLM & models →
        </NavLink>
        <NavLink to="/logs" className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
          Activity log →
        </NavLink>
      </div>
    </div>
  );
}
