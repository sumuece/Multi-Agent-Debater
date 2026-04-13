import { getLlmSettings } from "./lib/llmSettings";

export type DebaterProfile = { id?: string; name: string; stance: string };

export type DebaterTurn = {
  debater_id: string;
  debater_name: string;
  stance: string;
  content: string;
};

export type JudgeVerdict = {
  winner_debater_id: string;
  winner_name: string;
  rationale: string;
  confidence: string;
};

export type DebateResponse = {
  topic: string;
  turns: DebaterTurn[];
  verdict: JudgeVerdict;
  used_llm: boolean;
};

export type UserOut = {
  id: number;
  email: string;
  display_name: string | null;
};

export type ActivityItem = {
  id: number;
  event_type: string;
  summary: string;
  detail: string | null;
  created_at: string;
};

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function messageFromFastApiDetail(detail: unknown): string | null {
  if (detail == null) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (item && typeof item === "object" && "msg" in item) {
        const o = item as { msg?: string; loc?: (string | number)[] };
        const loc = o.loc?.filter((x) => typeof x === "string" && x !== "body");
        const field = loc?.length ? String(loc[loc.length - 1]).replace(/_/g, " ") : null;
        const msg = o.msg ?? "Invalid value";
        return field ? `${field}: ${msg}` : msg;
      }
      return String(item);
    });
    return parts.join(" ");
  }
  return null;
}

type ApiErrorContext = "login" | "register" | "debate" | "activity" | "session" | "general";

function contextual404(ctx: ApiErrorContext): string {
  switch (ctx) {
    case "login":
      return "We couldn't reach sign-in right now — the app may not be connected to the server. If you don't have an account yet, create one below once things are working.";
    case "register":
      return "We couldn't reach sign-up right now. Check your connection, or try again in a moment.";
    case "session":
    case "activity":
      return "We couldn't load your account on the server. Try signing out and signing in again.";
    case "debate":
      return "The debate service isn't available. Check your connection and try again.";
    default:
      return "We couldn't find what we asked for on the server. Check your connection and try again.";
  }
}

function softenAuthDetail(ctx: ApiErrorContext, status: number, msg: string): string | null {
  const lower = msg.toLowerCase();
  if (ctx === "login" && status === 401) {
    if (
      (lower.includes("invalid") && (lower.includes("password") || lower.includes("email"))) ||
      lower.includes("incorrect") ||
      lower.includes("bad credentials")
    ) {
      return "That email or password didn't work. If you haven't registered yet, create an account first.";
    }
    if (lower.includes("not authenticated")) return "Please sign in again.";
  }
  if (ctx === "register" && status === 409) {
    if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
      return "That email already has an account. Sign in instead, or use a different email.";
    }
  }
  return null;
}

function fallbackMessageForStatus(status: number, ctx: ApiErrorContext): string {
  switch (status) {
    case 400:
      return ctx === "debate"
        ? "Something about your debate request wasn't accepted. Check the topic and debaters, then try again."
        : "Something about your request wasn't accepted. Check the fields and try again.";
    case 401:
      if (ctx === "login") {
        return "That email or password didn't work. If you haven't registered yet, create an account first.";
      }
      if (ctx === "session" || ctx === "activity") return "Your session may have expired. Please sign in again.";
      return "Please sign in to continue.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return contextual404(ctx);
    case 409:
      return ctx === "register"
        ? "That email already has an account. Sign in instead, or use a different email."
        : "That action conflicts with existing data. Try something different.";
    case 422:
      return ctx === "register"
        ? "Please fix the highlighted fields — for example, use a valid email and a password of at least 8 characters."
        : "Some fields didn't pass validation. Adjust them and try again.";
    case 429:
      return "Too many attempts. Wait a moment and try again.";
    case 502:
    case 503:
      return "The service is busy or unavailable. Try again in a moment.";
    case 504:
      return ctx === "debate"
        ? "The debate took too long. Try a shorter topic or fewer debaters."
        : "The request timed out. Try again in a moment.";
    default:
      if (status >= 500) return "Something went wrong on the server. Try again later.";
      return "Something went wrong. Try again.";
  }
}

