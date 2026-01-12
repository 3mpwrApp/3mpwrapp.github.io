# 🔥 TECHNICAL AUDIT & RECOVERY PLAN
## React Native App - Critical Architecture Issues Identified

**Date:** January 10, 2026  
**Status:** 🚨 CRITICAL - App Cannot Load/Navigate  
**Severity:** Production-blocking  

---

## EXECUTIVE SUMMARY

Your app is experiencing **cascading provider initialization failure** resulting in:
- ❌ App not rendering (blank screen or crash)
- ❌ Navigation completely non-functional
- ❌ Auth flow broken
- ❌ No error boundaries to catch root causes

### Root Cause Analysis

**CRITICAL FINDING:** Your `app/_layout.tsx` (RootLayout) is **NOT WRAPPED IN ANY PROVIDERS** yet multiple child screens depend on:
- `useAuth()` from `store/appStore.ts`
- `useAppPalette()` (theme/color system)
- `useTranslation()` (i18n)
- `useSettings()` (accessibility & preferences)
- And 8+ other context/Zustand stores

This is a **classic React hierarchy violation**: screens are trying to use hooks from stores that were never initialized.

---

## PART 1: ARCHITECTURE AUDIT

### 1.1 Current Provider Architecture (BROKEN)

**File:** [app/_layout.tsx](app/_layout.tsx)

```
app/_layout.tsx (RootLayout)
├─ NO PROVIDERS WRAPPING
├─ <Stack>
│  ├─ <index> → uses useAuth() ❌
│  ├─ <(auth)> → uses useAuth() ❌
│  ├─ <(tabs)> → uses many hooks ❌
│  └─ <modal>
└─ No error boundary
```

**Problem:** The `Stack` navigator is trying to render screens that require auth, theme, i18n, and settings context—but none of these contexts exist at the root level.

---

### 1.2 Store Dependencies Analysis

You have **2 conflicting auth systems**:

#### System A: `context/AuthContext.tsx` (Firebase-based)
- Firebase Authentication integration
- Admin tier system (SuperAdmin + GeneralAdmin)
- Session expiration handling
- **Status:** Currently UNUSED in navigation flow

#### System B: `store/appStore.ts` (Zustand)
- Local-first auth state management
- Simplified auth flow (signedIn/signedOut/anonymous)
- **Status:** Used by `app/index.tsx` but never initialized

#### System C: `store/auth.tsx` (Zustand alternative)
- Another local auth store implementation
- **Status:** Duplicate/conflicting with appStore.ts

**Issue:** Three separate auth implementations, no clear winner. App can't initialize because it doesn't know which one to use.

---

### 1.3 Provider Tree - What SHOULD Be Wrapped

Based on code analysis, your app needs:

```
RootLayout
├─ 🔥 ERROR BOUNDARY (required, missing)
├─ AuthProvider (from store/appStore OR context/AuthContext, not both)
├─ I18nProvider / TranslationProvider
├─ ThemeProvider / PaletteProvider
├─ SettingsProvider
├─ NotificationsProvider
├─ First7Provider (onboarding)
├─ MedicationsProvider
├─ FavoritesProvider
├─ ComplexityModeProvider
├─ Accessibility Context providers (6 total)
├─ SafeProviderWrapper (error isolation)
└─ Stack Navigator (your current code)
```

**Current state:** The Stack navigator sits at the root with zero providers.

---

## PART 2: DETAILED ROOT CAUSE ANALYSIS

### Issue #1: Missing Provider Initialization Chain

**Symptom:** App shows blank screen or crashes immediately

**Root Cause:**
1. Expo-Router loads [app/_layout.tsx](app/_layout.tsx)
2. RootLayout renders `<Stack>` with no providers
3. Stack tries to render [app/index.tsx](app/index.tsx)
4. [app/index.tsx](app/index.tsx) calls `const { user, loading } = useAuth()`
5. `useAuth()` from [store/appStore.ts](store/appStore.ts) tries to access Zustand store
6. Store was never created/wrapped in provider
7. **Result:** React throws "Hook called outside provider" error (often silent in production)

**Evidence from code:**
- [app/_layout.tsx](app/_layout.tsx): Line 31-36, `Stack` component with zero `Provider` wrappers
- [app/index.tsx](app/index.tsx): Line 7, calls `useAuth()` immediately
- [store/appStore.ts](store/appStore.ts): Line 281, Zustand store created but never wrapped in a context provider

---

### Issue #2: Auth State Conflict

