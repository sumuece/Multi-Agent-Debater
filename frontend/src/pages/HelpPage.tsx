import { Link } from "react-router-dom";

const blocks = [
  {
    title: "How a session works",
    body: "You set a topic and debaters. Each debater sees the one before; the judge returns one answer plus rationale and confidence.",
  },
  {
    title: "Demo vs LLM mode",
    body: "No key: demo text. You can set OPENAI_API_KEY on the server or add an OpenAI-compatible key under Settings → LLM (stored in the browser and sent per debate request).",
  },
  {
    title: "Accounts & audit",
    body: "Sign in if you want completed debates written to the SQLite log under your user. Local history stays in the browser until you clear it.",
  },
  {
    title: "Offline",
    body: "If the network or API is down, you can still open Help and Settings. Running a debate needs the API up.",
  },
  {
    title: "Security",
    body: "Auth is JWT + bcrypt + SQLite here. For anything facing the internet use HTTPS, rotate secrets, and swap in whatever identity stack your org uses.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Help</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl leading-relaxed">
          OpenAPI is at <code className="font-mono text-xs text-zinc-400">/docs</code> on the API host. In dev, Vite
          only proxies <code className="font-mono text-xs text-zinc-400">/api</code> and{" "}
          <code className="font-mono text-xs text-zinc-400">/health</code>, so hit the backend port for docs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {blocks.map((b, i) => (
          <section
            key={b.title}
            className="group bento-card animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-gradient-to-br from-accent/15 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h2 className="text-sm font-semibold text-white relative">{b.title}</h2>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed relative">{b.body}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-surface-1/40 backdrop-blur-sm px-6 py-5 flex flex-wrap gap-4 text-sm text-zinc-500">
        <Link to="/settings" className="link-brand">
          Settings
        </Link>
        <Link to="/logs" className="link-brand">
          Activity log
        </Link>
        <Link to="/offline" className="link-brand">
          Offline
        </Link>
      </section>
    </div>
  );
}
