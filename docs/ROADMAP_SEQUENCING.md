# Roadmap Sequencing

## Guiding Priorities
1. User trust & core value (advocacy, evidence, resources)
2. Accessibility & localization readiness
3. Scalable engagement (notifications, metrics)
4. Privacy & data governance

## Phase Overview
| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Foundation & Jurisdiction | Jurisdiction data layer, coach parser, resource coverage script |
| 2 | Engagement & Guidance | Notifications templates, preferences UI, evidence locker MVP plan |
| 3 | Quality & Compliance | Accessibility audit scripts, localization cleanup, data governance doc |
| 4 | Instrumentation | Metrics enrichment, pruning & archival logic, coverage expansion tests |
| 5 | Enhancement | Evidence encryption, notification dispatcher, admin metrics UI |
| 6 | Optimization | Performance tuning, advanced ML scheduling, export & delete workflows |

## Critical Path Dependencies
| Dependent | Requires |
|-----------|----------|
| Notifications dispatcher | Template registry, preference matrix |
| Evidence encryption | Data governance policy |
| Metrics enrichment | Jurisdiction store stable |
| Localization cleanup scripts | Baseline i18n extraction stable |
| Pruning logic | Notifications store implementation |

## Sequenced Backlog (Detailed)
1. Implement notifications store + dispatcher (Phase 2->5 bridge)
2. Add preference UI binding existing `NotificationPreferences` component
3. Add inbox UI + unread badge
4. Implement pruning cycle hooks (notifications cap)
5. Evidence locker MVP (types + encrypted local storage)
6. Evidence upload queue & progress indicators
7. Add encryption key management & rotation (Phase 5)
8. Metrics enrichment layer + local buffer export
9. Admin metrics overview (simple table + counts)
10. Localization placeholder & unused key scripts
11. Add CI jobs for a11y contrast + i18n lint
12. Implement notifications quiet hours + throttle policies
13. Evidence export (ZIP encrypted) workflow
14. Account data wipe (privacy tool)
15. Adaptive notification scheduling (heuristic -> ML option)
16. What’s New auto-archival: Move entries older than 30 days to an archived list; show concise, plain-language updates only in current list
17. Add deep-linkable anchors in User Guide for popular sections (Evidence Locker, Deadlines, Reflections Calendar)

## Timeboxing (Indicative)
| Item | Estimate |
|------|----------|
| Notifications store + dispatcher | 2-3d |
| Preference UI integration | 1d |
| Inbox UI + badge | 1d |
| Pruning cycle | 0.5d |
| Evidence MVP (unencrypted base) | 3d |
| Encryption layer | 2d |
| Upload queue | 2d |
| Metrics enrichment + export | 1.5d |
| Admin metrics screen | 1d |
| i18n cleanup scripts | 1d |
| A11y contrast + scan scripts | 1d |

## Risk Register
| Risk | Impact | Mitigation |
|------|--------|------------|
| Encryption performance | Medium | Use streaming & WebCrypto |
| Notification fatigue | High | Throttle & quiet hours defaults |
| i18n drift | Medium | CI scripts & extraction reports |
| Metrics privacy concerns | High | Aggregate only, hash IDs |

## Definition of Done (Phase 5 Milestone)
- Notifications live (in-app + push) with preferences & pruning
- Evidence locker local encrypted storage functional
- Metrics enrichment & export operational for admin
- A11y & i18n scripts green in CI

## Out-of-Scope (Current Plan)
- Multi-device evidence sync
- Full offline-first replication layer
- Advanced AI summarization beyond coach & simplifier

---
Prepared: 2025-09-22
