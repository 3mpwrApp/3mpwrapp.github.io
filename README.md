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
