# Performance guide (client + data)

This app targets responsive UX on modest devices. Use this checklist when adding features:

- Lists: Use FlatList/SectionList, set keyExtractor, paginate (limit + startAfter), use getItemLayout if item height is stable.
- Rendering: Prefer React.memo/useCallback/useMemo; avoid inline objects in hot paths; use reanimated for animations.
- Images: Use expo-image with caching and explicit width/height; serve sized thumbnails via CDN when possible.
- Navigation: Lazy-load heavy screens; keep initial route lean; Metro inlineRequires is enabled.
- State: Keep components small; avoid global re-renders; derive state when possible.
- Network: Cache repeated GETs; dedupe in-flight requests; debounce write bursts (typing indicators, presence).
- Firestore: Always use indexes + limits; narrow listeners; unsubscribe on unmount; use serverTimestamp; avoid hot doc contention.
- Offline: Web IndexedDB persistence is enabled; native uses long-polling to improve reliability.
- Bundles: Respect CI perf budgets; avoid large JSON blobs in source; prefer dynamic import for heavy modules.

## CI guards

- perf-bundle-budget (soft/hard)
- perf-max-file-size (default 35 KB/file) — tune via PERF_MAX_FILE_BYTES
- route conventions (Tabs.Screen name must not include "/")

## Troubleshooting

- Slow startup: check eager imports, reanimated setup, very large initial screens.
- Jank on lists: ensure virtualization, stable keys/styles, avoid nested ScrollViews.
- High network/Firestore: missing limits, unbounded listeners, client-side filtering, excessive write frequency.