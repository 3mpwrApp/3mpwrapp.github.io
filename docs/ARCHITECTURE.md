# 3mpwr App Architecture Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Native / Expo                     │
├─────────────────────────────────────────────────────────────┤
│                    App Shell (_layout.tsx)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Auth Gate & Routing (index.tsx)            │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      Tab Navigation                          │
│  ┌──────┬──────┬───────────┬────────┬───────┬──────┐        │
│  │ Home │Camps │Community  │Wellness│Health │Admin │        │
│  └──────┴──────┴───────────┴────────┴───────┴──────┘        │
├─────────────────────────────────────────────────────────────┤
│              State Management (Zustand Store)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  auth │ notifications │ mood │ meds │ settings │ ... │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Service Layer                              │
│  ┌────────────┬──────────────┬────────┬───────┬────────┐    │
│  │ Firestore  │ Authentication│ Cloud  │ CDN   │ Crypto │   │
│  │ Pagination │ Google        │ Storage│ Image │ AES256 │   │
│  └────────────┴──────────────┴────────┴───────┴────────┘    │
├─────────────────────────────────────────────────────────────┤
│              Data Sources                                    │
│  ┌──────────────┬───────────────┬──────────────┐            │
│  │   Firestore  │   Firebase    │   CDN        │            │
│  │ (campaigns,  │   Auth        │   (images)   │            │
│  │  community)  │   Storage     │              │            │
│  └──────────────┴───────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
```
App Start
  ↓
Check AsyncStorage for auth token
  ↓
Token exists? → Yes → Load from SecureStore
  ↓ No
Redirect to Auth Screen
  ↓
User signs in/continues anonymously
  ↓
Save token to SecureStore + AsyncStorage
  ↓
Zustand store updated
  ↓
Redirect to (tabs)
```

### Data Loading Flow
```
User navigates to tab
  ↓
useLoading hook starts loading state
  ↓
Show skeleton screens
  ↓
Firestore query with pagination
  ↓
Zustand store updated
  ↓
Loading state ends
  ↓
Components re-render with data
```

## State Management (Zustand)

**Single global store** with domains:

```typescript
const store = {
  // Auth domain
  auth: { user, status, signIn, signOut },
  
  // Notifications domain
  notifications: { inbox, unread, prefs },
  
  // Wellness domain
  mood: { current, history, setMood },
  
  // Settings domain
  settings: { language, accessibility, theme },
  
  // ... 15+ other domains
}
```

### Usage Pattern
```tsx
// Selector hook (only re-renders on change)
const { user } = useAuth();
const { mood } = useMood();

// Or full store
const store = useAppState();
```

## Component Architecture

### Directory Structure
```
components/
├── ui/                    # Reusable UI (Button, Card, etc.)
├── screens/              # Screen-specific components
├── forms/                # Form components (all with Zod)
├── a11y/                 # Accessibility components
├── loading/              # Loading states & skeletons
└── [named components]    # Individual components
```

### Component Patterns

**1. Memoized List Item**
```tsx
interface ItemProps { item: Campaign; onPress: () => void; }
const Item = React.memo(
  ({ item, onPress }: ItemProps) => (
    <Pressable onPress={onPress}>
      <Text>{item.title}</Text>
    </Pressable>
  ),
  (prev, next) => prev.item.id === next.item.id
);
```

**2. Form with Validation**
```tsx
const form = useFormValidation(CampaignSchema, initialValues);
<TextInput
  value={form.values.title}
  onChangeText={form.handleChange('title')}
  onBlur={form.handleBlur('title')}
/>
{form.errors.title && <Text>{form.errors.title[0]}</Text>}
```

**3. Loading State**
```tsx
const { loading, withLoading } = useLoading();
const load = () => withLoading(async () => {
  const data = await fetch();
  setData(data);
});
```

## Security Architecture

```
User Input → Zod Validation → Sanitization
                   ↓
         Type-safe data object
                   ↓
Sensitive data? → Yes → SecureStore (Keychain/KeyStore)
     ↓ No
AsyncStorage (encrypted if needed)
     ↓
Firestore Security Rules
```

