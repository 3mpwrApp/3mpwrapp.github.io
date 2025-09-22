# Pruning & Archival Plan

## Goals
Control storage growth, maintain performance, and honor retention expectations by pruning stale data and archiving where appropriate.

## Data Targets
| Data | Prune? | Archive? | Notes |
|------|--------|----------|-------|
| Notifications Inbox | Yes (cap 100) | No | FIFO remove oldest |
| Activity Events (local) | Yes (session) | No | Cleared on restart |
| Evidence Items (future) | No (user controlled) | Optional | User manual deletion only |
| Evidence Upload Queue | Yes (completed >30d) | No | Auto remove processed entries |
| Coach Sessions (ephemeral) | N/A | N/A | Not stored |
| Cached Jurisdiction Data | No | No | Static bundle |
| Resources Gap Reports | Yes (keep latest) | No | Single file rotation |

## Retention Policies
| Category | Policy |
|----------|--------|
| Inbox | Keep latest 100 notifications |
| Upload Queue | Remove completed jobs older than 30 days |
| Temp Files (evidence) | Purge orphaned temp chunks >24h |

## Archival Strategy (Future)
Evidence export: produce encrypted ZIP (AES-256 GCM) containing metadata.json + blobs/. Provide retention policy for generated exports (auto delete after 7 days).

## Implementation Hooks
- Notifications store: enforce cap after push
- Upload queue processor: scheduled sweep (on app launch + every 12h) removing old completed records
- Temp file manager: cleanup on startup

## Scheduling Model
No background daemon; piggyback on user activity:
1. App start: run pruning cycle
2. Foreground event (>=6h since last): run pruning cycle

Store timestamp: `maintenance:lastPrune`

## Algorithm Sketch (Notifications Cap)
```ts
function enforceInboxCap(list: DeliveredNotification[], cap = 100) {
  if (list.length <= cap) return list;
  const sorted = [...list].sort((a,b) => b.createdAt - a.createdAt);
  return sorted.slice(0, cap);
}
```

## Telemetry
Log pruning runs: `maintenance.prune` with counts removed per category.

## Edge Cases
- Clock skew: rely on monotonic relative durations where possible
- User changes device timezone: unaffected (use epoch ms)

## Future Enhancements
- Evidence archival lifecycle (soft delete -> purge after 30d)
- Batched deletion confirmations for large sets
- User-configurable notification retention cap

## Acceptance Criteria (Phase 1)
- Notifications cap enforced
- Upload queue stale removal implemented (placeholder if queue not yet active)
- Prune cycle runs on start & after 6h inactivity
- Telemetry event logged with removal counts

---
Prepared: 2025-09-22
