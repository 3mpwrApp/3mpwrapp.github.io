# Notifications Integration Plan

## Goals
Provide a unified, privacy-conscious notification system (push + in-app + optional email/SMS later) driven by explicit user preferences and event templates, enabling:
- Consistent authoring via structured templates
- Runtime personalization (jurisdiction, locale, accessibility tone adjustments)
- Central throttling, deduplication, and audit logging
- Easy future channel expansion (email/SMS)

## Scope (Phase 1)
- Template schema & registry
- Preference matrix persisted locally + (future) remote sync
- Event dispatch pipeline (translate domain events -> candidate notifications -> filtered & sent)
- Storage & state hooks (unread count, last delivered hashes for dedupe)
- Test harness & sample templates

Out of scope (Phase 1): rich action buttons, batching/digest, email/SMS, deep metrics dashboard, multi-device preference sync.

## Key Concepts
| Concept | Description |
|---------|-------------|
| Template | Structured definition of a notification variant with i18n keys & channel options |
| Event | Domain occurrence (e.g., `coach.generate`, `resource.bookmarked`) that maps to one or more templates |
| Preference Matrix | User choices per category + granular template overrides |
| Delivery Record | Local record (id, templateId, ts, read, payloadHash) |
| Channel | `push`, `inApp` (Phase 1); extendable |

## Template Schema (TS Interface)
```ts
interface NotificationTemplate {
  id: string; // unique (kebab-case)
  version: number; // bump to invalidate cached personalization
  category: 'advocacy' | 'wellness' | 'resources' | 'community' | 'system' | 'evidence' | 'admin';
  event: string; // canonical domain event source (wildcards allowed in mapping table)
  channels: {
    inApp?: boolean;
    push?: boolean;
  };
  priority: 'low' | 'normal' | 'high';
  throttleSec?: number; // per (user, template) minimum interval
  i18n: {
    titleKey: string; // e.g. 'notify.coach.ready.title'
    bodyKey: string;  // e.g. 'notify.coach.ready.body'
  };
  a11y?: {
    auditoryHintKey?: string; // screen reader hint localization key
  };
  personalization?: {
    // Fields we will attempt to inject into translation values
    fields: Array<'jurisdictionName' | 'resourceTitle' | 'coachTopic' | 'evidenceFocusCount'>;
  };
  featureFlag?: string; // optional env / flag gating
  dedupe?: 'event' | 'template' | 'none';
}
```

## Initial Template Set (Draft)
| ID | Event | Category | Purpose |
|----|-------|----------|---------|
| coach-result-ready | coach.generate.completed | advocacy | Let user know AI coach answer is ready (if backgrounded) |
| coach-session-summary | coach.view.summary | advocacy | Encourage saving or sharing generated steps |
| evidence-reminder-weekly | evidence.checkin.cron | evidence | Nudge to add new evidence items |
| resource-bookmark-confirm | resource.bookmark.add | resources | Confirm bookmark + hint about offline availability |
| resource-new-jurisdiction | resource.catalog.new.jurisdiction | resources | Inform of new jurisdiction-specific resources |
| community-new-message | community.thread.message.new | community | Prompt return to active discussion |
| system-changelog | system.release.notes | system | Notify of new What's New entry |
| wellness-streak-nudge | wellness.activity.missed | wellness | Encourage resuming wellness tracking |

(IDs and events subject to refinement; ensure alignment with existing `types/activity.ts` or extend.)

## Preference Matrix Shape
```ts
interface NotificationPreferences {
  // High-level categorical enable switches
  categories: {
    advocacy: boolean;
    resources: boolean;
    community: boolean;
    wellness: boolean;
    evidence: boolean;
    system: boolean;
  };
  // Optional per-template overrides (true=force on if category enabled, false=force off)
  templates: Record<string, boolean | undefined>;
  // Channel global toggles
  channels: {
    push: boolean;
    inApp: boolean;
  };
  quietHours?: { start: string; end: string; timezone: string }; // '22:00'-'07:00'
  lastUpdated: number; // epoch
  version: number; // schema version for migrations
}
```
Persistence key suggestion: `notifications:prefs:v1`

## Event -> Template Mapping
Strategy: maintain an index keyed by event (supports exact + prefix wildcard) for quick lookup.
```ts
interface TemplateIndex { [event: string]: string[] } // event -> templateIds
```
Prefix events (e.g., `coach.generate.*`) allow grouping; expansion occurs at registration time.