**Current implementations:**
1. **context/AuthContext.tsx** - Firebase auth, feature-rich, but not hooked into navigation
2. **store/appStore.ts** - Zustand store with auth domain, used by app/index.tsx
3. **store/auth.tsx** - Another Zustand store, duplicate/orphaned

**Problems:**
- Navigation relies on `store/appStore.ts` auth
- Firebase features (admin claims, session expiration) are in `context/AuthContext.tsx`
- No initialization flow connects them
- Screen navigation doesn't wait for auth to initialize

**Why this breaks navigation:**
- `app/index.tsx` checks `useAuth()` status but store is uninitialized
- When store is uninitialized, `user` is undefined
- Navigation logic redirects to auth screens, but auth screens also depend on uninitialized stores
- Result: Redirect loop or blank screen

---

### Issue #3: Missing Error Boundaries

**Current state:** No error boundaries anywhere

**Problem:** When providers fail (even silently), entire app tree collapses with no user feedback

**Code gap:**
- `components/SafeProviderWrapper.tsx` exists but is NOT USED in `app/_layout.tsx`

---

### Issue #4: Theme/Palette Not Available

**Symptom:** `useAppPalette()` throws or returns undefined

[app/index.tsx](app/index.tsx) line 8 calls:
```tsx
const palette = useAppPalette();
```

But there's no ThemeProvider in the tree. This requires:
- Theme context initialized
- Colors defined
- Palette selector working

Currently missing.

---

### Issue #5: Localization (i18n) Not Initialized

**Missing:** [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) uses `useTranslation()` at line 8:
```tsx
const { t } = useTranslation();
```

But there's no TranslationProvider wrapping the app.

---

### Issue #6: Navigation Structure Problems

**Current tabs layout:** [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx)
- Lazy rendering enabled (good)
- But nested route groups may not be properly registered
- Auth-based navigation (index.tsx → auth vs tabs) happens BEFORE routes are fully initialized

**Risk:** Routes exist in file system but aren't discovered by Expo-Router during initialization.

---

## PART 3: COMPARISON TO PRODUCTION BEST PRACTICES

### ✅ What You're Doing Right

1. **File-based routing (Expo-Router)** - Modern, maintainable
2. **Zustand for state** - Lightweight, performant
3. **AsyncStorage persistence** - Good for offline support
4. **Environment variable handling** - Decent separation of concerns
5. **Multiple auth methods** (Google, anonymous, email) - Good flexibility
6. **Accessibility contexts** - Comprehensive approach

### ❌ What's Broken or Missing

| Area | Issue | Impact | Recommendation |
|------|-------|--------|-----------------|
| **Provider tree** | No root provider wrapper | App can't initialize | Wrap RootLayout with all providers |
| **Auth unification** | 3 conflicting systems | Routing broken | Choose ONE: Firebase (context) OR local (appStore) |
| **Error boundaries** | None at root level | Silent failures | Add error boundary above Stack |
| **Initialization flow** | Async setup with no wait | Race conditions | Use useEffect to hydrate stores before rendering nav |
| **Theme provider** | Missing entirely | useAppPalette fails | Create ThemeProvider, wrap RootLayout |
| **i18n provider** | Missing entirely | useTranslation fails | Create TranslationProvider, wrap RootLayout |
| **Provider ordering** | N/A (no providers) | Dependency chaos | Define: Auth → Theme → i18n → Other |
| **Navigation guards** | Auth checks in screens | Too late to redirect | Use auth state in RootLayout to render conditional trees |

---

## PART 4: RECOMMENDED PRODUCTION TECH STACK ALIGNMENT

### Your Tech Stack vs. Recommended

| Layer | Your Current | Recommended | Gap |
|-------|--------------|-------------|-----|
| **Framework** | React Native (Expo) ✅ | React Native (Expo) | None |
| **Navigation** | Expo-Router ✅ | React Navigation / Expo-Router | None (Router good) |
| **Backend** | Firebase (hybrid) | Supabase (target) | Major gap - not started |
| **Auth** | Firebase + local store | Clerk (modern) OR Supabase Auth | Firebase is legacy, Clerk recommended |
| **Database** | Firestore | Supabase (PostgreSQL) | Major gap - not started |
| **State** | Zustand + Context | Zustand ✅ | None |
| **AI/LLM** | OpenAI + Claude | OpenAI + Claude ✅ | None |
| **Error Tracking** | Sentry (set up) | Sentry ✅ | None |

### Critical Gaps to Address

1. **Firebase → Supabase migration** (not started)
2. **Auth consolidation** (Firebase OR Clerk, not both)
3. **Provider initialization** (blocking everything else)

