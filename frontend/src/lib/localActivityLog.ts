const KEY = "multi_agent_debater_local_activity_v1";

export type LocalActivityEntry = {
  id: string;
  at: string;
  event_type: string;
  summary: string;
  meta?: Record<string, unknown>;
};

function read(): LocalActivityEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LocalActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: LocalActivityEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 200)));
}

function pingUi() {
  try {
    window.dispatchEvent(new Event("mad-local-storage"));
  } catch {
    /* no window */
  }
}

export function getLocalActivity(): LocalActivityEntry[] {
  return read();
}

export function appendLocalActivity(entry: Omit<LocalActivityEntry, "id" | "at"> & { id?: string }) {
  const entries = read();
  const row: LocalActivityEntry = {
    id: entry.id ?? crypto.randomUUID(),
    at: new Date().toISOString(),
    event_type: entry.event_type,
    summary: entry.summary,
    meta: entry.meta,
  };
  write([row, ...entries]);
  pingUi();
}

export function clearLocalActivity() {
  localStorage.removeItem(KEY);
  pingUi();
}
