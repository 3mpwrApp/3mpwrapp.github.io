# Accessibility Audit Setup

## Objectives
Establish a repeatable process to assess and improve WCAG 2.1 AA conformance across core screens, ensuring inclusive experience for assistive tech users.

## Scope (Phase 1)
- Automated static & runtime checks (lint + Jest + optional detox axe pass)
- Manual focus order & keyboard navigation checklist
- Color contrast validation against theme tokens
- Screen reader labeling review (iOS VoiceOver, Android TalkBack)

## Exclusions (Phase 1)
- Full cognitive load UX studies
- Gestures/drag alternative patterns (document but not fix yet)
- Biometric / haptic fallback patterns

## Tooling
| Layer | Tool | Purpose |
|-------|------|---------|
| Lint  | `eslint-plugin-jsx-a11y` | Catch basic ARIA / semantic issues |
| Runtime (React Native) | `@react-native-voice/voice` (existing) & custom audit harness | Validate labels/hints |
| Contrast | Script comparing `theme/Colors.ts` combinations using APCA | Ensure >= target contrast for text |
| Axe (web fallback) | `@axe-core/react` (optional for web preview) | Supplementary scanning |

## Commands (Proposed)
Add to `package.json` scripts:
```json
{
  "a11y:lint": "eslint 'components/**/*.{ts,tsx}' 'app/**/*.{ts,tsx}' --max-warnings=0",
  "a11y:contrast": "ts-node scripts/a11y-contrast-check.ts",
  "a11y:scan": "node scripts/a11y-scan-runner.js"
}
```

## New Scripts
### `scripts/a11y-contrast-check.ts`
- Loads `Colors.ts` & `Typography.ts`
- Defines sample text roles (body, caption, heading)
- Computes contrast (APCA or WCAG formula) for required foreground/background pairs (primary on background, accent on background, error text, link, inverse heading)
- Fails (exit 1) if below thresholds (WCAG AA: 4.5:1 normal, 3:1 large) or APCA equivalent

### `scripts/a11y-scan-runner.js`
- Enumerates a list of representative screens (Home, Advocacy Coach, Resources, Community Thread, Settings, Profile, Jurisdiction Panel)
- Launches Expo in headless / loads each component programmatically (if feasible) OR stubs render with Jest + react-test-renderer
- Checks for: missing `accessibilityLabel` where required, duplicate labels, touch target size heuristics (>=44x44), presence of dynamic content with `accessibilityLiveRegion`
- Outputs JSON report: `a11y-report.json`

## Focus Order Checklist Template
```
Screen: <Name>
[ ] Logical order (LTR / expected grouping)
[ ] No trapped focus
[ ] Skip links / primary actions reachable within 3 swipes
[ ] Modal focus: initial focus on heading or first interactive
[ ] Dismissal via Escape / Back accessible
```

## Labeling Checklist
```
[ ] All icons have readable labels (unless decorative)
[ ] Buttons describe action (no generic 'Tap here')
[ ] Form fields have programmatic name, role, state
[ ] Dynamic status updates use polite announcements
```

## Contrast Targets
| Type | Target |
|------|--------|
| Body text | ≥ 4.5:1 |
| Large text (>=18pt or 14pt bold) | ≥ 3:1 |
| Icons essential | ≥ 3:1 |
| Focus outline | ≥ 3:1 vs adjacent |

## Theme Token Guard
Add unit test: iterate tokens & ensure no pair used in `Typography.ts` mapping violates contrast when combined with default background.

## Integration Steps
1. Add scripts & install dependencies (`axe-core` only if web target needed)
2. Implement contrast checker script
3. Implement scan runner stub (start with static heuristics)
4. Add GitHub Action job (future) to run `npm run a11y:contrast` + `npm run a11y:scan`
5. Document manual testing protocol in this file
6. Train dev flow: run contrast before adjusting theme tokens

## Metrics & Tracking
- Store last report hash in `a11y-report.meta.json`
- Fail CI if new violations increase count

## Risk Mitigations
- False positives: allow `// a11y-ignore-next-line` ESLint directive with justification comment
- Platform divergence: keep platform-specific label adjustments isolated

## Future Enhancements
- Automated voice hints coverage % metric
- Gesture alternative library
- High contrast theme auto switch based on OS setting

## Acceptance Criteria (Phase 1)
- Scripts present & runnable locally
- Contrast check reports no failures or blocks PR
- A11y scan produces JSON with 0 critical issues for baseline screens
- Manual checklists created for ≥5 core screens

---
Prepared: 2025-09-22