---

## PART 5: RECOVERY PLAN

### Phase 0: IMMEDIATE STABILIZATION (Next 2 hours)

**Goal:** Get app rendering without crashes, enable navigation

#### Step 1: Fix RootLayout Provider Wrapping

**File:** [app/_layout.tsx](app/_layout.tsx)

Replace entire file with minimal working version:

```tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";

// Safe error handler
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('ResizeObserver')) return;
    if (!event.error && !event.message) return;
    console.error('[GlobalError]', event.message);
  });
}

console.log('[RootLayout] Initializing...');

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({});
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate minimum async setup (replace with your actual init)
    if (fontsLoaded && !fontsError) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </View>
  );
}
```

**Why this works:**
- Still bare (no providers yet)
- But at least navigation renders
- Allows you to see where app fails next

#### Step 2: Disable Auth Requirement Temporarily

**File:** [app/index.tsx](app/index.tsx)

Temporarily remove auth redirect:

```tsx
import { View } from 'react-native';

export default function Index() {
  // TODO: Restore auth logic after provider setup
  return <View style={{ flex: 1 }} />;
}
```

Or redirect directly without hooks:

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Always redirect to tabs for now - we'll implement auth later
  return <Redirect href="/(tabs)" />;
}
```

#### Step 3: Test Navigation Works

Run:
```bash
npx expo start --clear
```

**Expected:** App loads, you can see tabs, can tap between screens. Might show errors about missing hooks/data, but **app should render and not crash**.

---

### Phase 1: PROPER PROVIDER SETUP (Next 4 hours)

**Goal:** Initialize providers in correct order, enable auth

#### Step 4: Create Root Provider Component

**New file:** [components/RootProviders.tsx](components/RootProviders.tsx)

```tsx
import React, { ReactNode } from 'react';
import { View } from 'react-native';

// Placeholder provider until real ones are implemented
function createProvider(
  displayName: string,
  Provider: React.FC<{ children: ReactNode }>
) {
  const Component = ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
  Component.displayName = displayName;
  return Component;
}

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    // Wrap in layers, in order of dependency
    // 1. Auth (foundational - everything depends on knowing if user is logged in)
    // 2. Theme (styling depends on auth, but not on theme-dependent content)
    // 3. i18n (strings for whole app)
    // 4. Settings (user preferences)
    // 5. Other features
    <View style={{ flex: 1 }}>
      {/* 
        TODO: Add providers one by one, testing after each
        Order:
        1. AuthProvider (from store/appStore.ts)
        2. ThemeProvider
        3. TranslationProvider
        4. SettingsProvider
        5. Others: NotificationsProvider, ComplexityModeProvider, etc.
      */}
      {children}
    </View>
  );
}
```

#### Step 5: Update RootLayout to Use Providers

**File:** [app/_layout.tsx](app/_layout.tsx)

```tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";

import { RootProviders } from "../components/RootProviders";

console.log('[RootLayout] Starting...');

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({});
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded && !fontsError) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <RootProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </RootProviders>
  );
}
```

#### Step 6: Decide: Firebase or Supabase Auth

**Choose ONE:**

**Option A: Firebase Auth (Use existing context/AuthContext.tsx)**
- Keep: `context/AuthContext.tsx`
- Remove: `store/auth.tsx`, simplify `store/appStore.ts`
- Benefits: Already integrated, Firebase features work
- Drawbacks: Firebase is legacy, costs scale poorly

**Option B: Local-first (Use store/appStore.ts)**
- Keep: `store/appStore.ts` auth domain
- Remove: `context/AuthContext.tsx`, `store/auth.tsx`
- Benefits: No backend dependency, fast, simple
- Drawbacks: No cloud sync, auth features limited

**Option C: Supabase Auth (Recommended, longer-term)**
- Create: New `store/supabaseAuth.ts` using Supabase client
- Remove: Firebase contexts and stores
- Benefits: Modern, production-ready, great DX, cheaper at scale
- Drawbacks: Requires Supabase setup (1-2 hours)

**RECOMMENDATION:** Start with **Option B (Local-first)** for immediate stabilization, plan **Option C (Supabase)** for production.

---

### Phase 2: RESTORE FEATURES (Next 8 hours)

Once Phase 1 is done (app renders + navigation works):

1. **Add Theme Provider** → Fix `useAppPalette()`
2. **Add i18n Provider** → Fix `useTranslation()`
3. **Add Settings Provider** → Fix `useSettings()`
4. **Restore Auth Logic** → Re-enable login/signup
5. **Test Each Tab** → Verify no missing hooks
6. **Add Error Boundaries** → Production safety

---

## PART 6: STEP-BY-STEP DEBUGGING GUIDE

### Debug Session 1: Isolate Provider Issues

**Goal:** Identify which provider is failing

```bash
# 1. Clear cache and start with verbose logging
npx expo start --clear

