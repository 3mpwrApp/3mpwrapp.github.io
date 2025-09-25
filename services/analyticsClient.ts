// Lightweight analytics client wrapper to centralize event emission for testability.
// Production code should import { trackEvent } from this file instead of using logEvent directly.
import type { AnalyticsEventParamsMap } from '../types/analytics';

import { logEvent } from './analytics';
import type { AnalyticsEventName } from './analyticsEvents';
import { ANALYTICS_EVENT_SET } from './analyticsEvents';
import { validateAndRedactEvent } from './analyticsEventSchemas';

export type AnalyticsEvent = { name: string; params?: Record<string, any> };

export type AnalyticsSink = (name: string, params?: Record<string, any>) => void;

let sink: AnalyticsSink | null = (name, params) => {
  // Defer to existing logEvent if present
  (logEvent as any)?.(name, params);
};

export function setAnalyticsSink(next: AnalyticsSink | null) {
  sink = next;
}

export function trackEvent(name: string, params?: Record<string, any>) {
  const dev = process.env.NODE_ENV !== 'production';
  if (dev && !ANALYTICS_EVENT_SET[name]) {
     
    console.warn(`[analytics] Unregistered event name: ${name}`);
  }
  let finalParams = params;
  if (dev) {
    const { sanitized, warnings } = validateAndRedactEvent(name, params);
    if (warnings.length) {
       
      console.warn('[analytics][schema]', name, warnings);
    }
    if (sanitized) finalParams = sanitized; // Use redacted sanitized subset
  }
  sink?.(name, finalParams);
}

// Narrowing helper for callers that want compile-time checking
// Deprecated simple typed wrapper (kept for backward compatibility)
export function trackTypedEvent(name: AnalyticsEventName, params?: Record<string, any>) {
  trackEvent(name, params);
}

// Strictly typed overload using schema-derived param mapping
export function trackEventStrict<E extends AnalyticsEventName>(
  name: E,
  params: AnalyticsEventParamsMap[E]
) {
  trackEvent(name, params as Record<string, any>);
}

export { ANALYTICS_EVENTS } from './analyticsEvents';

// Helper used in tests to capture events in an array
export function withCapturedEvents(run: () => any) {
  const events: AnalyticsEvent[] = [];
  const prev = sink;
  setAnalyticsSink((n, p) => { events.push({ name: n, params: p }); });
  try { run(); } finally { setAnalyticsSink(prev); }
  return events;
}

// Async variant
export async function withCapturedEventsAsync(run: () => Promise<any>) {
  const events: AnalyticsEvent[] = [];
  const prev = sink;
  setAnalyticsSink((n, p) => { events.push({ name: n, params: p }); });
  try { await run(); } finally { setAnalyticsSink(prev); }
  return events;
}
