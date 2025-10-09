# Accessibility Notes

## Loading states

Use `components/ScreenSkeleton.tsx` as the Suspense fallback for heavy screens. It:
- Announces a loading state using i18n strings
- Sets `accessibilityRole="progressbar"` and marks the container busy
- Hides descendants from screen readers until content is ready
- Supports per‑screen contextual labels via `labelKey` (e.g., `loading.community`, `loading.deadlines`, `loading.evidence`).

### Post‑load announcements

List/screens with dynamic counts (e.g., Deadlines list) announce "N items loaded" once on initial load or manual reload (pluralized keys under `templates.<feature>.itemsLoaded`). Avoid announcing after every mutation to reduce noise.

Reusable hook: `hooks/usePostLoadAnnounce.ts` to standardize this behavior across lists (Evidence Locker wired up).

### Undo patterns

Destructive actions (deadlines delete) provide an ephemeral undo region using a live polite container; on restore we announce "Restored". Timeout currently 6s.

### Focus restoration

After inline edits (deadline edit save), focus returns to the screen heading to give a predictable anchor and avoid focus loss.

## Offline indicator

An `OfflineBanner` appears at the root (role=`alert`) when network store signals offline, announcing "Offline: showing cached content". This is injected above the header in `_layout.tsx`.

## Readability scan

`npm run read:level` performs a heuristic English string readability scan (avg word length & sentence length) and reports candidates for simplification without failing CI (unless `--strict`). Helps keep copy plain language.

## RN Web pointerEvents deprecation

Avoid setting `pointerEvents` as a prop on React Native Web elements. Instead use style:

```tsx
<View style={[styles.wrap, { pointerEvents: 'box-none' as any }]}>
  {/* content */}
</View>
```

Patterns updated in the app:
- Global Assistant pill (`components/GlobalAssistant.tsx`)
- Voice Controller (`components/VoiceController.tsx`)
- Toast viewport (`utils/toast.tsx`)
 - Offline banner (root layout)
 - Deadlines undo delete live region
