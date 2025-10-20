# Closed Beta – Readiness Checklist (Free)

This checklist ensures we can run a stable closed beta without paid accounts.

## Technical
- [x] Lint, strict typecheck, tests passing on main
- [x] i18n diff/threshold/assert clean (EN/ES/FR)
- [x] A11y scan + WCAG audit pass
- [x] What’s New daily generator + auto‑archive >30 days
- [x] Privacy & data governance doc in repo
- [x] Error boundaries & offline fallbacks present on AI features
- [x] App runs fully in Expo Go (no missing native modules)

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
- [ ] Weekly "What's New" summary in Notifications (silent, auto-expire)
- [ ] Minimal crash labeling via Sentry DSN in .env (local only)
- [ ] CI job to run analytics report and attach as artifact
- [ ] Beta tester badge implementation (documented as "coming soon")

---
**Prepared:** 2025-10-06  
**Last Updated:** 2025-10-20 (Beta Documentation Consolidation)
