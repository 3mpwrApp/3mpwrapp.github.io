# How to Capture Screenshots for Google Play

## ❌ DO NOT Use Web Browser
The web version has compatibility issues and doesn't represent the actual Android app experience.

## ✅ RECOMMENDED: Use Expo Go on Android Phone

### Step 1: Install Expo Go
- Open Google Play Store on your Android phone
- Search for "Expo Go"
- Install the app

### Step 2: Connect to Development Server
1. Make sure your phone and computer are on the **same WiFi network**
2. Open Expo Go app on your phone
3. Wait for the Expo server to show QR code in terminal
4. Scan the QR code with Expo Go app

### Step 3: Capture Screenshots
Once the app loads on your phone:
1. Navigate to each screen listed in `SCREENSHOT_GUIDE.md`
2. Take screenshots using your phone's screenshot function:
   - **Samsung**: Volume Down + Power button
   - **Google Pixel**: Power + Volume Down
   - **Most Android**: Power + Volume Down
3. Transfer screenshots to computer via USB or cloud storage

### Step 4: Resize and Optimize
- Use image editor to resize to 1080 x 2400 pixels
- Save as PNG or JPEG (max 8MB each)
- Name files: `01-home-dashboard.png`, `02-wellness-hub.png`, etc.

---

## Alternative: Use Android Studio Emulator

### Step 1: Open Android Studio
- Launch Android Studio
- Go to Tools → Device Manager

### Step 2: Create/Start Emulator
- Create new AVD with these specs:
  - Device: Pixel 6 or Pixel 7
  - System Image: Android 13 (API 33) or higher
  - Resolution: 1080 x 2400
- Click "Play" to start emulator

### Step 3: Run App on Emulator
1. Wait for emulator to fully boot
2. In Expo terminal, press `a` for Android
3. App will install and launch in emulator

### Step 4: Capture Screenshots
- Use emulator's camera button (right sidebar)
- Or use keyboard shortcut: Ctrl+S (Windows)
- Screenshots saved to: `C:\Users\<YourName>\Pictures\Android`

---

## Troubleshooting

### "Metro bundler errors"
- These `<anonymous>` errors are normal - ignore them
- The app will still work correctly

### "App keeps reloading on web"
- This is expected - web version is not stable
- **Always use Android device or emulator for screenshots**

### "Can't scan QR code"
- Check both devices are on same WiFi
- Try running: `npx expo start --tunnel`
- This creates a public URL (slower but works across networks)

### "App crashes on phone"
- Clear Expo Go cache in app settings
- Restart Expo server: `npx expo start --clear`
- Check terminal for actual errors

---

## Production Build Alternative

If you want the exact production experience:

```bash
# Build production APK
eas build --platform android --profile production

# Install on device
# Download APK from EAS build page
# Transfer to phone and install
```

This takes 15-30 minutes but gives you the final production app.
