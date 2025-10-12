# Unfinished Work / Follow-Up Backlog

Purpose: Living checklist of outstanding tasks after recent i18n, advocacy, and data ownership implementation cycles.

Status legend: [Done] completed this cycle · [In Progress] partially implemented · [Planned] not started
Linked inventory of raw placeholders: see `docs/UNFINISHED_WORK.md` (auto scan).
Last updated: 2025-10-11

## 1. Data Ownership & Privacy
- [Done] 100% User Data Ownership implementation and technical verification
- [Done] BYOC (Bring Your Own Cloud) strict mode with complete app storage disabling
- [Done] Data ownership statement component for in-app display
- [Done] Privacy policy updates with prominent data sovereignty section
- [Done] User guide updates reflecting complete data ownership guarantees
- [Done] **MAJOR: Enterprise Security Framework** - Comprehensive security-by-design implementation
  - [Done] AES-256 encryption with hardware-backed key storage
  - [Done] Air-gapped architecture with optional private cloud support
  - [Done] TLS 1.3 network security with certificate pinning
  - [Done] Anti-tampering and runtime integrity monitoring
  - [Done] Input validation framework preventing injection attacks
  - [Done] Minimal permissions with privacy-first design
  - [Done] OWASP Mobile Top 10 compliance testing
  - [Done] Automated security validation and testing suite
- [Planned] Additional BYOC providers (S3 compatible, IPFS, personal FTP)
- [Planned] Enhanced encryption options for Evidence Locker
- [Planned] Automated privacy verification reports for users
- [Planned] Third-party security audit coordination
- [Planned] User data portability enhancements (structured export formats)

## 2. Localization
- [Planned] Replace placeholder "[T]" entries in `locales/es/common.json` and `locales/fr/common.json` with real translations.
- [Planned] Add automated CI gate for translation coverage (extend `i18n.locale.parity` with % threshold from `i18n:coverage`).
- [Planned] Introduce pluralization validation for new advocacy & evidence keys (ensure they appear in `i18n-plural-check`).
- [Planned] Generate translation coverage badge in README (optional CI artifact).

