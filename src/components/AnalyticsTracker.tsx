import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { flushAnalytics, readingClock, trackEvent } from "../lib/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();
  const lastVisit = useRef<string>();
  useEffect(() => {
    if (lastVisit.current === location.key) return;
    lastVisit.current = location.key;
    trackEvent({ event_type: "visit", path: location.pathname });
  }, [location.key, location.pathname]);
  return null;
}

export function useReadingAnalytics(storySlug: string, chapterSlug?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!chapterSlug) return;
    const clock = readingClock(() => performance.now(), () => {
      const rect = document.getElementById("chapter-content")?.getBoundingClientRect();
      return document.visibilityState === "visible" && document.hasFocus() && Boolean(rect && rect.bottom > 0 && rect.top < window.innerHeight);
    }, (duration_seconds) => trackEvent({
      event_type: "read", path: pathname,
      story_slug: storySlug, chapter_slug: chapterSlug, duration_seconds,
    }));
    let ticks = 0;
    const interval = window.setInterval(() => {
      clock.tick();
      if (++ticks % 15 === 0) { clock.flush(); void flushAnalytics(); }
    }, 1000);
    const activity = () => clock.activity();
    const flush = () => { clock.flush(); void flushAnalytics(); };
    const visibility = () => {
      flush();
      if (document.visibilityState === "visible") activity();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "focus"];
    events.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", flush);
    window.addEventListener("blur", flush);
    return () => {
      window.clearInterval(interval);
      flush();
      events.forEach((event) => window.removeEventListener(event, activity));
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("blur", flush);
    };
  }, [storySlug, chapterSlug, pathname]);
}
