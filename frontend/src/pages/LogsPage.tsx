import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActivity, humanizeClientError, type ActivityItem } from "../api";
import { useAuth } from "../context/AuthContext";
import { getLocalActivity, type LocalActivityEntry } from "../lib/localActivityLog";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const entryCard =
  "relative pl-5 rounded-xl border border-white/[0.06] border-l-[3px] border-l-violet-500/40 hover:border-l-violet-400/70 transition-colors bg-surface-1/40 backdrop-blur-sm p-4 text-sm shadow-inset";

export default function LogsPage() {
  const { token, user } = useAuth();
  const [localRows, setLocalRows] = useState<LocalActivityEntry[]>(() => getLocalActivity());
  const [serverRows, setServerRows] = useState<ActivityItem[]>([]);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshLocal = useCallback(() => setLocalRows(getLocalActivity()), []);

  const loadServer = useCallback(async () => {
    if (!token) {
      setServerRows([]);
      return;
    }
    setLoading(true);
    setServerErr(null);
    try {
      const items = await fetchActivity(token);
      setServerRows(items);
    } catch (e) {
      setServerErr(humanizeClientError(e, "activity"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadServer();
  }, [loadServer]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refreshLocal();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshLocal]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90 mb-2">Logs</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Activity log</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl leading-relaxed">
          Local entries stay on this device. Signed-in runs also append to the server audit trail.
        </p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-surface-1/50 backdrop-blur-md p-6 sm:p-8 shadow-lift">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-sm font-semibold text-white">This device</h2>
          <button type="button" onClick={() => refreshLocal()} className="text-xs font-semibold link-brand">
            Refresh
          </button>
        </div>
        {localRows.length === 0 ? (
          <p className="text-sm text-zinc-600">No local entries yet. Run a debate to populate this list.</p>
        ) : (
          <ul className="space-y-3">
            {localRows.map((row) => (
              <li key={row.id} className={entryCard}>
                <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500 font-mono">
                  <span>{formatTime(row.at)}</span>
                  <span className="text-accent font-sans font-semibold">{row.event_type}</span>
                </div>
                <p className="mt-2 text-zinc-200">{row.summary}</p>
                {row.meta && (
                  <pre className="mt-3 text-xs text-zinc-500 overflow-x-auto font-mono bg-surface-0/60 rounded-lg p-3 border border-white/[0.05]">
                    {JSON.stringify(row.meta, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-surface-1/50 backdrop-blur-md p-6 sm:p-8 shadow-lift">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-sm font-semibold text-white">Server audit</h2>
          {user && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadServer()}
              className="text-xs font-semibold link-brand disabled:opacity-40"
            >
              {loading ? "Loading…" : "Reload"}
            </button>
          )}
        </div>
        {!user ? (
          <p className="text-sm text-zinc-500">
            <Link to="/login" className="link-brand">
              Sign in
            </Link>{" "}
            to load server-side activity for your account.
          </p>
        ) : serverErr ? (
          <p className="text-sm text-rose-300/95">{serverErr}</p>
        ) : serverRows.length === 0 ? (
          <p className="text-sm text-zinc-600">No server entries yet. Complete a debate while signed in.</p>
        ) : (
          <ul className="space-y-3">
            {serverRows.map((row) => (
              <li key={row.id} className={entryCard}>
                <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500 font-mono">
                  <span>{formatTime(row.created_at)}</span>
                  <span className="text-accent font-sans font-semibold">{row.event_type}</span>
                </div>
                <p className="mt-2 text-zinc-200">{row.summary}</p>
                {row.detail && (
                  <pre className="mt-3 text-xs text-zinc-500 overflow-x-auto font-mono bg-surface-0/60 rounded-lg p-3 border border-white/[0.05]">
                    {row.detail}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
