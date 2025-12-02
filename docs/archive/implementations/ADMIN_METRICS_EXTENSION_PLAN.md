# Admin Metrics Extension Plan

## Goals
Provide actionable, privacy-conscious adoption telemetry segmented by jurisdiction and feature area to guide roadmap investment.

## Principles
- Aggregate over individual: no raw PII storage
- Opt-out ready: global analytics disable flag
- Jurisdiction segmentation without exposing specific user identities

## Core Metrics
| Metric | Definition | Dimensions |
|--------|------------|------------|
| DAU | Distinct active users per day | date, jurisdiction |
| Feature Usage | Event counts per feature (coach, resources view, bookmarks) | date, jurisdiction, feature |
| Retention | Cohort repeat usage (7d/30d) | cohort_week, jurisdiction |
| Evidence Engagement (future) | Evidence item add/view counts | date, jurisdiction |
| Notification Delivery | Delivered notifications by template | date, jurisdiction, template |
| Conversion Funnel | Coach start -> generate -> view steps | jurisdiction |

## Event Model
Leverage existing `logEvent(name, payload)`; enrich with derived fields:
```ts
interface AnalyticsEventBase {
  name: string;
  ts: number;
  jurisdiction?: string; // from store
  feature?: string;
}
```

Add wrapper `trackFeature(feature: string, action: string, extra?: Record<string,any>)` producing names like `feature.coach.generate`.

## Jurisdiction Attribution
- On event dispatch, read current jurisdiction from store
- If missing, attribute as `unknown`
- Avoid retroactive mutation; capture at event time

## Storage / Transport Strategy (Phase 1)
- Local buffer (in-memory array) -> flush on interval (e.g., 60s) or size > N
- Flush target: placeholder endpoint (future) or console (dev)
- Provide export function for manual JSON download (Admin screen)

## Aggregation (Phase 2)
- Backend service aggregates by day & jurisdiction
- Pre-compute retention cohorts (first seen week number)

## Admin UI Additions
| View | Metrics |
|------|---------|
| Overview | DAU (sparkline), Top features, Jurisdiction distribution |
| Coach | Funnel, Avg steps per session |
| Notifications | Deliveries by template, opt-out rate |
| Resources | Resource views by category |

## Data Minimization
- Do not store full prompt text, only counts and durations
- Hash route names if sensitive (optional toggle)

## Implementation Steps
1. Add `analytics/enrich.ts` helper (inject jurisdiction, feature)
2. Extend existing `services/analytics.ts` to call enrich helper
3. Implement local buffer with flush + export API
4. Add admin export button (JSON download) in Admin screen
5. Document event naming conventions
6. Add test ensuring enrichment adds jurisdiction

## Naming Conventions
`feature.<area>.<action>` e.g., `feature.coach.generate`
`system.<area>.<action>` for internal operations
`notify.delivered.<templateId>` for notification deliveries

## Privacy & Compliance
- Provide toggle to disable analytics (respect OS privacy toggle future)
- On disable: clear buffer & prevent new enqueue

## Metrics Quality Tests
- Test funnel progression (start -> generate -> view) increments correctly
- Test unknown jurisdiction case handled gracefully

## Acceptance Criteria (Phase 1)
- Enrichment layer present & tested
- Local buffer flush functioning (manual trigger)
- Export from Admin screen available
- Event naming documented

---
Prepared: 2025-09-22
