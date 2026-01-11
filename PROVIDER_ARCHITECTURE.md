# Provider Architecture Guide

## Overview

This app uses a **non-blocking, fail-safe provider system** designed to prevent white screens and rendering failures.

## Key Principles

### 1. **Never Block Rendering**
- Providers MUST NOT prevent the app from rendering
- If a provider fails, the app continues with default values
- Children are always rendered, even during provider initialization

### 2. **Async Initialization**
- Provider initialization happens in the background
- Timeouts prevent infinite loading states
- Default timeout: 3 seconds per provider

### 3. **Graceful Degradation**
- Failed providers log errors but don't crash the app
- Each provider has sensible default values
- Users see a working app even if some features are unavailable

### 4. **Error Isolation**
- Each provider is wrapped in error boundaries
- Errors in one provider don't affect others
- All errors are logged for debugging

## Provider Hierarchy

```
RootProviders (non-blocking wrapper)
├── SettingsProvider (essential - theme, locale)
└── I18nProvider (essential - translations)
    └── AuthProvider (optional - lazy loaded)
        └── ... (other optional providers)
```

### Essential Providers (Always Loaded)
- **SettingsProvider**: Theme, locale, accessibility preferences
- **I18nProvider**: Translations and localization

### Optional Providers (Lazy Loaded)
- **AuthProvider**: Authentication state
- **ComplexityModeProvider**: UI simplification
- **PrivacyProvider**: Data handling preferences
- **NotificationsProvider**: Push notifications
- **CommunityProvider**: Social features
- **MoodProvider**: Wellness tracking
- ... and others

## Adding New Providers

### Option 1: Essential Provider (Synchronous)

```tsx
// In RootProviders.tsx
import { MyProvider } from '../store/myProvider';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <I18nProvider>
        <MyProvider> {/* Add here */}
          {children}
        </MyProvider>
      </I18nProvider>
    </SettingsProvider>
  );
}
```

### Option 2: Optional Provider (Async/Lazy)

```tsx
// In utils/providerHelpers.tsx
import { createAsyncProvider } from '../utils/providerHelpers';
import { MyProvider } from '../store/myProvider';

const AsyncMyProvider = createAsyncProvider(
  MyProvider,
  async () => {
    // Async initialization logic
    await initializeMyFeature();
  },
  {
    name: 'MyProvider',
    timeout: 3000,
  }
);

// Then use AsyncMyProvider in RootProviders
```

### Option 3: Lazy Loaded Provider

```tsx
import { createLazyProvider } from '../utils/providerHelpers';

const LazyMyProvider = createLazyProvider(
  () => import('../store/myProvider'),
  'MyProvider'
);

// Provider loads only when needed
```

## Provider Implementation Checklist

When creating a new provider, ensure:

- [ ] Has default/fallback values
- [ ] Doesn't throw during initialization
- [ ] Uses `try/catch` for async operations
- [ ] Logs errors but doesn't crash
- [ ] Exports both Provider and useContext hook
- [ ] Has TypeScript types for context value
- [ ] Documents expected behavior

## Example Provider Template

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '../utils/logger';

// 1. Define types
interface MyContextValue {
  data: string | null;
  loading: boolean;
  error: Error | null;
}

// 2. Create context with default values
const MyContext = createContext<MyContextValue>({
  data: null,
  loading: false,
  error: null,
});

