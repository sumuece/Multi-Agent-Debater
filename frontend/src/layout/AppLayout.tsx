import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { checkHealth } from "../api";
import { BrandMark } from "../components/BrandMark";
import { SidebarSnapshot } from "../components/SidebarSnapshot";
import { IconDebate, IconHelp, IconLogs, IconSettings } from "../components/NavIcons";
import { useAuth } from "../context/AuthContext";
import { useOnline } from "../hooks/useOnline";

function userInitials(email: string) {
  const local = email.split("@")[0] ?? "?";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

export function AppLayout() {
  const { user, logout, loading } = useAuth();
  const online = useOnline();
  const navigate = useNavigate();
  const [apiUp, setApiUp] = useState<boolean | null>(null);

  const poll = useCallback(async () => {
    if (!online) {
      setApiUp(false);
      return;
    }
    setApiUp(await checkHealth());
  }, [online]);

  useEffect(() => {
    void poll();
    const id = setInterval(() => void poll(), 20000);
    return () => clearInterval(id);
  }, [poll]);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `nav-item ${isActive ? "nav-item-active" : "nav-item-idle"}`;

  return (
    <div className="app-shell flex">
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-surface-1/40 backdrop-blur-xl">
        <div className="p-6 border-b border-white/[0.06]">
          <NavLink to="/" className="flex items-center gap-3 group">
            <BrandMark size="sm" />
            <div className="min-w-0">
              <div className="font-semibold text-sm tracking-tight text-white group-hover:text-white transition-colors">
                Multi Agent Debater
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Debates</div>
            </div>
          </NavLink>
        </div>
        <nav className="p-3 flex-1 flex flex-col min-h-0">
          <div className="space-y-1 shrink-0">
            <NavLink to="/" end className={navCls}>
              <IconDebate />
              Debate
            </NavLink>
            <NavLink to="/logs" className={navCls}>
              <IconLogs />
              Activity log
            </NavLink>
            <NavLink to="/help" className={navCls}>
              <IconHelp />
              Help
            </NavLink>
            <NavLink to="/settings" className={navCls}>
              <IconSettings />
              Settings
            </NavLink>
          </div>
          <p className="mt-6 px-3 text-xs text-zinc-600 leading-relaxed shrink-0">
            Signed-in runs also get a row in the DB log. Everything else stays in localStorage until you clear it.
          </p>
          <SidebarSnapshot />
        </nav>
        <div className="p-4 border-t border-white/[0.06] text-xs text-zinc-600 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span>Network</span>
            {online ? <span className="text-emerald-400/90 font-medium">Online</span> : <span className="text-amber-400/90 font-medium">Offline</span>}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>API</span>
            {apiUp === null ? (
              <span className="text-zinc-500">…</span>
            ) : apiUp ? (
              <span className="text-emerald-400/90 font-medium">Live</span>
            ) : (
              <span className="text-amber-400/90 font-medium">Down</span>
            )}
          </div>
          <button type="button" onClick={() => void poll()} className="link-brand text-xs w-full text-left pt-1">
            Refresh status
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {!online && (
          <div className="relative overflow-hidden border-b border-amber-500/20 bg-amber-950/25 px-4 py-2.5">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative flex flex-wrap items-center justify-between gap-2 text-sm text-amber-100/95">
              <span>No network — debates need connectivity and a running API.</span>
              <button type="button" className="text-amber-200 link-brand hover:text-accent-hover text-sm font-medium" onClick={() => navigate("/offline")}>
                Offline guide →
              </button>
            </div>
          </div>
        )}
        {online && apiUp === false && (
          <div className="relative overflow-hidden border-b border-rose-500/25 bg-rose-950/20 px-4 py-2.5">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent pointer-events-none" />
            <div className="relative flex flex-wrap items-center justify-between gap-2 text-sm text-rose-100/95">
              <span>API unreachable — start the backend or verify URL / VPN.</span>
              <button type="button" className="text-rose-200 font-medium hover:text-white text-sm underline-offset-2 hover:underline" onClick={() => void poll()}>
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="lg:hidden flex items-center gap-1.5 border-b border-white/[0.06] bg-surface-1/50 backdrop-blur-md px-3 py-2.5 overflow-x-auto shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive ? "bg-white/[0.1] text-white ring-1 ring-white/10" : "text-zinc-500 hover:text-zinc-300"
              }`
            }
          >
            Debate
          </NavLink>
          <NavLink
            to="/logs"
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive ? "bg-white/[0.1] text-white ring-1 ring-white/10" : "text-zinc-500 hover:text-zinc-300"
              }`
            }
          >
            Logs
          </NavLink>
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive ? "bg-white/[0.1] text-white ring-1 ring-white/10" : "text-zinc-500 hover:text-zinc-300"
              }`
            }
          >
            Help
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive ? "bg-white/[0.1] text-white ring-1 ring-white/10" : "text-zinc-500 hover:text-zinc-300"
              }`
            }
          >
            Settings
          </NavLink>
        </div>

        <header className="glass-header sticky top-0 z-10 border-b border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {user && (
                <div
                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-from to-brand-to flex items-center justify-center text-xs font-bold text-white shadow-glow ring-1 ring-white/15 shrink-0"
                  title={user.email}
                >
                  {userInitials(user.email)}
                </div>
              )}
              <div className="text-sm text-zinc-500 min-w-0 truncate">
                {loading ? (
                  <span className="animate-shimmer">Loading…</span>
                ) : user ? (
                  <span>
                    <span className="text-zinc-400">Signed in</span>{" "}
                    <span className="text-zinc-200 font-medium">{user.email}</span>
                  </span>
                ) : (
                  <span>Not signed in</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <button type="button" onClick={() => logout()} className="btn-secondary !py-2 !px-3.5 !text-xs">
                  Sign out
                </button>
              ) : (
                <>
                  <NavLink to="/login" className="btn-secondary !py-2 !px-3.5 !text-xs">
                    Sign in
                  </NavLink>
                  <NavLink to="/signup" className="btn-primary !py-2 !px-3.5 !text-xs shadow-md">
                    Sign up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>

        <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-600">
          Multi Agent Debater
        </footer>
      </div>
    </div>
  );
}
