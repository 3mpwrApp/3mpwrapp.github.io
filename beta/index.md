---
layout: default
title: Beta Testers Guide
description: Comprehensive guide for 3mpwr App beta testers with step-by-step testing instructions, templates, and support information.
version: 1.0.0
lastUpdated: 2025-11-05
audience: Beta Testers
---

# 3mpwr App Beta Testers Guide

Welcome to the 3mpwr App Beta Testing Program! Thank you for joining us to help build a better app for injured workers and persons with disabilities.

This guide explains everything you need to know to be an effective beta tester. We use plain language and provide step-by-step instructions.

---

## Table of Contents

1. [Program Overview](#program-overview)
2. [Roles & Responsibilities](#roles--responsibilities)
3. [Access & Environments](#access--environments)
4. [Test Scope & Priorities](#test-scope--priorities)
5. [Step-by-Step Testing Instructions](#step-by-step-testing-instructions)
6. [Sample Test Scenarios](#sample-test-scenarios)
7. [Reporting Issues & Triage Process](#reporting-issues--triage-process)
8. [Severity Levels & SLAs](#severity-levels--slas)
9. [Data & Privacy](#data--privacy)
10. [Security & Incident Reporting](#security--incident-reporting)
11. [Communication Channels & Meeting Cadence](#communication-channels--meeting-cadence)
12. [Legal & Confidentiality](#legal--confidentiality)
13. [Templates & Checklists](#templates--checklists)
14. [Contacts](#contacts)
15. [Appendix: Release Versioning & Feature Flags](#appendix-release-versioning--feature-flags)

---

## Program Overview

### What is Beta Testing?

Beta testing means using the app before it launches to the public. You help us find bugs and improve the user experience.

### Why Your Feedback Matters

- You represent our real users
- You help us catch problems early
- Your input shapes the final product
- You make the app better for everyone

### Beta Testing Phases

**Phase 1: Closed Beta (Current)**
- Small group of 20-50 testers
- Focus on core features
- Duration: 4-6 weeks

**Phase 2: Open Beta**
- Larger group of 100-200 testers
- Test all features
- Duration: 2-4 weeks

**Phase 3: Release Candidate**
- Final testing before launch
- Bug fixes only
- Duration: 1-2 weeks

---

## Roles & Responsibilities

### Your Role as a Beta Tester

**What You Do:**
- Test the app 2-3 times per week
- Try all major features
- Report bugs when you find them
- Share honest feedback
- Keep beta information confidential
- Respond to follow-up questions

**What You Don't Do:**
- You are not required to fix bugs
- You don't need technical skills
- You don't need to test every day
- You don't need to write code

### Our Role (3mpwr Team)

**What We Do:**
- Provide clear instructions
- Fix bugs quickly
- Answer your questions
- Keep you updated on progress
- Protect your privacy
- Appreciate your time

**What We Don't Do:**
- We won't share your data
- We won't ignore your feedback
- We won't require unpaid work beyond testing

---

## Access & Environments

### How to Get the App

**iOS Users:**
- You will receive a TestFlight invitation email
- Tap the invitation link
- Install TestFlight from the App Store if needed
- Open TestFlight and install 3mpwr App
- Launch the app

**Android Users:**
- You will receive a Google Play Beta invitation email
- Tap the invitation link
- Accept the beta invitation
- Update or install the app from Google Play
- Launch the app

### System Requirements

**iOS:**
- iOS 13.0 or newer
- iPhone or iPad
- 500 MB free storage
- Internet connection for initial setup

**Android:**
- Android 6.0 or newer
- Phone or tablet
- 500 MB free storage
- Internet connection for initial setup

### Test Environments

**Production-Like Environment:**
- Uses real servers (not test servers)
- Your data is real and will be saved
- App behavior matches what users will see

**Beta Features:**
- Some features may be marked "Beta"
- These are new and may have more bugs
- We especially need feedback on beta features

---

## Test Scope & Priorities

### What to Test (Priority Order)

**Priority 1: Critical Features**
- Account creation and login
- Password reset
- Profile setup
- Main navigation (all tabs work)
- App doesn't crash on launch

**Priority 2: Core Features**
- Letter Wizard (create advocacy letters)
- Evidence Locker (upload and store documents)
- Wellness tools (mood tracker, sleep log)
- Community (read and post messages)
- Campaigns (join and track progress)
- Resources (browse guides and articles)

**Priority 3: Secondary Features**
- Deadlines and reminders
- Bookmarks
- Search functionality
- Settings and preferences
- Notifications
- Language switching

**Priority 4: Accessibility Features**
- Screen reader support (VoiceOver/TalkBack)
- High contrast mode
- Large text support
- Dyslexia-friendly fonts
- Motor accessibility options

### What Not to Test

- Internal admin features
- Payment processing (not implemented yet)
- Features marked "Coming Soon"
- Third-party integrations not yet active

---

## Step-by-Step Testing Instructions

### Basic Testing Approach

Use simple, everyday language to test features. Here's the process:

**Step 1: Pick a Feature**
Choose one feature to test from the priority list above.

**Step 2: Try It**
Use the feature like a regular user would. Don't overthink it.

**Step 3: Watch for Problems**
Look for:
- Things that don't work
- Confusing buttons or text
- Slow loading
- Error messages
- App crashes

**Step 4: Take Notes**
Write down:
- What you did (steps you took)
- What happened
- What you expected to happen

**Step 5: Report**
Use the bug report template (see below) to tell us what you found.

### Testing Each Screen

**For Every Screen You Test:**

1. **Open the screen**
   - Does it load?
   - Does it show the right information?

2. **Try every button**
   - Tap each button once
   - Does it do what you expect?

3. **Fill in forms**
   - Type in text fields
   - Select from dropdowns
   - Toggle switches on and off

4. **Check navigation**
   - Tap the back button
   - Use the tab bar at bottom
   - Does it go where you expect?

5. **Test edge cases**
   - Leave fields empty
   - Enter very long text
   - Try special characters
   - Turn off internet
   - Rotate your device

---

## Sample Test Scenarios

Here are detailed examples showing exactly how to test specific features.

### Sample Scenario 1: Testing File Upload

**Feature:** Evidence Locker file upload

**Steps to Test:**

1. Open the app
2. Tap "Advocacy" tab at bottom
3. Tap "Evidence Locker"
4. Tap the "+ Upload" button
5. Choose "Photo Library"
6. Select a photo
7. Wait for upload to complete
8. Check if photo appears in your locker

**What to Check:**
- Upload progress shows
- Photo appears in locker after upload
- Photo can be opened and viewed
- File size is shown correctly

**Example Bug Report if Upload Fails:**

```
Bug: Photo upload freezes at 50%

Steps to reproduce:
1. Opened app on iPhone 13
2. Went to Advocacy → Evidence Locker
3. Tapped "+ Upload"
4. Selected "Photo Library"
5. Chose a 3MB photo
6. Upload started but froze at 50%
7. Waited 5 minutes, still frozen
8. Had to close and reopen app

Expected: Photo should upload completely
Actual: Upload froze at 50%, never completed

Device: iPhone 13
OS: iOS 17.2
App version: 1.0.0-beta.5
Internet: WiFi, strong signal
```

### Sample Scenario 2: Testing Letter Wizard

**Feature:** Creating an advocacy letter

**Steps to Test:**

1. Open app
2. Tap "Resources" tab
3. Tap "Letter Wizard"
4. Tap "Start New Letter"
5. Select template "Appeal Denial"
6. Fill in your name
7. Fill in recipient name
8. Add one paragraph of text
9. Tap "Save Draft"
10. Go back and check if draft saved

**What to Check:**
- All templates load
- Text fields accept input
- Draft saves without error
- Draft appears in "My Letters"
- Can open saved draft later

**Example Bug Report if Save Fails:**

```
Bug: Letter draft not saving

Steps:
1. Opened Letter Wizard
2. Selected "Appeal Denial" template
3. Filled in name fields
4. Typed 2 paragraphs
5. Tapped "Save Draft"
6. Saw "Saved!" message
7. Went back to home screen
8. Returned to Letter Wizard
9. Draft was NOT in "My Letters" list

Expected: Draft should be saved and visible
Actual: Draft disappeared, not saved

Device: Samsung Galaxy S21
OS: Android 13
App version: 1.0.0-beta.5
```

### Sample Scenario 3: Testing Offline Mode

**Feature:** App works without internet

**Steps to Test:**

1. Open app with internet on
2. Browse a few screens
3. Turn on Airplane Mode
4. Try to navigate to different tabs
5. Try to open saved content
6. Check if error messages appear
7. Turn Airplane Mode off
8. Check if app syncs properly

**What to Check:**
- App shows "Offline" indicator
- Cached content still loads
- Appropriate messages for unavailable features
- No crashes when offline
- Smooth reconnection when back online

**Example Note for Console Log:**

```
Console Log - Offline Mode Testing

Time: 14:30
Action: Enabled Airplane Mode
Result: Banner appeared "You're offline. Some features limited."

Time: 14:31
Action: Tapped Community tab
Result: Showed cached posts, banner said "Showing cached content"

Time: 14:32
Action: Tried to upload photo
Result: Error message "Upload requires internet connection"
         Option to "Save for Later" appeared

Time: 14:35
Action: Disabled Airplane Mode
Result: Banner changed to "Back online. Syncing..."
        Upload started automatically
        
Note: Offline handling works well!
```

---

## Reporting Issues & Triage Process

### How to Report a Bug

**Option 1: In-App Feedback (Easiest)**
1. Open Settings
2. Tap "About & Feedback"
3. Tap "Report a Bug"
4. Fill in the form
5. Submit

**Option 2: Email**
- Send to: empowrapp08162025@gmail.com
- Subject: "Beta Bug: [short description]"
- Use the bug report template below

**Option 3: Beta Testers Chat**
- For quick issues or questions
- Community → Beta Testers Chat
- Post your bug with #bug tag

### Bug Report Template (Copy This!)

```
🐛 BUG REPORT

Title: [One sentence describing the problem]

Device Information:
- Device: [iPhone 13 Pro / Samsung Galaxy S21 / etc.]
- Operating System: [iOS 17.2 / Android 13 / etc.]
- App Version: [Found in Settings → About]
- Network: [WiFi / Cellular / Offline]

Steps to Reproduce:
1. [First thing you did]
2. [Second thing you did]
3. [Third thing you did]
4. [Continue until bug occurred]

What Happened:
[Describe what actually happened]

What Should Happen:
[Describe what you expected to happen]

How Often:
[Every time / Sometimes / Only once]

Screenshots:
[Attached: Yes / No]

Additional Notes:
[Any other relevant information]
```

### Sample Filled Bug Report

```
🐛 BUG REPORT

Title: App crashes when opening Settings on Android

Device Information:
- Device: Google Pixel 6
- Operating System: Android 14
- App Version: 1.0.0-beta.8
- Network: WiFi

Steps to Reproduce:
1. Open 3mpwr App
2. Tap tab bar at bottom
3. Tap "Settings" icon (gear icon)
4. App immediately crashes to home screen

What Happened:
The app crashes instantly when I tap Settings. 
The screen goes black and I'm back at my phone's home screen.

What Should Happen:
Settings screen should open and show options.

How Often:
Every single time. Tested 5 times.

Screenshots:
Attached: No (happens too fast to screenshot)

Additional Notes:
- Other tabs work fine
- Happens right after opening Settings
- Phone has plenty of memory available
- Tried restarting phone, still happens
```

### Triage Process (What Happens Next)

**Step 1: We Receive Your Report**
- You get auto-reply confirming receipt
- Report assigned to team member

**Step 2: Initial Review (Within 24 Hours)**
- Team reviews report
- Assigns severity level
- May ask follow-up questions

**Step 3: Investigation**
- Developers try to reproduce bug
- Analyze logs if available
- Identify root cause

**Step 4: Fix & Test**
- Developers fix the bug
- Internal testing
- Fix included in next beta update

**Step 5: Verification**
- We notify you when fixed
- Ask you to test again
- Confirm bug is resolved

**Step 6: Closure**
- Bug marked as fixed
- Added to release notes
- Your contribution noted (if desired)

---

## Severity Levels & SLAs

### Severity Levels Explained

**🔴 Critical (P1)**
- App won't launch
- Data loss occurs
- Security vulnerability found
- Core feature completely broken

**Response Time:** 4 hours
**Fix Target:** Same day or next beta release

**🟠 High (P2)**
- Major feature doesn't work
- Frequent crashes
- Login problems
- Data not syncing

**Response Time:** 24 hours
**Fix Target:** Within 3 days

**🟡 Medium (P3)**
- Minor feature issues
- UI display problems
- Slow performance
- Confusing error messages

**Response Time:** 3 days
**Fix Target:** Within 1 week

**🟢 Low (P4)**
- Typos
- Cosmetic issues
- Minor layout problems
- Feature requests

**Response Time:** 1 week
**Fix Target:** Future release

### Service Level Agreements (SLAs)

**Response Times:**
- Critical: 4 hours during business hours
- High: 24 hours
- Medium: 3 business days
- Low: 1 week

**Business Hours:**
- Monday-Friday
- 9 AM - 5 PM Eastern Time
- Excluding holidays

**Update Frequency:**
- Beta updates: 1-2 times per week
- Critical hotfixes: As needed
- Release notes: With each update

---

## Data & Privacy

### Your Data is Safe

**What We Collect During Beta:**
- Account information (name, email)
- App usage data (which features you use)
- Crash reports (when app crashes)
- Bug reports (what you tell us)

**What We Don't Collect:**
- Your personal documents (stay on your device)
- Your exact location
- Your contacts
- Anything outside the app

### How We Protect Your Data

- Encryption in transit (HTTPS)
- Encryption at rest (on servers)
- Secure authentication
- Regular security audits
- Limited team access

### Your Rights

**You Can:**
- View your data anytime
- Export your data
- Delete your data
- Opt out of analytics
- Request data removal

**How to Exercise Rights:**
1. Go to Settings → Privacy
2. Choose your preference
3. Or email: empowrapp08162025@gmail.com

### Data Retention

**During Beta:**
- Your account data: Kept for beta duration
- Usage analytics: 90 days
- Crash logs: 30 days
- Bug reports: Until resolved

**After Beta:**
- If you continue: Data transfers to production
- If you quit: Data deleted within 30 days
- You can request immediate deletion anytime

---

## Security & Incident Reporting

### How to Report Security Issues

**⚠️ IMPORTANT: Do NOT post security issues publicly!**

**For Security Issues:**
1. Email: empowrapp08162025@gmail.com
2. Subject: "SECURITY ISSUE - Confidential"
3. Describe the security concern
4. We'll respond within 4 hours

**What is a Security Issue?**
- Someone else can see your data
- You can access someone else's account
- Password stored in plain text
- Sensitive data visible in logs
- App doesn't log you out
- Session doesn't expire

### Example Security Report

```
SECURITY ISSUE - Confidential

Issue: User data visible in device logs

Severity: High

Description:
When I connected my phone to my computer and viewed 
system logs, I could see my password in plain text 
in the app's debug logs.

Steps to Reproduce:
1. Log into app with password
2. Connect device to computer
3. Open device logs/console
4. Search for app name
5. Password visible in authentication logs

Device: iPhone 14
OS: iOS 17.1
App Version: 1.0.0-beta.6

Risk: Anyone with physical access to device could 
read user passwords from system logs.
```

### Security Best Practices

**For Your Protection:**
- Use a strong unique password
- Enable two-factor auth (when available)
- Don't share your login
- Log out on shared devices
- Report suspicious activity
- Keep your device OS updated

**Red Flags to Report:**
- Unexpected password resets
- Unrecognized login locations
- Missing data
- Changed settings you didn't change
- Suspicious emails claiming to be from us

---

## Communication Channels & Meeting Cadence

### How We Stay Connected

**Primary Channels:**

1. **Email Updates**
   - Weekly beta update emails
   - New build notifications
   - Important announcements
   - Direct responses to your reports

2. **In-App Chat**
   - Community → Beta Testers Chat
   - Daily check-ins welcome
   - Quick questions answered here
   - Connect with other testers

3. **Release Notes**
   - Included with each update
   - Lists bug fixes
   - Describes new features
   - Notes what to test

### Meeting Schedule

**Weekly Beta Check-In (Optional)**
- When: Every Friday, 3 PM Eastern
- Where: Video call (link sent via email)
- Duration: 30 minutes
- Topics: Week's progress, Q&A, priorities

**Monthly All-Hands (Optional)**
- When: First Monday of month
- Where: Video call
- Duration: 1 hour
- Topics: Roadmap, major updates, recognition

**You're Not Required to Attend:**
- Meetings are optional
- Recordings shared afterward
- Summary notes emailed

### Response Expectations

**You Can Expect:**
- Email replies within 24-48 hours
- Chat responses within a few hours (business hours)
- Bug status updates weekly
- New builds announced immediately

**We Understand:**
- You have a life outside testing
- You may not respond immediately
- You can take breaks
- No pressure to attend meetings

---

## Legal & Confidentiality

### Non-Disclosure Agreement (NDA)

By participating in beta testing, you agree to:

**Keep Confidential:**
- Beta app features not yet public
- Unreleased designs or content
- Internal discussions and feedback
- Other testers' identities (unless they share publicly)
- Bugs and issues (until fixed in production)

**You Can Share:**
- General positive feedback ("I'm testing an accessibility app!")
- Your participation (if you want)
- Public information from our website
- Features after they're publicly launched

### What "Confidential" Means

**DON'T:**
- Post screenshots of beta app on social media
- Share beta builds with non-testers
- Discuss unannounced features publicly
- Review beta app on app stores
- Write blog posts about unreleased features

**DO:**
- Talk privately with close friends/family
- Discuss in private beta tester chat
- Share feedback directly with our team
- Ask permission if unsure

### Legal Protections

**For You:**
- Participating is voluntary
- No financial commitment required
- Can withdraw anytime
- Your data is protected
- No liability for normal testing

**For Us:**
- Intellectual property protection
- Prevents early competitor knowledge
- Allows safe testing environment
- Protects other testers' privacy

### Consequences of Breach

If you share confidential information:
- Removal from beta program
- Possible legal action (in serious cases)
- Loss of early access privileges

We're reasonable humans! Accidents happen. If you accidentally post something, just let us know immediately.

---

## Templates & Checklists

### Smoke Test Checklist

**Use this for quick testing after each update (10 minutes):**

- [ ] App launches successfully
- [ ] Login works
- [ ] Home screen loads
- [ ] All bottom tabs open
- [ ] Can navigate back from any screen
- [ ] Can open Settings
- [ ] At least one feature works (your choice)
- [ ] App doesn't crash during basic use
- [ ] No obvious visual glitches

**If all items checked:** App passes smoke test ✅

**If any items fail:** Report immediately as High priority 🟠

### Accessibility Test Checklist

**Screen Reader Testing:**
- [ ] Turn on VoiceOver (iOS) or TalkBack (Android)
- [ ] Navigate using swipe gestures
- [ ] All buttons announced correctly
- [ ] All images have alt text
- [ ] Forms are usable
- [ ] Error messages are read aloud
- [ ] Can complete one full task

**Visual Accessibility:**
- [ ] Enable high contrast mode
- [ ] Check all text is readable
- [ ] Enable large text (Settings → Display)
- [ ] Verify text scales properly
- [ ] Check color is not the only indicator
- [ ] Test in bright light and darkness

**Motor Accessibility:**
- [ ] Try using app with one hand
- [ ] Test all touch targets (buttons)
- [ ] Verify buttons are large enough
- [ ] Test without precise touch
- [ ] Check tap tolerance is generous

### Feature Test Template

```
FEATURE TEST: [Feature Name]

Date: [Date]
Tester: [Your Name]
Device: [Device and OS]
App Version: [Version]

Test Objective:
[What you're trying to test]

Test Steps:
1. [Step one]
2. [Step two]
3. [Step three]

Results:
✅ [What worked]
❌ [What didn't work]
⚠️ [What was confusing]

Issues Found:
- [Bug #1]
- [Bug #2]

Recommendations:
- [Suggestion #1]
- [Suggestion #2]

Overall Rating: [1-5 stars]
```

### Weekly Testing Report Template

```
WEEKLY BETA TESTING REPORT

Week of: [Date Range]
Tester: [Your Name]

Hours Tested: [Approximate hours]

Features Tested:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Bugs Reported: [Number]
- [Link or reference to bug reports]

Highlights:
- [Something that impressed you]
- [Feature that works really well]

Pain Points:
- [Something frustrating]
- [Something confusing]

Suggestions:
- [Your ideas for improvement]

Questions for Team:
- [Any questions you have]
```

---

## Contacts

### Support Team

**General Beta Support:**
- Email: empowrapp08162025@gmail.com
- Response time: 24-48 hours
- For: Questions, bugs, feedback

**Emergency/Critical Issues:**
- Email: empowrapp08162025@gmail.com
- Subject: "URGENT" or "CRITICAL"
- Response time: 4 hours (business hours)
- For: App crashes, data loss, security issues

**Beta Program Manager:**
- Email: empowrapp08162025@gmail.com
- For: Program questions, feedback process, meetings

### Community Support

**Beta Testers Chat:**
- Access: Community → Beta Testers Chat
- Active: 9 AM - 9 PM Eastern (most days)
- For: Quick questions, discussions, tips

### Social Media (For Public Updates Only)

- X (Twitter): [@3mpowrApp0816](https://x.com/3mpowrApp0816)
- Facebook: [facebook.com/3mpowrapp](https://facebook.com/3mpowrapp)
- Instagram: [@3mpwrapp](https://instagram.com/3mpwrapp)

**Note:** Don't report bugs via social media! Use email or in-app reporting.

### Helpful Links

- Main Website: [3mpwrapp.pages.dev](https://3mpwrapp.pages.dev)
- User Guide: [/user-guide/](/user-guide/)
- Feature List: [/features/](/features/)
- Privacy Policy: [/privacy/](/privacy/)
- Terms of Service: [/terms/](/terms/)

---

## Appendix: Release Versioning & Feature Flags

### Understanding Version Numbers

**Version Format:** Major.Minor.Patch-Beta.Build

Example: `1.0.0-beta.8`

- **Major (1):** Big changes, new core features
- **Minor (0):** Smaller features, improvements
- **Patch (0):** Bug fixes, tiny tweaks
- **Beta (beta):** Pre-release version
- **Build (8):** Specific beta build number

**What Versions Mean:**

- `1.0.0-beta.1`: First beta of version 1.0
- `1.0.0-beta.8`: Eighth beta build
- `1.0.0-rc.1`: Release candidate (almost ready)
- `1.0.0`: Official public release

### Feature Flags

**What Are Feature Flags?**

Feature flags let us turn features on or off without releasing a new app version. You might see:

- "This feature is currently disabled"
- "Coming soon" badges
- Features that appear and disappear

**This is normal!** We use flags to:
- Test features with specific groups
- Roll out gradually
- Turn off broken features quickly
- A/B test different approaches

**Types of Flags:**

1. **Beta-Only Features**
   - Only visible to beta testers
   - Won't be in initial public release
   - We want your feedback before launching

2. **Gradual Rollout**
   - Enabled for some testers first
   - Expanded to more over time
   - Helps us catch issues early

3. **A/B Tests**
   - Different testers see different versions
   - Helps us choose best approach
   - You might see different UI than another tester

**If You See a Flag:**
- It's intentional
- Test it if visible to you
- Give feedback on it
- Don't worry if others have different features

### Beta Build Types

**Development Builds (dev):**
- Very early testing
- Many bugs expected
- Features incomplete
- Changes daily

**Alpha Builds (alpha):**
- Feature complete
- Still many bugs
- Internal testing mostly

**Beta Builds (beta):**
- Most features work
- Fewer bugs
- Your testing focus here

**Release Candidate (rc):**
- Feature frozen
- Bug fixes only
- Almost ready for public
- Final testing round

---

## Thank You!

Thank you for being a beta tester. Your time, feedback, and patience help us create an app that truly serves injured workers and persons with disabilities.

You are making a difference! 💪

**Questions? Feedback? Issues?**

📧 Email: empowrapp08162025@gmail.com  
💬 Chat: Community → Beta Testers Chat  
🐦 Twitter: [@3mpowrApp0816](https://x.com/3mpowrApp0816)

---

*Last Updated: November 5, 2025*  
*Guide Version: 1.0.0*  
*For App Version: 1.0.0-beta.x*

{%- include page-feedback.html -%}
