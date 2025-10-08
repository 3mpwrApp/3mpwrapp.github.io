// Central registry of analytics event names to prevent typos and enable automated validation.
// Now backed by a JSON asset to reduce TS source size.
import RAW from '../data/analytics-events.json';

export const ANALYTICS_EVENTS: Readonly<Record<string, string>> = RAW as any;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Utility: constant-time lookup set for validation
export const ANALYTICS_EVENT_SET: Record<string, true> = Object.values(ANALYTICS_EVENTS).reduce((acc, name) => {
  acc[name] = true; return acc;
}, {} as Record<string, true>);
