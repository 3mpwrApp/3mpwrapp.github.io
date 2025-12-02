# Android Emulator Setup for Google Play Screenshots

This guide will help you create Android emulators for all required screenshot sizes.

## Prerequisites

1. **Install Android Studio**: https://developer.android.com/studio
2. **System Requirements**: 
   - 16GB RAM recommended (8GB minimum)
   - 20GB free disk space
   - Enable virtualization in BIOS (Intel VT-x or AMD-V)

## Step-by-Step Setup

### 1. Open Android Studio
- Launch Android Studio
- Click "More Actions" → "Virtual Device Manager" (or Tools → Device Manager if project is open)

### 2. Create Required Emulators

#### A. 7-inch Tablet (Required by Google Play)
1. Click **"Create Device"**
2. **Category**: Tablet
3. **Device**: Nexus 7 (2013)
   - Resolution: 1920 × 1200 (WUXGA)
   - Size: 7.0"
   - Density: xhdpi (320 dpi)
4. Click **"Next"**
5. **System Image**: Select latest API 34 (Android 14) or API 33
   - Click "Download" if not installed
6. Click **"Next"** → **"Finish"**

#### B. 10-inch Tablet (Required by Google Play)
1. Click **"Create Device"**
2. **Category**: Tablet
3. **Device**: Pixel Tablet
   - Resolution: 2560 × 1600
   - Size: 10.95"
   - Density: xhdpi (276 dpi)
4. Click **"Next"**
5. **System Image**: Same as above (API 34 or 33)
6. Click **"Next"** → **"Finish"**

#### C. Chromebook (Required by Google Play)
1. Click **"Create Device"**
2. Click **"New Hardware Profile"** (bottom left)
3. Configure:
   - **Device Name**: Chromebook Generic
   - **Device Type**: Phone/Tablet
   - **Screen Size**: 13.5 inches
   - **Resolution**: 1920 × 1280 (landscape) or 2256 × 1504
   - **Density**: mdpi (213)
   - **Supported device states**: Landscape
4. Click **"Finish"**
5. Select your new "Chromebook Generic" device
6. Click **"Next"**
7. **System Image**: API 34 or 33
8. Click **"Next"** → **"Finish"**

#### D. Android XR / Large Screen (Required by Google Play)
**Option 1: Use Pixel Fold (Recommended)**
1. Click **"Create Device"**
2. **Category**: Phone
3. **Device**: Pixel Fold
   - Unfolded: 2208 × 1840
   - Large screen format acceptable for XR
4. Click **"Next"**
5. **System Image**: API 34 or 33
6. Click **"Next"** → **"Finish"**

**Option 2: Create Custom XR Device**
1. Click **"New Hardware Profile"**
2. Configure:
   - **Device Name**: Android XR Large Screen
   - **Screen Size**: 14 inches
   - **Resolution**: 2880 × 1920
   - **Density**: xhdpi (320)
3. Click **"Finish"** and proceed as above

## Running Your App on Emulators

### Method 1: Expo Development Build (Recommended)

```powershell
# Build development build for Android
npx expo run:android

# Or use EAS Build
eas build --platform android --profile development
```

When prompted, select the emulator you want to use.

### Method 2: Install APK Directly

```powershell
# First, create a production build
eas build --platform android --profile preview

# Download the APK from EAS dashboard
# Then install on emulator:
adb install path/to/your-app.apk

# To install on specific emulator:
adb -s emulator-5554 install path/to/your-app.apk
```

### Method 3: Use Expo Go (Quick Testing Only)

```powershell
# Start Expo
npx expo start

# Press 'a' to open on Android emulator
```

⚠️ **Note**: Expo Go won't show your custom app icon/splash. Use development build for accurate screenshots.

## Taking Screenshots

### Option 1: Emulator Built-in Tool (Best Quality)
1. Run your app on the emulator
2. Click the **camera icon** in emulator toolbar (right side)
3. Screenshots saved to: `C:\Users\YourName\Pictures\Screenshots\`

### Option 2: Keyboard Shortcut
- Press **Ctrl + S** while emulator is focused
- Saves to same location as above

### Option 3: ADB Command
```powershell
# Take screenshot via ADB
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshot.png
```

## Screenshot Requirements for Google Play

Each device type needs **at least 2 screenshots** (up to 8):

- **Phone**: 1080 × 2400 or similar (you have A50)
- **7" Tablet**: 1920 × 1200 or higher
- **10" Tablet**: 2560 × 1600 or higher  
- **Chromebook**: Landscape orientation, 1920 × 1280+
- **Android XR**: 2208 × 1840 or larger

**Format**: PNG or JPEG, max 8MB each

## Optimizing Emulator Performance

### 1. Enable Hardware Acceleration
In Android Studio:
- Tools → SDK Manager → SDK Tools
- Check "Intel x86 Emulator Accelerator (HAXM)" or "Android Emulator Hypervisor Driver"
- Install and restart

### 2. Allocate More RAM
When creating/editing emulator:
- Click "Show Advanced Settings"
- RAM: 4096 MB (4GB) for tablets
- Internal Storage: 2048 MB minimum

### 3. Use Cold Boot for Screenshots
- Emulator Settings → Boot Option → "Cold Boot"
- Ensures clean state for screenshots

## Troubleshooting

### Emulator is slow
- Close other applications
- Reduce emulator resolution (Advanced Settings)
- Enable "Use Host GPU" in emulator settings

### Can't install app
```powershell
# Check if emulator is running
adb devices

# Uninstall previous version first
adb uninstall app.empowrapp.main

# Then reinstall
```

### Wrong orientation
- Press **Ctrl + F11** to rotate emulator
- Or use toolbar rotation buttons

### Emulator won't start
- Check BIOS virtualization is enabled
- Update graphics drivers
- Try "Cold Boot" instead of "Quick Boot"

## Quick Commands Reference

```powershell
# List running emulators
adb devices

# List all AVDs
emulator -list-avds

# Start specific emulator from command line
emulator -avd Nexus_7_2013_API_34

# Install APK
adb install app.apk

# Uninstall app
adb uninstall app.empowrapp.main

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# Clear app data
adb shell pm clear app.empowrapp.main
```

## Screenshot Checklist

- [ ] Phone (A50) - 2+ screenshots
- [ ] 7" Tablet (Nexus 7) - 2+ screenshots  
- [ ] 10" Tablet (Pixel Tablet) - 2+ screenshots
- [ ] Chromebook (Custom) - 2+ screenshots
- [ ] Android XR (Pixel Fold) - 2+ screenshots

**Total needed**: Minimum 10 screenshots (2 per device type)

## Next Steps

1. Create all emulators using steps above
2. Build your app: `npx expo run:android` or use EAS Build
3. Install on each emulator
4. Navigate to your best screens (Home, Features, etc.)
5. Take 2-8 screenshots per device type
6. Upload to Google Play Console

## Resources

- Android Studio Download: https://developer.android.com/studio
- AVD Manager Guide: https://developer.android.com/studio/run/managing-avds
- Google Play Screenshot Requirements: https://support.google.com/googleplay/android-developer/answer/9866151

---

**Estimated Time**: 1-2 hours for setup + screenshots
**Disk Space Needed**: ~15-20GB (emulators + system images)
