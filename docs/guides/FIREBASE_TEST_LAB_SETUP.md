# Firebase Test Lab & Crashlytics Setup

## ✅ Installation Status

### Crashlytics - INSTALLED ✓
- `@react-native-firebase/app`: v23.5.0
- `@react-native-firebase/crashlytics`: v23.5.0
- Configured in `app.json` plugins
- Service wrapper created: `services/crashlytics.ts`
- Initialized in: `app/_layout.tsx`
- Google Services file: `google-services.json` ✓

### Firebase Test Lab - READY ✓
- Robo script created: `robo_script.json`
- Project ID: `empowrapp-4e25b`
- Package: `com.app3mpwr.app3mpwr`

---

## Usage Guide

### 1. Crashlytics (Crash Reporting)

Crashlytics will automatically capture crashes after you build and deploy your app.

**Build with Crashlytics:**
```bash
eas build --platform android --profile preview
```

**View crashes:**
https://console.firebase.google.com/project/empowrapp-4e25b/crashlytics

**Manual logging (already integrated):**
```typescript
import { logError, log, setUserId } from './services/crashlytics';

// Log non-fatal errors
logError(error, { screen: 'Home', action: 'loadData' });

// Custom logs
log('User completed onboarding');

// Set user identifier (no PII)
setUserId('user-123');
```

---

### 2. Firebase Test Lab (Screenshot Generation & Testing)

**Step 1: Build APK**
```bash
eas build --platform android --profile preview
```

**Step 2: Upload to Firebase Test Lab**

**Option A: Firebase Console (Recommended)**
1. Go to: https://console.firebase.google.com/project/empowrapp-4e25b/testlab
2. Click "Run a test"
3. Select "Robo test"
4. Upload your APK
5. Click "Advanced options"
6. Upload `robo_script.json`
7. Select devices:
   - Phone: Pixel 6 (API 33)
   - 7" Tablet: SmallTablet.arm (API 30)
   - 10" Tablet: MediumTablet.arm (API 30)
   - Chromebook: Any Chromebook device
8. Set timeout: 30 minutes
9. Click "Start tests"

**Option B: gcloud CLI (Advanced)**
```bash
# Install gcloud first: https://cloud.google.com/sdk/docs/install

gcloud firebase test android run \
  --type robo \
  --app path/to/your.apk \
  --robo-script robo_script.json \
  --timeout 30m \
  --device model=Pixel6,version=33,locale=en,orientation=portrait \
  --device model=SmallTablet.arm,version=30,locale=en,orientation=landscape \
  --device model=MediumTablet.arm,version=30,locale=en,orientation=landscape \
  --project empowrapp-4e25b
```

**Step 3: Download Screenshots**
1. Wait for tests to complete (20-30 minutes)
2. Click on each device in the results
3. Go to "Screenshots" tab
4. Download screenshots for Google Play Store submission

---

## Robo Script Coverage

The `robo_script.json` navigates through:
- ✅ Terms Gate (all 7 disclaimer steps)
- ✅ Home Tab
- ✅ Campaigns Tab
- ✅ Community Tab
- ✅ Resources Tab
- ✅ Wellness Tab (Spoon Economist, Energy Dashboard)
- ✅ Advocacy Tab (Hub, Legal DNA)
- ✅ Settings Tab (Profile, Accessibility, Privacy)
- ✅ What's New Tab
- ✅ Inbox

---

## Google Play Screenshot Requirements

| Device Type | Required? | Min Screenshots | Resolution |
|-------------|-----------|-----------------|------------|
| Phone | ✅ Yes | 2 | 1080x2400 or similar |
| 7" Tablet | ✅ Yes | 2 | 1200x1920 or similar |
| 10" Tablet | ✅ Yes | 2 | 2560x1600 or similar |
| Chromebook | ⚠️ Recommended | 1-2 | 1366x768+ |

**Total minimum: 6 screenshots (2 per device type)**

---

## Troubleshooting

### Crashlytics not showing crashes?
1. Ensure you built with EAS Build (not Expo Go)
2. Check Firebase Console permissions
3. Wait 5-10 minutes after first crash
4. Verify `google-services.json` matches your package name

### Robo test not navigating properly?
1. Check if Terms Gate is blocking (robo_script should handle it)
2. Increase timeout to 30 minutes
3. Add more specific element descriptors to robo_script.json
4. Try running without robo_script first to see where it gets stuck

### Can't find screenshots?
1. Go to Firebase Console → Test Lab → Results
2. Click on specific device test
3. Navigate to "Screenshots" tab
4. Download individually or use "Download all"

---

## Next Steps After Testing

1. **Review crashes** in Crashlytics dashboard
2. **Download screenshots** from Test Lab results
3. **Upload to Google Play Console**:
   - Store presence → Main store listing
   - Phone screenshots (2-8)
   - 7" tablet screenshots (2-8)
   - 10" tablet screenshots (2-8)
4. **Monitor** ongoing crashes in production

---

## Quick Links

- **Firebase Console**: https://console.firebase.google.com/project/empowrapp-4e25b
- **Test Lab**: https://console.firebase.google.com/project/empowrapp-4e25b/testlab
- **Crashlytics**: https://console.firebase.google.com/project/empowrapp-4e25b/crashlytics
- **Google Play Console**: https://play.google.com/console
- **EAS Builds**: https://expo.dev/accounts/3mpwrapp/projects/empowrapp/builds

---

## Summary

✅ **Crashlytics**: Installed and configured - will work after next build
✅ **Test Lab**: Ready to use with robo_script.json
✅ **APK**: Need to build with `eas build --platform android --profile preview`
✅ **Screenshots**: Will be generated automatically by Test Lab

**You're all set! Just build and upload to Firebase Test Lab.**
