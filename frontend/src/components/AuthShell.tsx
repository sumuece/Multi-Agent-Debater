import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

const highlights = [
  "Several debaters, one thread (each sees the previous turn)",
  "Judge picks a winner with a short rationale",
  "Optional sign-in to persist runs on the server",
];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__hero animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300/90 mb-4">{eyebrow}</p>
          <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-semibold text-white tracking-tight leading-snug max-w-md">
            Multi Agent Debater
          </h2>
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-sm">
            Run a topic past a few stances, then get a single recommendation you can paste into notes or a ticket.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((line) => (
              <li key={line} className="flex gap-3 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-zinc-600 mt-10 md:mt-0">Multi Agent Debater</p>
      </aside>

      <div className="auth-shell__panel">
        <div
          className="card-glass relative z-10 w-full max-w-[440px] p-8 sm:p-10 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-start gap-4">
            <BrandMark linkTo="/" size="md" />
            <div className="min-w-0 pt-0.5">
              <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
              <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
            </div>
          </div>
          <div className="mt-8">{children}</div>
          <div className="mt-8 pt-6 border-t border-white/[0.06]">{footer}</div>
        </div>
      </div>
    </div>
  );
}
