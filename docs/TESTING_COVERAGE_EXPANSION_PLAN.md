# Testing Coverage Expansion Plan

## Current Snapshot (Observed)
- Unit + component tests for i18n, bookmarks, advocacy hub, parser, jurisdiction data, resources filtering
- Gaps: notifications pipeline (planned), evidence locker (planned), accessibility scripts, data migrations

## Coverage Goals
| Layer | Target |
|-------|--------|
| Core utilities & stores | >90% lines |
| Components (critical UX) | >80% lines |
| Scripts (gap / i18n / a11y) | Smoke tests + success/fail branches |
| Planned features (notifications, evidence) | Baseline test suite before prod usage |

## Priority Areas
1. Stores & Contexts: `store/jurisdiction`, forthcoming `store/notifications`, evidence queue (future)
2. Services: `services/aiAdvocacy` edge parsing, error handling
3. Scripts: `resources-gap-report.js/ts` deterministic output test
4. Activity Logging: ensure events fire for coach interactions
5. Localization: placeholder & unused key detectors (after implementation)

## New Test Suites (Planned)
| Suite | Purpose |
|-------|---------|
| notifications.dispatcher.test.ts | throttle, quiet hours, preference filtering |
| notifications.store.test.ts | persistence, migration path |
| evidence.encryption.test.ts (future) | key derivation, decrypt round-trip |
| a11y.contrast.test.ts | catch regressions in contrast script logic |
| i18n.placeholders.test.ts | ensure zero `[T]` remains post-cleanup |
| resources.gap.script.test.ts | stability of category coverage output |

## Helper Utilities
Create `__tests__/testUtils/time.ts` mocking Date/now for deterministic throttle tests.

## Test Data Fixtures
- Jurisdiction fixture with multiple `evidenceFocus` entries
- Notification templates mock registry
- Sample evidence item (future) with encrypted blob placeholder

## Tooling Enhancements
Add jest config moduleNameMapper for script paths if needed.

## Phased Implementation
1. Add utilities (time freeze, template registry mock)
2. Notifications Store + Dispatcher
  - Store unit tests: add/markRead/markAllRead/updatePrefs/lastSent; inbox cap
  - Dispatcher tests: quiet hours suppression, in‑app delivery during quiet, throttle windows
  - Template registry mock for deterministic scenarios
3. Scripts Regression
  - CLI shape tests for analytics report and i18n validators
4. Coverage Thresholds
  - Enforce Jest global thresholds (branches 60%, lines 70%, functions 70%) and collect coverage for notifications modules
5. Accessibility QA with User Input
  - Regular audits with real users with disabilities; capture issues into a11y backlog
6. Technology Updates (Assistive Tech)
  - Periodic test passes on latest iOS/Android AT (VoiceOver, TalkBack, Switch/Voice Control)
7. Standards Evolution (WCAG)
  - Track WCAG updates; add automated checks where feasible and manual audits otherwise
8. Platform Features
  - Validate new OS accessibility features and integrate where helpful
2. Implement notifications store tests alongside feature
3. Implement dispatcher logic + tests (throttle, quiet hours)
4. Add script regression tests (gap report, future i18n scanners)
5. Add coverage thresholds to `jest.config.js`

## Coverage Threshold Proposal
```js
coverageThreshold: {
  global: { lines: 75, statements: 75, functions: 70, branches: 65 },
  './store/**': { lines: 85 },
  './services/**': { lines: 80 }
}
```
Raise gradually after new suites land.

## CI Integration
- Add `--coverage` to `test:ci` for daily runs
- Badge generation (future) using coverage summary

## Acceptance Criteria
- New suites for notifications dispatcher & store exist at feature release
- Scripts each have at least one regression test
- Global coverage +5% from baseline (record baseline now)

---
Prepared: 2025-09-22