/** Turn FastAPI / proxy error bodies into a single line for UI. */
export function formatApiErrorResponse(status: number, bodyText: string, context: ApiErrorContext = "general"): string {
  const trimmed = (bodyText ?? "").trim();
  if (trimmed) {
    try {
      const j = JSON.parse(trimmed) as { detail?: unknown };
      if (j && "detail" in j) {
        const m = messageFromFastApiDetail(j.detail);
        if (m) {
          if (status === 404 && m === "Not Found") return contextual404(context);
          const softened = softenAuthDetail(context, status, m);
          if (softened) return softened;
          return m;
        }
      }
    } catch {
      if (trimmed.startsWith("<")) return fallbackMessageForStatus(status, context);
      if (trimmed.length > 0 && trimmed.length <= 280) return trimmed;
    }
  }
  return fallbackMessageForStatus(status, context);
}

export type HumanizeErrorContext = "auth" | "debate" | "activity" | "default";

/** Map network failures and other thrown values to readable copy. */
export function humanizeClientError(err: unknown, surface: HumanizeErrorContext = "default"): string {
  if (err instanceof TypeError) {
    const m = err.message || "";
    if (/fetch|network|load failed|failed to fetch/i.test(m)) {
      if (surface === "auth") {
        return "Couldn't reach the server. If you're working locally, start the API and open the app from the dev server. New here? Sign up once you're connected.";
      }
      if (surface === "debate") {
        return "Couldn't reach the debate service. Check your connection and that the API is running.";
      }
      if (surface === "activity") {
        return "Couldn't load your server activity. Check your connection or sign in again.";
      }
      return "Couldn't reach the server. Check your connection, or start the API if you're developing locally.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

function authHeader(token: string | null | undefined): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function llmHeaders(): Record<string, string> {
  const llm = getLlmSettings();
  const h: Record<string, string> = {};
  if (llm.apiKey.trim()) h["X-LLM-Api-Key"] = llm.apiKey.trim();
  if (llm.baseUrl.trim()) h["X-LLM-Base-Url"] = llm.baseUrl.trim();
  if (llm.debateModel.trim()) h["X-LLM-Debate-Model"] = llm.debateModel.trim();
  if (llm.judgeModel.trim()) h["X-LLM-Judge-Model"] = llm.judgeModel.trim();
  return h;
}

export async function runDebate(
  topic: string,
  debaters: DebaterProfile[] | undefined,
  token: string | null | undefined
): Promise<DebateResponse> {
  const res = await fetch(`${apiBase}/api/debate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token), ...llmHeaders() },
    body: JSON.stringify({ topic, debaters: debaters?.length ? debaters : undefined }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiErrorResponse(res.status, text, "debate"));
  }
  return res.json() as Promise<DebateResponse>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${apiBase}/health`);
    return r.ok;
  } catch {
    return false;
  }
}

export async function registerAccount(
  email: string,
  password: string,
  displayName?: string
): Promise<{ access_token: string }> {
  const res = await fetch(`${apiBase}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      display_name: displayName?.trim() || null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiErrorResponse(res.status, text, "register"));
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function loginAccount(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiErrorResponse(res.status, text, "login"));
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchMe(token: string): Promise<UserOut> {
  const res = await fetch(`${apiBase}/api/auth/me`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) throw new Error("Session expired. Please sign in again.");
    throw new Error(formatApiErrorResponse(res.status, text, "session"));
  }
  return res.json() as Promise<UserOut>;
}

export async function fetchActivity(token: string, limit = 100): Promise<ActivityItem[]> {
  const res = await fetch(`${apiBase}/api/activity?limit=${limit}`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiErrorResponse(res.status, text, "activity"));
  }
  const data = (await res.json()) as { items: ActivityItem[] };
  return data.items;
}
