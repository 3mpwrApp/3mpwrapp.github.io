Soft Launch QA Checklist

Owner: 3mpowr App

Build & Cache
- Clear Metro cache: `npm run metro:clear`
- Rebuild dev client (Android): `npm run android`
- Verify icon fonts load (no missing glyphs “X”)

Navigation & Tabs
- Tabs show correct labels (Home, Campaigns, Community, Resources, Wellness, What’s New)
- Active/inactive colors match theme, labels readable at large text

Lists (Empty/Loading/Error)
- Podcasts/Resources/Campaigns/Community/Events/Archive/FAQs/Research
- Loading: skeleton rows appear
- Error: message announces as alert; retry/refresh works
- Empty: friendly message visible; padding feels consistent

Saved/Favorites
- Saved tab shows empty message initially
- Bookmark/save toggles update Saved list; subtitles readable

What’s New
- Title/labels read “What’s New”
- Empty state shows; adding item works and marks unread

Settings/Profile
- Display name updates; errors show alerts
- Profile photo picker handles “unavailable” gracefully; upload works in dev build
- High contrast toggle works; offline banner appears during Firestore offline

Community
- Channels list shows sections + empty state
- Thread lists show empty state and readable metadata
- Compose/post/comment buttons have adequate touch targets

Events
- Calendar month nav buttons have hit slop and correct a11y labels
- Event meta uses “date - place”

Accessibility
- Headers use `MAX_FONT_SCALE`; content wraps without truncation
- Buttons/links have roles and labels; small controls have hit slop
- Error messages use `accessibilityRole="alert"`

Performance/Offline
- App foreground warms caches (Podcasts, Resources, Campaigns, Events)
- Offline banner appears when network unavailable; lists use cached/local data

Release Notes
- Version: 1.0.0-rc.1
- Scope: UI polish, accessibility, offline resilience, soft‑launch readiness

