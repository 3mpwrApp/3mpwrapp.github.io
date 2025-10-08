# Developer Cost Alerts

This app can surface developer-only alerts when a potentially paid integration is used.

What triggers alerts:
- LLM requests (services/llm.ts)
- Sentry initialization (services/telemetry.ts)
- Android Maps load (components/MapEmbed.tsx)

How it behaves:
- By default, alerts only show in development (__DEV__).
- Set EXPO_PUBLIC_COST_ALERT=1 to enable alerts in any build.
- If Free Mode is enabled (EXPO_PUBLIC_FREE_MODE=1), paid integrations are blocked and alerts for them won’t fire.
 - You can toggle alerts at runtime via Settings → Developer → "Cost alerts" (local-only; does not enable paid features).

Environment variables:
- EXPO_PUBLIC_FREE_MODE=1 — blocks paid integrations (LLM, Sentry, Android Maps unless keys provided) for zero-cost operation.
- EXPO_PUBLIC_COST_ALERT=1 — enables cost alert logging and optional webhook.
- EXPO_PUBLIC_COST_WEBHOOK=<url> — optional webhook to receive JSON cost-alert events.

Event payload example:
```
{ "type": "cost-alert", "feature": "llm", "action": "request:POST /interpret", "ts": 1712345678901 }
```

Files:
- services/featureFlags.ts — central flags incl. FREE_MODE
- services/costGuard.ts — cost alert utility
- services/devPrefs.ts — local developer preferences (runtime toggle)
- services/llm.ts, services/telemetry.ts, components/MapEmbed.tsx — instrumented call sites
