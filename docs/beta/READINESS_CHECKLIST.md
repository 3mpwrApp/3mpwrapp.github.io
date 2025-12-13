# Closed Beta – Readiness Checklist (Free)

> **Last Updated:** December 7, 2025  
> **Status:** ✅ ALL CHECKS PASSING - Production Ready

This checklist ensures we can run a stable closed beta without paid accounts.

## Technical
- [x] Lint, strict typecheck, tests passing on main **(721 tests, 0 errors)**
- [x] i18n diff/threshold/assert clean (EN/ES/FR)
- [x] A11y scan + WCAG audit pass **(0 issues)**
- [x] What's New daily generator + auto‑archive >30 days
- [x] Privacy & data governance doc in repo
- [x] Error boundaries & offline fallbacks present on AI features
- [x] App runs fully in Expo Go (no missing native modules)
- [x] **Final stress test complete** (December 7, 2025)

## Distribution (Expo Go)
- [x] Unlisted Expo project link or dev tunnel for invited testers
- [x] Tester instructions prepared (see Tester Guide)
- [x] Easy opt-out: clear local data in Settings → Privacy

## Product
- [x] User Guide and Quick Tour links in README
- [x] Anchors for popular topics (Evidence, Deadlines, Reflections)
- [x] Personalization: always-on policy documented (no global off toggle)
- [x] Jurisdiction coverage doc expanded (UNCRPD, Charter, provincial)

## Feedback & Support
- [x] Contact channel set: empowrapp08162025@gmail.com or GitHub Issues
- [x] Triage labels: bug, performance, accessibility, translation, UX
- [x] Lightweight release notes via What's New
- [x] Comprehensive Beta Tester Guide created and published (see docs/COMPREHENSIVE_BETA_TESTER_GUIDE.md)

## Nice-to-have (optional)
- [x] Weekly "What's New" summary in Notifications (silent, auto-expire)
  - Implemented: `services/weeklyWhatsNewNotification.ts` with Monday 9 AM scheduling
  - UI: `components/WeeklyWhatsNewToggle.tsx` in Settings → What's New Notifications
  - Features: Silent notifications, 7-day auto-expire, opt-in toggle
- [x] Minimal crash labeling via Sentry DSN in .env (local only)
  - Implemented: `services/sentryLabeling.ts` with automatic feature/type/severity tagging
  - Integration: Replaces `initSentry()` in `app/_layout.tsx`
  - Labels: feature (wellness, advocacy, etc.), type (network, validation), severity (critical, error, warning)
- [x] CI job to run analytics report and attach as artifact
  - Implemented: `.github/workflows/ci-consolidated.yml` step after `perf:budget`
  - Artifact: `docs/analytics-report.md` uploaded with 30-day retention
- [x] Beta tester badge implementation (documented as "coming soon")
  - Implemented: `services/betaBadge.ts` with Firestore sync for cross-device persistence
  - UI: `components/BetaTesterBadge.tsx` with welcome card and shield-star icon
  - Display: Shown in Profile screen (ProfileCard.tsx) for authenticated users

---
**Prepared:** 2025-10-06  
**Last Updated:** 2025-12-12 (All nice-to-have features implemented)
