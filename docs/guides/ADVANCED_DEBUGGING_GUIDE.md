# 🔍 ADVANCED DEBUGGING GUIDE

For when things don't go as planned in recovery

---

## TABLE OF CONTENTS

1. [Diagnostic Commands](#diagnostic-commands)
2. [Provider Initialization Debugging](#provider-initialization-debugging)
3. [Hook Error Debugging](#hook-error-debugging)
4. [Navigation Debugging](#navigation-debugging)
5. [Performance Debugging](#performance-debugging)
6. [Silent Failure Debugging](#silent-failure-debugging)

---

## DIAGNOSTIC COMMANDS

### Check Expo-Router Setup

```bash
# Verify routes are discoverable
npx expo-router --inspect

# Check for conflicting screens
find app -name "*.tsx" | sort

# Verify entry point
cat package.json | grep "expo-router/entry"
```

### Check TypeScript Compilation

```bash
# Run strict type checking
npm run typecheck:strict

# Or manually:
npx tsc --noEmit -p tsconfig.json

# Look for provider type errors
npx tsc --noEmit 2>&1 | grep -i "provider\|context"
```

### Check for Circular Dependencies

```bash
# Install madge if you don't have it
npm install -D madge

# Check for cycles
npx madge --circular app/ store/ context/ components/
```

### Enable Detailed Logging

In `app/_layout.tsx`, add:

```tsx
import { LogBox } from 'react-native';

if (__DEV__) {
  // See all console logs
  LogBox.ignoreAllLogs(false);
  
  // Spy on all renders
  console.log = ((orig) => {
    return (...args: any[]) => {
      const stack = new Error().stack || '';
      const caller = stack.split('\n')[2]?.trim() || 'unknown';
      orig('[LOG]', caller, ...args);
    };
  })(console.log);
}
```

---

## PROVIDER INITIALIZATION DEBUGGING

### Issue: Provider Never Initializes (App Stuck on Loading)

**Symptom:** Loading screen shows forever

**Diagnosis:**

```tsx
// Add this to RootProviders.tsx to trace initialization
export function RootProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[RootProviders] Initializing...');
    
    Promise.all([
      initAuth().then(() => console.log('[RootProviders] Auth OK')),
      initTheme().then(() => console.log('[RootProviders] Theme OK')),
      initI18n().then(() => console.log('[RootProviders] i18n OK')),
    ]).then(() => {
      console.log('[RootProviders] All providers ready');
      setIsReady(true);
    }).catch(err => {
      console.error('[RootProviders] Init failed:', err);
      // Don't block app - set ready anyway
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <Text>Initializing... (check console)</Text>;
  }

  return <>{children}</>;
}
```

**What to check:**
1. Do you see all "OK" messages?
2. If not, which one's missing?
3. Is that provider's initialization hanging on an async operation?

**Fix:**

```tsx
// Add timeouts to prevent infinite hangs
Promise.race([
  initAuth(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Auth init timeout')), 5000)
  )
]).catch(err => {
  console.error('[Auth] Init failed:', err);
  // Continue anyway with default state
});
```

---

### Issue: Provider Throws Error During Init

**Symptom:** Specific provider crashes app

**Diagnosis:**

```tsx
function SafeProviderInit({ 
  name, 
  init, 
  children 
}: {
  name: string;
  init: () => Promise<void>;
  children: ReactNode;
}) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    init()
      .catch(err => {
        console.error(`[${name}] Init error:`, err);
        console.error(`[${name}] Stack:`, err.stack);
        setError(err);
      });
  }, [init, name]);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: '#ffe6e6' }}>
        <Text style={{ color: '#c00', fontWeight: 'bold', marginBottom: 10 }}>
          {name} Failed
        </Text>
        <Text style={{ fontSize: 12 }}>
          {error.message}
        </Text>
        <Text style={{ fontSize: 10, marginTop: 10, color: '#666' }}>
          {error.stack}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

// Use it:
<SafeProviderInit 
  name="Auth" 
  init={initAuth}
>
  {/* other providers */}
</SafeProviderInit>
```

**Then check:**
1. Console shows which provider failed
2. Error message tells you why
3. Stack trace points to the problem code

---

## HOOK ERROR DEBUGGING

### Issue: "Hook Called Outside Provider"

**Symptom:**
```
Error: Invalid hook call. Hooks can only be called inside 
the body of a function component.
```

**Root cause:** Component is calling hook OUTSIDE of where provider exists

**Diagnosis:**

```tsx
// Create a custom hook that validates provider exists
function useAuthSafe() {
  const store = useAppStore();
  
  if (!store) {
    console.error('[useAuthSafe] Store is not initialized!');
    console.error('[useAuthSafe] This means RootProviders did not create the store');
    console.error('[useAuthSafe] Check:');
    console.error('  1. Is RootProviders wrapping this component?');
    console.error('  2. Is AuthProvider initialized inside RootProviders?');
    console.error('  3. Is Zustand store created before provider renders?');
    throw new Error('useAuth: Store not initialized');
  }
  
  return store;
}

// Replace all useAuth calls with useAuthSafe, get detailed errors
```

**Fix:** Make sure component is inside provider tree

```tsx
// ❌ WRONG - component not inside provider
export default function App() {
  return <MyComponent />; // MyComponent calls useAuth()
}

// ✅ CORRECT
export default function App() {
  return (
    <RootProviders>
      <MyComponent /> {/* Now wrapped by AuthProvider inside RootProviders */}
    </RootProviders>
  );
}
```

---

### Issue: Hook Returns Undefined/Null

**Symptom:** Hook works (no error) but returns empty state

**Diagnosis:**

```tsx
function MyComponent() {
  const auth = useAuth();
  
  // Debug: Check if store initialized
  console.log('[MyComponent] Auth state:', {
    status: auth?.status,
    user: auth?.user,
    isStoreNull: auth === null,
    isStoreUndefined: auth === undefined,
    storeType: typeof auth,
  });
  
  // Check if this is a data loading issue vs provider issue
  if (auth?.status === 'loading') {
    return <Text>Loading auth...</Text>;
  }
  
  if (!auth?.user && auth?.status !== 'loading') {
    return <Text>Not authenticated</Text>;
  }
  
  return <Text>User: {auth.user?.name}</Text>;
}
```

**What to look for:**
1. Is `auth` null or undefined? → Provider issue
2. Is `auth.status === 'loading'`? → Normal, wait for it
3. Is store initialized but data missing? → Initialization logic issue

---

## NAVIGATION DEBUGGING

### Issue: Navigation Broken (Redirect Loop / Blank Screen)

**Symptom:** App redirects infinitely or gets stuck

**Diagnosis:**

```tsx
// In app/index.tsx, add detailed logging
export default function Index() {
  const { user, loading, status } = useAuth();
  const router = useRouter();
  const lastState = useRef<string>('initial');

  useEffect(() => {
    const currentState = `loading:${loading}, status:${status}, hasUser:${!!user}`;
    
    if (currentState === lastState.current) {
      console.log('[Index] State unchanged, skipping redirect');
      return;
    }
    
    console.log('[Index] State changed:', {
      from: lastState.current,
      to: currentState,
      loading,
      status,
      userId: user?.id,
      shouldGoToAuth: !user && !loading,
      shouldGoToTabs: !!user && !loading,
    });
    
    lastState.current = currentState;
    
    if (loading) {
      console.log('[Index] Auth loading, waiting...');
      return;
    }
    
    if (user) {
      console.log('[Index] User found, navigating to tabs');
      router.replace('/(tabs)');
    } else {
      console.log('[Index] No user, navigating to signin');
      router.replace('/(auth)/signin');
    }
  }, [user, loading, status, router]);

  // Render loading state
  if (loading) {
    return <View style={{ flex: 1 }} />;
  }

  // Render redirect or fallback
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/signin" />;
  }
}
```

**Check console for:**
1. Does state ever change? If not, hook not updating
2. Does it redirect? If yes, to where?
3. Does it redirect multiple times? Redirect loop detected

**If redirect loop:**

```tsx
// Problem: Both (tabs) and (auth)/signin are redirecting back to index
// Solution: One screen should NOT redirect

// In app/(tabs)/index.tsx:
// Make sure it doesn't call router.replace('/') or router.push('/')

// In app/(auth)/signin.tsx:
// Make sure it doesn't redirect to index until user actually signs in
```

---

### Issue: Screen Not Rendering After Navigation

**Symptom:** Navigate to screen but it's blank

**Diagnosis:**

```tsx
// Add this to every screen you're testing
export default function MyScreen() {
  useEffect(() => {
    console.log('[MyScreen] Mounted');
    return () => console.log('[MyScreen] Unmounted');
  }, []);

  console.log('[MyScreen] Rendering');

  try {
    // Your component code here
    return <View><Text>Content</Text></View>;
  } catch (err) {
    console.error('[MyScreen] Render error:', err);
    return <Text style={{ color: 'red' }}>Error: {String(err)}</Text>;
  }
}
```

**Check console:**
1. Is "MyScreen Mounted" logged? If not, route didn't load
2. Is "MyScreen Render error" logged? If yes, component has error
3. Is screen rendering but blank? Check if content is being returned

**If route didn't load:**
- Check Expo-Router config
- Verify file path matches route
- Check for syntax errors in file

---

## PERFORMANCE DEBUGGING

### Issue: App Slow to Start

**Diagnosis:**

```tsx
import { useEffect, useRef } from 'react';

export function RootProviders({ children }: { children: ReactNode }) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    console.log('[RootProviders] Setup took', Date.now() - startTime.current, 'ms');
  }, []);

  const [checkpoints] = useState<Record<string, number>>({});

  useEffect(() => {
    checkpoints['auth_init'] = Date.now() - startTime.current;
    console.log('[Checkpoint] Auth ready:', checkpoints['auth_init'], 'ms');
  }, []);

  // Similar for each provider...

  return <>{children}</>;
}
```

**Look for:**
1. Which provider takes longest?
2. Is it doing heavy async work on load?
3. Can it be deferred to after app renders?

**Optimization:**

```tsx
// ❌ SLOW - Everything waits for auth
<AuthProvider>
  <ThemeProvider>
    <I18nProvider>
      <AllOtherProviders>
        <App />
      </AllOtherProviders>
    </I18nProvider>
  </ThemeProvider>
</AuthProvider>

// ✅ FAST - Critical path only
<ThemeProvider>
  <I18nProvider>
    <AuthProvider>  {/* Auth loads in parallel */}
      <LazyProviders>
        <App />
      </LazyProviders>
    </AuthProvider>
  </I18nProvider>
</ThemeProvider>
```

---

## SILENT FAILURE DEBUGGING

### Issue: App Crashes But No Error Message

**Root cause:** Error caught and not logged

**Diagnosis:**

```tsx
// Add global error handler
if (__DEV__) {
  // Catch all unhandled errors
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Log with stack trace
    const err = new Error();
    console.log('[GLOBAL_ERROR]', {
      message: args[0],
      args: args,
      stack: err.stack,
    });
    originalError(...args);
  };
}

// Add error boundary at root
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[RootErrorBoundary] Caught error:', error);
    console.error('[RootErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, padding: 20, backgroundColor: 'red' }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            App Error
          </Text>
          <Text style={{ color: 'white', marginTop: 10 }}>
            {this.state.error?.message}
          </Text>
          <Text style={{ color: 'white', fontSize: 12, marginTop: 10 }}>
            {this.state.error?.stack}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Use in app/_layout.tsx
export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <RootProviders>
        <Stack />
      </RootProviders>
    </RootErrorBoundary>
  );
}
```

---

### Issue: Provider Initializes But App Still Blank

**Diagnosis:**

```tsx
// Add render tracking
function RenderTracker() {
  const [renders, setRenders] = useState(0);
  
  useEffect(() => {
    setRenders(r => r + 1);
    console.log('[RenderTracker] App rendered', renders, 'times');
  });

  return <Text>Renders: {renders}</Text>;
}

// Add to your app, it will tell you if component is re-rendering
```

**Check:**
1. Is component rendering? (look for console logs)
2. How many times? (if 1, probably loading state)
3. Is layout working? (use StyleSheet.absoluteFill to test visibility)

```tsx
// Test visibility
<View style={{ flex: 1, backgroundColor: 'red' }}>
  <Text>If you see red, layout works</Text>
</View>
```

---

## REAL-WORLD EXAMPLE: Complete Debug Session

Let's say your app shows blank screen after Step 4.

```tsx
// Step 1: Add logging to RootLayout
export default function RootLayout() {
  console.log('[RootLayout] Render called');

  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
      <RootProviders>
        <View style={{ flex: 1, backgroundColor: 'green' }}>
          <Text>If you see green, RootLayout is working</Text>
          <Stack />
        </View>
      </RootProviders>
    </View>
  );
}

// Console shows:
// ✅ "[RootLayout] Render called" → Layout is rendering
// ✅ Blue background visible → View works
// ❌ No green background → RootProviders not rendering children
// ❌ No Stack showing → Navigation not rendering

// Step 2: Debug RootProviders
export function RootProviders({ children }: { children: ReactNode }) {
  console.log('[RootProviders] Render called');
  console.log('[RootProviders] Children:', children);

  return (
    <View style={{ flex: 1, backgroundColor: 'yellow' }}>
      <Text>RootProviders is rendering</Text>
      {children}
    </View>
  );
}

// Console shows:
// ✅ "[RootProviders] Render called" → RootProviders is rendering
// ❌ Yellow background not showing → Something is wrong with View
// ✅ "RootProviders is rendering" → Component rendering
// ❌ Children not showing → children prop is not rendering

// Step 3: Check what children is
// If children is undefined/null → RootLayout not passing it
// If children is a function → need to call it
// If children is not rendering → useEffect issue?
```

---

## BEST PRACTICES FOR DEBUG

1. **Always log at provider init** - Know when each provider initializes
2. **Use TypeScript** - Catch undefined/null at compile time
3. **Use Error Boundaries** - Prevent silent crashes
4. **Test incrementally** - Add one provider, test, repeat
5. **Check console first** - 90% of issues show in console
6. **Use React DevTools** - Inspect component tree structure
7. **Enable strict mode** - Catch more issues: `<React.StrictMode>`

---

## USEFUL SNIPPETS

### Log Provider Tree

```tsx
function LogProviderTree() {
  useEffect(() => {
    console.group('[Provider Tree]');
    console.log('Auth provider:', useAuth ? '✅' : '❌');
    console.log('Theme provider:', useAppPalette ? '✅' : '❌');
    console.log('i18n provider:', useTranslation ? '✅' : '❌');
    console.groupEnd();
  }, []);

  return null;
}

// Add to RootLayout
```

### Test Provider in Isolation

```tsx
// Create minimal test component
function ProviderTest() {
  return (
    <RootProviders>
      <TestComponent />
    </RootProviders>
  );
}

function TestComponent() {
  const auth = useAuth();
  const palette = useAppPalette();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: palette.background }}>
      <Text style={{ color: palette.text }}>
        {t('common.hello', 'Hello!')}
      </Text>
      <Text>Auth status: {auth.status}</Text>
    </View>
  );
}

// If this works in isolation, providers are OK
// If it fails, specific provider is broken
```

---

**Remember:** The key to debugging is systematically isolating which component/provider is failing, then fixing that one thing. Test after each change.

Good luck! 🔍
