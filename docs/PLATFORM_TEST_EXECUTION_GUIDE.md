# Platform Test Execution Guide
**For:** 3mpwr App Multi-Platform QA  
**Date:** November 19, 2025  
**Duration:** 3-5 days for complete testing

---

## 🎯 Quick Start

### Prerequisites
- [ ] Node.js 20.19.4+ installed
- [ ] Git repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Firebase project configured
- [ ] EAS CLI installed (`npm install -g eas-cli`)

### Environment Setup
```bash
# Clone and setup (if not already done)
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new

# Install dependencies
npm install

# Verify installation
npm test
npm run lint
npm run web:validate
```

---

## 📱 Part 1: Android Native Testing

### Option A: Physical Android Device (RECOMMENDED)

#### Setup
1. **Enable Developer Options on your Android phone:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → System → Developer Options → Enable USB Debugging

2. **Connect device to computer via USB**

3. **Verify device connection:**
   ```bash
   adb devices
   # Should show your device listed
   ```

4. **Start development server:**
   ```bash
   npx expo start
   ```

5. **Install Expo Go from Play Store**
   - Open Expo Go app
   - Scan QR code from terminal
   - App should load on your device

#### Alternative: EAS Development Build
```bash
# Build development client
eas build --profile development --platform android

# Download APK when ready
# Install on device: adb install <path-to-apk>

# Start dev server with dev client
npx expo start --dev-client
```

### Option B: Android Studio Emulator

#### Setup (First Time)
1. **Install Android Studio:**
   - Download from https://developer.android.com/studio
   - Install with default settings

2. **Create Virtual Device:**
   - Open Android Studio
   - Tools → Device Manager
   - Create Device → Pixel 6 Pro (or similar)
   - System Image: Android 13 (API 33) or 14 (API 34)
   - Finish setup

3. **Start Emulator:**
   - Device Manager → Play button on your device
   - Wait for emulator to boot (2-3 minutes first time)

4. **Run app on emulator:**
   ```bash
   npx expo start --android
   ```

---

### Android Test Execution Checklist

#### Installation & First Run
- [ ] App installs successfully
- [ ] Splash screen displays
- [ ] Terms gate loads
- [ ] Can scroll through all 9 legal screens
- [ ] Can accept all terms
- [ ] Redirects to onboarding

#### Authentication
- [ ] Sign up with email/password works
- [ ] Login with email/password works
- [ ] Guest mode works
- [ ] Google OAuth works (requires EAS build)
- [ ] Logout works
- [ ] Login state persists after app restart

#### Navigation
- [ ] All 8 tabs load
- [ ] Tab switching is smooth
- [ ] Back button works correctly
- [ ] Deep links work (test from browser)
- [ ] App doesn't crash when backgrounded
- [ ] App resumes correctly from background

#### Permissions
- [ ] Camera permission request (Evidence Locker)
- [ ] Gallery permission request (Evidence Locker)
- [ ] Location permission request (Rep Tracker)
- [ ] Microphone permission (if using voice features)
- [ ] Permissions can be granted
- [ ] Permissions can be denied (app handles gracefully)
- [ ] Permission dialogs have clear explanations

#### Evidence Locker (Critical Feature)
- [ ] Take photo with camera
- [ ] Select photo from gallery
- [ ] Upload PDF document
- [ ] Upload Word document
- [ ] Record audio note
- [ ] View uploaded evidence
- [ ] Share evidence to other apps
- [ ] Delete evidence
- [ ] Evidence persists after app restart
- [ ] Offline upload queue works (airplane mode)

#### Community Features
- [ ] View threads in channels
- [ ] Post new thread
- [ ] Reply to thread
- [ ] Real-time message updates
- [ ] Typing indicators work
- [ ] Unread badges accurate
- [ ] Offline messages queue and send later

#### Wellness Tools
- [ ] Mood tracker logs mood
- [ ] Pacing partner tracks energy
- [ ] AI insights display
- [ ] DBT skills accessible
- [ ] Exercise videos play (YouTube)
- [ ] Meditation audio plays
- [ ] Sleep tracker works

#### Advocacy Tools
- [ ] Jurisdiction selector works (all 14)
- [ ] Deadline calculator accurate
- [ ] Form helper shows forms
- [ ] Letter wizard generates letters (all 22)
- [ ] Lawyer finder with filters
- [ ] Rep tracker shows reps (location required)

#### Accessibility
- [ ] TalkBack navigation works
- [ ] All buttons have labels
- [ ] Screen reader announces content
- [ ] Dyslexia font toggle works
- [ ] Font size adjustment works
- [ ] Color tint overlays work
- [ ] Simplified mode works
- [ ] High contrast readable

