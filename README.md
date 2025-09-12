# Empowr App

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

You can start developing by editing the files inside the `app` directory. This project uses file-based routing via Expo Router.

## Auth, Onboarding, and Guest Mode

- Auth store: `store/auth.tsx` manages auth state with optional AsyncStorage persistence.
- Onboarding: `app/(auth)/onboarding.tsx` shows an intro and a “Get Started” action.
- Login: `app/(auth)/login.tsx` provides a demo sign-in (name-only) or “Continue as Guest”.
- Routing: `app/index.tsx` redirects to onboarding, login, or the main tabs based on auth status.
- Header actions: The top header shows a login icon when signed out/guest, and a logout icon when signed in.

### States

- `needsOnboarding` → routes to `/(auth)/onboarding`
- `signedOut` → routes to `/(auth)/login`
- `anonymous` or `signedIn` → routes to `/(tabs)`

Notes

- AsyncStorage is optional. If not installed, auth state persists for the current session only.

## Localization (i18n)

- Provider: `i18n/index.tsx` with lightweight runtime translations (no external deps).
- Languages: English (`en`), French (`fr`), Spanish (`es`). Files in `locales/<lang>/common.json`.
- Usage: `const { t } = useTranslation();` then `t('home.title')`.
- Change language: Profile screen provides quick EN/FR/ES toggle.

## Accessibility Enhancements

- Consistent touch targets: `constants/a11y.ts` exports `HIT_SLOP_8` and `touchTarget.min` (44×44dp). Applied to header buttons.
- RTL readiness: replaced left/right paddings with start/end where present.
- Static scan: `npm run a11y:scan` to flag missing roles/hitSlop in TSX.

## Push Notifications

- Local notifications work in Expo Go. Remote push (Expo push tokens) requires a development build (Dev Client) or EAS build.
- Expo Go limitation: As of SDK 53, Android remote push is removed from Expo Go. Use a dev build.
- Test flows:
  - Local: Profile → "Send Test Notification".
  - Remote: Profile → copy your token → run `node scripts/send-expo-push.mjs --to <token> --title "Hi" --body "Message"`.
- Dev build quickstart:
  - Android: `npx expo run:android` or EAS Dev build.
  - iOS: `npx expo run:ios` or EAS Dev build (requires Mac).

## Podcasts (YouTube Integration)

- Configure `EXPO_PUBLIC_YT_API_KEY` in your environment to auto-populate the Podcasts tab with Canadian injured worker videos (WSIB/WCB/workers' compensation) from YouTube.
- Priority order for podcast data:
  - `EXPO_PUBLIC_API_BASE` → fetches from `GET ${EXPO_PUBLIC_API_BASE}/podcasts` if set
  - `EXPO_PUBLIC_YT_API_KEY` → fetches curated YouTube search results
  - Local mock data → `data/podcasts.ts`
- Opening YouTube videos: On a podcast whose `id` starts with `yt:`, the detail view shows an "Open on YouTube" button.

Notes

- The app does not download or extract audio from YouTube to respect YouTube Terms of Service. It links out to YouTube for playback.

## Firestore Rules

A sample rules file is included at `firebase/firestore.rules`. To deploy:

1. Install Firebase CLI and login: `npm i -g firebase-tools && firebase login`
2. Initialize in this project (once): `firebase init firestore` (choose existing project, skip overwriting rules if desired)
3. Deploy rules: `firebase deploy --only firestore:rules`

Use `firebase emulators:start` during development to test reads/writes locally.

## LLM Backend (optional)

Some advocacy tools can call a server for improved summaries if `EXPO_PUBLIC_LLM_BASE` is set.

- Expected endpoints:
  - `POST /simplify` -> `{ summary: string }`
  - `POST /interpret` -> `{ summary: string, next: string[] }`

Without this var, the app uses offline deterministic fallbacks.

## Mandatory Terms Gate

On first open, users must accept Terms to proceed. See `components/TermsGate.tsx`. Host your Terms at `https://empowr.app/terms` or update the URL inside the component.
## Admin setup

Grant yourself admin once using Firebase Admin SDK:

1. Download a Firebase service account JSON for your project.
2. Place it at `firebase/serviceAccount.json` or set env `GOOGLE_APPLICATION_CREDENTIALS` to the file path.
3. Run: `npm run admin:set -- <your-uid>`
4. In the app (Settings), tap "Refresh admin status".

Revoke admin: `npm run admin:set -- <uid> false`

### Admin scripts

- `npm run admin:users` — List all users as JSON (add `-- --format csv` for CSV)
- `npm run admin:fcm -- --token <fcmToken> --title "Hi" --body "Message"` — Send FCM via Admin SDK (or `--topic <topic>`)
- `npm run admin:export -- <collection> [--out file.json]` — Export a Firestore collection

## New Features

- Admin Panel: filters (verified/banned), contains search, client-side sort, CSV export/copy, and Export All (batched).
- Deadlines: import events from an ICS file, snooze 7 days, bulk mark done/not-done, and quick-add weekly/monthly templates.
- Evidence Locker: queue progress indicator and bulk delete of cloud items.
- New Tools and Hubs:
  - Lawyer & Advocate Finder: `/(tabs)/advocacy/lawyer-finder`
  - Return-to-Work Planner: `/(tabs)/resources/rtw-planner`
  - Medication & Treatment Tracker: `/(tabs)/resources/meds-tracker`
  - Chronic Condition Tracker: `/(tabs)/resources/chronic-tracker`
  - AI Body Mechanics Advisor (video tips): `/(tabs)/resources/body-mechanics-advisor`
  - Interactive Policy Simulator: `/(tabs)/resources/policy-simulator`
  - Accessible Exercise Hub: `/(tabs)/wellness/exercise-hub`
  - Diet & Nutrition Guides: `/(tabs)/wellness/nutrition-guides`
  - Accessible Event Finder: `/(tabs)/events/finder`
  - Accommodation Request Builder: `/(tabs)/resources/accommodation-request` (redirects to improved letter builder)

## Firestore security rules

Rules live at `firebase/firestore.rules`. Deploy with:

```
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## Branding assets

Replace placeholder brand assets with your final files:

- `assets/images/brand-logo.png` (512–1024px square PNG)
- `assets/images/brand-adaptive.png` (Android adaptive icon foreground, transparent)

Then restart Metro: `npm run metro:clear`.

## Error monitoring (Sentry)

This app integrates `sentry-expo` via the config plugin. To enable reporting:

- Create a Sentry project and organization
- Set env variables for EAS Build:
  - `SENTRY_AUTH_TOKEN` (scoped token)
  - Optional: `EXPO_PUBLIC_SENTRY_DSN` if you prefer DSN-based manual init
- Update `app.json` plugin options `organization` and `project`
- Build with EAS: `eas build --profile production --platform android`

During local dev, Sentry only reports if you configure a DSN. You can add `EXPO_PUBLIC_SENTRY_DSN` to a `.env` and load it via Expo env support.

## OTA updates (EAS Update)

- Use EAS Update channels (production/preview/development) and consider enabling Code Signing for tamper resistance.
- Quick start:
  - `eas update:configure`
  - Create channels: `eas channel:create production`, `eas channel:create preview`
  - Publish: `eas update --channel production`
- Code signing requires generating keys and setting `EXPO_UPDATE_CODE_SIGNING_CERTIFICATE` etc. See Expo docs.
