# Activity Feed & Telemetry

This document describes the lightweight client-side activity telemetry system.

## Goals
- Provide a user-visible "What's New" feed that merges curated release notes with real-time in‑app events.
- Enable admin visibility into usage patterns (counts, per-type stats) without a full analytics vendor.
- Keep implementation small, privacy-aware, and extensible.

## Collection
Firestore collection: `activity_events`

Event document shape (see `types/activity.ts`):
```
{
  type: string,          // e.g. bookmark.add
  ts: number,            // epoch ms (primary logical ordering)
  userId: string|null,   // optional (system / broadcast can omit)
  payload: object|null,  // structured per event type
  summaryKey: string|null,
  metadata: object|null,
  createdAt: <serverTimestamp>
}
```

## Core Event Types
| Type | Purpose |
|------|---------|
| bookmark.add | User bookmarked an item |
| bookmark.remove | User removed a bookmark |
| petition.sign | Petition signed (petitionId) |
| resource.view | Resource detail viewed |
| broadcast | Admin broadcast announcement |
| feature.use | Feature interaction (generic hook) |
| a11y.toggle | Accessibility feature changed |
| faq.create / faq.update / faq.delete | FAQ lifecycle events |
| error.report | Reserved for future error surfacing |

## Logging
Use `logActivity({...})` from `services/activity.ts`. Minimal required fields:
```
await logActivity({ type: 'feature.use', payload:{ feature: 'x' }, summaryKey: 'feature.use.generic' });
```
`userId` auto-populates from current Firebase auth user if not supplied.

## Subscription
`subscribeToActivityFeed(cb, { limit })` returns an unsubscribe function. Client merges activity with static list for the What's New screen.

Ordering: dual orderBy on `ts` then `createdAt` ensures stable fallback if clocks drift.

## Admin Metrics
Admin panel subscribes with limit 200 and derives:
- Total events
- Events in last 24h
- Per-type counts

Function: `computeActivityStats(events)`.

## Adding New Event Type
1. Extend `ActivityEventType` union in `types/activity.ts`.
2. (Optional) Define a specific interface for stronger typing.
3. Adjust feed mapping in `whatsnew/index.tsx` (`readableTitle` / `readableSummary`).
4. Log events from relevant UI/service code.
5. Add localization for any new summaryKey(s) when introduced.

## Privacy Considerations
- Avoid storing PII directly in payloads; reference IDs instead.
- Consider aggregation / pruning if collection grows quickly (current approach: client simply limits fetch size).

## Roadmap
- Server-side pruning / archival job.
- User-scoped filters or preferences.
- Aggregated daily rollups for admin dashboard.
- Notification template integration for selected events (see `services/notificationTemplates.ts`).
- Batch logging helper to coalesce burst writes.

---
Questions or improvements? Update this document or create an issue.