#### Performance
- [ ] App starts in <2 seconds
- [ ] Navigation is smooth (60fps)
- [ ] No memory leaks (use several hours)
- [ ] Battery drain acceptable (<5%/hour)
- [ ] No ANR (App Not Responding) dialogs
- [ ] Large lists scroll smoothly

#### Offline Mode
- [ ] Enable airplane mode
- [ ] App still functions
- [ ] Evidence can be queued
- [ ] Messages queue
- [ ] Offline indicator shows
- [ ] Re-enable network
- [ ] Queued items sync automatically

#### Stress Testing
- [ ] Rotate device (portrait/landscape)
- [ ] Background/foreground 10+ times
- [ ] Fill Evidence Locker with 50+ items
- [ ] Post 20+ messages in Community
- [ ] Navigate through all tabs rapidly
- [ ] Leave app open overnight

---

## 🌐 Part 2: Web Browser Testing

### Desktop Browser Setup

#### Chrome/Edge Testing
```bash
# Start web development server
npm run web

# Open in browser
# Navigate to: http://localhost:8081
# Or scan QR code from terminal
```

**Test in:**
- Chrome (Windows)
- Chrome (macOS)
- Edge (Windows)
- Edge (macOS)

#### Firefox Testing
```bash
# Same server: npm run web
# Open Firefox
# Navigate to: http://localhost:8081
```

#### Safari Testing (macOS only)
```bash
# Same server: npm run web
# Open Safari
# Navigate to: http://localhost:8081
```

---

### Web Test Execution Checklist

#### Initial Load & Performance
- [ ] Page loads in <3 seconds
- [ ] No console errors
- [ ] No network errors
- [ ] Service worker registers
- [ ] Offline mode available
- [ ] IndexedDB initializes

#### Responsive Design Testing
Test at these viewport sizes:
- [ ] 320px (small phone)
- [ ] 375px (iPhone)
- [ ] 768px (tablet)
- [ ] 1024px (small desktop)
- [ ] 1920px (full desktop)

**How to test:**
- Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Select device or enter custom dimensions
- Verify layout doesn't break at any size

#### Authentication
- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] Guest mode
- [ ] Google OAuth (must configure web client ID)
- [ ] Logout
- [ ] Session persists in LocalStorage
- [ ] Session persists across tab close/open

#### Navigation & Routing
- [ ] All 8 tabs accessible
- [ ] Browser back button works
- [ ] Browser forward button works
- [ ] Deep links work (paste URL)
- [ ] Browser history accurate
- [ ] Page refresh doesn't lose state

#### File Upload (Evidence Locker)
- [ ] Click "Upload Photo"
- [ ] File picker opens
- [ ] Select image file
- [ ] Image uploads successfully
- [ ] Thumbnail displays
- [ ] Can view full image
- [ ] Can delete uploaded file

**Test file types:**
- [ ] JPG image
- [ ] PNG image
- [ ] PDF document
- [ ] Word document (.docx)
- [ ] Large file (>5MB)

#### Camera Access (may require HTTPS)
- [ ] Click "Take Photo"
- [ ] Browser requests camera permission
- [ ] Grant permission
- [ ] Camera stream shows
- [ ] Capture photo
- [ ] Photo uploads successfully

#### Firestore Real-Time Features
- [ ] Open Community in 2 browser tabs
- [ ] Post message in tab 1
- [ ] Message appears in tab 2 immediately
- [ ] Typing indicator shows
- [ ] Unread badges update

#### Keyboard Navigation
- [ ] Tab key moves focus
- [ ] Enter key activates buttons
- [ ] Escape key closes modals
- [ ] Arrow keys work in lists
- [ ] Shift+Tab moves focus backward
- [ ] Focus indicators visible

#### Screen Reader Testing
**Windows (NVDA - free):**
- Download NVDA from https://www.nvaccess.org/
- Press Ctrl to stop speech
- Tab through app
- Verify all elements announced

**macOS (VoiceOver - built-in):**
- Cmd+F5 to enable VoiceOver
- Ctrl to pause speech
- Tab through app
- Verify all elements announced

#### Accessibility Features
- [ ] Font size slider works
- [ ] Dyslexia font toggle works
- [ ] Color tint overlays work
- [ ] High contrast mode readable
- [ ] Reduced motion respected
- [ ] Keyboard shortcuts work

#### Browser-Specific Features
- [ ] Copy/paste works
- [ ] Right-click context menu appropriate
- [ ] Browser zoom (Ctrl/Cmd +/-) scales correctly
- [ ] Print preview works
- [ ] Bookmark/save works
- [ ] Browser notifications (if enabled)

#### Offline/Online Transitions
- [ ] Disconnect network (DevTools → Network → Offline)
- [ ] Offline indicator shows
- [ ] App still navigable
- [ ] Actions queue
- [ ] Reconnect network
- [ ] Online indicator shows
- [ ] Queued actions sync

