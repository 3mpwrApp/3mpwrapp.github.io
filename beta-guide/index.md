---
layout: default
title: 3mpwr App - Beta Testers Guide & Feedback Program
permalink: /beta-guide/
description: Complete beta testing guide for 3mpwr App. Learn what to test, how to report bugs, and join the testing program for a privacy-first accessibility tool.
version: 1.1 (Core Docs Sync - February 2026)
lastUpdated: 2026-02-24
---

{%- include status-banner.html -%}

# 3mpwr App – Closed Beta Tester Guide

Welcome to the 3mpwr App Beta Testing Program! This guide shows you how to join the beta, test the app using Expo Go (free), and share your valuable feedback.

**What's New Reference:** [Documentation Sync Complete → Core user docs (English)](/whats-new/2026-02-24-documentation-sync-en-fr-legal/#core-user-docs-en)

> 📱 **New to Beta Testing?** No worries! This guide is designed for testers of all experience levels. If you can use a smartphone, you can beta test!

> 🎉 **February 24, 2026 Sync:** This beta guide is now aligned with the app-side user documentation baseline (user guide, FAQ, features, legal/policy pages, and What’s New sources).

> 📖 **Resources for Testers:**  
> [User Guide](/user-guide/) - Step-by-step tutorials for all features  
> [Features List](/features/) - Browse all features with descriptions  
> 📺 [Getting Started Video](https://www.youtube.com/watch?v=4i6xPpik_6M) - Install, permissions & privacy explained  
> 📺 [YouTube Channel](https://www.youtube.com/@3mpwrApp) - Subscribe for tutorials and updates

---

## 📧 How to Join Beta Testing

### Phase 1: Closed Beta (Current)

**Status:** Invitations being sent to selected testers

**To join:**
1. **Wait for your invitation email** from empowrapp08162025@gmail.com
2. Your email will include:
   - Installation instructions specific to your device
   - Beta access link or QR code
   - Beta tester welcome information

**Not invited yet?**
- Phase 1 is limited to 20-50 testers
- **Sign up for Phase 2** (Open Beta): Email empowrapp08162025@gmail.com with subject "Phase 2 Beta Interest"
- Phase 2 will begin approximately 2 weeks after Phase 1 starts

> � **Installation instructions will be provided in your invitation email.** This guide focuses on what to test and how to provide feedback once you have the app installed.

---

---

## ⚠️ Known Limitations in Expo Go

**Push Notifications:**
- **Android**: Remote push notifications not available in Expo Go
- **iOS**: Remote push requires special setup (not available in beta)
- **Workaround**: We'll use in-app notices and local reminders during closed beta
- Full push notifications will be available in production app

**Native Features:**
- Some advanced native modules require custom builds
- We've designed the beta to work within Expo Go's supported APIs
- All core features (Letter Wizard, Evidence Locker, Wellness tools) work perfectly!

**Performance:**
- Expo Go may be slightly slower than production app
- First launch might take 1-2 minutes to cache assets
- This is normal and won't affect production version

---

## 🧪 What to Test

### 🆕 **PRIORITY: February 2026 Personalization** (Test This First!)

**🌟 Personalization System (20 minutes)** → [User Guide: Personalization](/user-guide/#personalization-setup)
- Go to Settings → Profile → Edit Profile
- Select your role (Person with Disability, Supporter, Ally, or Family)
- Choose disability categories (if PWD)
- Select 3-5 wellness tools you want highlighted
- Choose 3-5 advocacy needs
- Click SAVE
- Return to Home screen - verify personalized greeting appears
- Go to Wellness tab - check if your tools appear first with ⭐
- Go to Advocacy tab - verify your needs are shown
- Close app completely, reopen - confirm personalization persists
- **Report:** Does personalization work? Are recommendations helpful?

### **January 2026 PowerTools** (Test These Next)

**🌟 Wellness Hub (15 minutes)** → [User Guide: Wellness Hub](/user-guide/#wellness-hub)
- Go to Wellness tab → Browse 6 categories
- **Mental Health & Crisis** - Try AI Companion, Emotional First Aid, Grief Support
- **Energy & Pain** - Test Energy Coins, [Pacing Partner](/user-guide/#pacing-partner), Pain Forecast
- **Daily Living** - Try Daily Planner, Work-Life Balance
- **Physical Health** - Test [Exercise Hub](/user-guide/#exercise-hub), Symptom Tracker, Meds Tracker
- **Communication & Growth** - Explore DBT Skills, [CBT Tools](/user-guide/#cbt-coach)
- **Specialty** - Try Rehab Games, Ambience Sync
- Check if search finds tools across all categories
- Verify old wellness tool links redirect correctly

**📁 Document Management (10 minutes)** → [User Guide: Document Management](/user-guide/#document-management)
- Go to Resources → Document Manager
- Upload a test PDF or image
- Try categorizing it (medical, legal, evidence)
- Upload a Word doc or spreadsheet
- Test retrieval and organization
- Verify encryption notice appears

**💚 Wellness Check System (10 minutes)** → [User Guide: Wellness Checks](/user-guide/#wellness-checks)
- Go to Settings → Wellness Checks
- Set up an inactivity alert (e.g., 7 days)
- Add a test emergency contact
- Review privacy controls
- Test notification preferences

**⚖️ Legal Action Hub (15 minutes)** → [User Guide: Legal Action Hub](/user-guide/#legal-action-hub)
- Go to Advocacy → Legal Action Hub
- **Accountability Tracker** - Create a test case
- **Legal Coach** - Browse communication scripts
- **Legal Help** - Search for lawyers or legal aid
- **Automation** - Try letter generator
- **Policy Advocacy** - View active campaigns
- Check if old legal screen links redirect correctly

**👥 Support Groups (15 minutes)**
- Go to Community → Support Groups
- Browse available groups (24 total)
- Test filters: Disability Type, Meeting Type, Focus Area, Language
- View a group's details and members
- Try joining a group
- Leave the group to test functionality
- Verify real-time member counts update

**⚙️ Complexity Mode System (10 minutes)**
- Go to Settings → Complexity Mode
- Try switching between Simple Mode (5 features), Standard Mode (20 features), and Power User Mode (150+ features)
- Notice how tabs change based on your mode
- Test "Bad Day Mode" button - should instantly switch to Simple Mode
- Check if SimpleModeWelcome banners appear in tabs
- Verify feature counts match mode selection

**📚 Resources vs Research Split (10 minutes)**
- **Resources Tab** - Should contain ONLY in-app tools:
  - Master Tracker Hub (Beta)
  - Letter Wizard
  - Appeal Command Center (Beta)
  - Evidence Manager
  - NO external links here
- **Research Tab** - Should contain external resources:
  - External Resources card
  - Click it → Should see 96 external links organized by category
  - Test province filter (select your province)
  - Test category filter (Employment, Benefits, Human Rights, etc.)
  - Click a resource → Should open browser with "opens in browser" warning

**🗂️ Master Tracker Hub (15 minutes)**
- Resources → Master Tracker Hub
- Check dashboard with quick stats
- Try quick log buttons for symptoms, meds, appointments
- Test each tab: Symptoms, Medications, Rehab, Appointments, Timeline, Accessibility
- Log sample data in 2-3 trackers
- Check if AI pattern detection works (requires 7+ days of data)
- Test export to PDF/CSV/JSON
- Verify all data saves and reloads correctly

**⚖️ Appeal Command Center (15 minutes)**
- Resources → Appeal Command Center
- Check quick stats card (active appeals, deadlines, evidence count)
- Test deadline warfare section - add a test deadline
- Check color coding: Red (7 days), Orange (30 days), Blue (additional)
- Try denial decoder - paste sample insurance jargon
- Test evidence strength meter - rate your evidence
- Browse appeal prep guide
- Check if tips and privacy notice appear

**📦 Offline Queue (10 minutes - CRITICAL)**
- Evidence Locker → Upload a test file
- Turn on airplane mode (or disable WiFi)
- Try uploading another file
- Should see "offline" status and queued message
- Check pending count badge appears
- Turn WiFi back on
- Verify auto-sync works
- Check if retry button appears for failed uploads
- Test manual retry functionality

**🆘 SOS/Crisis Button (5 minutes)**
- Look for red SOS button (bottom-right on main screens)
- Single tap → Should open crisis menu with:
  - Call 988 option
  - Text Crisis Line
  - Safe Landing Page
  - Emotional First Aid
  - Quick Exit
- Triple tap → Should trigger emergency contact dialog (don't actually send!)
- Check if button is visible on: Home, Resources, Wellness, Advocacy, Community

**💪 Wellness Hubs (20 minutes)**
- **Energy & Mood Hub** (Wellness tab):
  - Dashboard view with stats
  - Track energy, mood, sleep
  - Check if forecasting works (requires data)
  - Test pacing partner integration
  - Try quantum energy mechanics (Power User mode)
  
- **Unified Health Tracker**:
  - Navigate between tabs (Symptoms, Pain, Chronic, Rehab, Pacing)
  - Log sample data in 2+ tabs
  - Check if data persists
  - Test export functionality
  
- **Mental Wellness Toolkit**:
  - Browse CBT Coach, DBT Skills, Grounding Games
  - Try at least one exercise
  - Check if progress saves
  
- **Movement & Rehab Hub**:
  - Browse exercises, micro-movements
  - Check video demonstrations (if available)
  - Test nutrition guides

**🌐 Campaigns & Events (10 minutes)**
- Campaigns tab → Join "Every Canadian Counts" campaign
- Check if signature count updates (460+)
- Events tab → Browse upcoming events
- Look for TBDIWSG information sessions
- Test calendar subscription feature
- Try creating a user campaign
- Check if "Submit to 3mpwr" button appears
- DON'T actually submit (or use test data only)

**👤 Profile Editor (10 minutes)**
- Settings → Profile Editor
- Fill out 5 sections:
  - Disability Types (select multiple)
  - Symptoms to Track
  - Wellness Tools Preferences
  - Advocacy Needs
  - Family Role
- Save profile
- Close app and reopen
- Verify profile data persisted
- Check if tool recommendations change based on profile

---

### Original Priority Features (Still Important!)

**🏠 Core Navigation (5 minutes)**
- Tap through all tabs: Home, Campaigns, Community, Resources, Wellness, Advocacy, Research, Settings, What's New
- Check if everything loads without errors
- Test back button functionality
- Try rotating your device (portrait ↔ landscape)
- Notice how Complexity Mode affects visible features

**✍️ Letter Wizard (10 minutes)**
- Go to Resources → Letter Wizard
- Pick any template (e.g., "Accommodation Request")
- Fill in your information
- Save as draft
- Edit the draft
- Export or share the letter
- Check formatting looks professional

**📁 Evidence Locker (10 minutes)**
- Go to Advocacy → Evidence Locker
- Upload a test file (screenshot, photo, or PDF)
- View the uploaded file
- Add notes or tags
- Try uploading multiple files
- Delete a test file
- Check storage indicator

**💪 Wellness Tools (15 minutes)**
- **Mood Tracker**: Log your current mood, add notes, view history
- **Sleep Tracker**: Log last night's sleep, see patterns
- **Energy Coins**: Track today's energy level, visualize data
- **Reflections**: Complete a guided reflection
- Check if all data saves when you close and reopen app

**👥 Community (10 minutes)**
- Browse available channels
- Read posts and comments
- Join "Beta Testers Chat"
- Post a friendly test message
- Check if posts load quickly
- Try searching for a topic

**📢 Campaigns (5 minutes)**
- Browse active campaigns
- Join one campaign
- Complete a campaign action
- Track your progress
- Check if updates appear

**⚙️ Settings & Accessibility (15 minutes)**
- Change language (English, French, Spanish)
- Enable dark mode / high contrast mode
- Increase text size
- Enable screen reader (VoiceOver/TalkBack)
- Test if all buttons are announced correctly
- Enable "Step-by-Step Mode" (cognitive accessibility)
- Try dyslexia-friendly fonts

**🌐 Offline Mode (5 minutes)**
- Turn on airplane mode
- Check if app shows "offline" banner
- Try browsing previously loaded content
- Turn WiFi back on
- Check if app syncs data

---

## 💬 How to Report Feedback

### What We Want to Hear

**✅ Positive Feedback:**
- What do you love?
- Which features are most helpful?
- Any "wow" moments?

**🤔 Constructive Feedback:**
- What's confusing?
- What's frustrating or slow?
- What would you improve?

**🐛 Bugs:**
- What were you doing when it crashed?
- What error messages appeared?
- Can you reproduce the problem?

**💡 Feature Requests:**
- What's missing that you need?
- What would save you time?
- What would make the app more accessible?

---

### Where to Send Feedback

**Method 1: In-App Feedback** (Easiest! ⭐)
1. Open app
2. Go to Settings → About & Feedback
3. Tap "Send Feedback"
4. Type your feedback
5. App automatically includes device info and version

**Method 2: Beta Testers Chat**
- Community → Beta Testers Chat
- Quick questions and discussions
- Other testers can help too!
- Team monitors regularly

**Method 3: Email**
- **To:** empowrapp08162025@gmail.com
- **Subject:** "Beta Feedback: [topic]"
- **Include:**
  - What you were testing
  - What happened
  - Screenshots (if helpful)
  - Device info: Settings → About

**Method 4: GitHub Issues** (If invited)
- For technical users
- Include steps to reproduce
- Mention phone model and OS version

---

### Bug Report Template

Copy this template for detailed bug reports:

```
🐛 BUG REPORT

Device: [e.g., iPhone 14 Pro, Samsung Galaxy S24]
OS: [e.g., iOS 17.5, Android 14]
App Version: [Settings → About → Version]

What I was doing:
1. Opened Evidence Locker
2. Tapped "+ Upload"
3. Selected a photo
4. [etc.]

What went wrong:
[e.g., App froze and crashed]

What should have happened:
[e.g., Photo should upload to my locker]

Happens: [Every time / Sometimes / Just once]

Screenshot: [Attached / No screenshot]
```

---

## 🔐 Privacy & Safety

**Protect Your Personal Data:**
- ❌ Don't share real personal documents in screenshots
- ❌ Don't include confidential data in bug reports
- ❌ Don't post sensitive information in Beta Chat
- ✅ Use dummy/test data when testing upload features
- ✅ Redact (black out) personal info before screenshotting

**AI & Legal Disclaimers:**
- All AI outputs are educational only, not legal advice
- App provides information, not professional legal counsel
- Always consult with qualified professionals for legal matters
- AI may make mistakes - verify important information

**Your Data Control:**
- Clear local data anytime: Settings → Privacy → Clear Data
- Delete account: Settings → Account → Delete Account
- Export your data: Settings → Privacy → Export Data
- Manage permissions: Device Settings → 3mpwr App

**Beta Testing Confidentiality:**
- Don't share beta builds publicly or on social media
- Don't post beta screenshots to public forums (Beta Chat is OK!)
- Don't distribute your Expo Go link to non-testers
- You can talk about the app, just don't share install links

---

## 🙋 Frequently Asked Questions

**Q: How long will beta testing last?**
A: Approximately 2-4 weeks. We'll announce when moving to production.

**Q: Will my data transfer to the production app?**
A: Yes, if you have an account. Guest mode data may not transfer.

**Q: Can I use the beta as my daily app?**
A: Yes, but back up important documents externally (beta may have bugs).

**Q: I'm not technical. Can I still help?**
A: Absolutely! We need testers of all skill levels. Your perspective is valuable!

**Q: What if I find a security issue?**
A: Email empowrapp08162025@gmail.com immediately with subject "SECURITY ISSUE". Don't post publicly.

**Q: Can I test on multiple devices?**
A: Yes! Testing on phone + tablet is super helpful.

**Q: The app crashed. What do I do?**
A: Restart the app and report the bug. Include what you were doing when it crashed.

**Q: Is the app safe to use?**
A: Yes. We use encryption and follow security best practices. However, always back up critical documents.

---

## 📞 Need Help?

**In-App Support:**
- Settings → About & Feedback → "Help & Support"
- Searchable FAQ built-in

**Beta Testers Chat:**
- Community → Beta Testers Chat
- Ask questions, share tips, help others
- Team members monitor daily

**Email Support:**
- empowrapp08162025@gmail.com
- Include "BETA" in subject line
- We respond within 24-48 hours

**Emergency Contact** (Critical bugs only):
- empowrapp08162025@gmail.com
- Subject: "**URGENT:**"
- For crashes, data loss, security issues

---

## 🎯 Quick Testing Checklist

Use this for a fast 20-minute test of December 2025 features:

### Critical December Features (Priority)
- [ ] Test Complexity Mode switching (Simple/Standard/Power)
- [ ] Verify Resources vs Research split (in-app vs external)
- [ ] Try Master Tracker Hub (log sample data)
- [ ] Test Appeal Command Center (add test deadline)
- [ ] Verify offline queue (airplane mode upload)
- [ ] Find and test SOS button (single tap only!)
- [ ] Browse at least 2 of 4 Wellness Hubs
- [ ] Test province filter in Research → External Resources
- [ ] Try Bad Day Mode emergency simplification
- [ ] Check profile editor saves correctly

### Original Features (Secondary)
- [ ] Launch app successfully
- [ ] Navigate to all tabs
- [ ] Create a test letter
- [ ] Log your mood
- [ ] Join Beta Testers Chat
- [ ] Test dark mode / high contrast
- [ ] Report at least 1 piece of feedback (bug or praise!)

---

## 🙏 Thank You!

Your participation helps us create an app that truly empowers Canadians living with disabilities. Every bug you find, every piece of feedback you share - it all matters!

**Special Focus for December 2025 Beta:**
- How well does Complexity Mode work? Does it reduce overwhelm?
- Is the Resources vs Research split clear? Any confusion?
- Does offline queue work reliably? Does auto-sync work?
- Are the hubs (Master Tracker, Appeal Command Center, Wellness) organized intuitively?
- Is the SOS button discoverable and helpful?
- Does Bad Day Mode simplification help during tough moments?

**Questions? Feedback? Found a bug?**
- 📧 empowrapp08162025@gmail.com
- 💬 Beta Testers Chat (in app)
- 🌐 [Sign up for website beta](https://3mpwrapp.pages.dev/beta-guide)

**Happy Testing! 🎉**

— The 3mpwr Team

---

*Last Updated: **December 14, 2025***  
*Guide Version: **4.1** (December 2025 Production Ready + USA Lite)*  
*For questions about this guide: empowrapp08162025@gmail.com*
