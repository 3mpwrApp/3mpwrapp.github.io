# Copilot Instructions for Empowr App

## Project Overview
- React Native app using Expo Router for file-based navigation (`app/` directory).
- Main tabs: Home, Campaigns, Community, Resources, Wellness, Advocacy, Settings, What's New.
- State management via context and local stores (see `context/`, `store/`).
- Data: Local mock data in `data/`, remote APIs, and Firestore integration.
- Accessibility, localization, and admin tools are first-class features.

## Key Patterns & Conventions
- **Routing:** File-based, e.g. `app/(tabs)/wellness.tsx` for tab screens. Use `Link` from `expo-router` for navigation.
- **Auth:** Managed in `store/auth.tsx`. Auth state controls routing in `app/index.tsx`.
- **Localization:** Use `useTranslation()` from `i18n/index.tsx`. Language files in `locales/<lang>/common.json`.
- **Accessibility:** Use constants from `constants/a11y.ts` and hooks from `hooks/useA11y.ts`.
- **AsyncStorage:** Used for persistence in stores and some features. Optional, fallback to session-only if not installed.
- **Notifications:** Local and remote push via Expo. See `services/notifications.ts` and scripts in `scripts/`.
- **Firestore:** Rules in `firebase/firestore.rules`. Data flows through `services/firestore.ts` and related files.
- **Admin:** Scripts in `scripts/` and admin logic in `components/AdminGuard.tsx`.

## Developer Workflows
- **Install:** `npm install`
- **Start:** `npx expo start`
- **Lint:** `npm run lint` (uses ESLint)
- **Accessibility scan:** `npm run a11y:scan`
- **Push notifications:** Test via Profile screen or `scripts/send-expo-push.mjs`
- **Firestore rules:** Deploy with `npm run rules:deploy`
- **Branding:** Replace assets in `assets/images/` and run `npm run metro:clear`
- **EAS Update:** Publish OTA updates with `eas update --channel production`

## Integration Points
- **YouTube API:** For podcasts and exercise videos. Configure `EXPO_PUBLIC_YT_API_KEY`.
- **LLM Backend:** Optional, set `EXPO_PUBLIC_LLM_BASE` for advanced summaries.
- **Advocate Directory:** Set `EXPO_PUBLIC_ADVOCATE_API` for remote data.
- **Sentry:** Error monitoring via `sentry-expo` (see env vars in README).

## Project-Specific Patterns
- **Terms Gate:** All users must accept terms on first open (`components/TermsGate.tsx`).
- **Guest Mode:** Supported in auth flow.
- **Wellness Tab:** All wellness features live in `app/(tabs)/wellness/` as individual screens/components.
- **Community:** Firestore-based chat, threads, and presence. See `app/(tabs)/community/` and `services/firestore.ts`.
- **Evidence Locker:** Upload queue and progress in local storage, see `evidence:uploadQueue:v1`.

## Examples
- **Add a new tab:** Create a file in `app/(tabs)/<name>.tsx` and link it in the main tab navigator.
- **Add a new Firestore rule:** Edit `firebase/firestore.rules` and deploy with `npm run rules:deploy`.
- **Add a new localization string:** Update `locales/en/common.json` and use `t('key')` in code.

## References
- See `README.md` for full developer setup, workflows, and integration details.
- Key directories: `app/`, `components/`, `context/`, `store/`, `services/`, `data/`, `firebase/`, `scripts/`, `assets/`, `locales/`.

---

If any section is unclear or missing, please provide feedback to improve these instructions.
