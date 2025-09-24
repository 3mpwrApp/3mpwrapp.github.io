# Analytics Enrichment

Basic analytics are routed through `services/analytics.ts`.

- Session enrichment: every event includes `session_id` (random per app load) and an `event_count` counter per event name.
- Platform tag: includes `platform` (web/ios/android) for basic segmentation.
- Screen views: use `logView(contentId, extra?)` to send a `screen_view` with `content_id` like `wellness/pain-forecast`.
- Custom params: continue passing tool‑specific params (e.g., `step`, `value`, `cost`).

Notes:
- On web, events flow to Firebase Analytics; on native, current impl logs in dev only.
- Respect privacy settings as configured in Settings.
- Prefer stable `content_id` paths matching Expo Router routes.
