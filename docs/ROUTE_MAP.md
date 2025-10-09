# Route Map (Expo Router)

Generated snapshot of user-facing routes derived from the `app/` directory. Implementation helpers like `*.impl.tsx`, `*.jest.tsx`, and `_layout.tsx` are omitted. Paths use Expo Router conventions.

Last updated: 2025-10-09

Note
- Hidden/admin-only routes are marked as such.
- Dynamic segments are shown in square brackets (e.g., `[id]`).
- Some internal or experimental routes are included for completeness and may be hidden in production.

## Root
- `/` → `app/index.tsx` (launch router; delegates to auth or tabs depending on state)
- `/modal` → `app/modal.tsx` (modal route)
- `/profile` → `app/profile.tsx`
- `/* not-found */` → `app/+not-found.tsx`

## Auth flow (group)
- `/(auth)/login` → `app/(auth)/login.tsx`
- `/(auth)/register` → `app/(auth)/register.tsx`
- `/(auth)/onboarding` → `app/(auth)/onboarding.tsx`

## Tabs root
- `/(tabs)` → `app/(tabs)/index.tsx` (Tab container)

Common top-level tabs/screens under `/(tabs)`:
- `/(tabs)/campaigns` → `app/(tabs)/campaigns/index.tsx`
- `/(tabs)/community` → `app/(tabs)/community/index.tsx`
- `/(tabs)/resources` → `app/(tabs)/resources/index.tsx`
- `/(tabs)/wellness` → `app/(tabs)/wellness/index.tsx`
- `/(tabs)/advocacy` → `app/(tabs)/advocacy/index.tsx`
- `/(tabs)/whatsnew` → `app/(tabs)/whatsnew/index.tsx`
- `/(tabs)/saved` → `app/(tabs)/saved.tsx`
- `/(tabs)/settings` → `app/(tabs)/settings.tsx`
- `/(tabs)/faqs` → `app/(tabs)/faqs.tsx`
- `/(tabs)/about` → `app/(tabs)/about.tsx`
- `/(tabs)/inbox` → `app/(tabs)/inbox.tsx`
- `/(tabs)/voice-help` → `app/(tabs)/voice-help.tsx`

## Community
- `/(tabs)/community` → feed/home
- `/(tabs)/community/[slug]` → topic/category
- `/(tabs)/community/threads/[id]` → thread detail
- `/(tabs)/community/compose` → create post
- `/(tabs)/community/dms` → direct messages
- `/(tabs)/community/dms/[id]` → direct message thread
- `/(tabs)/community/my-posts` → your posts
- `/(tabs)/community/mutual-aid` → mutual aid hub
- `/(tabs)/community/mutual-chat` → mutual chat room
- `/(tabs)/community/testers-chat` → testers chat (internal/testing)
- `/(tabs)/community/media-studio` → media tools
- `/(tabs)/community/safety` → safety & reporting

## Events
- `/(tabs)/events` → event list
- `/(tabs)/events/[id]` → event detail
- `/(tabs)/events/finder` → event finder

## Podcasts
- `/(tabs)/podcasts` → podcast list
- `/(tabs)/podcasts/[id]` → episode detail
- `/(tabs)/podcasts/stories/[id]` → story detail

## Research
- `/(tabs)/research` → research hub
- `/(tabs)/research/articles`
- `/(tabs)/research/reports`
- `/(tabs)/research/studies`
- `/(tabs)/research/wait-times`
- `/(tabs)/research/history-timeline`
- `/(tabs)/research/master-index`
- `/(tabs)/research/uncrpd-info`
- `/(tabs)/research/[id]`

## Wellness
- `/(tabs)/wellness` → wellness hub
- Habits & trackers: 
  - `/(tabs)/wellness/daily-planner`
  - `/(tabs)/wellness/sleep-energy-tracker`
  - `/(tabs)/wellness/sleep-reframe`
  - `/(tabs)/wellness/pain-forecast`
  - `/(tabs)/wellness/micro-movement`
  - `/(tabs)/wellness/exercise-hub`
  - `/(tabs)/wellness/exercise-favorites`
  - `/(tabs)/wellness/achievements`
  - `/(tabs)/wellness/symptom-tracker`
  - `/(tabs)/wellness/trigger-detector`
- Skills & supports:
  - `/(tabs)/wellness/ai-companion`
  - `/(tabs)/wellness/resilience`
  - `/(tabs)/wellness/resilience-points` (if enabled)
  - `/(tabs)/wellness/belief-meter`
  - `/(tabs)/wellness/pacing-partner`
  - `/(tabs)/wellness/rehab-games`
  - `/(tabs)/wellness/nutrition-guides`
  - `/(tabs)/wellness/grief-support`
  - `/(tabs)/wellness/harm-reduction`
- DBT suite:
  - `/(tabs)/wellness/dbt`
  - `/(tabs)/wellness/acceptance-function`
  - `/(tabs)/wellness/opposite-action`
  - `/(tabs)/wellness/radical-acceptance`
  - `/(tabs)/wellness/distress-tolerance`
- Work & balance:
  - `/(tabs)/wellness/work-balance-ai`
  
