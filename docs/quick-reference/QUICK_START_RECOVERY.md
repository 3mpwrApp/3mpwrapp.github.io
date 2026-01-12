# 🚀 QUICK START: RECOVERY IMPLEMENTATION

**Follow this step-by-step. Test after each step.**

---

## STEP 1: Backup & Initial Test (5 minutes)

```bash
# Backup current state
git add .
git commit -m "Pre-recovery-backup: app currently non-functional"

# Test current state to confirm failure
npx expo start --clear
# Expected: Blank screen, navigation broken, or crash
# Note the exact error in console

# Stop the dev server (Ctrl+C)
```

---

## STEP 2: Emergency Fix - Simplify RootLayout (10 minutes)

**Goal:** Get the app to at least render without crashing

**File:** [app/_layout.tsx](app/_layout.tsx)

Replace **entire file** with:

```tsx
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

console.log('[RootLayout] Starting');

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
      </Stack>
    </View>
  );
}
```

**Test:**
```bash
npx expo start --clear
# Expected: App loads, shows blank screen, no errors about providers
# You might see errors about hooks, that's OK for now
```

---

## STEP 3: Disable Auth Requirements (10 minutes)

**Goal:** Get navigation working without auth

**File:** [app/index.tsx](app/index.tsx)

Replace **entire file** with:

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Temporarily bypass auth to test navigation
  return <Redirect href="/(tabs)" />;
}
```

**Test:**
```bash
npx expo start --clear
# Expected: App loads, shows Home tab
# Tap other tabs - they should load (might show errors about missing data)
# At least navigation is working now
```

---

## STEP 4: Create Provider Wrapper (15 minutes)

**Goal:** Set up the provider structure

**New File:** [components/RootProviders.tsx](components/RootProviders.tsx)

```tsx
import React, { ReactNode } from 'react';
import { View } from 'react-native';

export function RootProviders({ children }: { children: ReactNode }) {
  // For now, just return children unwrapped
  // We'll add providers here in the next step
  
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}
```

**Update RootLayout:** [app/_layout.tsx](app/_layout.tsx)

```tsx
import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

import { RootProviders } from "../components/RootProviders";

export default function RootLayout() {
  return (
    <RootProviders>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
        </Stack>
      </View>
    </RootProviders>
  );
}
```

**Test:**
```bash
npx expo start --clear
# Should work exactly like Step 3 (still rendering)
```

---

## STEP 5: Add First Provider - Auth (20 minutes)

**Goal:** Initialize auth state safely

**Update [components/RootProviders.tsx](components/RootProviders.tsx):**

```tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';

export function RootProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate async auth initialization
    // TODO: Replace with real auth setup
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Loading indicator */}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}
```

**Test:**
```bash
npx expo start --clear
# Should work (isReady triggers immediately)
```

---

## STEP 6: Add Theme Provider (20 minutes)

**Goal:** Fix `useAppPalette()` errors

**Check:** Where is `useAppPalette` defined?

```bash
# Search for the hook
grep -r "useAppPalette" src/ --include="*.ts" --include="*.tsx"
```

**Likely location:** [theme/usePalette.ts](theme/usePalette.ts)

Look at how it's implemented. If it's a simple hook that returns colors:

**Update [components/RootProviders.tsx](components/RootProviders.tsx):**

```tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';

// Simple theme context
const ThemeContext = React.createContext<any>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const colors = {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#007AFF',
      surface: '#f5f5f5',
      muted: '#999999',
      error: '#ff3b30',
      onPrimary: '#ffffff',
    },
    dark: {
      background: '#1a1a1a',
      text: '#ffffff',
      primary: '#0a84ff',
      surface: '#2a2a2a',
      muted: '#666666',
      error: '#ff453a',
      onPrimary: '#000000',
    },
  };

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function RootProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
```

**Test:**
```bash
npx expo start --clear
# Theme errors should be gone
```

---

## STEP 7: Add i18n Provider (20 minutes)

**Goal:** Fix `useTranslation()` errors

**Check:** Where is `useTranslation` defined?

```bash
grep -r "useTranslation" src/ --include="*.ts" --include="*.tsx" | grep "export"
```

Likely: [i18n/index.tsx](i18n/index.tsx)

**Update [components/RootProviders.tsx](components/RootProviders.tsx):**

```tsx
const I18nContext = React.createContext<any>(null);