# 2. Check console for provider initialization errors
# Look for patterns like:
# - "Hook called outside provider"
# - "Cannot read property 'xyz' of undefined"
# - Provider X initialization failed

# 3. If you see errors, note:
# - Which provider failed?
# - What was it trying to do?
# - Does it depend on another provider?
```

**Expected outputs:**
- ✅ "RootLayout Starting"
- ✅ "Loading fonts..."
- ✅ App renders with tabs visible (or blank screen if all hooks disabled)
- ❌ Any other errors = specific provider issue

### Debug Session 2: Test Auth Flow

Once Phase 1 complete:

```bash
# 1. Try to sign in
# Check logs for:
# - Auth state changes
# - Navigation redirects
# - Any Firebase/Zustand errors

# 2. If sign in fails:
# - Is auth provider initialized?
# - Is auth store hydrated?
# - Is navigation hook wired correctly?

# 3. Test guest mode first (simplest):
# - Should not require Firebase
# - Should redirect to home /(tabs)
```

### Debug Session 3: Test Navigation

Once auth works:

```bash
# 1. Tap between tabs
# Check for:
# - Screen loads without errors
# - No missing hook errors
# - Correct data displays

# 2. If a tab fails:
# - Find which hook is missing
# - Verify provider is wrapped
# - Check hook uses inside component
```

### Debug Session 4: Validate Provider Order

Once all providers added:

```bash
# 1. Check that auth initializes FIRST
#    (everything depends on knowing if user is logged in)

# 2. Check that theme initializes EARLY
#    (avoid flashing wrong colors)