## Advocacy
- `/(tabs)/advocacy` → advocacy hub
- `/(tabs)/advocacy/ask`
- `/(tabs)/advocacy/assistant-hub`
- `/(tabs)/advocacy/ally-hub`
- `/(tabs)/advocacy/policy-simple`
- `/(tabs)/advocacy/ratings`
- `/(tabs)/advocacy/lawyer-finder`
- `/(tabs)/advocacy/world-map`
- AI tools:
  - `/(tabs)/advocacy/ai-advocate-translator`
  - `/(tabs)/advocacy/ai-case-interpreter`
  - `/(tabs)/advocacy/ai-gov-navigator`
- Accountability:
  - `/(tabs)/advocacy/accountability-coach`
  - `/(tabs)/advocacy/accountability-cases`
  - `/(tabs)/advocacy/accountability-case`
  - `/(tabs)/advocacy/[id]` (case detail)

## Resources
- `/(tabs)/resources` → resources hub
- Evidence & documents:
  - `/(tabs)/resources/evidence-locker`
  - `/(tabs)/resources/evidence-queue`
  - `/(tabs)/resources/evidence-checklist`
  - `/(tabs)/resources/doctor-visit-prep`
  - `/(tabs)/resources/voice-notes`
  - `/(tabs)/resources/templates-gallery`
- Rights & policy:
  - `/(tabs)/resources/rights-checker`
  - `/(tabs)/resources/rights-explainer`
  - `/(tabs)/resources/policy-simulator`
  - `/(tabs)/resources/impact-simulator`
  - `/(tabs)/resources/justice-as-a-service`
  - `/(tabs)/resources/support-directory`
  - `/(tabs)/resources/allyship-playbook`
- Claims & employment:
  - `/(tabs)/resources/claims-navigator`
  - `/(tabs)/resources/denial-decoder`
  - `/(tabs)/resources/appeal-coach`
  - `/(tabs)/resources/prepare-appeal`
  - `/(tabs)/resources/rtw-planner`
  - Letters:
    - `/(tabs)/resources/letter-accommodation`
    - `/(tabs)/resources/letter-appeal`
    - `/(tabs)/resources/letter-reconsideration`
    - `/(tabs)/resources/letter-rtw-plan`
    - `/(tabs)/resources/letter-union-request`
- Health & tracking:
  - `/(tabs)/resources/meds-tracker`
  - `/(tabs)/resources/rehab-tracker`
  - `/(tabs)/resources/chronic-tracker`
  - `/(tabs)/resources/doctor-visit-prep`
  - `/(tabs)/resources/accessibility-log`
  - `/(tabs)/resources/body-mechanics-advisor`
  - `/(tabs)/resources/financial-safety-net`
  - `/(tabs)/resources/adaptive-tech-library`
  - `/(tabs)/resources/myth-busting-hub`

## Campaigns
- `/(tabs)/campaigns` → campaign list
- `/(tabs)/campaigns/[id]` → campaign detail
- `/(tabs)/campaigns/room/[id]` → live room

## Saved
- `/(tabs)/saved` → saved items

## Settings
- `/(tabs)/settings` → settings home

## Admin (hidden)
- `/(tabs)/admin` → admin home (hidden)
- `/(tabs)/admin/moderation` → moderation tools (hidden)
- Additional panels under `/(tabs)/admin/panels/*` (hidden)

## Archive (internal)
- `/(tabs)/archive` → archive index (internal/hidden)

---

How this is generated
- Copilot scanned the `app/` folder for `*.tsx` files and compiled the route list, omitting `*.impl.tsx` and other non-routable helpers.
- If you add or remove screens, re-run Copilot to refresh this snapshot.

## Route Conventions (Expo Router)

To keep routing predictable and avoid warning floods:

- Tabs use group segment names, not child files. Do this:
  - `name="wellness"`, `name="resources"`, `name="events"`, `name="community"`, `name="campaigns"`, `name="advocacy"`, `name="podcasts"`, `name="research"`, `name="whatsnew"`.
  - Don’t append `/index` in Tab names. For example, avoid `name="resources/index"`.

- Don’t declare nested stack routes in the Tabs layout. Each section manages its own nested routes via its `_layout.tsx` under `app/(tabs)/<section>/`.
  - Remove any `Tabs.Screen` like `resources/allyship-playbook`, `community/threads/[id]`, `events/finder]`, etc. They belong to their section’s stack, not Tabs.

- Hidden routes under Tabs should be direct children only (no slashes), e.g. `index`, `inbox`, `settings`, `saved`, `saved-original`, `voice-help`, `admin`, `archive`, `settings.sections`.
  - If a folder has an `index.tsx` inside (e.g., `app/(tabs)/admin/index.tsx`), reference it in Tabs as `name="admin"` (the group name), not `admin/index`.

- When adding a new section:
  1) Create `app/(tabs)/<section>/_layout.tsx` with a `<Stack />`.
  2) Add `app/(tabs)/<section>/index.tsx` as the entry screen.
  3) In `app/(tabs)/_layout.tsx`, add a single `<Tabs.Screen name="<section>" ... />`.

Why: Expo Router’s Tabs only know immediate children. Pointing Tabs at `segment/index` or at deeply nested paths causes “No route named …” warnings because those children are owned by the nested Stack.
