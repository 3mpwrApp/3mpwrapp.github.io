# ✅ PRODUCTION READINESS CHECKLIST

For when you've fixed the app and want to ensure it's ready for real users.

---

## PRE-RECOVERY CHECKLIST

Before implementing any fixes, verify you have:

- [ ] **Code backup:** `git commit` done
- [ ] **Current error documented:** Screenshot or console log saved
- [ ] **Test device ready:** Simulator or physical device working
- [ ] **Network available:** For API calls, Firebase, etc.
- [ ] **Time blocked:** 8-12 hours uninterrupted work
- [ ] **Caffeine:** ☕

---

## ARCHITECTURE CHECKLIST

### ✅ Core Structure

- [ ] **Root entry point exists** 
  - File: `app/_layout.tsx` or configured in `package.json`
  - Must not throw on init
  
- [ ] **All providers wrapped at root**
  - File: `app/_layout.tsx` wraps `RootProviders` or equivalent
  - Order documented: Auth → Theme → i18n → Settings → Features
  
- [ ] **No circular dependencies**
  - Run: `npx madge --circular app/ store/ context/`
  - Result: Zero cycles reported
  
- [ ] **Auth system chosen and unified**
  - Keep: ONE of (Firebase, Supabase, or Local)
  - Remove: All competing auth systems
  - Document: Which one and why

- [ ] **Error boundaries at critical points**
  - Root level: `RootErrorBoundary`
  - Provider level: Each major provider wrapped in SafeProviderWrapper
  - Screen level: Important screens have error boundary
  
- [ ] **Provider initialization happens before rendering**
  - All async setup completes before Stack renders
  - Loading state shown while initializing
  - No "hook outside provider" errors

---

### ✅ Navigation Structure

- [ ] **Route files exist and are discoverable**
  - `app/index.tsx` - Home/root redirect
  - `app/(tabs)/_layout.tsx` - Main tab navigator
  - `app/(auth)/_layout.tsx` - Auth screens
  - Run: `find app -name "_layout.tsx" | wc -l` (should be 16+)

- [ ] **All nested routes registered properly**
  - No broken imports
  - No missing parent layout files
  - Verify: `npx expo-router --inspect` shows all routes

- [ ] **Auth-based navigation works**
  - Unauthenticated users see login screens
  - Authenticated users see main app
  - Navigation redirects have no race conditions
  - Test: Sign in → see tabs, Sign out → see login

- [ ] **Deep linking configured**
  - `app.json` has `scheme` and `intentFilters`
  - Test: Click on external link to open app
  - Handle unmatched routes gracefully

---

## STATE MANAGEMENT CHECKLIST

### ✅ Store Setup

- [ ] **Zustand stores created properly**
  - All stores export hooks (not components)
  - Hooks check for provider existence
  - Example: `useAuth`, `useSettings`, `useMood`

- [ ] **Persistence working**
  - AsyncStorage available on native
  - Fallback to memory on web
  - Test: App state survives reload
  - No AsyncStorage not available errors (should warn, not crash)

- [ ] **Store initialization safe**
  - Stores initialize with defaults
  - No missing data causes crashes
  - Async data loads in useEffect, not store constructor

- [ ] **Context cleanup**
  - Remove unused contexts
  - Verify all `React.createContext` is paired with Provider
  - No orphaned context definitions

---

## ACCESSIBILITY CHECKLIST

### ✅ WCAG AA Minimum

- [ ] **Text contrast**
  - Ratio ≥ 4.5:1 for normal text
  - Ratio ≥ 3:1 for large text (18pt+)
  - Run: `npm run wcag:contrast-audit`

- [ ] **Touch targets**
  - Minimum 44×44 dp for interactive elements
  - Check: Settings tab visible and tappable
  - Verify: `tapTargetMinimum` setting works

- [ ] **Color not sole conveyor of info**
  - Status not indicated by color alone
  - Icons + text for all key info
  - Error states: color + icon + text

