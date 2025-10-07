import { Platform } from "react-native";

import { getFirebaseAnalytics, getFirebaseApp } from "../firebase/config";

let analyticsLoaded: Promise<any | null> | null = null;

// Lightweight session + event counters (in-memory per app load)
const sessionId = (() => {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${rand}`;
})();
const eventCounts: Record<string, number> = {};
let betaFlag: boolean | null = null;

export function setBetaFlag(v: boolean) {
  betaFlag = v;
}

function withEnrichment(name: string, params?: Record<string, any>) {
  eventCounts[name] = (eventCounts[name] || 0) + 1;
  // Decide beta context once per session (default true in dev; allow override via env)
  const beta = betaFlag ?? (process.env.NODE_ENV !== 'production');
  return {
    ...params,
    session_id: sessionId,
    event_count: eventCounts[name],
    platform: Platform.OS,
    beta,
  } as Record<string, any>;
}

export function initAnalytics() {
  if (analyticsLoaded) return analyticsLoaded;
  // Ensure app is created
  getFirebaseApp();
  analyticsLoaded = getFirebaseAnalytics();
  return analyticsLoaded;
}

export async function logEvent(name: string, params?: Record<string, any>) {
  try {
    const analytics = await (analyticsLoaded ?? getFirebaseAnalytics());
    const enriched = withEnrichment(name, params);
    if (analytics && Platform.OS === "web") {
      const { logEvent } = await import("firebase/analytics");
      logEvent(analytics, name, enriched);
    } else {
      // No-op on native for now
      if (__DEV__) {
        console.warn("analytics event (noop native):", name, enriched);
      }
    }
  } catch {
    // ignore
  }
}

// Convenience for screen/view tracking with content identifiers
export function logView(contentId: string, extra?: Record<string, any>) {
  return logEvent("screen_view", { content_id: contentId, ...extra });
}
