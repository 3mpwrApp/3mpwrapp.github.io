// Developer-only cost alerts for potential paid integrations
// Enables a lightweight console warning and optional webhook POST when
// an integration that may incur cost is about to be used.

import { FLAGS, FREE_MODE } from './featureFlags';

type Feature = keyof typeof FLAGS;

export type CostEvent = {
  feature: Feature;
  action: string; // e.g., 'request:POST /interpret', 'init:sentry', 'maps:load'
  details?: Record<string, any> | string;
};

const ALERT_ENABLED = (process.env.EXPO_PUBLIC_COST_ALERT || '').toLowerCase() === '1';
const WEBHOOK = process.env.EXPO_PUBLIC_COST_WEBHOOK || '';

function shouldAlert(feature: Feature) {
  // Alert only if feature is enabled (i.e., not blocked by Free Mode) and could incur cost.
  // If FREE_MODE is on, integrations are already blocked, so skip alert unless explicitly enabled.
  return FLAGS[feature] && !FREE_MODE;
}

async function postWebhook(payload: any) {
  if (!WEBHOOK) return;
  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Swallow to avoid impacting app flow
  }
}

export async function devCostAlert(ev: CostEvent) {
  if (!shouldAlert(ev.feature)) return; // only alert for active paid features
  if (!ALERT_ENABLED && !__DEV__) return; // default to dev-only unless explicitly enabled

  const msg = `COST ALERT: ${ev.feature} -> ${ev.action}`;
  try {
    // Prefer warn to make it stand out in devtools
    // Include small, safe details preview
    // Avoid logging potentially sensitive payloads in full
  console.warn(msg, ev.details ? safePreview(ev.details) : '');
  } catch {}

  // Fire-and-forget webhook
  postWebhook({
    type: 'cost-alert',
    ts: Date.now(),
    feature: ev.feature,
    action: ev.action,
    details: truncateJson(ev.details, 512),
  });
}

function safePreview(details?: Record<string, any> | string) {
  if (!details) return '';
  try {
    if (typeof details === 'string') return details.slice(0, 200);
    const shallow: Record<string, any> = {};
    Object.keys(details).slice(0, 6).forEach((k) => {
      const v = (details as any)[k];
      shallow[k] = typeof v === 'string' ? v.slice(0, 120) : v;
    });
    return shallow;
  } catch {
    return '';
  }
}

function truncateJson(value: any, max = 1024) {
  try {
    const s = JSON.stringify(value);
    if (s.length <= max) return value;
    return JSON.parse(s.slice(0, max));
  } catch {
    return undefined;
  }
}
