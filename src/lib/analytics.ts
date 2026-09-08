import { API_BASE_URL } from "../api/client";

type EventPayload = {
  event_id: string;
  event_type: "visit" | "read";
  visitor_id: string;
  session_id: string;
  path: string;
  story_slug?: string;
  chapter_slug?: string;
  duration_seconds?: number;
};

let identity: { visitor_id: string; session_id: string } | undefined;
const pending: EventPayload[] = [];
let sending = false;

function storedId(kind: "localStorage" | "sessionStorage", key: string): string {
  const fresh = crypto.randomUUID();
  try {
    const value = window[kind].getItem(key);
    if (value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return value;
    window[kind].setItem(key, fresh);
  } catch { /* Storage restrictions use a per-page anonymous identity. */ }
  return fresh;
}

// Separate names and endpoint: never use the main site's analytics or progress APIs.
function getIdentity() {
  return identity ??= {
    visitor_id: storedId("localStorage", "nepalikatha.visitor.v1"),
    session_id: storedId("sessionStorage", "nepalikatha.session.v1"),
  };
}

export async function flushAnalytics() {
  if (sending) return;
  sending = true;
  try {
    while (pending.length) {
      const response = await fetch(`${API_BASE_URL}/nepalikatha/events/`, {
        method: "POST", credentials: "omit", keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending[0]),
      });
      if (response.status === 429 || response.status >= 500) break;
      // Invalid payloads cannot succeed on retry. Transient failures keep the same UUID.
      pending.shift();
    }
  } catch { /* Best-effort telemetry; retry on the next heartbeat/navigation. */ }
  finally { sending = false; }
}

export function trackEvent(event: Pick<EventPayload, "event_type" | "path" | "story_slug" | "chapter_slug" | "duration_seconds">) {
  if (pending.length >= 50) { void flushAnalytics(); return; }
  pending.push({ ...event, ...getIdentity(), event_id: crypto.randomUUID() });
  void flushAnalytics();
}

// A tab's reading time is active only while visible, focused, in the chapter and
// recently interacted with. Cap sampling gaps so sleep/suspension cannot add hours.
export function readingClock(now: () => number, active: () => boolean, emit: (seconds: number) => void) {
  let previous = now();
  let lastActivity = previous;
  let pendingMs = 0;
  const tick = () => {
    const current = now();
    const delta = current - previous;
    if (delta > 0 && delta <= 1500 && current - lastActivity <= 60_000 && active()) pendingMs += delta;
    previous = current;
  };
  return {
    tick,
    activity: () => { tick(); lastActivity = now(); },
    flush: () => {
      tick();
      const seconds = Math.min(30, Math.floor(pendingMs / 1000));
      if (seconds > 0) { pendingMs -= seconds * 1000; emit(seconds); }
    },
  };
}
