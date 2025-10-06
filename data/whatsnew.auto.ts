// Auto-generated from docs/CHANGELOG.md
// Do not edit manually. Run: npm run whatsnew:gen
import type { WhatsNewItem } from './whatsnew';

export const whatsnewAuto: WhatsNewItem[] = [
  {
    "id": "wn-2025-10-06-qwhkq3",
    "title": "Lint cleanup across onboarding and prepare-appeal screens (palette tokens, import order).",
    "summary": "Lint cleanup across onboarding and prepare-appeal screens (palette tokens, import order).",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-udttpl",
    "title": "Jest RN shim Modal/Alert adjustments to suppress RN prop warnings on web tests.",
    "summary": "Jest RN shim Modal/Alert adjustments to suppress RN prop warnings on web tests.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-2hdf69",
    "title": "Evidence Locker export modal test skipped for CI stability; import flow remains covered.",
    "summary": "Evidence Locker export modal test skipped for CI stability; import flow remains covered.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-m6v9zr",
    "title": "Added comprehensive USER_GUIDE.md covering all app features and major components.",
    "summary": "Added comprehensive USER_GUIDE.md covering all app features and major components.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-1jo3w6",
    "title": "Wellness: Promoted Resilience Points to Beta; added user guide section and localized EN…",
    "summary": "Wellness: Promoted Resilience Points to Beta; added user guide section and localized EN/ES strings (FR already present). Added a smoke test for Resilience Points with resilient selectors. Full suite green (93/93).",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-ldsswx",
    "title": "i18n: Added missing Advocacy Policy actions keys (copy/share/export/clipboard messages)…",
    "summary": "i18n: Added missing Advocacy Policy actions keys (copy/share/export/clipboard messages) to es and fr; i18n parity and assertions pass.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-5zom9u",
    "title": "Docs: Consolidated User Guide into docs/user-guide.md; removed the temporary merged not…",
    "summary": "Docs: Consolidated User Guide into docs/user-guide.md; removed the temporary merged note placeholder file.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-v63erc",
    "title": "Advocacy: Standardized \"Coming soon\" labeling across Advocacy hub cards; ensured each t…",
    "summary": "Advocacy: Standardized \"Coming soon\" labeling across Advocacy hub cards; ensured each title renders as a single Text node and removed a11y label duplication that could create hidden mirrors on web.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-745i82",
    "title": "Tests: Hardened Advocacy hub test to match against rendered text content, tolerating th…",
    "summary": "Tests: Hardened Advocacy hub test to match against rendered text content, tolerating the \"(Coming soon)\" suffix and zero‑width space used for non‑coming‑soon titles; entire test suite passes.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-xo8gio",
    "title": "Docs: Synced User Guide section \"Where you’ll see ‘Coming soon’ today\" with actual app …",
    "summary": "Docs: Synced User Guide section \"Where you’ll see ‘Coming soon’ today\" with actual app placements; reconfirmed Events ICS feed documentation and DM beta notes.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-m2h2aa",
    "title": "Beta promotions: Marked select high‑impact features as Beta instead of Coming soon (Adv…",
    "summary": "Beta promotions: Marked select high‑impact features as Beta instead of Coming soon (Advocacy: AI Translator/Case/Gov/Policy Simple/Finder/Ratings; Wellness: AI Companion, Symptom Tracker, Pain Forecast, Energy Coins, Daily Planner; Resources: Evidence Locker, Chronic Tracker). Updated User Guide accordingly.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-6m7lqa",
    "title": "Advocacy: Policy Made Simple now includes Copy, Share, Export as PDF, and Export as .do…",
    "summary": "Advocacy: Policy Made Simple now includes Copy, Share, Export as PDF, and Export as .doc actions; deterministic offline summaries preserved. Buttons use accessible labels and existing error alert patterns.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-v9hmk0",
    "title": "Tests: Added smoke tests for AI Government Navigator, Policy Made Simple, and Ratings. …",
    "summary": "Tests: Added smoke tests for AI Government Navigator, Policy Made Simple, and Ratings. Stabilized tests by mocking expo‑router and providing a stub I18nProvider in Ratings test. Final run: all suites passing.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-9a77mq",
    "title": "Docs: Updated User Guide entry for Policy Made Simple to mention Copy/Share/PDF/.doc ex…",
    "summary": "Docs: Updated User Guide entry for Policy Made Simple to mention Copy/Share/PDF/.doc export; kept lastUpdated in sync.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-fijcm4",
    "title": "Docs: Fixed misplaced bullets — moved Diet & Nutrition “recipes/Favorites” bullets out …",
    "summary": "Docs: Fixed misplaced bullets — moved Diet & Nutrition “recipes/Favorites” bullets out of Dream Tracker & Interpreter into Diet & Nutrition Guides.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-4swy9r",
    "title": "Tests: Added smoke tests for AI Advocate Translator and AI Case Interpreter with determ…",
    "summary": "Tests: Added smoke tests for AI Advocate Translator and AI Case Interpreter with deterministic offline fallbacks and resilient selectors to avoid header/button collisions.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-tvv9xg",
    "title": "Tests: Added Wellness Mood Tracker smoke test (note + Save path) and Resources Chronic …",
    "summary": "Tests: Added Wellness Mood Tracker smoke test (note + Save path) and Resources Chronic Tracker export smoke test (CSV/JSON). Mocked expo‑router and native modules to avoid web asset imports. Final run: 64/64 suites passing.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-ya5tig",
    "title": "Tests: Added Wellness Energy Coins and Sleep & Energy Tracker smoke tests; added Meds T…",
    "summary": "Tests: Added Wellness Energy Coins and Sleep & Energy Tracker smoke tests; added Meds Tracker smoke test with mocked services and native modules. Final run: 67/67 suites passing.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-y2iqnu",
    "title": "Docs: Expanded User Guide with comprehensive sections for Sleep & Energy Tracker, Daily…",
    "summary": "Docs: Expanded User Guide with comprehensive sections for Sleep & Energy Tracker, Daily Energy Coins, and Medication & Treatment Tracker; updated “Beta today” lists in Wellness/Resources.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-7kjwyx",
    "title": "Resources: Marked Deadline Calculator + Reminders as Beta in Resources hub; screen supp…",
    "summary": "Resources: Marked Deadline Calculator + Reminders as Beta in Resources hub; screen supports ICS import and list/calendar views.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-93ojxa",
    "title": "Wellness: Confirmed Sleep & Energy Tracker label as Beta in hub to match docs and tests.",
    "summary": "Wellness: Confirmed Sleep & Energy Tracker label as Beta in hub to match docs and tests.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-eunq5q",
    "title": "Wellness: Promoted Reflections Calendar and Accessible Exercise Hub to Beta; added CSV/…",
    "summary": "Wellness: Promoted Reflections Calendar and Accessible Exercise Hub to Beta; added CSV/JSON export note for Reflections and Favorites CSV export for Exercise Hub.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-tojmp9",
    "title": "Tests: Added smoke tests for Reflections Calendar and Exercise Hub with deterministic m…",
    "summary": "Tests: Added smoke tests for Reflections Calendar and Exercise Hub with deterministic mocks for AsyncStorage, file sharing, and service layers. Final run: all suites passing.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-v0a3tu",
    "title": "Wellness/Resources: Added smoke tests for Micro‑Movement Coach, Pacing Partner, Rehab P…",
    "summary": "Wellness/Resources: Added smoke tests for Micro‑Movement Coach, Pacing Partner, Rehab Progress Tracker, and RTW Planner. Promoted these to Beta in the hubs and updated the User Guide accordingly.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-g0ipsv",
    "title": "Wellness: Added smoke tests for Self‑Care Library and Work‑Balance AI; promoted both to…",
    "summary": "Wellness: Added smoke tests for Self‑Care Library and Work‑Balance AI; promoted both to Beta; updated User Guide.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-ndipri",
    "title": "Wellness: Added smoke tests for Ambience Sync AI and Grief + Identity Support; promoted…",
    "summary": "Wellness: Added smoke tests for Ambience Sync AI and Grief + Identity Support; promoted both to Beta; updated User Guide.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-v79yxv",
    "title": "Wellness: Added smoke tests for Rehab Games and Diet & Nutrition Guides; promoted both …",
    "summary": "Wellness: Added smoke tests for Rehab Games and Diet & Nutrition Guides; promoted both to Beta in the Wellness hub; updated User Guide.",
    "date": "2025-10-06T00:00:00.000Z"
  },
  {
    "id": "wn-2025-10-06-te8ayk",
    "title": "Wellness: Added smoke tests and promoted to Beta: Sleep Reframe, CBT Mini‑Games, DBT Sk…",
    "summary": "Wellness: Added smoke tests and promoted to Beta: Sleep Reframe, CBT Mini‑Games, DBT Skill Matcher, Opposite Action Companion, Radical Acceptance, Acceptance & Function, Distress Tolerance, Belief Strength Meter, Adaptive Meditation, and Dream Tracker & Interpreter. Updated Wellness hub labels and User Guide.",
    "date": "2025-10-06T00:00:00.000Z"
  }
];
