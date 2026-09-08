import { afterEach, describe, expect, it, vi } from "vitest";
import { readingClock } from "./analytics";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe("Nepalikatha active reading", () => {
  it("counts only focused visible reading and stops after one minute of inactivity", () => {
    let now = 0;
    let active = true;
    const emit = vi.fn();
    const clock = readingClock(() => now, () => active, emit);
    for (let second = 1; second <= 75; second++) {
      now = second * 1000;
      clock.tick();
      if (second % 15 === 0) clock.flush();
    }
    expect(emit.mock.calls.flat().reduce((a, b) => a + b, 0)).toBe(60);
    active = false;
    clock.activity();
    for (let i = 0; i < 15; i++) { now += 1000; clock.tick(); }
    clock.flush();
    expect(emit).toHaveBeenCalledTimes(4);
    active = true;
    clock.activity();
    now += 1000;
    clock.flush();
    expect(emit).toHaveBeenLastCalledWith(1);
  });

  it("does not count suspended timers and never sends the same time twice", () => {
    let now = 0;
    const emit = vi.fn();
    const clock = readingClock(() => now, () => true, emit);
    now += 1000;
    clock.tick();
    now += 3_600_000;
    clock.flush();
    expect(emit).toHaveBeenCalledWith(1);
    clock.flush();
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("sends telemetry only to the dedicated endpoint and reuses event IDs on retries", async () => {
    const storage = { getItem: () => null, setItem: vi.fn() };
    vi.stubGlobal("window", { localStorage: storage, sessionStorage: storage });
    const fetch = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetch);
    const { trackEvent, flushAnalytics } = await import("./analytics");
    trackEvent({ event_type: "read", path: "/katha/test", story_slug: "test", chapter_slug: "one", duration_seconds: 15 });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await flushAnalytics();
    expect(fetch).toHaveBeenCalledTimes(2);
    const first = JSON.parse(fetch.mock.calls[0][1].body);
    const retry = JSON.parse(fetch.mock.calls[1][1].body);
    expect(retry).toEqual(first);
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/nepalikatha\/events\/$/);
    expect(fetch.mock.calls[0][1].credentials).toBe("omit");
    expect(first.duration_seconds).toBe(15);
    expect(storage.setItem.mock.calls.map(([key]) => key)).toEqual(["nepalikatha.visitor.v1", "nepalikatha.session.v1"]);
  });
});
