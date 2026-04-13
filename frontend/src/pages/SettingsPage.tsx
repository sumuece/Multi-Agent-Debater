import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearLocalActivity } from "../lib/localActivityLog";
import { SecretInput } from "../components/SecretInput";
import {
  clearLlmApiKey,
  getLlmSettings,
  hasStoredLlmKey,
  saveLlmSettings,
} from "../lib/llmSettings";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [cleared, setCleared] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [baseUrlDraft, setBaseUrlDraft] = useState("");
  const [debateModelDraft, setDebateModelDraft] = useState("");
  const [judgeModelDraft, setJudgeModelDraft] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [llmSaved, setLlmSaved] = useState(false);

  useEffect(() => {
    const s = getLlmSettings();
    setBaseUrlDraft(s.baseUrl);
    setDebateModelDraft(s.debateModel);
    setJudgeModelDraft(s.judgeModel);
    setKeySaved(hasStoredLlmKey());
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <div className="animate-fade-up">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90 mb-2">Workspace</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          Account, what stays in the browser, and a couple of deploy notes.
        </p>
      </div>

      <section className="settings-group animate-fade-up" style={{ animationDelay: "40ms" }}>
        <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Account</h2>
        </div>
        <div className="settings-row">
          <div>
            <p className="text-sm font-medium text-zinc-200">{user ? "Signed in" : "Not signed in"}</p>
            <p className="text-sm text-zinc-500 mt-1">
              {user ? (
                <>
                  <span className="text-zinc-300 font-mono text-xs">{user.email}</span>
                  {user.display_name ? (
                    <>
                      {" "}
                      <span className="text-zinc-400">({user.display_name})</span>
                    </>
                  ) : null}
                </>
              ) : (
                "Runs won’t be tied to a user on the server."
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {user ? (
              <button type="button" onClick={() => logout()} className="btn-secondary !text-xs !py-2 !px-4">
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !text-xs !py-2 !px-4 text-center">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary !text-xs !py-2 !px-4 text-center">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="settings-group animate-fade-up" style={{ animationDelay: "70ms" }}>
        <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">LLM (this browser)</h2>
        </div>
        <div className="settings-row !flex-col !items-stretch gap-5">
          <p className="text-sm text-zinc-500 leading-relaxed">
            OpenAI-compatible <code className="font-mono text-xs text-zinc-400">/v1/chat/completions</code> only.
            Values are stored in <code className="font-mono text-xs text-zinc-400">localStorage</code> and sent to{" "}
            <strong className="text-zinc-400">your</strong> backend on each debate; the server calls the provider.
            Empty API key field on save keeps an existing key. Use HTTPS in production. The key stays masked until
            you use the eye button.
          </p>
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="settings-llm-api-key" className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                API key
              </label>
              <span className="text-[10px] text-zinc-600">Hidden by default</span>
            </div>
            <SecretInput
              id="settings-llm-api-key"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              className="font-mono text-xs"
              placeholder={keySaved ? "New key (optional — leave empty to keep current)" : "sk-…"}
              autoComplete="off"
            />
            {keySaved && !apiKeyDraft && (
              <p className="text-xs text-emerald-400/90">A key is already saved for this browser.</p>
            )}
          </div>
          <div className="space-y-3 max-w-xl">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">Base URL (optional)</label>
            <input
              type="url"
              value={baseUrlDraft}
              onChange={(e) => setBaseUrlDraft(e.target.value)}
              className="input-modern font-mono text-xs"
              placeholder="https://api.openai.com/v1"
            />
            <p className="text-xs text-zinc-600">Leave blank to use the server default (often OpenAI).</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">Debate model</label>
              <input
                value={debateModelDraft}
                onChange={(e) => setDebateModelDraft(e.target.value)}
                className="input-modern font-mono text-xs"
                placeholder="gpt-4o-mini"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">Judge model</label>
              <input
                value={judgeModelDraft}
                onChange={(e) => setJudgeModelDraft(e.target.value)}
                className="input-modern font-mono text-xs"
                placeholder="gpt-4o-mini"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                saveLlmSettings({
                  baseUrl: baseUrlDraft,
                  debateModel: debateModelDraft,
                  judgeModel: judgeModelDraft,
                  ...(apiKeyDraft.trim() ? { newApiKey: apiKeyDraft.trim() } : {}),
                });
                setApiKeyDraft("");
                setKeySaved(hasStoredLlmKey());
                setLlmSaved(true);
                setTimeout(() => setLlmSaved(false), 2500);
              }}
              className="btn-primary !text-xs !py-2 !px-4"
            >
              Save LLM settings
            </button>
            <button
              type="button"
              onClick={() => {
                clearLlmApiKey();
                setApiKeyDraft("");
                setKeySaved(false);
              }}
              className="btn-secondary !text-xs !py-2 !px-4"
            >
              Remove API key
            </button>
          </div>
          {llmSaved && <p className="text-xs text-emerald-400/90">Saved.</p>}
        </div>
      </section>

      <section className="settings-group animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Privacy & data</h2>
        </div>
        <div className="settings-row">
          <div>
            <p className="text-sm font-medium text-zinc-200">Local activity log</p>
            <p className="text-sm text-zinc-500 mt-1 max-w-md">
              Clears debate history stored in this browser only. Server audit rows are unchanged.
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                clearLocalActivity();
                setCleared(true);
              }}
              className="rounded-xl border border-rose-500/35 bg-rose-950/25 px-4 py-2.5 text-xs font-semibold text-rose-100 hover:bg-rose-950/40 transition-colors"
            >
              Clear local log
            </button>
            {cleared && <span className="text-xs text-emerald-400/90 text-right">Cleared.</span>}
          </div>
        </div>
      </section>

      <section className="settings-group animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Developers</h2>
        </div>
        <div className="settings-row !items-start">
          <div>
            <p className="text-sm font-medium text-zinc-200">API base URL</p>
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
              Set <code className="font-mono text-xs text-violet-300/90 bg-white/[0.04] px-1.5 py-0.5 rounded-md">VITE_API_BASE_URL</code>{" "}
              before production build when UI and API differ. Ensure CORS on the API matches your UI origin.
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-zinc-600">
        <Link to="/help" className="link-brand">
          Help
        </Link>
        {" · "}
        <Link to="/offline" className="link-brand">
          Offline guide
        </Link>
      </p>
    </div>
  );
}
