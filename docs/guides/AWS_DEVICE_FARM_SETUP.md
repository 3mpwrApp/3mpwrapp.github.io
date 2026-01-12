# AWS Device Farm Setup Guide for 3mpwrApp

## ✅ Prerequisites
- AWS Account (signed up)
- Android APK or AAB build file
- AWS CLI installed (optional but recommended)

---

## 📱 Step 1: Prepare Your Build

### Option A: Use Existing EAS Build
Your latest preview build: `083630c1-a220-4a79-b644-0867abe2901c`

```powershell
# Download the APK from EAS
eas build:download --platform android --id 083630c1-a220-4a79-b644-0867abe2901c
```

### Option B: Build New APK for Testing
```powershell
# Build APK (faster than AAB for testing)
eas build --platform android --profile preview --non-interactive
```

---

## 🌐 Step 2: Access AWS Device Farm Console

1. **Go to AWS Device Farm Console:**
   - URL: https://console.aws.amazon.com/devicefarm/
   - Or search "Device Farm" in AWS Console

2. **Select Region:**
   - Device Farm is only available in: **us-west-2 (Oregon)**
   - Make sure you're in the correct region (top-right dropdown)

3. **Create New Project:**
   - Click **"Create a new project"**
   - Name: `3mpwrApp Testing`
   - Click **"Create project"**

---

## 📤 Step 3: Upload Your App

1. **Click "Create a new run"**

2. **Upload Application:**
   - **Application type:** Android
   - Click **"Choose File"**
   - Select your `.apk` file (from EAS download or local build)
   - Wait for upload to complete (~2-5 minutes depending on size)

3. **Verify Upload:**
   - AWS will analyze the APK and show:
     - Package name: `com.empowrapp.main`
     - Version code
     - Supported ABIs
     - Permissions

---

## 🧪 Step 4: Configure Test

### Test Type Options:

#### **Option A: Built-in Fuzz Test (Recommended for First Run)**
- **What it does:** Randomly taps, swipes, enters text
- **Duration:** 5-60 minutes
- **Best for:** Quick smoke testing, finding crashes

**Steps:**
1. Select **"Built-in: Fuzz"**
2. Configure:
   - **Event count:** 6000 (default) or adjust
   - **Event throttle:** 0ms (fastest) to 1000ms (slower)
   - **Randomizer seed:** Leave blank for random, or set number for reproducible tests
3. Click **"Next"**

#### **Option B: Built-in Explorer (Better for Screenshots)**
- **What it does:** Intelligently explores UI, captures screenshots
- **Duration:** 5-60 minutes
- **Best for:** UI testing, screenshot generation

**Steps:**
1. Select **"Built-in: Explorer"**
2. Configure:
   - Username/password fields (if your app has login) - **leave blank for guest mode**
3. Click **"Next"**

#### **Option C: Appium/Calabash (Advanced - Custom Scripts)**
- Skip for now unless you have test scripts ready

---

## 📱 Step 5: Select Devices

### Device Pool Options:

#### **Top Devices (Recommended for Google Play)**
AWS curates popular devices. Best choices for screenshots:

1. **Create custom device pool:**
   - Click **"Create a device pool"**
   - Name: `3mpwrApp Play Store Devices`

2. **Add these devices:**
   - **Phone:** Samsung Galaxy S21 (or latest S-series)
   - **7" Tablet:** Samsung Galaxy Tab A7 10.4"
   - **10" Tablet:** Samsung Galaxy Tab S7+
   - **Chromebook:** Search for "Chromebook" devices (limited availability)

3. **Filter devices:**
   - **OS Version:** Android 10+ (your minSdkVersion: 31 = Android 12)
   - **Availability:** Available (green dot)
   - **Form factor:** Phone, Tablet

#### **Free Tier Limits:**
- **1000 device minutes per month** (first 12 months)
- Example: 10 devices × 10 minutes = 100 minutes used
- After free tier: $0.17/device minute

---

## ⚙️ Step 6: Device Configuration

1. **Device state:**
   - **Wi-Fi:** On
   - **Bluetooth:** Off (unless needed)
   - **GPS:** On (if app uses location)
   - **Locale:** English (United States) or test multiple locales

2. **Radio states:**
   - Leave defaults unless testing specific network conditions

3. **Auxiliary apps:** (Optional)
   - Upload additional APKs if needed for testing
   - Skip for now

4. Click **"Next"**

---

## 📝 Step 7: Review & Run

1. **Review Configuration:**
   - Application: Your APK
   - Test: Built-in Explorer or Fuzz
   - Devices: Your selected pool
   - Execution timeout: 60 minutes (max)

2. **Name your run:**
   - Example: `3mpwrApp v1.0.0 - UI Explorer - Nov 30 2025`

3. **Click "Confirm and start run"**

---

## 📊 Step 8: Monitor Test Execution

1. **Run Status Page:**
   - Shows real-time progress for each device
   - **States:**
     - 🟡 Pending → 🔵 Running → 🟢 Passed / 🔴 Failed

2. **Estimated Time:**
   - Provisioning devices: ~5 minutes
   - Installing app: ~2 minutes
   - Running tests: 5-60 minutes (based on config)
   - **Total:** ~15-70 minutes

3. **Watch Live:**
   - Click device name → **"View video"** (available after ~30 seconds)
   - See real-time screen recording of test

---

## 📷 Step 9: Download Results

### After Tests Complete:

1. **Click on device name** in results table

2. **Available Data:**
   - **Screenshots:** Auto-captured during test
   - **Video:** Full screen recording (.mp4)
   - **Logs:** Logcat, device logs
   - **Performance:** CPU, memory, network usage
   - **Crashes:** Stack traces if any

