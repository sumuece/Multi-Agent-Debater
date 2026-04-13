import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { SecretInput } from "../components/SecretInput";
import { humanizeClientError } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
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
      title="Sign in"
      subtitle="Email + password from signup."
      footer={
        <div className="space-y-4 text-center text-sm">
          <p className="text-zinc-500">
            No account?{" "}
            <Link to="/signup" className="link-brand">
              Create one
            </Link>
          </p>
          <p className="text-xs text-zinc-600 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link to="/help" className="hover:text-zinc-400 transition-colors">
              Help
            </Link>
            <Link to="/" className="hover:text-zinc-400 transition-colors">
              App home
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
          <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            id="email"
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
          <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Password
          </label>
          <SecretInput
            id="password"
            autoComplete="current-password"
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