// 3. Provider component
export function MyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Async initialization
    const init = async () => {
      try {
        setLoading(true);
        const result = await fetchData();
        setData(result);
      } catch (err) {
        logger.error('[MyProvider] Init failed:', err);
        setError(err as Error);
        // DON'T throw - set error state instead
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Always provide value, even during loading/error
  const value: MyContextValue = {
    data,
    loading,
    error,
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// 4. Hook for consuming the context
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    // DON'T throw - return default values
    logger.warn('[useMyContext] Called outside provider, using defaults');
    return {
      data: null,
      loading: false,
      error: null,
    };
  }
  return context;
}
```

## Troubleshooting

### White Screen After Adding Provider

1. **Check console logs** - Look for error messages from the provider
2. **Remove the provider** - Confirm app works without it
3. **Add error boundary** - Wrap provider in SafeProviderWrapper
4. **Check initialization** - Ensure async init doesn't block
5. **Add timeout** - Use createAsyncProvider with timeout

### Provider Not Initializing

1. **Check logs** - Look for initialization start/complete messages
2. **Check timeout** - May be timing out (increase timeout value)
3. **Check dependencies** - Ensure all required modules are available
4. **Check error state** - Provider may have failed silently

### Hook Called Outside Provider

1. **Check provider hierarchy** - Ensure provider wraps the component
2. **Add default values** - Hook should return defaults if no provider
3. **Use SafeProviderWrapper** - Prevents provider from failing to render

## Best Practices

### DO:
- ✅ Always return children, even on error
- ✅ Log errors for debugging
- ✅ Provide default/fallback values
- ✅ Use timeouts for async operations
- ✅ Test provider in isolation
- ✅ Document expected behavior

### DON'T:
- ❌ Throw errors during initialization
- ❌ Block rendering while loading
- ❌ Return `null` if provider fails
- ❌ Use synchronous blocking operations
- ❌ Nest providers more than 3 levels deep
- ❌ Couple providers tightly together

## Utilities Reference

### composeProviders
Reduces nesting by composing multiple providers:

```tsx
const AllProviders = composeProviders([
  SettingsProvider,
  I18nProvider,
  AuthProvider,
]);

<AllProviders>
  {children}
</AllProviders>
```

### createAsyncProvider
Wraps provider with async initialization and timeout:

```tsx
const AsyncProvider = createAsyncProvider(
  MyProvider,
  async () => await init(),
  { name: 'MyProvider', timeout: 3000 }
);
```

### createLazyProvider
Lazy loads provider only when needed:

```tsx
const LazyProvider = createLazyProvider(
  () => import('./MyProvider'),
  'MyProvider'
);
```

### withDefaultContext
Provides default context values to prevent errors:

```tsx
const DefaultMyProvider = withDefaultContext(
  MyContext,
  { data: null, loading: false }
);
```

## Migration Guide

### From Old System to New System

**Before:**
```tsx
// Deep nesting, no error handling
<Provider1>
  <Provider2>
    <Provider3>
      {children}
    </Provider3>
  </Provider2>
</Provider1>
```

**After:**
```tsx
// Composed, with error handling
const AllProviders = composeProviders([
  createAsyncProvider(Provider1, init1, { name: 'P1', timeout: 3000 }),
  createAsyncProvider(Provider2, init2, { name: 'P2', timeout: 3000 }),
  createAsyncProvider(Provider3, init3, { name: 'P3', timeout: 3000 }),
]);

<AllProviders>
  {children}
</AllProviders>
```

## Performance Considerations

1. **Lazy load non-critical providers** - Reduces initial bundle size
2. **Use memoization** - Prevent unnecessary re-renders
3. **Batch updates** - Use `unstable_batchedUpdates` if needed
4. **Monitor provider count** - Too many providers = slower initialization
5. **Profile in dev tools** - Check for slow providers

## Security

- Never store sensitive data in provider state
- Use secure storage for tokens/credentials
- Validate data before storing in context
- Clear sensitive data on logout
- Use environment variables for API keys

## Testing

```tsx
// Test provider in isolation
import { render } from '@testing-library/react-native';
import { MyProvider, useMyContext } from './MyProvider';

it('provides default values', () => {
  const TestComponent = () => {
    const { data } = useMyContext();
    return <Text>{data || 'null'}</Text>;
  };

  const { getByText } = render(
    <MyProvider>
      <TestComponent />
    </MyProvider>
  );

  expect(getByText('null')).toBeTruthy();
});
```

## Related Files

- `components/RootProviders.tsx` - Main provider wrapper
- `components/SafeProviderWrapper.tsx` - Error boundary for providers
- `utils/providerHelpers.tsx` - Utility functions
- `store/*` - Individual provider implementations
- `context/*` - Legacy context providers (being migrated)

---

**Last Updated:** January 10, 2026