## Dispatch Pipeline
1. Domain event emitted (existing analytics/activity logger can also call notification bus)
2. Notification bus resolves templateIds for event
3. For each template:
   - Check featureFlag (if any)
   - Check category & template preference switches
   - Enforce quiet hours (delay or drop per policy; Phase 1: drop push, keep inApp queued)
   - Throttle: compare last sent timestamp per (user, template)
   - Personalize translation values
   - Dedupe: hash(payload core + templateId) vs recent delivery records
4. Deliver via enabled channels:
   - inApp: append to local store; increment unread
   - push: call Expo Notifications service (`services/notifications.ts`)
5. Persist delivery record (id, templateId, ts, hash, read:false)
6. Emit secondary analytics event `notification.delivered`

Reading / marking read: maintain a simple store `notifications.store.ts` with actions `add`, `markRead(id)`, `markAllRead()`.

## Data Structures
```ts
interface DeliveredNotification {
  id: string;
  templateId: string;
  createdAt: number;
  read: boolean;
  title: string;
  body: string;
  payloadHash: string;
  event: string;
  channel: 'inApp' | 'push';
}
```
Storage key: `notifications:inbox:v1`

## Personalization Inputs
Collected on demand from:
- Jurisdiction: `store/jurisdiction`
- Recent coach session: last `coach.generate` context
- Resource metadata: passed as event payload
- Evidence store: count of stored evidence items (future)

## Accessibility Considerations
- Ensure all in-app notifications have `accessibilityLabel`
- Provide setting to reduce frequency (low stimulus mode)
- Respect system reduced motion (disable animated toasts)

## Localization Workflow
- Add template i18n keys under `notify.*`
- Include English first; extraction script ensures presence across other locales
- Avoid concatenation; always use interpolation placeholders

## Throttling & Quiet Hours (Phase 1 Policy)
- If within quiet hours: skip push (do not queue), still add inApp silently
- Per-template throttle default: 300s unless `throttleSec` provided

## Migration Strategy
- Introduce schema version = 1
- On load: if missing, initialize with all categories true except `system` (opt-in) and `community` (opt-in) to minimize unsolicited alerts.
- Future version increment triggers migration function (`migratePreferences(old)`)

## Incremental Implementation Steps
1. Add `types/notifications.ts` (interfaces above)
2. Implement `store/notifications.tsx` (React context + AsyncStorage persistence) with inbox + prefs
3. Implement template registry `services/notifications.templates.ts`
4. Implement dispatcher `services/notifications.dispatcher.ts`
5. Wire domain events: extend activity logger or emit bus calls where events fire (`coach.generate.completed`, resource bookmark add, etc.)
6. Add UI: basic Notifications screen / tab or integrate into existing Profile/Settings (Phase 1: simple list + unread badge)
7. Add preference UI component `NotificationPreferences` (already exists?) – if present, extend to use new matrix
8. Add tests: registry loading, throttle logic, quiet hours, preference filter, dedupe
9. Documentation update in README (env var notes) + this plan link
10. Hook up What's New auto-archive event (system.changelog) to run monthly

## Testing Strategy
- Unit: template resolution, throttling, quiet hours edge (wrap midnight), dedupe hashing
- Integration: dispatch pipeline with mocked Expo push
- Snapshot: serialized prefs baseline
- E2E (later): user toggles category and event suppressed

## Security & Privacy
- Minimize payload data stored (hash raw payload where possible)
- Avoid storing sensitive PII in notification body; rely on generic language referencing in-app content
- Provide clear toggle to disable all notifications

## Future Extensions (Phase 2+)
- Digest/bundling engine
- Email/SMS channel abstraction
- Adaptive scheduling (ML-based send time)
- Jurisdiction change announcements
- Evidence locker streak / milestone badges
- Admin broadcast tools (role-gated)
 - Auto-expire old marketing/system notices after 30 days (archived list)

## Open Questions
- Should quiet hours be jurisdiction-local or device timezone? (Assume device for Phase 1)
- Do we need per-channel throttle differences? (Not Phase 1)
- Retention window for inApp inbox? (Propose cap 100 items, drop oldest)

## Acceptance Criteria (Phase 1)
- Registry with ≥ 4 operational templates
- Preferences persisted & reload correctly
- Dispatch pipeline filters on prefs, throttle, quiet hours, dedupe
- In-app list shows delivered notifications, unread badge increments
- Push delivery invoked for at least one template when enabled
- Tests cover core logic (>80% lines across dispatcher + store)

---
Prepared: 2025-09-22