### SecureStore Flow
```
saveAuthToken(token)
  ↓
Is SecureStore available?
  ↓ Yes
Save to Keychain (iOS) / KeyStore (Android)
  ↓ No
Fall back to encrypted AsyncStorage
```

## Service Layer

### Firestore Service (`services/firestoreQueries.ts`)
```
getCampaignsPaginated(limit, filters)
  ↓
Build query with: where(), orderBy(), limit()
  ↓
Check listener cache
  ↓
Set up onSnapshot listener
  ↓
Return unsubscribe function (cleanup)
  ↓
Zustand store updated
```

### CDN Image Service (`services/cdnImage.ts`)
```
loadImageFromCDN(id, { width, height })
  ↓
Check cache
  ↓ Cache hit
Return cached URL
  ↓ Cache miss
Generate CDN URL with params
  ↓
Cache result
  ↓
Return URL
```

## Performance Optimizations

### 1. Code Splitting
- Route-based lazy loading (React.lazy + Suspense)
- Heavy features load on-demand
- Heavy data files lazy-loaded

### 2. Memoization
- React.memo on list items
- useCallback for event handlers
- useMemo for expensive calculations

### 3. Firestore
- Pagination (20 items per page)
- Query limits + filters
- Listener caching
- Cleanup on unmount

### 4. Images
- CDN serving
- Responsive sizing
- WebP format
- Placeholder while loading

### 5. Bundling
- Hermes JS engine
- Tree shaking
- Bundle analysis
- Lazy data files

## Error Handling

```
Try operation
  ↓
Catch error
  ↓
Is AppError? → Yes → Use error type
  ↓ No
Convert to AppError
  ↓
Log to Sentry
  ↓
Show user-friendly message
  ↓
Announce via screen reader
```

## Testing Architecture

```
Unit Tests (Jest)
  ├── Validators (__tests__/validation.test.ts)
  ├── Feature Flags (__tests__/featureFlags.test.ts)
  ├── Encryption (__tests__/encryption.test.ts)
  └── Hooks (__tests__/hooks.test.ts)

E2E Tests (Maestro)
  ├── Auth Flow
  ├── Campaigns Flow
  ├── Community Flow
  └── Settings Flow

Accessibility Tests
  ├── Color Contrast
  ├── Focus Management
  └── Screen Reader Labels
```

## Accessibility (WCAG 2.2 AAA)

```
User Input
  ↓
A11yPressable wrapper
  ↓
Min touch target 44x44pt
  ↓
Proper focus management
  ↓
Screen reader label
  ↓
Color contrast ≥7:1
  ↓
Keyboard navigation
```

## Feature Flags

```
User loads app
  ↓
Check feature flag status
  ↓
Hash user ID for rollout
  ↓
Is within rollout %? → Yes → Show feature
  ↓ No
Hide feature
  ↓
Admin override? → Yes → Show/hide based on override
```

## Deployment Flow

```
Code commit
  ↓
GitHub Actions CI
  ├── Run tests
  ├── Lint check
  ├── Type check
  └── Build check
  ↓
EAS Build (if all pass)
  ↓
EAS Update (OTA updates)
  ↓
Feature flags control rollout
  ↓
Monitor with Sentry
```

## Key Dependencies

- **expo-router** - File-based navigation
- **zustand** - State management
- **zod** - Input validation
- **firebase/firestore** - Database
- **expo-secure-store** - Secure token storage
- **crypto-js** - Encryption
- **react-native** - UI framework
- **@sentry/react-native** - Error monitoring

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Bundle Size | <2.5 MB | 2.5 MB |
| Initial Load | <1s | 0.8-1s ✅ |
| Time to Interactive | <1.5s | 1-1.2s ✅ |
| Memory | <50MB | 40-50MB ✅ |
| FPS | 58+ | 58-60 ✅ |

---

**Last Updated:** January 9, 2026  
**Version:** 1.0  
**Status:** Production