- [ ] **Keyboard navigation**
  - All screens navigable without touch
  - Focus indicators visible
  - Tab order logical
  - Test on device/simulator

- [ ] **Screen reader support**
  - `accessibilityLabel` on all buttons
  - `accessibilityRole` set correctly
  - Screen reader announces all content
  - Test: VoiceOver (iOS) or TalkBack (Android)

- [ ] **Motion/animations**
  - `reduceMotion` setting respected
  - Animations disable when setting enabled
  - No auto-playing videos
  - Test: Enable motion reduction

---

## SECURITY CHECKLIST

### ✅ Essential Security

- [ ] **Authentication secure**
  - No passwords stored in localStorage/AsyncStorage
  - No auth tokens visible in logs
  - Session management implemented
  - Test: Try to tamper with storage, app rejects it

- [ ] **API requests secured**
  - All API calls use HTTPS
  - Sensitive data in body, not URL
  - API keys not exposed in frontend
  - Check: Network tab in DevTools shows only HTTPS

- [ ] **Firebase rules configured**
  - File: `firebase/firestore.rules`
  - Rules deployed: `npm run rules:deploy`
  - Only authenticated users access data
  - Test: Try unauthenticated request, fails

- [ ] **Environment variables**
  - Secrets in `.env.local` (git-ignored)
  - Public vars in `app.json` with `expo.extra`
  - No secrets in version control
  - Check: `git log --full-history -S "secret"` returns nothing

- [ ] **Dependency vulnerabilities**
  - Run: `npm audit`
  - Fix high/critical: `npm audit fix`
  - Review remaining issues
  - Document unavoidable vulnerabilities

- [ ] **Error messages safe**
  - No stack traces shown to users
  - No sensitive data in error messages
  - Example: "Sign in failed" not "User not found with email X"

---

## PERFORMANCE CHECKLIST

### ✅ User Experience

- [ ] **App startup time < 3 seconds**
  - Measured from tap to main screen visible
  - Use: Performance.now() and console timing
  - Test on: Slow device or network

- [ ] **Navigation responsive**
  - No lag when switching tabs
  - Transitions smooth (60 FPS)
  - Check: React DevTools Profiler

- [ ] **Lists don't lag**
  - Long lists use `FlatList` or `SectionList`
  - Items rendered lazily
  - Test: Scroll through 500+ item list
  - No janky scrolling

- [ ] **Images optimized**
  - All images ≤ 100 KB (or progressive JPG)
  - Proper aspect ratios in layout
  - No transparent PNGs for photos
  - Use: `expo-image` for better performance

- [ ] **Data fetching efficient**
  - No unnecessary re-renders
  - Requests batched/debounced
  - Caching implemented where appropriate
  - Test: Check Network tab, no duplicate requests

- [ ] **Memory doesn't leak**
  - Run: `npm run test:stress` 
  - Memory stable over time
  - No memory grows indefinitely when cycling screens

---

## TESTING CHECKLIST

### ✅ Minimum Coverage

- [ ] **Unit tests passing**
  - Run: `npm test`
  - Result: All tests passing or baseline established
  - Coverage: ≥ 50% for critical code

- [ ] **Lint clean**
  - Run: `npm run lint`
  - Result: 0 errors, <50 warnings
  - Warnings documented and tracked

- [ ] **TypeScript strict**
  - Run: `npm run typecheck:strict`
  - Result: 0 errors
  - All `any` types resolved or documented

