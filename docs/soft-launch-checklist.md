Soft Launch QA Checklist

Owner: 3mpwr App

Build & Cache
- Clear Metro cache: `npm run metro:clear`
- Rebuild dev client (Android): `npm run android`
- Verify icon fonts load (no missing glyphs “X”)

Navigation & Tabs
- Tabs show correct labels (Home, Campaigns, Community, Resources, Wellness, What’s New)
- Active/inactive colors match theme, labels readable at large text
- No router warnings during navigation (no "No route named …"): Tabs reference group segment names only — DONE

Lists (Empty/Loading/Error)
- Podcasts/Resources/Campaigns/Community/Events/Archive/FAQs/Research
- Loading: skeleton rows appear
- Error: message announces as alert; retry/refresh works
- Empty: friendly message visible; padding feels consistent
- Post‑load item-count announcements (polite, one‑time) on lists — DONE

Saved/Favorites
- Saved tab shows empty message initially
- Bookmark/save toggles update Saved list; subtitles readable

What’s New
- Title/labels read “What’s New”
- Empty state shows; adding item works and marks unread

Settings/Profile
- Display name updates; errors show alerts
- Profile photo picker handles “unavailable” gracefully; upload works in dev build
- High contrast toggle works; offline banner appears during Firestore offline
- Jurisdiction context provider wired at app root (panels render correctly) — DONE

Community
- Channels list shows sections + empty state
- Thread lists show empty state and readable metadata
- Compose/post/comment buttons have adequate touch targets

Events
- Calendar month nav buttons have hit slop and correct a11y labels
- Event meta uses “date - place”

Accessibility
- Headers use `MAX_FONT_SCALE`; content wraps without truncation — DONE
- Buttons/links have roles and labels; small controls have hit slop — DONE (static scan 0 issues)
- Error messages use `accessibilityRole="alert"` — DONE
- Contrast audit passes palette AA — DONE (see `wcag-report.json`)
- Accessibility audit report added — DONE (`docs/ACCESSIBILITY_AUDIT_REPORT.md`)
- Screen reader post‑load announcements for item counts — DONE (shared hook)

Performance/Offline
- App foreground warms caches (Podcasts, Resources, Campaigns, Events)
- Offline banner appears when network unavailable; lists use cached/local data

Release Notes
- Version: 1.0.0-rc.1
- Scope: UI polish, accessibility, offline resilience, soft‑launch readiness
- Promotions: Resources tools promoted to Beta (Rights Checker, Appeal Coach, Deadlines + Reminders, Evidence Checklist, Voice‑to‑Case Notes, Template Gallery, Support Directory)
- Notifications: Quiet hours defaults (22:00–07:00), throttle windows respected, in‑app delivery always on; verify test suite passes `notifications.store` and `notifications.dispatcher` specs

Accessibility (detailed)
- High Contrast: global palette and compliant contrast ratios — PASS (AA)
- Text Scaling: up to 200% without layout breakage — PASS (spot-checked Settings, Wellness)
- Screen Reader: headers/roles/alerts announce correctly; focus order logical — PASS (spot-checked)
- Reduce Motion: transitions minimized when enabled — PASS
- Tap Targets: 44pt minimum for small controls — PASS (HIT_SLOP_8)
- Dyslexia‑friendly spacing: copy and forms retain readability — PASS

Offline Resilience
- Lists show cached data when offline; clear offline banner
- Compose queues: community posts/DMs retry when back online
- Evidence Locker: works offline; exports when online

Admin & Security
- Admin role gating wired (Firestore rules + AdminGuard) — DONE
- Admin scripts present (`npm run admin:*`) — DONE
- Server admin endpoints optional; require credentials — DONE (no-op if unavailable)
- Threat model — TODO (tracked in `unfinishedwork.md`)
- Admin audit log — DONE (Firestore `admin_audit`, admin-only read/write; viewer in Admin Panel)

Pruning & Archival
- What's New auto-archive >30d — DONE
- Evidence upload queue: prune completed >30d — DONE
- Temp evidence exports in cache: purge >7d — DONE (best-effort)
- Prune cycle runs on app start and when foregrounded after 12h — DONE
- Telemetry `maintenance.prune` logs removal counts — DONE

CI/Test Health
- Full test suite green (101 suites, 194 tests) — PASS
- Jest worker graceful-exit warning due to open handles — ACCEPTED (intermittent; added unref() on app intervals; safe to proceed)
- Pre-push gates enforce: lint (0 warnings), strict typecheck, a11y scan, WCAG audit, i18n assert/diff/plural/threshold, analytics report, PII soft scan, perf budget — PASS
- Advisory pre-commit guard for bad `Tabs.Screen` names (slashes) — DONE

Docs & Conventions
- Route conventions documented in README and mirrored in `docs/ROUTE_MAP.md` — DONE
- ROUTE_MAP regenerated/synced with latest routes — DONE

