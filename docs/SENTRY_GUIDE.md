# Sentry Error Monitoring Guide

## Overview
Sentry is integrated via `sentry-expo` (config plugin) and respects app privacy controls. Reporting is **opt-in via env/DSN** and can be disabled from the app’s privacy settings.

## Setup (Production Builds)
1. Create a Sentry org/project.
2. In `app.json` plugin settings, set `organization` and `project`.
3. Provide env vars to EAS:
   - `SENTRY_AUTH_TOKEN` (scoped token for uploads)
   - Optional: `EXPO_PUBLIC_SENTRY_DSN` if you want runtime DSN-based init
4. Build with EAS: `eas build --profile production --platform android` (and iOS as needed).

## Local Development
- Reporting is off by default. To test locally, set `EXPO_PUBLIC_SENTRY_DSN` in `.env` and restart Expo.

## Privacy & Controls
- App setting `errorReporting` (Settings → Privacy & Security) gates Sentry submission; default is off.
- No PII is sent by default; honor user opt-outs and free-mode constraints.
- When free/budget mode is enabled, leave DSN unset to avoid unintended traffic.

## Testing Checklist
1. Set `EXPO_PUBLIC_SENTRY_DSN` (dev) or ensure DSN is present in production build env.
2. Launch app; confirm console shows "[Sentry] initialized" (see `services/telemetry.ts`).
3. Trigger a safe test error (e.g., temporary `throw new Error("sentry-test")` or the existing logger-based test flow used in QA) and verify it appears in Sentry.
4. Clear the test code after verifying the event.

## Release Health & Source Maps
- Plan: Upload source maps on EAS builds using `SENTRY_AUTH_TOKEN`; add CI step to run `sentry-expo upload-sourcemaps` after build artifacts are created.
- Use consistent release names (EAS sets `appVersion`/`buildNumber`); align Sentry releases to those values.

## Operations Runbook
- **Enable/Disable**: Control via env DSN and the in-app `errorReporting` toggle.
- **Monitoring**: Check Sentry dashboards for new errors after releases; track performance via Sentry Performance (if enabled) per `docs/ADMIN_ANALYTICS_PANEL.md`.
- **Troubleshooting**: If initialization fails, confirm DSN and plugin config, then rebuild. If users opt out, expect no events.

## Related Docs
- `README.md` → Error monitoring (Sentry) section
- `docs/ADMIN_ANALYTICS_PANEL.md` → Performance monitoring hooks
- `docs/ARCHIVE/SENTRY_PERFORMANCE_GUIDE.md` (if present) for legacy notes
