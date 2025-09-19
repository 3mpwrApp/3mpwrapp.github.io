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
- Screen reader announcements: use `announce()` from `utils/announce` instead of calling `AccessibilityInfo.announceForAccessibility` directly. It queues rapid calls (debounced ~120ms) and merges messages to avoid flooding. For immediate, unbatched output use `announceNow()`. Tests or scripts can force-flush via `flushAnnouncements()`.

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

## Navigation & Tabs

The app uses 8 main tabs. All other features live behind menus or deep links.

- Home (`/(tabs)/index`)
- Campaigns (`/(tabs)/campaigns/index`)
- Community (`/(tabs)/community/index`)
- Resources (`/(tabs)/resources/index`)
- Wellness (`/(tabs)/wellness`)
- Advocacy (`/(tabs)/advocacy/index`)
- Settings (`/(tabs)/settings`)
- What’s New (`/(tabs)/whatsnew/index`) – shows an unread badge

## Community (Firestore)

- Channels/Threads
  - Channel pages read threads from Firestore with pagination and pull‑to‑refresh.
  - Admin-only moderation toggles per thread (Flag/Unflag, Hide/Unhide).
  - Unread badges per channel use per‑user last_read stored at `chats/channel_<slug>/last_read/{uid}`.

- Thread Comments
  - Comments stream via Firestore subscription by `threadId`.
  - Typing indicator via `chats/thread_<id>/typing/{uid}`.
  - Last-read marked on open for accurate unread separation.

- Testers Chat (real-time)
  - Room path: `chats/testers/messages` with presence and typing.
  - Presence: `chats/testers/presence/{uid}`; Typing: `chats/testers/typing/{uid}`; Last read: `chats/testers/last_read/{uid}`.

## Evidence Locker

- Upload Queue & Progress
  - Local save failures are queued at `AsyncStorage` key `evidence:uploadQueue:v1`.
  - Thumbnails/preview for image attachments with Share/Open actions.

- Daily mood + optional note with 7‑day trend sparkline.
- Edit/Delete recent reflections.
- “Remind me daily” schedules a local 9:00 notification.

## Admin Tools

- Moderation Queue: lists flagged/hidden threads with Approve/Restore/Trash/Delete actions.
- User Lookup: shows basic profile and lastActive (from testers presence), plus Ban/Verify toggles.

## Firestore & Storage Rules

- Chat messages: update/delete (admin or author).
- Presence/Typing/Last_read: a user can only write their own document.
- User-owned subcollections (evidence, deadlines, reflections): owner-only; admin can read.

Deploy:

```
npm run rules:deploy        # Firestore
## Remote Integrations

- YouTube Exercises
  - Set `EXPO_PUBLIC_YT_API_KEY` to enable remote playlists in Exercise Hub.
  - Optional audience queries (fallbacks provided):
    - `EXPO_PUBLIC_EXERCISE_WHEELCHAIR_QUERY`
    - `EXPO_PUBLIC_EXERCISE_LIMITED_QUERY`
    - `EXPO_PUBLIC_EXERCISE_SENSORY_QUERY`
    - `EXPO_PUBLIC_EXERCISE_MAX` (default 6)
- Lawyer/Advocate Directory
  - If you have a public API, set `EXPO_PUBLIC_ADVOCATE_API` (expects `GET /advocates?page=&pageSize=&q=&issue=&province=&proBono=` → `{ items, total }`).
  - Local seed is used as a fallback.
- Body Mechanics Analysis
  - App optionally calls `POST ${EXPO_PUBLIC_LLM_BASE}/analyze-body` with multipart `file`.
  - A local stub server is provided at `server/` (Express + Multer). Usage:
    - `cd server && npm install && npm start`
    - Set `EXPO_PUBLIC_LLM_BASE=http://localhost:8080`

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

## i18n Tooling

Scripts (see `package.json`):

- `npm run i18n:diff` – Fails (exit 1) if any keys missing vs `en`.
- `npm run i18n:fill` – Non‑destructive: adds missing English keys to `es` / `fr` only if absent.
- `npm run i18n:untranslated` – Lists keys whose translated value exactly matches English.
- `npm run i18n:export` – Writes `i18n-untranslated.csv` (locale,key,en,value) for translator handoff.
- `npm run i18n:tag` – Prefixes untranslated values with `[T]` tag (visual audit in-app / search).
- `npm run i18n:strip` – Removes `[T]` tags after translation.

### Additional QA / CI Scripts
- `npm run i18n:tag:check` – Lists `[T]` tagged keys (fails if any).
- `npm run i18n:threshold` – Fails if total untranslated (EN-equal) keys exceed `I18N_MAX_UNTRANSLATED` (env).
- `npm run i18n:assert` – Hard fail if any `[T]` tags remain (intended pre‑release gate).

### Runtime Badge
Set `EXPO_PUBLIC_I18N_BADGE=1` to display a small `◀` marker after any string whose underlying value is still tagged. Use with `npm run i18n:tag` to visually sweep the UI.

### CI
The workflow `i18n-check.yml` runs:
1. `i18n:diff` on PR + push (structure sync)
2. `i18n:threshold` with a configured ceiling
3. `i18n:assert` on main pushes (ensures no `[T]` tags ship)

Workflow suggestion:
1. `npm run i18n:diff` (ensure structure synced)
2. `npm run i18n:fill` (only on new namespaces)
3. `npm run i18n:untranslated` (quick counts)
4. `npm run i18n:export` (send CSV to translators)
5. Optionally `npm run i18n:tag` before a UI review build
6. After translations land, run `npm run i18n:strip` then `npm run i18n:diff` again

CI: `.github/workflows/i18n-check.yml` runs the diff on PRs touching locale/script files.

Translation QA ideas:
- Add visual badge: if value starts with `[T]`, show subtle warning icon.
- Add unit test to assert no `[T]` tags before production release.

### Progress & Automation
- `npm run i18n:progress` – Shows change in untranslated counts vs last snapshot (stores `i18n-untranslated.snapshot.json`).
- `npm run i18n:export:open` – Exports CSV and auto-opens it (sets `I18N_OPEN=1`).
- `npm run i18n:test` – Runs diff → threshold → assert in sequence.

### Pluralization
Basic plural support uses `.one` / `.other` key suffixes.

Example keys:
```json
"demoPlural": {
  "item": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}
```

Usage in code:
```ts
const { tCount } = useTranslation();
const label = tCount('demoPlural.item', count);
```

Validation:
- `npm run i18n:plural` – Ensures every `.one` has a matching `.other` and both include `{{count}}`.
- Included automatically in `npm run i18n:test`.

Guidelines:
- Always include `{{count}}` in both forms (even if some languages omit the number).
- For now only two plural categories are supported (1 vs other). Future ICU expansion possible.