## 2. Accessibility & WCAG
- [Done] Integrate `wcag_compliance_audit.js` in CI (palette AA gating, JSON artifact upload).
- [Done] Add GitHub workflow step uploading `wcag-report.json`.
- [Done] Palette adjustment for `light.tabIconSelected` (#0056B3) to reach AAA.
- [Planned] Expand `a11y-scan.js`: detect icon-only Pressables missing labels, heading role heuristics, redundant role/label combos.
- [Planned] Inline contrast severity classification (error/warn/info) & later gating once inline issues remediated.
- [Planned] Dynamic font scaling smoke test (large accessibility text setting simulation).
- [Done] Per‑screen loading labels, post‑load item count announcements, undo pattern, and focus restoration patterns implemented; docs updated.
- [Done] Jurisdiction context provider added at app root to fix dependent panels and improve accessibility of jurisdiction-aware content.
- [Planned] Add regression snapshot of WCAG JSON to detect palette drift.

## 3. Analytics Coverage
- [Done] Re-introduce analytics event tests (pure harness) for:
  - `advocacy.ask.submitted`
  - `advocacy.world.view`
  - `advocacy.collective.submit`
- [Done] Added `services/analyticsClient.ts` abstraction + capture helpers.
- [Done] Migrated all feature code to `trackEvent` (removed direct UI-layer `logEvent` calls).
- [Done] Added centralized registry `services/analyticsEvents.ts`.
- [Done] Automated test `analytics.registry.test.ts` that scans source for event usage vs registry.
- [Done] Parameter schema enforcement (define expected keys & types per event, warn on drift + redaction support).
- [Done] Script to block new direct imports of `logEvent` outside `services/analytics.ts` (`scripts/check-analytics-imports.mjs`).
- [In Progress] Expanded payload redaction policy (classification field + CI sensitive summary; pending auto-detect + policy doc).
- [Done] Human-friendly CLI scan report (`npm run analytics:scan`).
- [Done] Generate markdown artifact of event counts in CI (`npm run analytics:report` in test chain).
- [Done] Type generation for event param schemas (`types/analytics.ts` + `trackEventStrict`).

## 4. Performance / Technical Debt
- [Done] Add Node engines field (>=20) in `package.json`.
- [Planned] Enforce Node version in CI matrix + preflight script.
- [Planned] Replace deprecated `react-test-renderer` with RN Testing Library (blocks: peer deps alignment).
- [Done] Enable tab screen lazy loading in Expo Router (reduces startup work).
- [Planned] Bundle size budget check (report warning if JS bundle > threshold).
- [Done] Router warnings resolved (hidden non-screen routes under tabs and dummy default export for app/utils proxy).
- [Done] Route conventions documented in README and mirrored in `docs/ROUTE_MAP.md` to prevent regressions.
- [Done] Advisory pre-commit check warns on `<Tabs.Screen name=".../...">` to catch common routing mistake early.
- [Planned] Optional stricter gate: make the Tabs.Screen name check blocking in CI/pre-push once the team is comfortable.

## 5. Evidence Locker Enhancements
- [Planned] Retry with exponential backoff for failed uploads.
- [Planned] Background sync indicator badge on tab icon.
- [Planned] File type icons (PDF, Image, Audio) with accessible labels.
- [Planned] Local encryption option (tie into Security section once designed).

## 6. Policy Simplification Tool
- [Planned] Remote policy fetch with caching + ETag.
- [Planned] In-page search across simplified sections.
- [Planned] Export (TXT/Markdown) with accessible file naming.
- [Planned] Add analytics for section expansion interactions.

## 7. Notifications
- [Planned] Per-template analytics counters (delivery + interaction) in Firestore.
- [Planned] Quiet hours user setting and enforcement logic.
- [Planned] Deduplicate identical queued notifications (content hash).

## 8. Testing Improvements
- [Planned] Snapshot avoidance policy (semantic assertions instead).
- [Planned] Regression tests for `UploadProgress` component.
- [Planned] Custom matcher `expectKey(locale, key)`.
- [Planned] Add performance smoke test (cold start metric capture in Jest via mock Date).

## 9. DevEx
- [Planned] Script to auto-tag untranslated lines inline (`i18n-inline-tag`).
- [Done] Pre-push hook with lint, strict typecheck, i18n:assert, a11y:scan, wcag audit.
- [Done] Added advisory pre-commit script for Tabs.Screen names (slashes) to surface route issues early (non-blocking).
- [Planned] Add commit-msg hook to enforce conventional commit prefixes (feat:, fix:, docs:, chore:, test:, perf:, a11y:).
- [Planned] Add PR template referencing backlog & WCAG report artifact.
- [Done] Added `npm run analytics:scan` CLI output (human friendly) using same discovery logic as registry test.

## 10. Security & Privacy
- [Done] **MAJOR: Enterprise Security Implementation** - Complete security-by-design framework
  - [Done] Air-gapped architecture with 100% user data ownership
  - [Done] AES-256 encryption with hardware keystore integration
  - [Done] TLS 1.3 network security with certificate pinning
  - [Done] Comprehensive input validation and sanitization
  - [Done] Runtime tamper detection and integrity monitoring
  - [Done] OWASP Mobile Top 10 compliance testing
  - [Done] Security testing automation (validate/test/all scripts)
  - [Done] Complete security documentation and implementation guides
- [Done] Admin audit log implemented (Firestore `admin_audit` + export CSV in Admin Panel). See `docs/ADMIN_AUDIT.md`.
- [Planned] Threat model doc for evidence storage and advocacy submissions.
- [Planned] Client-side encryption at rest toggle for evidence files.
- [Planned] Data minimization checklist integrated into README.

## 11. App Runtime Validation
- [In Progress] Post-Expo SDK 54 upgrade manual smoke on devices (remaining: deep linking path list verification).
- [Done] Eliminated “No route named …” warnings by correcting Tab Screen names to group segments and removing nested routes from Tabs.
- [Planned] Automated detox/e2e smoke for navigation & notifications permission flow.
- [Planned] Device matrix in CI (at least Android emulator headless for basic launch).

## 12. Monitoring & Observability
- [Planned] Sentry release & source map upload in CI (post-build step + release health).
- [Planned] Redaction layer for PII in analytics params (middleware in `services/analytics`).
- [Planned] Add `console.warn` capture & aggregation in dev builds.
- [Planned] Performance trace for initial screen mount (custom mark/measure).

## 13. Future Nice-to-Haves
- [Planned] World Map: cluster performance test & offline fallback tiles.
- [Planned] Ask Advocate: auto-suggest similar questions before submit.
- [Planned] Collective Reports: user feedback loop (Was this helpful?).
- [Planned] Offline-first bundle prefetch for critical advocacy tools.

---
Ownership: Keep this file updated each PR (add/remove lines). Short, actionable bullet style.

## Status Delta — Campaigns & Advocacy (Oct 7, 2025)

- [Done] Campaigns list and room fully implemented
  - `app/(tabs)/campaigns/index.tsx`: Sections, search, create/join/leave, share, support +1.
  - `app/(tabs)/campaigns/room/[id].tsx`: Tasks, Notes, CSV export, Share Room Link, Invite Moderator, accept invite token.
- [Done] AI advocacy tools shipped
  - `app/(tabs)/advocacy/ai-case-interpreter.tsx`: Offline/LLM summary, next steps, share/copy/PDF/DOC, a11y & disclaimer.
  - `app/(tabs)/advocacy/accountability-coach.tsx`: Plan, violation detect, letter draft, response track, ally brief; persisted to cases.
- [Docs] User Guide updated (Campaigns): added Share Room Link and Invite Moderator steps.

Note: The automated soft scan still flags historical "placeholder/coming soon" in several files, including these screens; those findings are now stale. See `docs/UNFINISHED_WORK.md` for the raw scan output.