3. **Download Screenshots:**
   - Click **"Screenshots"** tab
   - Click **"Download all"** → ZIP file with all images
   - Individual download: Right-click screenshot → Save

4. **Download Video:**
   - Click **"Video"** tab
   - Click download icon → .mp4 file

---

## 🎯 Step 10: Get Google Play Screenshots

### Recommended Approach:

1. **Run Explorer test** on these devices:
   - Samsung Galaxy S21 (Phone)
   - Samsung Galaxy Tab A7 (7" Tablet)
   - Samsung Galaxy Tab S7+ (10" Tablet)

2. **Download all screenshots**

3. **Select best 2-8 screenshots per device:**
   - Show key features: Home, Wellness, Advocacy, Community
   - Avoid error states or loading screens
   - Ensure Terms Gate is **not** in screenshots (users see after download)

4. **Resize if needed:**
   - Google Play accepts various sizes
   - Minimum: 320px
   - Maximum: 3840px
   - Recommended: 1080px width for phones, 2560px for tablets

---

## 🔧 Step 11: Handling Terms Gate for Testing

### Problem:
AWS Device Farm Explorer will stop at Terms Gate (needs human acceptance)

### Solutions:

#### **Option A: Modify App for Testing Build** (Recommended)
Create a test-only build that auto-accepts terms:

```typescript
// In components/TermsGate.tsx - add this for test builds only
const isTestBuild = __DEV__ || process.env.EXPO_PUBLIC_AUTO_ACCEPT_TERMS === 'true';

React.useEffect(() => {
  if (isTestBuild) {
    // Auto-accept for testing
    saveAcceptance();
  }
  // ... rest of normal loading logic
}, []);
```

Build with test flag:
```powershell
# In eas.json, add to preview profile:
"env": {
  "EXPO_PUBLIC_AUTO_ACCEPT_TERMS": "true"
}

# Build
eas build --platform android --profile preview
```

#### **Option B: Use Fuzz Test Instead**
Fuzz test will randomly tap and might get through Terms Gate by chance

#### **Option C: Appium Script** (Advanced)
Write Appium script to click through Terms Gate, then explore app

---

## 💰 Cost Breakdown

### Free Tier (First 12 Months):
- **1000 device minutes per month**
- Example: 10 devices × 10 min test = 100 min used
- **Remaining:** 900 minutes for month

### After Free Tier:
- **$0.17 per device minute**
- Example: 10 devices × 10 min = 100 min × $0.17 = **$17.00**

### Tips to Save Minutes:
1. Use shorter test durations (5-10 min instead of 60 min)
2. Test on fewer devices initially
3. Use device filters to avoid slow/old devices
4. Stop tests early if issues found

---

## 🆚 AWS Device Farm vs Firebase Test Lab

| Feature | AWS Device Farm | Firebase Test Lab |
|---------|----------------|-------------------|
| **Free Tier** | 1000 min/month (12 months) | 10 tests/day (5 physical + 5 virtual) |
| **Devices** | 300+ devices | 20+ devices |
| **Screenshots** | ✅ High quality | ✅ Auto-organized |
| **Video** | ✅ Full recording | ✅ Full recording |
| **Robo Test** | Built-in Explorer | ✅ Robo Script support |
| **Custom Scripts** | Appium, Calabash | Robo Script, Espresso |
| **Integration** | AWS CLI, SDK | Firebase CLI, gcloud |
| **Best For** | Enterprise testing | Google Play integration |

---

## ✅ Quick Start Checklist

- [ ] AWS account created and signed in
- [ ] Download APK from EAS: `eas build:download --platform android --id 083630c1-a220-4a79-b644-0867abe2901c`
- [ ] Go to https://console.aws.amazon.com/devicefarm/ (us-west-2 region)
- [ ] Create project: "3mpwrApp Testing"
- [ ] Upload APK
- [ ] Select test type: **Built-in Explorer**
- [ ] Create device pool: Phone + 7" Tablet + 10" Tablet
- [ ] Configure: 10-15 minute test duration
- [ ] Start run
- [ ] Download screenshots after completion (~20-30 minutes total)
- [ ] Upload screenshots to Google Play Console

---

## 🐛 Troubleshooting

### "App crashes on launch"
- Check logcat in Device Farm results
- Verify APK runs on local emulator first
- Check if all native dependencies are included

### "Explorer doesn't navigate past Terms Gate"
- Use Option A above: Create test build with auto-accept
- Or use Fuzz test which randomly taps

### "No devices available"
- Change OS version filter (try Android 10+ instead of 12+)
- Check device availability (green dot)
- Try different device models

### "Upload failed"
- Check APK size (max 4GB)
- Verify APK is signed
- Try re-building APK

### "Tests timeout"
- Reduce test duration
- Check if app has infinite loading states
- Review video to see where it got stuck

---

## 📞 Support Resources

- **AWS Device Farm Docs:** https://docs.aws.amazon.com/devicefarm/
- **AWS Support:** https://console.aws.amazon.com/support/home
- **Community:** https://repost.aws/tags/TA4 qa_w8FuQ0ax9gDB_YWPhA/aws-device-farm
- **Pricing:** https://aws.amazon.com/device-farm/pricing/

---

## 🎯 Next Steps After Screenshots

1. Upload screenshots to Google Play Console
2. Add feature graphic (1024×500px)
3. Write app description
4. Set content rating
5. Submit for review

---

**Ready to start? Go to:** https://console.aws.amazon.com/devicefarm/
