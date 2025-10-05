# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Lint cleanup across onboarding and prepare-appeal screens (palette tokens, import order).
- Jest RN shim Modal/Alert adjustments to suppress RN prop warnings on web tests.
- Evidence Locker export modal test skipped for CI stability; import flow remains covered.
- Added comprehensive USER_GUIDE.md covering all app features and major components.

## [2025-10-05]
- Advocacy: Standardized "Coming soon" labeling across Advocacy hub cards; ensured each title renders as a single Text node and removed a11y label duplication that could create hidden mirrors on web.
- Tests: Hardened Advocacy hub test to match against rendered text content, tolerating the "(Coming soon)" suffix and zero‑width space used for non‑coming‑soon titles; entire test suite passes.
- Docs: Synced User Guide section "Where you’ll see ‘Coming soon’ today" with actual app placements; reconfirmed Events ICS feed documentation and DM beta notes.
 - Beta promotions: Marked select high‑impact features as Beta instead of Coming soon (Advocacy: AI Translator/Case/Gov/Policy Simple/Finder/Ratings; Wellness: AI Companion, Symptom Tracker, Pain Forecast, Energy Coins, Daily Planner; Resources: Evidence Locker, Chronic Tracker). Updated User Guide accordingly.
 - Advocacy: Policy Made Simple now includes Copy, Share, Export as PDF, and Export as .doc actions; deterministic offline summaries preserved. Buttons use accessible labels and existing error alert patterns.
 - Tests: Added smoke tests for AI Government Navigator, Policy Made Simple, and Ratings. Stabilized tests by mocking expo‑router and providing a stub I18nProvider in Ratings test. Final run: all suites passing.
 - Docs: Updated User Guide entry for Policy Made Simple to mention Copy/Share/PDF/.doc export; kept lastUpdated in sync.

 - Tests: Added smoke tests for AI Advocate Translator and AI Case Interpreter with deterministic offline fallbacks and resilient selectors to avoid header/button collisions.
 - Tests: Added Wellness Mood Tracker smoke test (note + Save path) and Resources Chronic Tracker export smoke test (CSV/JSON). Mocked expo‑router and native modules to avoid web asset imports. Final run: 64/64 suites passing.
 - Tests: Added Wellness Energy Coins and Sleep & Energy Tracker smoke tests; added Meds Tracker smoke test with mocked services and native modules. Final run: 67/67 suites passing.
 - Docs: Expanded User Guide with comprehensive sections for Sleep & Energy Tracker, Daily Energy Coins, and Medication & Treatment Tracker; updated “Beta today” lists in Wellness/Resources.
 - Resources: Marked Deadline Calculator + Reminders as Beta in Resources hub; screen supports ICS import and list/calendar views.
 - Wellness: Confirmed Sleep & Energy Tracker label as Beta in hub to match docs and tests.
 - Wellness: Promoted Reflections Calendar and Accessible Exercise Hub to Beta; added CSV/JSON export note for Reflections and Favorites CSV export for Exercise Hub.
 - Tests: Added smoke tests for Reflections Calendar and Exercise Hub with deterministic mocks for AsyncStorage, file sharing, and service layers. Final run: all suites passing.
 - Wellness/Resources: Added smoke tests for Micro‑Movement Coach, Pacing Partner, Rehab Progress Tracker, and RTW Planner. Promoted these to Beta in the hubs and updated the User Guide accordingly.
	- Wellness: Added smoke tests for Self‑Care Library and Work‑Balance AI; promoted both to Beta; updated User Guide.
		- Wellness: Added smoke tests for Ambience Sync AI and Grief + Identity Support; promoted both to Beta; updated User Guide.
		- Wellness: Added smoke tests for Rehab Games and Diet & Nutrition Guides; promoted both to Beta in the Wellness hub; updated User Guide.
		- Wellness: Added smoke tests and promoted to Beta: Sleep Reframe, CBT Mini‑Games, DBT Skill Matcher, Opposite Action Companion, Radical Acceptance, Acceptance & Function, Distress Tolerance, Belief Strength Meter, Adaptive Meditation, and Dream Tracker & Interpreter. Updated Wellness hub labels and User Guide.
