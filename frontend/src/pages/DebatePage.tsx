import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge } from "../components/Badge";
import { ShoutProfileIcon } from "../components/icons/ShoutProfileIcon";
import type { DebateResponse, DebaterProfile } from "../api";
import { checkHealth, humanizeClientError, runDebate } from "../api";
import { useAuth } from "../context/AuthContext";
import { appendLocalActivity } from "../lib/localActivityLog";
import { hasStoredLlmKey } from "../lib/llmSettings";

const DEFAULT_DEBATERS: DebaterProfile[] = [
  { name: "Analyst", stance: "Evidence-first: trade-offs, risks, measurable outcomes." },
  { name: "Strategist", stance: "Long-term positioning, stakeholders, execution path." },
  { name: "Skeptic", stance: "Challenge assumptions; failure modes and hidden costs." },
];

function confidenceLabel(c: string): string {
  const x = c.toLowerCase();
  if (x === "high") return "High confidence";
  if (x === "low") return "Low confidence";
  return "Medium confidence";
}

const panel = "rounded-2xl border border-white/[0.06] bg-surface-1/55 backdrop-blur-md shadow-lift";

export default function DebatePage() {
  const { token } = useAuth();
  const [topic, setTopic] = useState(
    "Should we prioritize time-to-market over full test automation for our next release?"
  );
  const [debaters, setDebaters] = useState<DebaterProfile[]>(() => DEFAULT_DEBATERS.map((d) => ({ ...d })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResponse | null>(null);
  const [apiUp, setApiUp] = useState<boolean | null>(null);

  const pollHealth = useCallback(async () => {
    setApiUp(await checkHealth());
  }, []);

  useEffect(() => {
    void pollHealth();
    const id = setInterval(() => void pollHealth(), 15000);
    return () => clearInterval(id);
  }, [pollHealth]);

  const canSubmit = useMemo(() => {
    return (
      topic.trim().length >= 3 &&
      debaters.length > 0 &&
      debaters.every((d) => d.name.trim() && d.stance.trim())
    );
  }, [topic, debaters]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runDebate(topic.trim(), debaters, token);
      setResult(data);
      appendLocalActivity({
        event_type: "debate_completed",
        summary: topic.trim().slice(0, 200),
        meta: {
          winner: data.verdict.winner_name,
          confidence: data.verdict.confidence,
          used_llm: data.used_llm,
        },
      });
    } catch (err) {
      setError(humanizeClientError(err, "debate"));
    } finally {
      setLoading(false);
    }
  }

  function updateDebater(i: number, patch: Partial<DebaterProfile>) {
    setDebaters((prev) => prev.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  }

  function addDebater() {
    setDebaters((prev) => [...prev, { name: "Advisor", stance: "Practical constraints and next steps." }]);
  }

  function removeDebater(i: number) {
    setDebaters((prev) => (prev.length <= 1 ? prev : prev.filter((_, j) => j !== i)));
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 border-b border-white/[0.06]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4 sm:gap-5">
              <div
                className="hidden sm:block shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5 shadow-inset"
                aria-hidden
              >
                <ShoutProfileIcon className="h-11 w-11 text-violet-300/85" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90 mb-2">Session</p>
                <h1 className="text-2xl sm:text-[1.65rem] font-semibold tracking-tight text-white">
                  Multi Agent Debater
                </h1>
                <p className="text-sm text-zinc-500 mt-1">Argue → judge → best answer</p>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {result && (
                    <Badge tone={result.used_llm ? "ok" : "warn"}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {result.used_llm ? "LLM mode" : "Demo mode"}
                    </Badge>
                  )}
                  <Badge tone={apiUp ? "ok" : apiUp === false ? "warn" : "neutral"}>
                    API {apiUp === null ? "checking" : apiUp ? "healthy" : "unavailable"}
                  </Badge>
                  {!token && <span className="text-xs text-zinc-600">Sign in if you want runs in the DB log.</span>}
                </div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none flex shrink-0 justify-center lg:justify-end lg:pt-1 select-none"
            aria-hidden
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-violet-500/10 blur-2xl" />
              <ShoutProfileIcon className="relative h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36 text-violet-400/35" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        <section className={`${panel} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Configure run</h2>
              <p className="text-sm text-zinc-500 mt-1 max-w-xl leading-relaxed">
                Each debater sees the prior argument; the judge evaluates the full thread.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void pollHealth()}
              className="shrink-0 text-sm font-medium link-brand"
            >
              Refresh status
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Topic / decision question
              </label>
              <textarea
                id="topic"
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-modern resize-y min-h-[120px] leading-relaxed"
                placeholder="What should we decide?"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Debaters</label>
                <button type="button" onClick={addDebater} className="text-xs font-semibold link-brand">
                  + Add debater
                </button>
              </div>
              <div className="space-y-3">
                {debaters.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.06] bg-surface-0/80 p-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto] shadow-inset"
                  >
                    <input
                      value={d.name}
                      onChange={(e) => updateDebater(i, { name: e.target.value })}
                      className="input-modern !py-2"
                      placeholder="Name"
                      aria-label={`Debater ${i + 1} name`}
                    />
                    <input
                      value={d.stance}
                      onChange={(e) => updateDebater(i, { stance: e.target.value })}
                      className="input-modern !py-2 sm:col-span-1"
                      placeholder="Stance / role"
                      aria-label={`Debater ${i + 1} stance`}
                    />
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeDebater(i)}
                        disabled={debaters.length <= 1}
                        className="text-xs text-zinc-500 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-sm text-rose-100/95">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={!canSubmit || loading} className="btn-primary px-6 disabled:opacity-40">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running debate…
                  </span>
                ) : (
                  "Run debate"
                )}
              </button>
              <p className="text-xs text-zinc-600 max-w-md leading-relaxed">
                Add an API key under <strong className="text-zinc-500">Settings → LLM</strong> or set{" "}
                <code className="font-mono text-violet-300/80 text-[11px]">OPENAI_API_KEY</code> on the server;
                otherwise demo text is used.
                {hasStoredLlmKey() ? (
                  <span className="block mt-1 text-zinc-500">This browser has a saved LLM key.</span>
                ) : null}
              </p>
            </div>
          </form>
        </section>

        {result && (
          <>
            <section className="relative rounded-2xl overflow-hidden border border-fuchsia-500/20 bg-gradient-to-br from-violet-950/50 via-surface-1/80 to-fuchsia-950/20 p-6 sm:p-8 shadow-panel">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(168,85,247,0.12),transparent)] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300/90 mb-2">
                    Judge verdict
                  </p>
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    Best answer: {result.verdict.winner_name}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">{confidenceLabel(result.verdict.confidence)}</p>
                </div>
                <Badge tone="neutral">
                  {result.topic.slice(0, 48)}
                  {result.topic.length > 48 ? "…" : ""}
                </Badge>
              </div>
              <p className="relative mt-5 text-sm leading-relaxed text-zinc-300">{result.verdict.rationale}</p>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Debate transcript</h3>
              <ol className="space-y-4">
                {result.turns.map((t, idx) => (
                  <li key={`${t.debater_id}-${idx}`}>
                    <article
                      className={`${panel} p-5 sm:p-6 border-l-[3px] border-l-accent/40 hover:border-l-accent/70 transition-colors`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{t.debater_name}</span>
                          {t.debater_id === result.verdict.winner_debater_id && (
                            <span className="text-[10px] uppercase tracking-wide font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md ring-1 ring-emerald-500/25">
                              Selected
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-600 font-mono">Turn {idx + 1}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{t.stance}</p>
                      <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{t.content}</p>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </main>
    </>
  );
}