# 3. Use React DevTools to inspect provider tree:
#    DevTools > Components > Search for Provider names
#    Verify nesting order matches your requirements
```

---

## PART 7: IMPLEMENTATION CHECKLIST

### Pre-Stabilization

- [ ] Backup current code (`git commit` or copy)
- [ ] Read this entire audit
- [ ] Understand your auth choice (Firebase vs Supabase vs Local)

### Phase 0: Stabilization (2 hours)

- [ ] Simplify [app/_layout.tsx](app/_layout.tsx) (remove fonts loading complexity)
- [ ] Disable auth redirects in [app/index.tsx](app/index.tsx)
- [ ] Test: App loads, navigation works, no crashes
- [ ] Verify with `npx expo start --clear`

### Phase 1: Providers (4 hours)

- [ ] Create [components/RootProviders.tsx](components/RootProviders.tsx)
- [ ] Add providers one-by-one:
  - [ ] Choose and implement AuthProvider
  - [ ] Test: App still renders
  - [ ] Create ThemeProvider
  - [ ] Test: Colors work, `useAppPalette()` works
  - [ ] Create i18nProvider
  - [ ] Test: Strings load, `useTranslation()` works
  - [ ] Create SettingsProvider
  - [ ] Add other providers (Notifications, Complexity, etc.)
- [ ] Update [app/_layout.tsx](app/_layout.tsx) to use `<RootProviders>`
- [ ] Test: All screens render without hook errors

### Phase 2: Auth & Navigation (4 hours)

- [ ] Re-enable auth logic in [app/index.tsx](app/index.tsx)
- [ ] Test: Guest login works
- [ ] Test: Regular login works
- [ ] Test: Sign out works
- [ ] Verify navigation redirects correctly (auth vs tabs)

### Phase 3: Bug Fixes (4 hours)

- [ ] Fix any remaining provider dependency issues
- [ ] Test each tab in detail
- [ ] Add error boundaries for production safety
- [ ] Run `npm test` and fix test failures

### Phase 4: Validation (2 hours)

- [ ] Full manual test pass
- [ ] `npm run lint` passes
- [ ] No console errors
- [ ] Device/simulator test (if possible)

---

## PART 8: PREVENTING FUTURE REFACTOR BREAKS

### Architectural Rules to Enforce

1. **Provider Pyramid:** Always explicitly define provider tree at root
   - Document nesting order
   - Use constant/enum for provider names
   - Add type checking

2. **Hook Safety:** Use custom hooks that check for providers
   ```tsx
   function useAuth() {
     const store = useAppStore();
     if (!store) throw new Error('useAuth must be wrapped by AuthProvider');
     return store;
   }
   ```

3. **Error Boundaries:** Every large provider gets wrapped
   ```tsx
   <SafeProviderWrapper providerName="Auth">
     <AuthProvider>{children}</AuthProvider>
   </SafeProviderWrapper>
   ```

4. **Provider Order:** Document and enforce
   ```tsx
   // auth → theme → i18n → settings → features
   // Do NOT change this order without understanding dependencies
   ```

5. **Testing:** Unit test providers in isolation
   ```tsx
   test('AuthProvider initializes correctly', () => {
     render(<AuthProvider><TestComponent /></AuthProvider>);
     expect(useAuth).not.toThrow();
   });
   ```

---

## PART 9: NEXT STEPS & LONG-TERM ROADMAP

### Immediate (This Week)

1. Execute Phase 0 & 1 of recovery plan
2. Get app rendering and navigating
3. Document your auth choice decision

### Short-term (This Month)

1. Complete Phase 2 & 3 (restore features)
2. Add comprehensive error handling
3. Run full test suite
4. Beta testing on devices

### Medium-term (2-3 Months)

1. **Supabase Migration** (Phase 0-1 of migration plan)
   - Set up Supabase project
   - Migrate auth system
   - Migrate Firestore data
   - Test sync & conflicts

2. **Clerk Integration** (Alternative to Supabase Auth)
   - Modern auth platform
   - Better DX than Firebase
   - Easier team management

3. **Architecture Documentation**
   - Create ARCHITECTURE.md with provider tree
   - Document all hook requirements
   - Create component template

### Production Release

1. Full QA pass
2. Performance testing
3. Security audit
4. Beta phase (300+ users minimum)
5. App store submission

---

## PART 10: QUICK REFERENCE - ERROR DIAGNOSIS

| Error | Cause | Fix |
|-------|-------|-----|
| "Hook called outside provider" | Provider not wrapping component | Wrap in RootProviders |
| "Cannot read property 'xyz' of undefined" | Store/context not initialized | Check provider initialization order |
| Blank white screen | App rendering but returning null/empty | Check loading states in RootLayout |
| Navigation doesn't respond | Routing broken or auth infinite loop | Disable auth, test navigation alone |
| useAuth returns undefined | AuthProvider not wrapping | Add to RootProviders in order |
| useAppPalette fails | ThemeProvider missing | Create ThemeProvider, add to RootProviders |
| useTranslation fails | i18n provider missing | Create TranslationProvider, add to RootProviders |
| Silent crashes | Error boundary missing | Add SafeProviderWrapper |

---

## CRITICAL FILES SUMMARY

| File | Current State | Action |
|------|---------------|--------|
| [app/_layout.tsx](app/_layout.tsx) | ❌ No providers | Replace with RootProviders wrapper |
| [app/index.tsx](app/index.tsx) | ⚠️ Calls useAuth too early | Simplify temporarily, restore later |
| [context/AuthContext.tsx](context/AuthContext.tsx) | ⚠️ Firebase, unused | Choose: Keep OR remove |
| [store/appStore.ts](store/appStore.ts) | ⚠️ Used but not wrapped | Wrap in RootProviders |
| [store/auth.tsx](store/auth.tsx) | ❌ Duplicate/orphaned | Delete or consolidate |
| [components/RootProviders.tsx](components/RootProviders.tsx) | ❌ Doesn't exist | Create as part of Phase 1 |
| [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) | ⚠️ Assumes providers exist | Should work once wrapped |

---

## QUESTIONS TO VALIDATE UNDERSTANDING

Before proceeding, confirm:

1. **Auth choice:** Firebase (context/AuthContext) or Local (store/appStore)? → ___________
2. **Long-term backend:** Firebase, Supabase, or other? → ___________
3. **Can you run?** `npm install && npx expo start` → Yes / No
4. **Errors seen?** Screenshot/console logs of current error → (attach)
5. **Deadline?** When must app be working? → ___________

---

## SUPPORT & ESCALATION

If you get stuck:

1. **Check console for provider initialization errors** → Note exact error
2. **Use React DevTools** → Inspect component tree
3. **Enable verbose logging** → Add `console.log` at provider initialization
4. **Isolate component** → Render screen without providers to verify logic
5. **Check dependencies** → Ensure all imported modules exist and export correct things

---

**Created:** 2026-01-10  
**Status:** Ready for implementation  
**Estimated Recovery Time:** 8-12 hours of focused work

Good luck! 🚀
