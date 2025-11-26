# 🐛 Quick Reference: Critical Issues

**Last Updated**: November 25, 2025

---

## 🔴 CRITICAL - FIX IMMEDIATELY

### 1. Web App Crash: CSSStyleDeclaration Error
```
TypeError: Failed to set an indexed property [0] on 'CSSStyleDeclaration': 
Indexed property setter is not supported
```
**Where**: React Native Web style handling  
**Impact**: Web app crashes on navigation  
**Fix**: Investigate `A11yPressable` and `ExpoRouterLink` style props  
**Priority**: 🔴 BLOCKER  

### 2. Missing API Endpoints (404 Errors)
```
❌ https://3mpwrapp.pages.dev/api/resources → 404
❌ https://3mpwrapp.pages.dev/api/campaigns.json → 404
❌ https://3mpwrapp.pages.dev/api/podcasts → 404
```
**Impact**: Features fall back to stale mock data  
**Fix**: Deploy endpoints to Cloudflare Pages  
**Priority**: 🔴 BLOCKER  

---

## 🟠 HIGH - FIX THIS WEEK

### 3. React.Fragment Invalid Style Props
```
Invalid prop `style` supplied to `React.Fragment`
```
**Where**: Multiple components (3+ occurrences)  
**Fix**: Find prop spreading to Fragments, use View instead  
**Priority**: 🟠 HIGH  

### 4. Provider Initialization Failures (Web)
```
[SafeProviderWrapper] First7Provider initialization failed
[SafeProviderWrapper] NotificationsProvider initialization failed
```
**Where**: Web platform  
**Fix**: Add platform checks, graceful degradation  
**Priority**: 🟠 HIGH  

---

## ✅ FIXED

### expo-av Deprecation (SDK 54)
**File**: `services/negotiationCoach.ts`  
**Fix**: Migrated to `expo-audio`  
**Status**: ✅ Code fixed, needs testing  

### Shadow Props
**Status**: ✅ App code clean (warning from Expo Router internals)  
**Action**: None required  

---

## 📋 QUICK ACTIONS

```bash
# 1. Deploy missing API endpoints
cd cloudflare-workers/
npm run deploy

# 2. Search for Fragment style issues
node scripts/find-fragment-issues-simple.js

# 3. Test Negotiation Coach audio
# Navigate to Advocacy → Negotiation Coach → Start Recording

# 4. Check for other expo-av usage
grep -r "from 'expo-av'" app/ components/ services/

# 5. Run full test suite
npm test

# 6. Check web app console
npm run web
# Open http://localhost:8081 and check browser console
```

---

## 📞 NEED HELP?

**Full Report**: `COMPREHENSIVE_BUG_REPORT.md`  
**Executive Summary**: `STRESS_TEST_EXECUTIVE_SUMMARY.md`  
**Email**: empowrapp08162025@gmail.com  

---

**Priority Order**:
1. Fix CSSStyleDeclaration error (web crash)
2. Deploy missing API endpoints
3. Fix Fragment invalid props
4. Fix provider initialization (web)
5. Test all fixes
6. Continue systematic feature testing

🎯 **Goal**: Production-ready in 4-6 weeks
