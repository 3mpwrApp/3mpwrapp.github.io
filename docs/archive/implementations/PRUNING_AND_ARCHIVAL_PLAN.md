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
| Temp Files (evidence) | Purge exported/summaries >7d |

## Archival Strategy (Future)
Evidence export: produce encrypted ZIP (AES-256 GCM) containing metadata.json + blobs/. Provide retention policy for generated exports (auto delete after 7 days).

## Implementation Hooks
- Notifications store: enforce cap after push — IMPLEMENTED (`store/notifications.tsx`, tests cover)
- Upload queue processor: scheduled sweep (on app launch + every 12h) removing old completed records — DONE (`services/evidenceQueue.ts` sweepQueueOldCompleted)
- Temp file manager: cleanup on startup — DONE (best-effort `sweepTempEvidenceFilesOlderThan` for cache files with safe prefixes)
- What's New auto-archive >30 days — IMPLEMENTED (`services/localContent.ts`)

## Scheduling Model
No background daemon; piggyback on user activity:
1. App start: run pruning cycle
2. Foreground event (>=12h since last): run pruning cycle

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
Log pruning runs: `maintenance.prune` with counts removed per category (removed_queue_completed, removed_temp_evidence, since_ms).

## Edge Cases
- Clock skew: rely on monotonic relative durations where possible
- User changes device timezone: unaffected (use epoch ms)

## Future Enhancements
- Evidence archival lifecycle (soft delete -> purge after 30d)
- Batched deletion confirmations for large sets
- User-configurable notification retention cap

## Acceptance Criteria (Phase 1)
- Notifications cap enforced — DONE
- Upload queue stale removal implemented — DONE
- Prune cycle runs on start & after 12h inactivity — DONE (app/_layout.tsx hooks)
- Telemetry event logged with removal counts — DONE (`maintenance.prune`)

---
Prepared: 2025-09-22
