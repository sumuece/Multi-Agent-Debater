import { Link } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useOnline } from "../hooks/useOnline";

export default function OfflinePage() {
  const online = useOnline();

  return (
    <div className="min-h-screen app-shell flex flex-col">
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between bg-surface-1/30 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
          <BrandMark size="sm" />
          <span>Multi Agent Debater</span>
        </Link>
        <Link to="/help" className="text-xs link-brand">
          Help
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="card-glass max-w-lg w-full p-10 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 ring-1 ring-amber-500/25 flex items-center justify-center mb-8">
            <svg className="w-8 h-8 text-amber-300/95" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>

          <h1 className="relative text-2xl font-semibold text-white tracking-tight">Connection interrupted</h1>
          <p className="relative mt-3 text-sm text-zinc-400 leading-relaxed">
            Can&apos;t reach the API from here. Check network and that the backend is running (port and URL match
            what the UI uses).
          </p>

          <ul className="relative mt-8 text-left text-sm text-zinc-300 space-y-3">
            {[
              "Verify Wi‑Fi, Ethernet, or VPN policy.",
              "Start API: uvicorn on port 8000 (dev UI proxies /api).",
              "Production: set VITE_API_BASE_URL and CORS on the API.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary justify-center">
              Return to app
            </Link>
            <button type="button" onClick={() => window.location.reload()} className="btn-secondary justify-center">
              Reload page
            </button>
          </div>

          <p className="relative mt-8 text-xs text-zinc-600">
            Browser says:{" "}
            <span className={online ? "text-emerald-400/90 font-medium" : "text-amber-400/90 font-medium"}>
              {online ? "online" : "offline"}
            </span>
          </p>
        </div>
      </main>

      <nav className="border-t border-white/[0.06] bg-surface-1/40 backdrop-blur-lg px-6 py-3 flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
        <Link to="/login" className="hover:text-zinc-300 transition-colors">
          Sign in
        </Link>
        <Link to="/settings" className="hover:text-zinc-300 transition-colors">
          Settings
        </Link>
        <Link to="/logs" className="hover:text-zinc-300 transition-colors">
          Activity log
        </Link>
      </nav>
    </div>
  );
}
