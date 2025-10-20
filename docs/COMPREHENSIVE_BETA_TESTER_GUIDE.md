# 3mpwr Beta Tester Guide
**Welcome to the 3mpwr App Beta Testing Program!**

Thank you for helping us build the best advocacy and wellness app for Canadians living with disabilities. Your feedback is invaluable and will directly shape our launch.

> 📱 **New to Beta Testing?** Don't worry! This guide explains everything step-by-step. Start with [Quick Start](#-quick-start-5-minute-test) below if you're short on time.

---

## 📋 Table of Contents

1. [Quick Start (5-Minute Test)](#-quick-start-5-minute-test)
2. [Getting Started](#-getting-started)
3. [What to Test](#-what-to-test)
4. [How to Give Feedback](#-how-to-give-feedback)
5. [Bug Reporting Guide](#-bug-reporting-guide)
6. [Testing Checklist](#-testing-checklist)
7. [FAQ](#-frequently-asked-questions)
8. [Support](#-need-help)

---

## ⚡ Quick Start (5-Minute Test)

**Short on time? Complete this quick test to help us catch the most common issues.**

### Step 1: Install & Launch (1 minute)
1. **Install the app**:
   - **iOS**: Use TestFlight (see [iOS Setup](#ios-testflight) for details)
   - **Android**: Use Play Beta (see [Android Setup](#android-google-play-beta) for details)
   
2. **Open the app** and wait ~1 minute for caches to load
3. **Accept Terms & Conditions** when prompted

### Step 2: Navigate & Explore (2 minutes)
1. **Tap every tab** at the bottom:
   - 🏠 Home → 📢 Campaigns → 👥 Community → 📚 Resources
   - 💪 Wellness → ⚖️ Advocacy → ⚙️ Settings → 🎉 What's New

2. **Look for problems**:
   - ❌ Dead links or crashes
   - ❌ Error messages that don't make sense
   - ✅ Loading spinners appear when data loads
   - ✅ Back button works correctly

3. **Test offline mode**:
   - Turn ON airplane mode
   - Check if app shows "offline" banner
   - Try browsing - cached content should still work

### Step 3: Try One Feature (2 minutes)
Pick ONE feature to test thoroughly:

**Option A: Letter Wizard**
- Go to Resources → Letter Wizard
- Start creating a letter
- Fill in a few fields and save

**Option B: Evidence Locker**
- Go to Advocacy → Evidence Locker
- Upload a test file (screenshot or photo)
- Check if it appears in your locker

**Option C: Mood Tracker**
- Go to Wellness → Mood Tracker
- Log how you're feeling today
- See if it saves correctly

**Option D: Community**
- Go to Community → Browse channels
- Read a few posts
- Check if everything loads

### Step 4: Report What You Found
**Found a problem?** Report it right away:
- **In-App**: Settings → About & Feedback → "Send Feedback"
- **Email**: empowrapp08162025@gmail.com
- **Subject**: "Beta: [what you were testing]"
- **Include**: What you tapped, what happened, what you expected

**Everything worked?** Great! Tell us what you liked:
- Same methods as above
- Let us know what felt easy or helpful

---

## 📱 Getting Started

### iOS (TestFlight)

#### First-Time Setup

1. **Install TestFlight**:
   - Open the App Store on your iPhone or iPad
   - Search for "TestFlight" (by Apple)
   - Download and install it (it's free)

2. **Accept Your Beta Invitation**:
   - Check your email for the TestFlight invitation from 3mpwr
   - Tap the **"View in TestFlight"** button in the email
   - Or manually open TestFlight and enter your invitation code

3. **Install 3mpwr Beta**:
   - In TestFlight, find "3mpwr" in your apps list
   - Tap **"Accept"** then **"Install"**
   - Wait for the download to complete
   - Tap **"Open"** to launch the app

4. **Enable Auto-Updates** (Recommended):
   - Open TestFlight
   - Tap on the 3mpwr app
   - Turn ON **"Automatic Updates"**
   - You'll get new beta versions automatically

#### Getting Updates
- New beta builds are usually released 1-2 times per week
- You'll get a notification when an update is available
- Or open TestFlight to manually check for updates

#### Troubleshooting
- **Invitation expired?** Email us for a new code
- **App won't install?** Make sure you have at least 500MB free space
- **Stuck loading?** Delete and reinstall from TestFlight

---

### Android (Google Play Beta)

#### First-Time Setup

1. **Join the Beta Program**:
   - Open the beta invitation link sent to your email
   - Sign in with your Google Account
   - Tap **"Become a tester"**
   - Wait 5-10 minutes for access to be granted

2. **Install 3mpwr Beta**:
   - Open the Google Play Store
   - Search for "3mpwr" or tap the link in your invitation
   - You'll see **"You're a beta tester"** banner at the top
   - Tap **"Install"** or **"Update"** if you have an older version

3. **Enable Auto-Updates** (Recommended):
   - In Play Store, go to the 3mpwr app page
   - Tap the ⋮ (three dots) menu in the top right
   - Select **"Enable auto-update"**

4. **Permissions**:
   - When first opening the app, you may be asked for permissions:
     - **Storage**: For Evidence Locker (uploading documents)
     - **Notifications**: For reminders and alerts
     - **Camera** (optional): For quick photo uploads
   - You can change these later in Android Settings

#### Getting Updates
- New beta builds are usually released 1-2 times per week
- Play Store will notify you when updates are available
- Or check manually: Play Store → My Apps → Updates

#### Leaving Beta (if needed)
- Return to your beta invitation link
- Tap **"Leave the program"**
- Uninstall the app and reinstall from Play Store for the public version

#### Troubleshooting
- **Can't see beta option?** Wait 10-15 minutes after joining, then restart Play Store
- **Update won't install?** Clear Play Store cache (Settings → Apps → Play Store → Clear Cache)
- **Permission issues?** Go to Android Settings → Apps → 3mpwr → Permissions

---

### Using Expo Go (Alternative Method)

If you're testing via Expo Go instead of TestFlight/Play Beta:

1. **Install Expo Go**:
   - iOS: App Store → Search "Expo Go"
   - Android: Play Store → Search "Expo Go"

2. **Open Beta Project**:
   - We'll send you a QR code or project link
   - Open it in Expo Go
   - Create a free Expo account if prompted

3. **Limitations**:
   - ⚠️ Push notifications won't work in Expo Go
   - ⚠️ Some features may behave differently
   - ✅ Great for testing core functionality

---

## 🧪 What to Test

### Week 1: Basics & Core Features

#### Priority 1: Essential Functionality
These are the most important things to test first:

- [ ] **Account Setup**:
  - Create an account OR use as guest
  - If creating account: email verification works
  - Sign out and sign back in
  - Password reset works (if applicable)

- [ ] **Onboarding**:
  - Complete the 7-day onboarding journey
  - Each day's content loads correctly
  - Can skip days if needed
  - Progress saves between sessions

- [ ] **Profile & Settings**:
  - Set up your disability profile
  - Configure energy levels and preferences
  - Change language (English, French, Spanish)
  - Adjust accessibility settings
  - Check that settings save when you close the app

- [ ] **Navigation**:
  - Tap all 8 main tabs
  - Each tab loads without errors
  - Back button always works
  - No dead ends or broken links
  - Bottom navigation is always visible

### Week 2: Key Features

#### Priority 2: Core Tools

- [ ] **Letter Wizard** (Resources Tab):
  - Go to Resources → Letter Wizard
  - Choose a template
  - Fill in your information
  - Save as draft
  - Edit the draft
  - "Export" or share the letter
  - Check if formatting looks correct

- [ ] **Evidence Locker** (Advocacy Tab):
  - Go to Advocacy → Evidence Locker
  - Upload a test document (PDF, image, etc.)
  - View the uploaded file
  - Add notes or tags
  - Delete a file
  - Check storage space indicator
  - Try uploading multiple files

- [ ] **Wellness Tools** (Wellness Tab):
  - **Mood Tracker**: Log your mood, add notes, view history
  - **Sleep Tracker**: Log sleep data, see patterns
  - **Energy Coins**: Track daily energy, see visualizations
  - Check if data persists after closing app

- [ ] **Community** (Community Tab - Beta):
  - Browse available channels
  - Read posts and comments
  - Join the "Beta Testers Chat"
  - Post a test message (be respectful!)
  - Check if posts load quickly

- [ ] **Campaigns** (Campaigns Tab):
  - Browse active campaigns
  - Join at least one campaign
  - Track your progress
  - Complete a campaign action
  - See progress updates

- [ ] **Resources** (Resources Tab):
  - Browse guides and resources
  - Search for a specific topic
  - Bookmark a resource
  - View jurisdiction-specific info (select your province)

- [ ] **Deadlines** (Advocacy Tab):
  - Add a new deadline
  - Set a reminder notification
  - Edit the deadline
  - Mark it as complete
  - Delete a deadline

- [ ] **Notifications**:
  - Enable notifications in Settings
  - Set a test reminder (e.g., 2 minutes from now)
  - Check if notification appears on time
  - Tap notification to open the app
  - Disable notifications and verify they stop

- [ ] **Bookmarks**:
  - Bookmark items from different tabs
  - View all bookmarks in one place
  - Remove bookmarks
  - Check if bookmarks persist

### Week 3: Accessibility Features

#### Priority 3: Accessibility Testing

- [ ] **Screen Reader** (VoiceOver/TalkBack):
  - Enable your device's screen reader
  - Navigate through the app using gestures
  - Check if all buttons/links are announced
  - Verify headings are in logical order
  - Test form inputs (can you fill them out?)
  - Listen for any confusing or missing labels

- [ ] **Visual Accessibility**:
  - Go to Settings → Accessibility
  - Enable **High Contrast Mode**
  - Check if text is readable
  - Try **Large Text** (increase to maximum)
  - Verify layout doesn't break
  - Test different color themes (light/dark mode)

- [ ] **Cognitive Accessibility**:
  - Enable **Step-by-Step Mode** (Settings → Cognitive)
  - Check if instructions are clearer
  - Try **Breadcrumbs** (shows where you are)
  - Enable **Navigation Memory** (returns you to where you were)
  - Test **Complexity Indicators** (shows difficulty level)

- [ ] **Dyslexia Support**:
  - Go to Settings → Dyslexia
  - Try **OpenDyslexic font**
  - Adjust line spacing and letter spacing
  - Enable **Reading Ruler**
  - Try **Syllable Breaks** and **Word Highlighting**
  - Check if text is easier to read

- [ ] **Motor Accessibility**:
  - Go to Settings → Motor Accessibility
  - Enable **Larger Touch Targets**
  - Try **Dwell Click** (tap by hovering)
  - Enable **Tremor Support** (reduces accidental taps)
  - Test **One-Handed Mode**
  - Check if buttons are easier to press

### Week 4: Edge Cases & Advanced Testing

#### Priority 4: Stress Testing

- [ ] **Network Conditions**:
  - **Offline Mode**: Turn off WiFi and cellular
    - App shows offline banner
    - Cached content still works
    - Can still browse previously loaded data
    - Sync works when back online
  - **Slow Network**: Use on 3G or slow WiFi
    - Loading indicators appear
    - App doesn't crash
    - Content eventually loads

- [ ] **Device Conditions**:
  - **Low Battery**: Use app when battery < 20%
    - Check if performance degrades
    - Look for battery drain issues
  - **Low Memory**: Open many apps in background
    - App doesn't crash
    - Returns to correct screen when reopened
  - **Storage Full**: Fill device storage to near-capacity
    - App warns about low storage
    - Can still use core features

- [ ] **Device Rotation**:
  - Rotate device from portrait to landscape
  - Check all main screens
  - Verify layout adjusts correctly
  - No text cut off or buttons hidden

- [ ] **App Lifecycle**:
  - **Backgrounding**: Switch to another app, return to 3mpwr
    - Returns to same screen
    - Data is still there
    - No logout or reset
  - **Interruptions**: Receive a phone call while using app
    - App pauses gracefully
    - Resumes correctly after call

- [ ] **Multi-Device Testing** (if possible):
  - Test on different phone models
  - Test on tablet (if available)
  - Compare performance across devices

---

## 💬 How to Give Feedback

### What We Want to Hear

#### ✅ Positive Feedback
- What do you love about the app?
- Which features are most helpful for you?
- What makes you feel empowered or supported?
- Any "wow" moments or pleasant surprises?

#### 🤔 Constructive Feedback
- What's confusing or hard to understand?
- What's frustrating or annoying to use?
- What feels slow or clunky?
- What would you change or improve?

#### 💡 Feature Requests
- What's missing that you really need?
- What features do other apps have that we should add?
- What would save you time or energy?
- What would make the app more accessible for you?

### Where to Send Feedback

Choose the method that works best for you:

#### 1. In-App Feedback (Easiest)
- Open the app
- Go to **Settings** → **About & Feedback**
- Tap **"Send Feedback"**
- Type your feedback
- The app automatically includes your device info and app version

#### 2. Beta Testers Chat (Great for Quick Questions)
- Open the app
- Go to **Community** → **Beta Testers Chat**
- Post your feedback as a message
- Other testers and the team can respond
- Good for: quick questions, sharing tips, discussing issues

#### 3. Email (For Detailed Reports)
- Email: **empowrapp08162025@gmail.com**
- Subject: "Beta Feedback: [topic]"
- Include:
  - What you were doing
  - What happened
  - Screenshots (if helpful)
  - Your device info (found in Settings → About)

### Tips for Great Feedback

- **Be Specific**: Instead of "the app is slow," say "the Mood Tracker takes 10+ seconds to load"
- **Include Steps**: Help us reproduce the issue by listing what you tapped
- **Add Screenshots**: A picture is worth a thousand words
- **Note Your Setup**: Mention if you have accessibility settings enabled
- **Be Honest**: We want to know what's not working - that's why we're in beta!
- **Be Kind**: Remember, real people are reading your feedback 😊

---

## 🐛 Bug Reporting Guide

### How to Report a Bug

#### Step 1: Check if It's a Known Issue

Before reporting, check:
- [Known Issues](#known-issues) section below
- Recent posts in Beta Testers Chat
- Your email for beta update announcements

#### Step 2: Gather Information

**Required Info:**
- [ ] **Device**: iPhone 14 Pro, Samsung Galaxy S24, etc.
- [ ] **OS Version**: iOS 17.5, Android 14, etc.
- [ ] **App Version**: (Settings → About & Feedback → Version)
- [ ] **What You Were Doing**: Step-by-step
- [ ] **What Went Wrong**: Be specific
- [ ] **Expected vs. Actual**: What should have happened vs. what did happen

**Super Helpful (but optional):**
- [ ] **Screenshot or Screen Recording**: Show the problem
- [ ] **Frequency**: Does it always happen, sometimes, or just once?
- [ ] **Workaround**: Did you find a way to avoid it?
- [ ] **Network Status**: WiFi, Cellular, or Offline?
- [ ] **Accessibility Settings**: Which ones are enabled?

#### Step 3: Determine Severity

**🔴 CRITICAL (Report Immediately)**
- App crashes on launch every time
- Cannot sign in or create account
- Evidence or letters disappearing
- Security or privacy issues
- Personal data exposed

→ **Action**: Email empowrapp08162025@gmail.com with subject "**URGENT:**"

**🟠 HIGH (Report Within 24 Hours)**
- Feature completely doesn't work
- Can't complete onboarding
- Evidence Locker won't upload
- Notifications not sending
- Text completely unreadable
- App crashes frequently

→ **Action**: Use in-app feedback or email ASAP

**🟡 MEDIUM (Report Within 3 Days)**
- Feature works but behaves oddly
- UI elements misaligned
- Translation errors (wrong language)
- App sometimes slow
- Minor accessibility issues

→ **Action**: Use in-app feedback when convenient

**🟢 LOW (Report Anytime)**
- Typos in text
- Cosmetic/visual issues
- Minor layout quirks
- Feature suggestions
- "Nice to have" improvements

→ **Action**: Beta Testers Chat or email when you have time

#### Step 4: Submit the Report

Use **one** of these methods:

**Method A: In-App (Best)**
1. Settings → About & Feedback → "Send Feedback"
2. Write a clear title: "Bug: [short description]"
3. In the message, include all the info from Step 2
4. Attach screenshot if possible
5. Tap Send

**Method B: Email**
1. To: empowrapp08162025@gmail.com
2. Subject: "[BETA] Bug: [short description]"
3. Body: Include all info from Step 2
4. Attach screenshots
5. Send

**Method C: Beta Chat (for Quick Issues)**
1. Community → Beta Testers Chat
2. Post: "Bug: [description]"
3. Someone may have a quick solution

### Bug Report Template

Copy and paste this into your feedback:

```
🐛 BUG REPORT

Device: [iPhone 14 Pro]
OS: [iOS 17.5]
App Version: [1.0.0-rc.1, found in Settings]

What I was doing:
1. Opened Evidence Locker
2. Tapped "+ Upload"
3. Selected a photo
4. [etc.]

What went wrong:
[App froze after selecting photo]

What should have happened:
[Photo should upload and appear in my locker]

Frequency:
[Happens every time / sometimes / just once]

Screenshot attached: [Yes/No]
```

### Known Issues

These are problems we're already aware of and working on. You don't need to report these:

- **iOS Push Notifications**: Remote push not working on iOS yet (pending APNs setup)
- **Some "Coming Soon" Features**: Features marked "Coming Soon" aren't built yet
- **First Launch Slowness**: App may feel slow on very first open (caches warming up)
- **Expo Go Limitations**: If testing via Expo Go, some features are limited
- **Translation Gaps**: Some text may appear in English even if you selected French/Spanish

If you experience something else, please report it!

---

## 📝 Testing Checklist

Use this checklist to track your progress. No pressure to complete everything - test what you can!

### Week 1: Getting Started
- [ ] Install app via TestFlight or Play Beta
- [ ] Complete onboarding (all 7 days) OR skip onboarding
- [ ] Create account or continue as guest
- [ ] Set up profile with your info
- [ ] Browse all 8 tabs
- [ ] Enable notifications
- [ ] Test language switching
- [ ] Report at least 1 thing (bug or feedback)

### Week 2: Core Features
- [ ] Create 1 letter with Letter Wizard
- [ ] Upload 1 document to Evidence Locker
- [ ] Try 3+ wellness tools (mood, sleep, energy)
- [ ] Join 1 campaign and complete an action
- [ ] Add 1 deadline with a reminder
- [ ] Bookmark 3+ items across different tabs
- [ ] Test Community → read and post
- [ ] Test offline mode (airplane mode)
- [ ] Report bugs or give feedback

### Week 3: Accessibility
- [ ] Enable screen reader and test navigation
- [ ] Try high contrast mode
- [ ] Increase text size to maximum
- [ ] Enable cognitive accessibility features
- [ ] Try dyslexia-friendly fonts
- [ ] Test motor accessibility features
- [ ] Report accessibility bugs or suggestions

### Week 4: Advanced Testing
- [ ] Test on slow/no network
- [ ] Use app with low battery
- [ ] Rotate device and check layouts
- [ ] Background app and return to it
- [ ] Test with many apps running (low memory)
- [ ] Try all community features
- [ ] Export or share something
- [ ] Final bug sweep and feedback

---

## 🏆 Beta Tester Benefits & Responsibilities

### What You Get

- ✨ **Early Access**: Be the first to try new features
- 🏅 **Beta Tester Badge**: Special badge in your profile (coming soon!)
- 💪 **Real Impact**: Your feedback shapes the app's future
- 🎁 **Rewards Program**: Eligible for future beta tester perks (details TBA)
- 📣 **Recognition**: Optionally featured in app credits
- 🤝 **Community**: Connect with other passionate testers
- 🎓 **Learning**: See how apps are built and improved

### What We Ask From You

- 🧪 **Regular Testing**: Use the app 2-3 times per week
- 🐛 **Prompt Bug Reports**: Report issues as you find them
- 💬 **Honest Feedback**: Tell us what's good and what's not
- 🤐 **Confidentiality**: Don't share beta builds publicly
- 🙏 **Patience**: Beta builds may have bugs and change frequently
- 👥 **Respect**: Be kind to other testers and the team
- 📧 **Communication**: Respond to our questions if we follow up

---

## ❓ Frequently Asked Questions

### General Questions

**Q: How long will beta testing last?**
A: Approximately 2-4 weeks, depending on how quickly we resolve issues. We'll announce the public launch when the app is stable.

**Q: Will my data transfer to the production app?**
A: Yes, if you sign in with an account. Guest data may not transfer. We recommend creating an account if you plan to use the app long-term.

**Q: Can I use the beta app as my daily app?**
A: Yes, but be aware that bugs may occur and data could be lost. Back up important documents (letters, evidence) externally just in case.

**Q: How often will you release updates?**
A: We aim for 1-2 updates per week during active beta. You'll get a notification when updates are available.

**Q: What happens after beta ends?**
A: Your TestFlight/Play Beta app will automatically update to the production version. You won't need to reinstall.

**Q: Can I test on multiple devices?**
A: Yes! In fact, testing on different devices (phone, tablet, old phone, etc.) helps us a lot.

**Q: I'm not very technical. Can I still be a beta tester?**
A: Absolutely! We need testers of all skill levels. If you can use a smartphone, you can beta test.

### Technical Questions

**Q: The app crashed. What do I do?**
A: Restart the app and report the bug. Include what you were doing when it crashed and your device info.

**Q: The app is slow. Is that normal?**
A: Some slowness is expected in beta, especially on first launch. If it's consistently slow or unusable, please report it.

**Q: I found a security or privacy issue. Who do I tell?**
A: Email empowrapp08162025@gmail.com immediately with subject "SECURITY ISSUE". Do NOT post publicly.

**Q: Can I test using an emulator or simulator?**
A: We prefer testing on real devices, but emulator testing is better than nothing!

**Q: What if I want to leave the beta?**
A: **iOS**: Delete the app from TestFlight. **Android**: Leave the beta program in Play Store settings.

**Q: The app is asking for permissions. Are they safe to grant?**
A: Yes. We only request necessary permissions:
- **Storage**: For Evidence Locker uploads
- **Notifications**: For reminders
- **Camera** (optional): For quick photo uploads
You can revoke these anytime in device settings.

### Privacy & Safety Questions

**Q: Is my data safe during beta?**
A: Yes. We use the same encryption and security measures as the production app. However, always back up critical documents externally.

**Q: Can other beta testers see my data?**
A: No. Your profile, evidence, letters, and wellness data are completely private unless you explicitly share them.

**Q: What data do you collect for testing?**
A: We collect minimal data: crash logs (anonymous), app usage patterns (anonymous), and your explicit feedback. See Settings → Privacy for full details.

**Q: Can I opt out of analytics?**
A: Yes! Go to Settings → Privacy and disable:
- "Anonymous Usage Data"
- "Crash Reporting"
Your feedback is still valuable even with analytics off.

**Q: What if I accidentally share personal info in a bug report?**
A: Email us immediately at empowrapp08162025@gmail.com and we'll delete it from our systems.

---

## 🚀 Beta Timeline & Roadmap

### Beta Phases

**Phase 1: Closed Beta** (Current - You are here!)
- **Testers**: 20-50 invited testers
- **Duration**: 2 weeks
- **Focus**: Core functionality, critical bugs, usability
- **Updates**: Weekly (1-2 per week)
- **Feedback**: High priority, quick response

**Phase 2: Open Beta** (Coming Soon)
- **Testers**: 100-500 public testers
- **Duration**: 1-2 weeks
- **Focus**: Performance, edge cases, polish
- **Updates**: Bi-weekly
- **Feedback**: Prioritized by severity

**Phase 3: Release Candidate** (Pre-Launch)
- **Testers**: 500+ testers
- **Duration**: 1 week
- **Focus**: Final validation, translations, accessibility
- **Updates**: As needed (hot fixes only)
- **Feedback**: Critical bugs only

**Production Launch**: TBD (when quality targets met)

### What's Coming in Each Version

**v1.0.0 - Launch Version** (Current Beta)
- ✅ Core advocacy tools (Letter Wizard, Evidence Locker, Deadlines)
- ✅ Wellness suite (Mood, Sleep, Energy, Reflections)
- ✅ Community forums (Province & topic channels)
- ✅ Resources (Guides, forms, jurisdiction info)
- ✅ Full accessibility support (screen readers, cognitive, dyslexia, motor)
- ✅ 3 languages (English, French, Spanish)
- ✅ Offline support
- ✅ Guest mode

**v1.1.0 - Post-Launch Update** (1-2 months after launch)
- 💬 Direct messaging between users
- 🤝 Mutual aid platform (request/offer help)
- 🎨 Media Studio (create memes, posters, graphics)
- 🎤 Voice navigation and commands
- 🤖 Advanced AI features (coaching, accountability)

**v1.2.0 - Major Update** (3-4 months after launch)
- ⚖️ Legal workflow automation
- 👥 Peer support matching
- 📢 Campaign coordinator tools
- 🔧 Admin dashboard for community managers
- 🌍 Additional languages (Indigenous languages, etc.)
- 🔔 Advanced notification customization

---

## 📞 Need Help?

### Support Channels

**In-App Support** (Fastest)
- Open app → Settings → About & Feedback → "Help & Support"
- Includes searchable FAQ

**Beta Testers Chat** (Community Support)
- Community → Beta Testers Chat
- Ask questions, share tips, help other testers
- Team members monitor and respond

**Email Support**
- empowrapp08162025@gmail.com
- For detailed questions or private issues
- Include "BETA" in subject line

**Emergency Contact** (Critical Issues Only)
- For urgent security/privacy issues ONLY
- empowrapp08162025@gmail.com
- Subject: "**URGENT SECURITY:**"

### Expected Response Times

- **🔴 Critical bugs**: Within 4 hours (during business hours)
- **🟠 High priority**: Within 24 hours
- **🟡 Medium priority**: Within 3 days
- **🟢 Low priority**: Within 1 week
- **💡 Feature requests**: Acknowledged within 1 week

### Before Contacting Support

1. Check this guide for answers
2. Search Beta Testers Chat for similar issues
3. Restart the app and try again
4. Check if an update is available
5. If still stuck, reach out!

---

## 🙏 Thank You!

Your participation means the world to us. Every bug you find, every piece of feedback you share, every suggestion you make - it all helps us create an app that truly empowers Canadians living with disabilities.

You're not just testing an app. You're helping build a movement. 💪

**Questions? Ideas? Issues?**
- 📧 empowrapp08162025@gmail.com
- 💬 Community → Beta Testers Chat
- 🐦 @3mpwr on social media

**Happy Testing!**
— The 3mpwr Team

---

## 📖 Quick Reference

### Important Links
- **TestFlight (iOS)**: Check your email for invitation
- **Play Beta (Android)**: Check your email for invitation
- **Support Email**: empowrapp08162025@gmail.com
- **In-App Feedback**: Settings → About & Feedback
- **Beta Chat**: Community → Beta Testers Chat

### Key Settings Locations
- **Language**: Settings → Language
- **Accessibility**: Settings → Accessibility
- **Notifications**: Settings → Notifications
- **Privacy**: Settings → Privacy
- **About/Version**: Settings → About & Feedback

### Keyboard Shortcuts (if applicable)
- **Refresh**: Pull down on most lists
- **Search**: Available in Resources, Community
- **Back**: Top-left arrow or device back button

---

*Last Updated: October 20, 2025*  
*Guide Version: 2.0 (Consolidated)*  
*App Version: 1.0.0-rc.1*  
*For questions about this guide: empowrapp08162025@gmail.com*
