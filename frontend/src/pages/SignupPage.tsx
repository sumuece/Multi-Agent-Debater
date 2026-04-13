import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { SecretInput } from "../components/SecretInput";
import { humanizeClientError } from "../api";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim() || undefined);
      navigate("/", { replace: true });
    } catch (e) {
      setErr(humanizeClientError(e, "auth"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Create account"
      subtitle="Same login flow as sign-in; new row in the local user table."
      footer={
        <div className="space-y-4 text-center text-sm">
          <p className="text-zinc-500">
            Already registered?{" "}
            <Link to="/login" className="link-brand">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-zinc-600 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link to="/help" className="hover:text-zinc-400 transition-colors">
              Help
            </Link>
            <Link to="/offline" className="hover:text-zinc-400 transition-colors">
              Offline
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="su-email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            id="su-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-modern"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="su-name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Display name <span className="text-zinc-600 font-normal normal-case">(optional)</span>
          </label>
          <input
            id="su-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-modern"
            placeholder="Alex Chen"
          />
        </div>
        <div>
          <label htmlFor="su-password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Password <span className="text-zinc-600 font-normal normal-case">(min 8)</span>
          </label>
          <SecretInput
            id="su-password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {err && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200/95">{err}</div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