#### Performance Profiling
**Chrome Lighthouse Audit:**
1. Open Chrome DevTools (F12)
2. Lighthouse tab
3. Select categories: Performance, Accessibility, Best Practices, SEO
4. Generate report
5. Target scores:
   - Performance: >90
   - Accessibility: >95
   - Best Practices: >90
   - SEO: >80

**Performance Metrics:**
- [ ] First Contentful Paint <1.5s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3.5s
- [ ] Total Blocking Time <200ms
- [ ] Cumulative Layout Shift <0.1

---

### Mobile Browser Testing

#### iOS Safari
1. Start web server: `npm run web -- --tunnel`
2. Note the ngrok/tunnel URL
3. Open Safari on iPhone/iPad
4. Navigate to tunnel URL
5. Run mobile test checklist (similar to desktop)

#### Chrome Mobile (Android)
1. Same tunnel setup
2. Open Chrome on Android device
3. Navigate to tunnel URL
4. Run mobile test checklist

#### Test Mobile-Specific Features
- [ ] Touch gestures work (swipe, pinch, tap)
- [ ] Pull-to-refresh works
- [ ] Add to Home Screen works
- [ ] PWA install prompt shows
- [ ] Landscape orientation works
- [ ] Mobile keyboard doesn't break layout
- [ ] File upload from mobile works
- [ ] Camera access works (HTTPS required)

---

## 🔄 Part 3: Cross-Platform Testing

### Data Sync Testing
1. **Login on Android with email/password**
2. **Add evidence item on Android**
3. **Login on Web with same account**
4. **Verify evidence appears on Web**
5. **Add evidence on Web**
6. **Check Android - should sync**
7. **Post message in Community on Android**
8. **Check Web - should appear in real-time**

### Expected Behavior:
- ✅ Evidence syncs via Firestore (if cloud enabled)
- ✅ Community messages sync in real-time
- ✅ User preferences sync (if cloud enabled)
- ✅ Mood/wellness data syncs (if cloud enabled)

### Offline → Online Sync
1. **Enable offline mode on Android**
2. **Add 3 evidence items**
3. **Post 2 messages**
4. **Enable network**
5. **Verify all items sync to cloud**
6. **Check Web - all items should appear**

---

## 📊 Test Results Template

### Bug Report Format

```markdown
**Bug ID:** BUG-001
**Platform:** Android / Web / Both
**Browser:** (if web) Chrome 120 / Firefox 121 / Safari 17
**Device:** (if mobile) Pixel 6 Pro / iPhone 14
**OS Version:** Android 14 / iOS 17 / Windows 11

**Severity:** Critical / High / Medium / Low
**Category:** Crash / UI / Performance / Data Loss / Minor

**Steps to Reproduce:**
1. Open app
2. Navigate to Evidence Locker
3. Tap "Upload Photo"
4. Select large image (>10MB)

**Expected Result:**
Image uploads with progress indicator

**Actual Result:**
App crashes with "Out of Memory" error

**Workaround:** Resize image before upload

**Screenshots:** (attach)

**Console Logs:** (attach)

**Priority:** P0 / P1 / P2 / P3
```

---

## ✅ Test Completion Checklist

### Before Declaring "PASSED"

#### Android
- [ ] Tested on at least 3 different devices/versions
- [ ] All critical features work
- [ ] No crash bugs
- [ ] Performance acceptable
- [ ] Accessibility features work
- [ ] Offline mode works
- [ ] 0 P0 bugs, 0 P1 bugs

#### Web
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on desktop + mobile browsers
- [ ] All viewport sizes work
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] Accessibility score >95
- [ ] 0 P0 bugs, 0 P1 bugs

#### Cross-Platform
- [ ] Data syncs correctly
- [ ] No data loss
- [ ] Offline queue works
- [ ] Real-time features work
- [ ] Same user experience across platforms

---

## 🚀 Final Validation

### Pre-Launch Checklist
```bash
# Run all automated validations
npm test                     # All tests pass
npm run lint                 # No errors
npm run web:validate         # <10 warnings
npm run security:all         # All checks pass
npm run a11y:scan            # No critical issues
npm run wcag:audit           # AAA compliance

# Manual validation
# - Test on 3+ Android devices
# - Test on 4+ web browsers
# - Test all critical user journeys
# - Performance benchmarks met
# - No P0 or P1 bugs
```

### Sign-Off
- [ ] **QA Lead:** All tests passed
- [ ] **Platform Engineer:** Builds successful
- [ ] **Security:** Security audit passed
- [ ] **Accessibility:** WCAG AAA compliance verified
- [ ] **Product Owner:** Approved for release

---

## 📞 Support

**Issues?** Email empowrapp08162025@gmail.com  
**Documentation:** See `docs/FULL_PLATFORM_AUDIT_NOV2025.md`  
**Automation:** See `scripts/validate-web-compat.mjs`