- [ ] **Manual testing pass**
  - Test checklist in [TEST_CHECKLIST.md](#manual-test-checklist)
  - At least 2 testers
  - Real devices (not just simulator)

- [ ] **Edge cases tested**
  - Offline mode: No internet → graceful degradation
  - Slow network: Simulate slow 3G → app doesn't freeze
  - Permissions denied: Location/camera denied → handles gracefully
  - Low memory: Simulate memory pressure → no crashes

---

## DEPLOYMENT CHECKLIST

### ✅ Release Ready

- [ ] **Versioning correct**
  - `app.json` version matches semantic versioning
  - `package.json` version in sync
  - `CHANGELOG.md` updated

- [ ] **Build successful**
  - Run: `eas build --platform ios` (or `android`)
  - Result: Build completes without errors
  - APK/IPA generated and valid

- [ ] **App configuration correct**
  - Bundle ID correct
  - App name correct
  - Icons & splash screen correct (visual check)
  - Permissions only what's needed

- [ ] **Signing & certificates**
  - iOS: Distribution certificate valid
  - Android: Upload key configured
  - Keys secured (not in git)

- [ ] **Release notes written**
  - For app stores
  - For internal team
  - Highlights new features & fixes

- [ ] **Rollback plan**
  - Previous version buildable
  - Data migration backward-compatible
  - Can downgrade without data loss

---

## MONITORING & ANALYTICS CHECKLIST

### ✅ Observability

- [ ] **Error tracking configured**
  - Sentry project created
  - Error reporting working
  - Test: `throw new Error()` shows in Sentry

- [ ] **Analytics events firing**
  - Key events instrumented
  - Test: Use app, check dashboard
  - No PII in events

- [ ] **Crash reporting**
  - Critical crashes captured
  - Stack traces helpful
  - Reproduction steps tracked

- [ ] **Performance monitoring**
  - Slow screens identified
  - Heavy operations measured
  - Baseline established for future comparison

---

## MANUAL TEST CHECKLIST

### 🔄 Full User Flow (30 minutes)

**Device:** Physical phone (iOS or Android)

**Setup:**
- [ ] Fresh install (uninstall old version)
- [ ] First time opening app
- [ ] Network available
- [ ] Location services available

**Test Flow:**

1. **Launch**
   - [ ] App opens without crash
   - [ ] Loading shown if needed
   - [ ] Splash screen appears
   - Takes < 5 seconds total

2. **Auth - Guest Mode**
   - [ ] Tap "Continue as Guest"
   - [ ] App loads home tab
   - [ ] Can navigate to other tabs
   - [ ] Can see main content

3. **Auth - Sign In**
   - [ ] Go to Settings → Sign In
   - [ ] Sign in with email/Google/Apple
   - [ ] Redirects to home after success
   - [ ] User data shows in Settings

4. **Navigation**
   - [ ] Tap each tab (Home, Wellness, Resources, Advocacy, Community, Campaigns, Events, Settings)
   - [ ] Each loads without error
   - [ ] Tap back: returns to previous tab
   - [ ] Tap tab again: goes to top of tab

5. **Core Features** (adapt to your app)
   - [ ] Create content (evidence, note, etc.)
   - [ ] Edit content
   - [ ] Delete content
   - [ ] Search/filter works
   - [ ] Can export/share

6. **Offline Mode**
   - [ ] Enable airplane mode
   - [ ] App still works (uses cached data)
   - [ ] Attempts to sync show graceful error
   - [ ] When online again, syncs automatically

7. **Accessibility**
   - [ ] Enable TalkBack (Android) / VoiceOver (iOS)
   - [ ] Can navigate all screens
   - [ ] All buttons have labels
   - [ ] Can interact with all features

8. **Settings**
   - [ ] Change text size: Large → content resizes
   - [ ] Change contrast: High contrast → colors change
   - [ ] Change language: App strings update
   - [ ] Change theme: Dark → colors switch

9. **Performance**
   - [ ] No lag switching tabs
   - [ ] Lists scroll smoothly
   - [ ] Images load quickly
   - [ ] App doesn't freeze during operations

10. **Sign Out & Restart**
    - [ ] Sign out from Settings
    - [ ] Returns to login screen
    - [ ] Close app
    - [ ] Reopen app
    - [ ] Still signed out
    - [ ] Can sign back in

---

## SIGN-OFF CHECKLIST

### Before Release

- [ ] **Product Owner Approval**
  - [ ] Feature complete
  - [ ] No critical bugs
  - [ ] Performance acceptable
  - [ ] Signed approval: ___________

- [ ] **QA Sign-Off**
  - [ ] Test checklist completed
  - [ ] All critical paths work
  - [ ] No regressions from previous version
  - [ ] QA name: ___________

- [ ] **Security Review**
  - [ ] Security checklist passed
  - [ ] No obvious vulnerabilities
  - [ ] Dependencies audited
  - [ ] Reviewer: ___________

- [ ] **Developer Ready**
  - [ ] Code review passed
  - [ ] All TODOs resolved or tracked
  - [ ] Documentation complete
  - [ ] Ready for production
  - [ ] Developer: ___________

---

## POST-RELEASE CHECKLIST

### After Deploy (First 24 Hours)

- [ ] **Monitor crashes**
  - Sentry dashboard clean (no new issues)
  - Error rate < 0.1%
  - If errors: Prepare hotfix

- [ ] **Monitor analytics**
  - Users activating
  - Key features being used
  - Retention looks good

- [ ] **Monitor performance**
  - Startup times normal
  - No memory leaks
  - Network usage reasonable

- [ ] **Monitor user feedback**
  - App store reviews
  - Support inbox
  - User forums/community

---

## ONGOING MAINTENANCE

### Weekly

- [ ] Review Sentry errors
- [ ] Check analytics trends
- [ ] Review GitHub issues

### Monthly

- [ ] Dependency updates (`npm update`)
- [ ] Security audit (`npm audit`)
- [ ] Performance review
- [ ] User feedback summary

### Quarterly

- [ ] Full regression test
- [ ] Accessibility audit
- [ ] Performance benchmark
- [ ] Architecture review

---

## SUCCESS METRICS

Once released, you should see:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Crash Rate** | < 0.1% | Sentry dashboard |
| **Startup Time** | < 3 sec | Performance profiler |
| **Daily Active Users** | > 100 | Firebase Console |
| **Retention (Day 1)** | > 40% | Analytics dashboard |
| **Retention (Day 7)** | > 15% | Analytics dashboard |
| **Error Rate** | < 0.5% | Sentry dashboard |
| **Feature Usage** | > 60% | Analytics events |
| **User Rating** | > 4.0 | App store |

---

## TROUBLESHOOTING BY PRIORITY

### 🔴 CRITICAL (App non-functional)

If users report app won't open or crashes immediately:

1. **Check Sentry** for error pattern
2. **Rollback** to previous version
3. **Prepare hotfix** while rolled back
4. **Deploy hotfix**
5. **Post-mortem** to prevent repeat

### 🟠 HIGH (Key feature broken)

If major feature doesn't work:

1. **Isolate feature** (does it work for all users?)
2. **Check feature logs** in analytics
3. **Assign fix** (highest priority)
4. **Deploy in next release** (or hotfix if critical enough)

### 🟡 MEDIUM (Some users affected)

If some users report issue:

1. **Identify pattern** (all iOS? All locations? etc.)
2. **Reproduce** if possible
3. **Document** in issue tracker
4. **Schedule fix** for next sprint

### 🟢 LOW (Polish/edge cases)

If users report minor issues:

1. **Document** in issue tracker
2. **Triage** with product team
3. **Schedule** for future release

---

## FINAL VALIDATION

Before you declare the app production-ready, ask yourself:

- [ ] "Would I use this app daily?"
- [ ] "Would I recommend this to a friend?"
- [ ] "Is it fast enough that it never annoys me?"
- [ ] "Is it accessible to someone with disabilities?"
- [ ] "Would I trust it with my sensitive data?"

If you answered "no" to any of these, fix it before release.

---

**Remember:** Production launches are not the end, they're the beginning. Your job is not done until users are happy using your app in the real world.

Good luck! 🚀
