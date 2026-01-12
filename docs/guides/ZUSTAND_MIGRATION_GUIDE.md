# Zustand Store Migration Guide

## Overview
All state management has been consolidated into a single Zustand store at `/store/appStore.ts` with domain-specific hooks available in `/hooks/useAppStore.ts`.

## Migration Path

### Before (Context/Store Pattern)
```tsx
import { useAuth } from '../context/AuthContext';
import { useMood } from '../store/mood';
import { useMedications } from '../store/medications';
import { useNotifications } from '../store/notifications';
import { useSettings } from '../store/settings';

export default function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  const { entries, addEntry } = useMood();
  const { medications, addMedication } = useMedications();
  const { inbox, unread } = useNotifications();
  const { highContrast, setHighContrast } = useSettings();

  // ... component logic
}
```

### After (Zustand Store)
```tsx
import { useAuth, useMood, useMedications, useNotifications, useSettings } from '../hooks/useAppStore';

export default function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  const { entries, addEntry } = useMood();
  const { medications, addMedication } = useMedications();
  const { inbox, unread } = useNotifications();
  const { highContrast, setHighContrast } = useSettings();

  // ... component logic - API remains identical!
}
```

## Key Changes
- **Same API**: All hooks maintain backward-compatible interfaces
- **Single Store**: One source of truth for all app state
- **Automatic Persistence**: AsyncStorage integration via Zustand middleware
- **Improved Performance**: Zustand's optimized re-render management
- **Type Safety**: Full TypeScript support with no `any` types

## Available Hooks

### `useAppState()`
Access the entire store state:
```tsx
const state = useAppState();
// {auth, notifications, mood, medications, settings, ...}
```

### `useAuth()`
Authentication state and actions:
```tsx
const { user, status, signIn, signOut, completeOnboarding } = useAuth();
```

### `useMood()`
Mood tracking functionality:
```tsx
const { entries, recentAverage, todayEntries, addEntry } = useMood();
```

### `useNotifications()`
Notification management:
```tsx
const { inbox, unread, prefs, markRead, markAllRead } = useNotifications();
```

### `useMedications()`
Medication management:
```tsx
const { medications, addMedication, updateMedication, removeMedication } = useMedications();
```

### `useSettings()`
App settings and preferences:
```tsx
const { highContrast, textScale, setHighContrast, setTextScale } = useSettings();
```

## State Domains (20 Consolidated)
1. **Auth** - User authentication, onboarding status
2. **Notifications** - Inbox, preferences, scheduling
3. **Mood** - Mood entries, analytics, patterns
4. **Medications** - Medication schedules and tracking
5. **Settings** - All user preferences and accessibility options
6. **Community** - Threads, comments, channels
7. **Profile** - Local profile data, badges
8. **Energy Coins** - Daily allowance system
9. **Bookmarks** - Saved routes and resources
10. **Resilience** - Event tracking and points
11. **Onboarding** - First 7 days progress
12. **Favorites** - Starred items
13. **Blocks** - Blocked user list
14. **Campaigns** - Campaign tracking
15. **Coach Progress** - Lesson completion
16. **Cognitive Comfort** - Accessibility settings
17. **Network** - Online/offline, syncing status
18. **Refresh** - Cache freshness tracking
19. **A11y Settings** - Advanced accessibility
20. **Jurisdiction** - Country/province data

## Persistence
The store automatically persists to AsyncStorage:
- Key: `'empowr-app-store'`
- Persisted domains: auth, notifications, mood, medications, settings, community, profile, coins, bookmarks, resilience, onboarding, favorites, blocks, campaigns, coachProgress, cognitiveComfort, a11ySettings, jurisdiction, privacy
- Non-persisted: network, refresh status (session-only)

## File Locations
- **Store Definition**: [store/appStore.ts](store/appStore.ts)
- **Hook Exports**: [hooks/useAppStore.ts](hooks/useAppStore.ts)
- **Usage Example**: [app/index.tsx](app/index.tsx)

## Implementation Status
✅ Store created with all 20 domains
✅ Domain-specific hooks exported
✅ app/index.tsx migrated to use new hook
✅ AsyncStorage persistence configured
✅ TypeScript types strict (no `any`)
✅ Linting passes without warnings
