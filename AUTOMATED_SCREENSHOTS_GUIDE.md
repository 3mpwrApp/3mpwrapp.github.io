# Automated Screenshot Guide

## Quick Start

### 1. Set up Android Emulators

Create emulators for each required screen size:

```powershell
# Open Android Studio → Device Manager → Create Device

# Required devices:
# - Phone (e.g., Pixel 8, 1080x2400)
# - 7" Tablet (e.g., Nexus 7, 1920x1200)  
# - 10" Tablet (e.g., Pixel Tablet, 2560x1600)
# - Chromebook (landscape, 1920x1280)
```

### 2. Start an Emulator

```powershell
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_8_API_34
```

### 3. Run the Automated Screenshot Script

```powershell
# Navigate to project
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new

# Run script (uses default emulator-5554)
.\scripts\automated-screenshots.ps1

# Or specify device and output folder
.\scripts\automated-screenshots.ps1 -DeviceName "emulator-5556" -OutputDir "screenshots/pixel8"
```

## What the Script Does

✅ Launches your app  
✅ Navigates through Terms Gate (all 7 disclaimer screens)  
✅ Captures screenshots of each main tab  
✅ Scrolls and captures content  
✅ Explores sub-screens (Spoon Economist, etc.)  
✅ Saves all screenshots with descriptive names  

## Customizing Tap Positions

If buttons are in different positions on your device:

1. **Find coordinates** by enabling "Pointer Location" in Developer Options
2. **Update tap positions** in the script:
   ```powershell
   Tap-Screen 540 2000  # X=540, Y=2000
   ```

## Running on Multiple Devices

```powershell
# Phone (1080x2400)
emulator -avd Pixel_8_API_34
.\scripts\automated-screenshots.ps1 -OutputDir "screenshots/phone"

# 7" Tablet
emulator -avd Nexus_7_API_34  
.\scripts\automated-screenshots.ps1 -DeviceName "emulator-5556" -OutputDir "screenshots/tablet7"

# 10" Tablet
emulator -avd Pixel_Tablet_API_34
.\scripts\automated-screenshots.ps1 -DeviceName "emulator-5558" -OutputDir "screenshots/tablet10"
```

## Manual Screenshots (Backup Method)

If automation doesn't work perfectly:

```powershell
# Take screenshot from emulator
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshot.png

# Or use Ctrl+S in emulator (saves to Pictures/Screenshots)
```

## Troubleshooting

### "Device not found"
```powershell
# Check connected devices
adb devices

# Find device name (usually emulator-5554, emulator-5556, etc.)
# Use that name with -DeviceName parameter
```

### Wrong tap positions
1. Enable Developer Options → Pointer Location
2. Tap buttons and note X,Y coordinates
3. Update Tap-Screen commands in script

### App not launching
```powershell
# Install APK first
adb install path/to/app.apk

# Or manually launch app, then run script without launch step
```

## Advanced: Screen Recording

```powershell
# Record video while script runs
adb shell screenrecord /sdcard/demo.mp4

# Let script run (max 3 minutes)
# Stop recording (Ctrl+C in terminal)

# Pull video
adb pull /sdcard/demo.mp4
```

## Alternative: Manual with Emulator

1. Start emulator
2. Install APK: `adb install app.apk`
3. Navigate app manually
4. Press `Ctrl+S` to save screenshots
5. Screenshots auto-save to: `C:\Users\YourName\Pictures\Screenshots\`

---

**Next Steps After Screenshots:**
1. Organize by device type (phone, 7", 10", Chromebook)
2. Select 2-8 best screenshots per device type
3. Upload to Google Play Console → Store Listing → Screenshots
