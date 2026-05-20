---
layout: default
title: 3MPWRAPP Beta Testers Guide - Test & Report Issues
description: Complete guide for beta testing 3MPWRAPP by the disability community. Learn what to test, how to report bugs, accessibility testing, and feature evaluation. Help shape Canada's platform for injured workers, persons with disabilities, and advocates.
version: 2.0 (Complete Rewrite - May 2026)
lastUpdated: 2026-05-20
accessibility: WCAG 2.2 AAA - fully readable in light, dark, and high contrast modes
---

{%- include status-banner.html -%}

# 3MPWRAPP Beta Testers Guide

**Help Shape Canada's Platform for the Disability Community | May 2026**

Thank you for beta testing! Your feedback makes 3MPWRAPP better for every Canadian in the disability community, every advocate, and every supporter. This guide explains what to test, how to test it, and how to report what you find.

*Special focus: Help us refine the 3 Flywheels of Change that turn individual evidence into collective power.*

---

## Quick Start

**New to beta testing?**
1. [Get access to the beta app](#getting-access)
2. [Understand what we're testing](#what-to-test)
3. [Pick a feature to test](#core-workflows)
4. [Report any issues you find](#bug-reporting)
5. [Give us feedback](#feedback)

**Already testing?**
- [Core workflows to test](#core-workflows)
- [Accessibility testing checklist](#accessibility-testing)
- [Performance testing checklist](#performance-testing)
- [Bug reporting template](#bug-template)

---

<a name="getting-access"></a>
## Getting Access to Beta

**3MPWRAPP beta testing is by invitation only.** We're in closed beta stress testing before submitting to app stores.

### How to Sign Up for Beta Access

1. **Go to signup form:** [https://3mpwrapp.ca/beta-signup](https://3mpwrapp.ca/beta-signup)
2. **Fill out the form** (name, email, device type — iPhone, iPad, Android, or Windows/Mac)
3. **We'll email you within 48 hours** with download instructions
4. **Follow the instructions** for your device

### After You're Approved

#### iPhone & iPad (TestFlight)

**You'll receive an email with a link to:** TestFlight invitation

1. Open Apple App Store
2. Search "TestFlight"
3. Tap "Get" → "Install"
4. Open the email from us and tap the 3MPWRAPP link
5. TestFlight opens
6. Tap "View in App" and then "Install"
7. Tap "Open" to launch

#### Android Phones & Tablets (Google Play Beta)

**You'll receive an email with a link to:** Google Play Beta signup

1. On your Android device, open the link from our email
2. Tap "Join" on the Google Play Store page
3. Tap "Install"
4. Tap "Open" to launch

#### Windows & Mac (Web App)

**You'll receive an email with a link to:** Web app

1. Click the link in the approval email
2. The web app opens in your browser
3. Create an account or sign in
4. Start testing

### Troubleshooting

- **Haven't received approval email?** Check spam folder or wait 48 hours
- **Lost the invitation link?** Email empowrapp08162025@gmail.com to request a new one
- **Installation issues?** You need iOS 14+ (iPhone/iPad), Android 10+ (Android), or a modern browser (Windows/Mac). Need 150 MB storage on mobile devices

**Troubleshooting:**
- **Can't find "Join the beta"?** Go to 3MPWRAPP app page → About section → scroll down
- **Update button won't appear?** Restart Play Store or wait 24 hours for rollout

---

## What Is Beta Testing?

**Beta testing = helping find and fix bugs before release.**

### Your Role

You help by:
1. Using new features
2. Testing workflows
3. Finding bugs
4. Testing accessibility
5. Testing performance
6. Reporting issues
7. Giving feedback

### What You'll Find

Beta versions often have:
- ✅ New features to try
- ⚠️ Sometimes crashes or bugs (that's why we need testers!)
- ⚠️ Performance issues (slow loading, battery drain)
- ⚠️ Accessibility barriers (harder to use with screen reader, etc.)

**Your job:** Find these issues and report them so we can fix them before the public release.

### What You Won't Find

- Finished documentation (we're writing it with you!)
- Perfect performance (that's what you help us fix)
- All features (some are still in progress)

---

<a name="what-to-test"></a>
## What to Test

### Prioritized Feature List

**CRITICAL (test thoroughly):**
- Parse Claim — decode decision letters
- Deadline Tracker — manage deadlines
- Evidence Locker — upload and store documents
- Letter Wizard — write letters
- Emergency Resources — access crisis help

**IMPORTANT (test when you can):**
- Pacing Partner — activity management
- Health Tracker — symptom and health logging
- Support Groups — community connection
- Campaigns — collective action
- Appeal Coach — personalized guidance

**NICE-TO-HAVE (test for edge cases):**
- Settings and personalization
- Search and filtering
- Data export
- Offline functionality
- Notification system

---

<a name="core-workflows"></a>
## Core Workflows to Test

### Workflow 1: Emergency - Upload Evidence & Write Letter

**Scenario:** You got a denial and want to appeal immediately

**What to test:**
1. Open app
2. Go to Evidence Locker
3. Upload a document (photo of a decision letter, PDF, image)
4. Give it a title: "Denial Letter - May 2026"
5. Add tag: "decision"
6. Save (check encryption lock icon appears)
7. Go to Evidence Command Center
8. Verify document appears in timeline
9. Open Letter Wizard
10. Choose "Appeal Letter"
11. Answer questions about your appeal
12. Review generated letter
13. Edit any parts you want to change
14. Save and/or export as PDF
15. Close app

**Expected results:**
- ✅ Document uploads without error
- ✅ Encryption lock icon visible
- ✅ Document appears in timeline within 5 seconds
- ✅ Letter Wizard opens without crashing
- ✅ Letter is readable and professional-quality
- ✅ Can edit all text
- ✅ Can export/save
- ✅ App doesn't crash when closing

**What to watch for (bugs):**
- File won't upload → note file type and size
- Encryption icon missing → security issue
- Document won't appear → data storage issue
- Letter Wizard crashes → stability issue
- Generated text is nonsense → AI quality issue

**Report any bugs using the template below →**

---

### Workflow 2: Ongoing - Track Health & Plan Activities

**Scenario:** You're managing symptoms and pacing your advocacy work

**What to test:**
1. Open app
2. Go to Wellness Hub
3. Open Symptom Tracker
4. Log a symptom (pain, fatigue, brain fog)
5. Rate severity 1-10
6. Add notes
7. Save
8. Open Pacing Partner
9. Set daily activity baseline (1-10 scale)
10. Plan today's activities
11. Check if within safe zone
12. View patterns in activity history
13. Close app

**Expected results:**
- ✅ All fields accept input without crashing
- ✅ Severity scale works 1-10
- ✅ Data saves immediately
- ✅ Can view past entries
- ✅ Charts/patterns display correctly
- ✅ No lag when switching between tools

**What to watch for:**
- Can't enter data → input problem
- Data disappears after closing → saving issue
- Charts don't update → display problem
- App slow when loading history → performance issue

---

### Workflow 3: Case Management - Parse Decision & Track Deadlines

**Scenario:** You got a decision and want to understand it and track appeal deadline

**What to test:**
1. Open app
2. Go to Advocacy Hub
3. Tap "Parse Claim"
4. Upload a decision letter (photo or PDF)
5. Wait for analysis (should be <2 minutes)
6. Read plain-language summary
7. Note the deadlines found
8. Tap "Add to Deadline Tracker"
9. Review deadline now appears in Tracker
10. Check Deadline Tracker shows correct countdown
11. Verify notifications will alert you

**Expected results:**
- ✅ Upload accepts photos and PDFs
- ✅ Analysis completes within 2 minutes
- ✅ Summary is readable and accurate
- ✅ Deadlines are identified correctly
- ✅ Deadlines add to Tracker without error
- ✅ Countdown shows correct number of days
- ✅ No crashes during any step

**What to watch for:**
- Analysis fails or times out → parsing problem
- Summary is nonsensical → AI problem
- Deadlines are inaccurate → logic issue
- Won't add to Tracker → integration issue

---

### Workflow 4: Community - Join Group & Participate

**Scenario:** You want to connect with others and participate in a support group

**What to test:**
1. Open app
2. Go to Community tab
3. Browse Support Groups
4. Find a group matching your interest
5. Read group description
6. Tap "Join Group"
7. Post an introduction
8. Read other people's messages
9. Post a message/question
10. See if you get any responses
11. Check if notifications work

**Expected results:**
- ✅ Can browse groups without crashing
- ✅ Can join group without error
- ✅ Can post messages successfully
- ✅ Messages appear immediately or within 10 seconds
- ✅ Can read all messages
- ✅ Receive notifications of responses
- ✅ Group feels safe and welcoming

**What to watch for:**
- Can't join group → permission issue
- Message won't post → save error
- Message appears twice → duplication bug
- Messages are out of order → sorting issue
- No notifications → notification issue

---

<a name="accessibility-testing"></a>
## Accessibility Testing Checklist

**Test 3MPWRAPP in all three display modes:**

### Light Mode Testing

- [ ] All text is clearly readable (dark gray or black on white)
- [ ] All links are blue and underlined
- [ ] Headings stand out from body text
- [ ] No text is faint or hard to read
- [ ] All buttons are clearly clickable
- [ ] Focus indicators (blue ring) are visible when using Tab key

**What to watch for:**
- Gray text on white background (too low contrast)
- Links that blend into surrounding text
- Text that's faint or barely visible

### Dark Mode Testing

- [ ] All text is clearly readable (white or light gray on dark background)
- [ ] All links are light blue and underlined
- [ ] Headings stand out from body text
- [ ] No text is faint or hard to read
- [ ] All buttons are clearly clickable
- [ ] Focus indicators are visible

**What to watch for:**
- Any text that becomes faint in dark mode
- Links that disappear or become invisible
- Buttons with dark text on dark backgrounds

### High Contrast Mode Testing

- [ ] All text is pure black on white (maximum contrast)
- [ ] All links are pure blue with underlines
- [ ] Headings are bold and prominent
- [ ] All buttons have thick black borders
- [ ] No color is used alone to show meaning
- [ ] Focus indicators are thick and visible

**What to watch for:**
- Gray colors (should be pure black or white)
- Color-only coding (e.g., red button for error with no text label)
- Thin borders or indicators

### Screen Reader Testing (VoiceOver/TalkBack)

**If you use a screen reader:**

- [ ] All buttons have descriptive labels (not just "Button 1")
- [ ] Form fields are labeled
- [ ] Instructions are spoken clearly
- [ ] Screen reader announces headings correctly
- [ ] Lists are announced as lists
- [ ] Links announce their destination
- [ ] Images have alt text descriptions

**What to watch for:**
- Unlabeled buttons (just say "button" with no purpose)
- Form fields with no labels
- Images with no descriptions
- Tables without header rows

### Keyboard Navigation Testing

- [ ] Can navigate entire app using Tab key only
- [ ] Can access all buttons and links with Tab
- [ ] Can activate buttons with Enter key
- [ ] Can cancel with Escape key
- [ ] Tab order makes sense (left-to-right, top-to-bottom)
- [ ] Focus ring is always visible

**What to watch for:**
- Keyboard can't reach certain buttons
- Tab order jumps around randomly
- Focus ring disappears or is hard to see
- Can't use Tab+Enter to do everything

### Text Scaling Testing

Test with text scaled to 150% and 200%:
- [ ] All text is still readable
- [ ] Text doesn't overlap or clip
- [ ] Buttons are still clickable
- [ ] Layout adjusts properly
- [ ] Horizontal scrolling isn't required (ideally)

**What to watch for:**
- Text that gets cut off
- Text that overlaps other text
- Buttons that become unreachable
- Layout that breaks

### Dyslexia-Friendly Font Testing

If you use dyslexic-friendly fonts:
- [ ] Font is actually different (not just smaller)
- [ ] Letters are easier to distinguish
- [ ] Reading feels easier
- [ ] All app features work with font enabled

**What to watch for:**
- Font doesn't actually change
- Font makes things harder to read
- Some text doesn't use the dyslexic font

---

<a name="performance-testing"></a>
## Performance Testing Checklist

### Speed Tests

**App startup:**
- [ ] App opens and is usable within 5 seconds
- [ ] Home screen loads fully within 10 seconds

**Screen loading:**
- [ ] Each screen loads within 3 seconds
- [ ] Scrolling is smooth (no stuttering)
- [ ] List items load as you scroll

**What to watch for:**
- App takes >10 seconds to open
- Blank screens that never load
- Stuttering or lag when scrolling
- Lists load very slowly

### Battery & Data Usage

**Battery:**
- [ ] App doesn't drain battery quickly
- [ ] Background sync doesn't run constantly
- [ ] App can run 8+ hours on normal use

**Data:**
- [ ] Doesn't use excessive mobile data
- [ ] Downloads are needed only once
- [ ] Works offline for core features

**What to watch for:**
- Battery drops 10%+ per hour
- Excessive data usage (>5 MB per day)
- Always trying to sync even when offline

### Offline Functionality

- [ ] Can use app without internet
- [ ] Evidence Locker works offline
- [ ] Can read Help content offline
- [ ] Can view saved documents offline
- [ ] Syncs when internet returns

**What to watch for:**
- App requires internet for everything
- Offline features crash or don't work
- Data doesn't sync when internet returns

---

<a name="bug-template"></a>
## How to Report Bugs

### Use This Template

```
TITLE: [Feature] - Brief description of problem
EXAMPLE: "Evidence Locker - Upload fails for PNG files"

DEVICE: [iPhone 12 / Samsung Galaxy S21 / etc]
OS VERSION: [iOS 15.2 / Android 12 / etc]
APP VERSION: [visible in Settings → About]

SEVERITY: [Critical / High / Medium / Low]

WHAT I WAS TRYING TO DO:
[Describe the task you were doing]

WHAT HAPPENED:
[Describe what went wrong]

WHAT I EXPECTED:
[Describe what should have happened]

STEPS TO REPRODUCE:
1. [First step]
2. [Second step]
3. [Etc.]

SCREENSHOTS:
[Attach if helpful]

NOTES:
[Any other relevant info]
```

---

### Severity Levels

**CRITICAL** — Urgent, blocks major functionality
- App crashed completely
- Lost data
- Security issue
- Feature completely broken
- Can't access core workflow

**Example:** "App crashes every time I try to upload evidence"

**HIGH** — Important feature doesn't work
- Feature has bugs but workaround exists
- Performance problem (very slow)
- Accessibility barrier (can't use with screen reader)
- Multiple related issues

**Example:** "Can't search documents by tag, but sorting works"

**MEDIUM** — Something is confusing or doesn't work perfectly
- Minor feature bug
- UI is unclear
- Error message is confusing
- Spelling/grammar error
- Minor performance issue

**Example:** "The button says 'Save' but it actually exports as PDF"

**LOW** — Nice-to-have improvement
- Cosmetic issue
- Feature request
- Minor UX improvement
- Wording could be better

**Example:** "The green color on buttons is a bit bright"

---

### How to Submit Your Report

**Option 1: In-app**
1. Open Settings
2. Tap "Help & Support"
3. Tap "Report a Bug"
4. Fill out the form
5. Attach screenshots if helpful
6. Tap "Send"

**Option 2: Email**
Email your report to: **empowrapp08162025@gmail.com**

**Option 3: GitHub** (for technical testers)
Create an issue: https://github.com/S0vryn9-C011ect1ve/empowrapp-main/issues

**Response time:** We aim to respond to all reports within 24-48 hours.

---

## Feedback Guidelines

### Types of Feedback We Want

✅ **What's working well**
- "The Evidence Locker is really clear and easy to use"
- "I love that I can change complexity mode"
- "The accessibility features actually work!"

✅ **What's confusing**
- "I didn't know I could tag documents until I looked in help"
- "The deadline calculator gave me different numbers than the tribunal"
- "High contrast mode is good but buttons are too small"

✅ **What's missing**
- "I wish I could export all my evidence at once"
- "It would help to see my case timeline with photos"
- "I need a way to add notes to deadlines"

✅ **Accessibility feedback**
- "Screen reader doesn't announce this button's purpose"
- "Text is too small even in Large font size"
- "Dark mode text is hard to read on my OLED screen"

### How to Give Feedback

**Option 1: In-app Feedback**
1. Settings → Help & Support → Send Feedback
2. Tell us what you think
3. We read every piece

**Option 2: Email**
empowrapp08162025@gmail.com

**Option 3: Community**
Join a Support Group and talk with other testers

---

## Known Limitations

**Things we know need work (that you might encounter):**

- **Bundle size:** App is ~100 MB (we're working to reduce this)
- **Performance on older phones:** May be slower on devices >5 years old
- **Some features in progress:** A few features are still being built
- **Limited video content:** App uses mostly text/images (videos coming)
- **Offline sync:** Sometimes takes 5-10 minutes to sync after coming online

**These are NOT bugs — we're actively working to improve them.**

---

## Testing Your Own Devices

### iOS Device Requirements

- **Minimum:** iPhone 8 or later
- **Recommended:** iPhone 12 or later
- **Storage:** 150 MB free space
- **Internet:** WiFi or cellular data

### Android Device Requirements

- **Minimum:** Android 10
- **Recommended:** Android 12+
- **Storage:** 150 MB free space
- **RAM:** 4 GB minimum
- **Internet:** WiFi or cellular data

---

## Privacy & Security While Testing

**Important:** Beta testing doesn't affect your privacy
- Your data is still encrypted
- We don't monitor beta tester data
- All usual privacy protections apply
- You can delete your account anytime

**What we DO collect for improvement:**
- Crash reports (to fix bugs)
- Usage analytics (to understand which features work)
- Performance metrics (to optimize speed)

**What we DON'T collect:**
- Any personal health information
- Identifying details
- Document content
- Location data

---

## Staying Updated

**You'll receive:**
- Updates and builds when issues or problems need fixing
- Email notifications when new beta versions are available
- In-app changelog showing what's new
- Requests for specific testing when we need your help

**To stay informed:**
- Check for updates in TestFlight or Play Store when notified
- Read the changelog in Settings → What's New
- Watch for emails from empowrapp08162025@gmail.com

---

## Recognition & Rewards

**Thank you for helping!**

Beta testers are:
- 🌟 Acknowledged in our release notes
- 🎁 First to access new features
- 💬 Heard directly by our team
- 🏆 Making 3MPWRAPP better for everyone

---

## Questions?

- **Email:** empowrapp08162025@gmail.com
- **In-app:** Settings → Help & Support → Contact Us
- **Community:** Ask in your Support Group

---

## Accessibility

This Beta Testers Guide is fully readable and accessible in:
- ✅ **Light Mode** — Dark text on white background
- ✅ **Dark Mode** — Light text on dark background
- ✅ **High Contrast Mode** — Maximum contrast, bold text

---

**Version 2.0 | Completely Rewritten May 2026 | Next update: May 2027**

**Thank you for helping make 3MPWRAPP better for everyone! 💙**