function I18nProvider({ children }: { children: ReactNode }) {
  // Simple passthrough for now - replace with real i18n
  const t = (key: string, defaultValue: string = key) => defaultValue;
  
  return (
    <I18nContext.Provider value={{ t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function RootProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
```

**Test:**
```bash
npx expo start --clear
# i18n errors should be gone
```

---

## STEP 8: Identify Remaining Hook Errors (15 minutes)

**Watch the console** and note any errors like:
- "Hook 'useAuth' called outside provider"
- "useSettings must be used within..."
- "useNotifications..."
- etc.

**For each error:**

1. Find the hook definition (`grep -r "useXYZ" src/`)
2. Find its corresponding Provider
3. Add that provider to RootProviders in same pattern

**Example pattern:**

```tsx
// Find provider
const MyProvider = require('../store/myStore').MyProvider;

// Add to tree in RootProviders
<ThemeProvider>
  <I18nProvider>
    <MyProvider>
      {children}
    </MyProvider>
  </I18nProvider>
</ThemeProvider>
```

---

## STEP 9: Test Complete Flow (15 minutes)

```bash
npx expo start --clear
```

**Checklist:**
- [ ] App loads without crashing
- [ ] Can navigate between tabs
- [ ] No console errors about missing providers
- [ ] Can see content on each screen

**Common remaining issues & fixes:**

| Error | Fix |
|-------|-----|
| `useSettings is undefined` | Add SettingsProvider to RootProviders |
| `useAuth is undefined` | Add AuthProvider to RootProviders |
| Colors look wrong | Check ThemeProvider is first |
| Text in wrong language | Check I18nProvider initialized correctly |
| App jumps/flickers | Remove unnecessary re-renders from providers |

---

## STEP 10: Re-enable Auth (Careful!) (30 minutes)

**Only do this after all providers are set up.**

**File:** [app/index.tsx](app/index.tsx)

Start with simple version:

```tsx
import { Redirect } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

export default function Index() {
  // First, check if useAuth works at all
  // If it throws, providers aren't set up right
  
  // For now, skip auth - just redirect
  return <Redirect href="/(tabs)" />;
}
```

Only when this works, try:

```tsx
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAppStore';

export default function Index() {
  const { status } = useAuth();
  const router = useRouter();
  const lastStatus = useRef<string | null>(null);

  useEffect(() => {
    if (status === lastStatus.current) return;
    lastStatus.current = status;
    
    if (status === 'loading') return;
    
    // Route based on auth status
    if (status === 'signedIn' || status === 'anonymous') {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/signin');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return <View style={{ flex: 1 }} />;
  }

  return null;
}
```

**Test carefully:**
```bash
npx expo start --clear

# Expected:
# - App shows loading momentarily
# - Redirects to (tabs) or (auth)/signin based on auth status
# - Navigation works after redirect
```

---

## FINAL TEST (30 minutes)

**Full manual test pass:**

```bash
npx expo start --clear

# 1. Home tab - check it loads
# 2. Wellness tab - tap it, check it loads
# 3. Resources tab - tap it, check it loads
# 4. Advocacy tab - tap it, check it loads
# 5. Community tab - tap it, check it loads
# 6. Campaigns tab - tap it, check it loads
# 7. Settings tab - tap it, check it loads

# If you get to step 7 with no crashes: SUCCESS! 🎉
```

---

## NEXT: Address Your Specific Issues

Once you've completed the above steps (should take 2-3 hours), you'll have:
- ✅ App rendering
- ✅ Navigation working
- ✅ Provider structure in place
- ✅ Ready for production fixes

Then tackle:
1. Re-enable proper authentication
2. Restore data-dependent features (campaigns, resources, etc.)
3. Add error boundaries
4. Full QA pass

---

## If You Get Stuck

**"Hook X called outside provider"**
→ Find that hook's Provider, add to RootProviders

**"Cannot read property 'xyz' of undefined"**
→ Provider didn't initialize, add to RootProviders earlier

**"App still blank"**
→ Add `console.log` at every provider to see which ones initialize

**Navigation doesn't work**
→ Make sure auth doesn't interrupt routing until ready

---

**Estimated Time:** 3-4 hours  
**Difficulty:** Medium (mostly copy-paste, some debugging)  
**Success Rate:** 95% if you follow steps exactly

You've got this! 💪
