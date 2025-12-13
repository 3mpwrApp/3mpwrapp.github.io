---
layout: default
title: Frequently Asked Questions (FAQ)
description: Common questions about 3mpwr App - privacy, features, accessibility, beta testing, USA Lite, and more. Updated December 2025 with production-ready status and USA Lite launch.
permalink: /faq/
lastUpdated: 2025-12-12
---

{%- include status-banner.html -%}

# Frequently Asked Questions (FAQ)

**Last Updated:** December 12, 2025

📖 **15 minute read** | ⚡ Use search or table of contents to jump to your question

Quick answers to common questions about 3mpwr App. Can't find what you're looking for? [Contact us](/contact).

<!-- FAQ Search -->
<div class="faq-search-container">
  <label for="faq-search" class="search-label">
    <span class="search-icon" aria-hidden="true">🔍</span>
    Search FAQs
  </label>
  <input 
    type="search" 
    id="faq-search" 
    class="faq-search-input"
    placeholder="Type keywords to search FAQs..."
    aria-describedby="search-help search-results-count"
    autocomplete="off">
  <small id="search-help" class="search-help">Try searching: "privacy", "cost", "beta testing"</small>
  <div id="search-results-count" class="search-results-count" role="status" aria-live="polite" style="display: none;"></div>
  <button type="button" id="clear-search" class="clear-search-btn" style="display: none;" aria-label="Clear search">
    ✕ Clear
  </button>
</div>

<!-- Expand/Collapse All Controls -->
<div class="accordion-controls">
  <button type="button" id="expand-all-btn" class="accordion-control-btn">
    <span class="icon">📖</span> Expand All Questions
  </button>
  <button type="button" id="collapse-all-btn" class="accordion-control-btn">
    <span class="icon">📕</span> Collapse All Questions
  </button>
</div>

<details class="tldr-box" open>
  <summary>⚡ Most Common Questions</summary>
  <ul>
    <li><strong>Is it really free?</strong> Yes, 100% free forever - no subscriptions, no hidden costs</li>
    <li><strong>Is my data private?</strong> Absolutely - your data stays on YOUR device, we can't see it</li>
    <li><strong>Do I need to be tech-savvy?</strong> No - designed for all skill levels with step-by-step guides</li>
    <li><strong>What about accessibility?</strong> 100% accessible - built by and for the disability community</li>
    <li><strong>When can I join?</strong> Currently in closed beta - sign up at <a href="/beta">/beta</a></li>
    <li><strong>Works in my province?</strong> Yes - supports all Canadian provinces and territories</li>
  </ul>
</details>

---

## 📑 Table of Contents

- [What's New - December 2025](#whats-new---december-2025)
- [USA Lite - For American Users](#usa-lite---for-american-users)
- [Getting Started](#getting-started)
- [Common Concerns & Trust Questions](#common-concerns--trust-questions)
- [Privacy & Data](#privacy--data)
- [BYOC Modes Explained](#byoc-modes-explained)
- [Features & Functionality](#features--functionality)
- [Accessibility](#accessibility)
- [Beta Testing](#beta-testing)
- [Troubleshooting](#troubleshooting)
- [Legal & Disclaimers](#legal--disclaimers)

---

## What's New - December 2025

### What's the December 2025 milestone?

**🎉 First Demo Presentation Successful + USA Lite Launch!**

On December 12, 2025, we completed our first demo/intro presentation for 3mpwr App — and it was a success!

**Key achievements:**
- ✅ **721 Tests Passing** - Complete test coverage across all features
- ✅ **0 ESLint/TypeScript Errors** - Clean, maintainable codebase
- ✅ **0 Accessibility Issues** - WCAG AAA compliant
- ✅ **AES-256-GCM Encryption** - Security verified
- ✅ **Full Offline Support** - Works without internet
- ✅ **First Demo Successful** - Positive community response
- ✅ **USA Lite Launched** - American supporters can now join!

### What is USA Lite?

Following strong interest from USA listeners during our demo, we've launched **USA Lite** - a streamlined version for American supporters and allies. [See full details below →](#usa-lite---for-american-users)

---

## What's New - November 2025

### What's new in the November 2025 update?

**We've achieved 90% accessibility (up from 40%)!** Major improvements include:

**🎯 Complexity Mode System**
- Simple Mode (5 features) - For overwhelming days and cognitive challenges
- Standard Mode (20 features) - For most users most of the time
- Power User Mode (150+ features) - Everything unlocked
- Bad Day Mode - One-tap emergency simplification

**📚 Resources vs Research Split**
- Resources Tab = In-app interactive tools only (Master Tracker Hub, Letter Wizard, Appeal Command Center, Evidence Manager)
- Research Tab = 96 external resources organized by category with province filtering
- Clear separation eliminates confusion about what opens in-app vs browser

**🗂️ Master Tracker Hub**
- All health tracking in one place (symptoms, meds, rehab, appointments, timeline, accessibility)
- Quick log buttons, AI pattern detection, export to PDF/CSV/JSON

**⚖️ Appeal Command Center**
- Deadline warfare with color-coded urgency (red: 7 days, orange: 30 days)
- Denial decoder translates insurance jargon
- Evidence strength meter, appeal prep guide

**📦 Offline Queue**
- Upload evidence without internet - auto-syncs when connection restored
- Critical for rural areas, court appearances, spotty WiFi

**🆘 Global SOS/Crisis Button**
- Single tap: crisis menu (Call 988, Crisis Text Line, Safe Landing Page, Emotional First Aid, Quick Exit)
- Triple tap: emergency contact with location
- Visible on all major screens

**💪 4 Wellness Hubs**
- Energy & Mood Hub, Unified Health Tracker, Mental Wellness Toolkit, Movement & Rehab Hub
- Consolidates 10+ separate screens into 4 integrated hubs

[See full November 2025 updates in User Guide →](/user-guide#whats-new-november-2025)

---

## USA Lite - For American Users

<div class="faq-accordion-section">

<details class="faq-accordion" id="faq-usa-lite" open>
  <summary class="faq-question">
    <span class="question-icon">🇺🇸</span>
    <span class="question-text">What is USA Lite?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**USA Lite** is a streamlined version of 3mpwr App designed for American supporters and allies who want to join our disability rights community.

**Why we launched it:** During our first demo presentation (December 12, 2025), USA listeners expressed strong interest in beta testing. Rather than making them wait for our planned 2026 US launch, we streamlined our roadmap to provide immediate access to core features.

**What's included:**
- ✅ Full wellness tools (energy tracking, mood, pacing partner AI)
- ✅ Community access (connect with disability rights movement)
- ✅ Evidence Locker (AES-256 encrypted document storage)
- ✅ Letter Wizard (general advocacy templates)
- ✅ Crisis resources (US hotlines: 988, Crisis Text Line)
- ✅ All accessibility features (WCAG AAA, Complexity Mode, voice)
- ✅ Full offline support

**What's different:**
- ⚠️ Workers' comp templates are general (not state-specific)
- ⚠️ Benefit workflows are general (not SSDI/SSI-specific)
- ⚠️ Legal workflows focus on advocacy (not US tribunal-specific)

**Full US launch with state-specific features is planned for Q1-Q2 2026.**

  </div>
</details>

<details class="faq-accordion" id="faq-usa-signup">
  <summary class="faq-question">
    <span class="question-icon">📝</span>
    <span class="question-text">How do I sign up for USA Lite?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**Same process as Canadian users!**

1. Go to [/beta/](/beta/) to sign up for beta testing
2. When asked about location, select United States
3. You'll receive access to USA Lite automatically
4. All core features work immediately

**No separate app** - USA Lite is the same app with region-appropriate features.

  </div>
</details>

<details class="faq-accordion" id="faq-usa-canada-difference">
  <summary class="faq-question">
    <span class="question-icon">🇨🇦</span>
    <span class="question-text">What's the difference between Canada and USA versions?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

| Feature | Canada (Full) | USA Lite |
|---------|---------------|----------|
| **Wellness Tools** | ✅ Full | ✅ Full |
| **Community** | ✅ Full | ✅ Full |
| **Evidence Locker** | ✅ Full | ✅ Full |
| **Accessibility** | ✅ WCAG AAA | ✅ WCAG AAA |
| **Crisis Resources** | 🇨🇦 Canadian | 🇺🇸 US (988, etc.) |
| **Workers' Comp** | ✅ WSIB/WCB specific | ⚠️ General templates |
| **Benefits** | ✅ ODSP, AISH, CPP-D | ⚠️ General resources |
| **Legal Workflows** | ✅ Canadian tribunals | ⚠️ Advocacy tools |
| **Province Filter** | ✅ All provinces | ❌ Not applicable |

**Bottom line:** Universal features work the same. Country-specific legal/benefits features are tailored to each region.

  </div>
</details>

</div>

---

## Getting Started

### What is 3mpwrApp?

3mpwrApp is a comprehensive platform built for injured workers and persons with disabilities in Canada. We provide tools for advocacy, community connection, wellness tracking, legal workflow automation, and system navigation - all designed with accessibility and privacy as top priorities.

### Who is 3mpwrApp for?

- **Persons with disabilities** (any disability type)
- **Injured workers** navigating workers' compensation systems
- **Supporters and allies** helping disabled friends/family
- **Unions and advocacy groups** organizing for change
- **Healthcare providers** supporting disabled clients

We're built BY the disability community, FOR the disability community.

---

## Common Concerns & Trust Questions

<div class="faq-accordion-section">

<details class="faq-accordion" id="faq-different">
  <summary class="faq-question">
    <span class="question-icon">❓</span>
    <span class="question-text">How is 3mpwrApp different from other disability apps?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**Key Differences:**

| 3mpwrApp | Other Apps |
|----------|------------|
| 🆓 **100% free forever** | Often have paid tiers, subscriptions |
| 🔒 **You own your data** (BYOC options) | They own your data |
| 🇨🇦 **Canadian-focused** (all provinces) | Often US-focused |
| ♿ **Built BY disabled people** | Often built by corporations |
| 🔓 **Open about limitations** | Often overpromise capabilities |
| 💚 **Community-funded mission** | Profit-driven |
| 🏛️ **Advocacy-focused** | Health tracking only |

**Bottom line:** We're not trying to make money off the disability community—we're trying to empower it.

  </div>
</details>

<details class="faq-accordion" id="faq-funding">
  <summary class="faq-question">
    <span class="question-icon">💰</span>
    <span class="question-text">If it's free, how do you make money? What's the catch?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**Great question!** Here's our honest answer:

**How We're Funded (Currently):**
- 💰 Personal funds from founder
- 🤝 Community donations (optional, not required)
- 🎯 Grants for disability advocacy (applied for, not guaranteed)

**Future Funding (Being Explored):**
- 🏢 Institutional partnerships (unions, advocacy orgs) - they pay, members use free
- 💼 Optional professional tools (lawyers, case workers) - NOT required for users
- 🎓 Training/workshops for organizations - again, users always free

**What We'll NEVER Do:**
- ❌ Charge users a subscription
- ❌ Sell your data to third parties
- ❌ Show you ads
- ❌ Require payment for core features
- ❌ Create "premium" tiers

**The Catch?** There isn't one. We're a grassroots community project, not a Silicon Valley startup looking for an exit strategy. We survive on donations and founder's personal investment because we believe in this mission.

**[Read our funding transparency statement →](/about#funding-transparency)**

  </div>
</details>

<details class="faq-accordion" id="faq-trust">
  <summary class="faq-question">
    <span class="question-icon">🔒</span>
    <span class="question-text">How can I trust you with my sensitive data?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**We understand this concern completely. Here's how we've addressed it:**

**1. You Don't Have to Trust Us**
- Use **Strict BYOC Mode** - your data never touches our servers
- Your data stays on YOUR device and YOUR cloud provider
- We literally can't access it even if we wanted to

**2. Technical Safeguards**
- Military-grade encryption (AES-256)
- Open-source security audit (coming Q1 2026)
- Third-party penetration testing
- Regular security audits

**3. Legal Commitments**
- Detailed privacy policy with no loopholes
- GDPR and Canadian privacy law compliance
- Data deletion on request (within 30 days)
- No data sales - ever (written into Terms of Service)

**4. Community Accountability**
- Built with input from disability advocates
- Transparent about what we collect and why
- Regular community updates
- Open to audits from disability rights organizations

**[Read our detailed security documentation →](/privacy#security-measures)**

  </div>
</details>

<details class="faq-accordion" id="faq-shutdown">
  <summary class="faq-question">
    <span class="question-icon">💾</span>
    <span class="question-text">What if 3mpwrApp shuts down? Will I lose my data?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**No, your data is safe!**

**If you use Default Mode:**
- Export all your data anytime (Settings → Export Data)
- Download JSON, PDF, or CSV formats
- Data remains on your device until you delete it

**If you use BYOC Modes (Hybrid or Strict):**
- Your data lives in YOUR cloud storage (Google Drive, Dropbox, etc.)
- You have complete copies independent of 3mpwrApp
- Even if we shut down tomorrow, you keep everything

**Our Shutdown Promise:**
- ✅ 90-day advance notice before any shutdown
- ✅ Tools to export all community posts/resources
- ✅ Open-source the app code so community can continue
- ✅ Provide migration guide to alternatives

**Bottom Line:** You're not locked in. Your data is portable. You can leave anytime with everything you created.

  </div>
</details>

<details class="faq-accordion" id="faq-privacy">
  <summary class="faq-question">
    <span class="question-icon">🕵️</span>
    <span class="question-text">What about privacy? Can employers/insurance companies see my data?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**Absolutely NOT - unless YOU choose to share it.**

**Default Privacy Protections:**
- 🔒 All data encrypted on your device
- 🔒 Only you have the decryption keys
- 🔒 We cannot access your Evidence Locker, wellness logs, or personal notes
- 🔒 No backdoors for law enforcement, employers, or insurance companies

**Community Privacy:**
- Use anonymous usernames (no real names required)
- Control what you share publicly vs. privately
- Delete your posts anytime
- Opt out of public community entirely (still use tools)

**Legal Requests:**
- We fight subpoenas for user data
- We comply only when legally required (with notice to you)
- We collect minimal data, so there's little to hand over
- BYOC modes mean we literally don't have your data to share

**[Read our Privacy Policy →](/privacy)**  
**[Read our Data Warrant Transparency Report →](/transparency-report)** (coming Q1 2026)

  </div>
</details>

<details class="faq-accordion" id="faq-afford">
  <summary class="faq-question">
    <span class="question-icon">📱</span>
    <span class="question-text">What if I can't afford a smartphone or data plan?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**We hear you. Digital divide is a real accessibility barrier.**

**Current Solutions:**
- 📱 App works 100% offline (no data needed after download)
- 💻 Web version coming Phase 3 (use library computers)
- 📄 Printable resources available (download PDFs)

**Future Solutions (Advocating For):**
- 📞 Partnership with free phone programs (SafeLink, Assurance Wireless)
- 📡 Lobbying for disability tech subsidies
- 🏢 Institutional access (union halls, community centers provide devices)

**Right Now:**
- Check if you qualify for [Connecting Families](https://ised-isde.canada.ca/site/connecting-families/en) (Canada) - $20/month internet
- Ask local library about device lending programs
- Contact your provincial disability program about tech assistance

**We're working on this. Digital access IS a disability justice issue.**

  </div>
</details>

<details class="faq-accordion" id="faq-scam">
  <summary class="faq-question">
    <span class="question-icon">🔍</span>
    <span class="question-text">How do I know this isn't a scam or data harvesting scheme?</span>
    <span class="accordion-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="faq-answer">

**Healthy skepticism is smart! Here's how to verify we're legitimate:**

**Transparency Markers:**
- ✅ Detailed [Terms of Service](/terms) and [Privacy Policy](/privacy) (no vague corporate speak)
- ✅ Real person contact: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- ✅ Active social media with real community engagement
- ✅ Open about limitations and what we DON'T do
- ✅ Beta testing with real community members
- ✅ Source code available for security audit (upon request during beta)

**Red Flags We DON'T Have:**
- ❌ No "too good to be true" promises
- ❌ No pressure to upgrade or pay
- ❌ No vague privacy policies
- ❌ No requests for banking info or SIN numbers
- ❌ No multi-level marketing or "refer 5 friends" schemes

**You Can Verify:**
- Google our app name + "reviews" or "scam"
- Check our social media for real user interactions
- Join beta and test with dummy data first
- Ask questions in our public community forums

**If something feels off, trust your gut.** We want informed, empowered users - not victims.

  </div>
</details>

</div>

---
- Join beta and test with dummy data first
- Ask questions in our public community forums

**If something feels off, trust your gut.** We want informed, empowered users - not victims.

---

## Getting Started

### How much does 3mpwrApp cost?

**3mpwrApp is completely FREE.** There are no paid tiers, no subscriptions, no in-app purchases - ever.

We're building this for the disability community, funded by the community. Our mission is accessibility and empowerment, not profit. All features will always be free for everyone.

### Is 3mpwrApp available now?

We're currently in **Phase 1 Closed Beta Testing**. [Sign up for beta access →](https://forms.gle/46yVp37vfitfitLT9)

### What platforms does 3mpwrApp support?

- **iOS** (iPhone, iPad)
- **Android** (phones, tablets)
- **Web version** (coming in Phase 3)

---

## Privacy & Data

### Who owns my data?

**YOU DO.** 100% of your data belongs to you, not us. We never claim ownership of your content, evidence, wellness data, or anything you create in the app.

**[Read our Data Ownership Statement →](/data-ownership/)**

### Where is my data stored?

That depends on which privacy mode you choose:

- **Default Mode:** On your device by default, optional backup to Firebase (our secure cloud)
- **Hybrid BYOC Mode:** On your device AND your chosen cloud (Google Drive, Dropbox, etc.)
- **Strict BYOC Mode:** Only on your device and YOUR chosen cloud (we never see it)

**[Learn about privacy modes →](/privacy-controls/#choose-your-privacy-mode)**

### Can you see my data?

**In Default Mode:** Only if you enable cloud backup (and even then, it's encrypted)  
**In Hybrid Mode:** We handle your login, but never see your content  
**In Strict Mode:** No - we're completely disconnected, the app only talks to YOUR cloud

### Do you sell my data?

**ABSOLUTELY NOT.** We will never sell, rent, or trade your personal information to third parties. This is a core promise we will never break.

### How secure is my data?

- **Military-grade encryption** (AES-256, same as banks use)
- **Hardware-backed security** (encryption keys stored in your device's secure chip)
- **Secure connections** (all network traffic encrypted with HTTPS/TLS)
- **No backdoors** (we don't have access keys to your encrypted data)

**[Read our Privacy Policy →](/privacy/)**

### Can I delete my data?

**YES!** You have the right to delete:
- Your entire account (permanently)
- Individual pieces of data (selective deletion)
- All cloud backups (if you use them)

Deletion is permanent and cannot be undone.

**[Learn how to delete your data →](/delete-data)**

---

## BYOC Modes Explained

### What does BYOC mean?

**BYOC = Bring Your Own Cloud**

It means you can connect your own cloud storage provider (Google Drive, Dropbox, iCloud, Nextcloud, etc.) and have ALL your data stored there instead of on our servers.

### What's the difference between the three privacy modes?

| Feature | Default Mode | Hybrid BYOC ⭐ | Strict BYOC |
|---------|-------------|----------------|-------------|
| **Login** | Easy (email, Google, Apple) | Easy (email, Google, Apple) | Custom only |
| **Your data location** | Device + optional Firebase | Device + YOUR cloud | Device + YOUR cloud |
| **What we can see** | Only what you backup | Only your login, never content | Nothing at all |
| **Setup difficulty** | 🟢 Easy | 🟡 Medium | 🔴 Advanced |
| **Best for** | Most users | Privacy + convenience | Maximum privacy |

### Which mode should I choose?

**Default Mode** - Start here if you're new and want the easiest experience

**Hybrid BYOC Mode** ⭐ **RECOMMENDED** - Best balance of easy login + full data privacy

**Strict BYOC Mode** - For maximum privacy advocates, healthcare settings, or legal work requiring complete air-gap

You can switch modes anytime in Settings → Privacy & Security.

### What cloud providers are supported?

**ANY cloud storage that supports standard protocols:**

- ✅ Google Drive
- ✅ Dropbox
- ✅ Microsoft OneDrive
- ✅ Apple iCloud
- ✅ Nextcloud
- ✅ ownCloud
- ✅ AWS S3
- ✅ Azure Storage
- ✅ Any WebDAV-compatible service
- ✅ Your own server

### Do I need technical skills for BYOC modes?

**Hybrid Mode:** No - if you can sign into Google Drive or Dropbox, you can use Hybrid Mode

**Strict Mode:** Some technical knowledge helpful (knowing what WebDAV is, how to connect to cloud storage)

**[Full BYOC setup guide →](/data-ownership/#3-user-cloud-user-control--three-privacy-modes)**

---

## Features & Functionality

### How many features does 3mpwr App have?

**60+ core features available in production-ready beta** (November 2025).

The app adapts to your needs with **Complexity Mode**:
- **Simple Mode:** 5 essential features for overwhelming days
- **Standard Mode:** 20 commonly-used features for most users
- **Power User Mode:** 150+ features including beta/experimental tools

Features organized into:
- 🏠 Home & Dashboard
- 📢 Campaigns & Events
- 👥 Community
- 📚 Resources (in-app tools)
- 🔬 Research (external resources)
- 💪 Wellness (4 integrated hubs)
- ⚖️ Advocacy & Legal
- ⚙️ Settings & Accessibility
- 🆕 What's New

**[See all features →](/features)**

### What's the Master Tracker Hub? (NEW November 2025)

**All your health tracking in one unified dashboard:**

**What It Tracks:**
- Symptoms (severity, triggers, patterns)
- Medications (doses, schedules, side effects)
- Rehab exercises (reps, sets, progress)
- Doctor appointments (notes, recommendations, follow-ups)
- Case timeline (legal deadlines, key events)
- Accessibility needs (accommodations, barriers)

**Features:**
- Quick log buttons for fast entry when low on energy
- AI pattern detection (requires 7+ days of data)
- Export to PDF, CSV, JSON for doctors/lawyers
- Privacy-first - data stays on your device

**Find It:** Resources → Master Tracker Hub (Beta)

### What's the Appeal Command Center? (NEW November 2025)

**Everything you need to fight benefit/insurance denials:**

**Core Features:**
- **Deadline Tracker** - Color-coded by urgency (red: 7 days, orange: 30 days, blue: additional)
- **Denial Decoder** - AI translates insurance jargon to plain English
- **Evidence Strength Meter** - Rate your evidence (weak/moderate/strong)
- **Appeal Prep Guide** - Step-by-step walkthrough
- **Precedent Finder** - Coming soon: Search successful cases like yours

**Find It:** Resources → Appeal Command Center (Beta)

### What's the Offline Queue? (NEW November 2025)

**Upload evidence even without internet connection:**

- Works in airplane mode, rural areas, spotty WiFi
- Automatically retries with smart timing (1s → 60s exponential backoff)
- Network monitoring - auto-syncs when connection restored
- Manual retry buttons for failed uploads
- Pending count badge shows what's waiting
- Critical for court appearances and legal deadlines

**Find It:** Evidence Locker → Upload files while offline

### What's the Global SOS/Crisis Button? (NEW November 2025)

**Instant access to crisis resources from any screen:**

**Single Tap Opens:**
- Call 988 (Suicide & Crisis Lifeline)
- Crisis Text Line (text HOME to 741741)
- Safe Landing Page (breathing exercises, grounding)
- Emotional First Aid tools
- Quick Exit (escape to weather.com for safety)

**Triple Tap:**
- Emergency contact with location (requires setup in Settings)

**Why It Matters:** Disability crises are real. Instant help access can be life-saving.

### What's Complexity Mode? (NEW November 2025)

**Revolutionary simplification system for cognitive accessibility:**

**Three Modes:**
1. **Simple Mode (5 features)** - For bad days, flare-ups, brain fog
   - Evidence Locker, Letter Wizard (top 3 templates), Crisis Resources, Mood Tracker, Community
   - Reduces overwhelm by 97%

2. **Standard Mode (20 features)** - For most users most of the time
   - All Simple features + AI tools, wellness tracking, campaigns, events, profiles
   - Balanced power and simplicity

3. **Power User Mode (150+ features)** - Everything unlocked
   - Full access to advanced tools, beta features, experimental functionality

**Bad Day Mode:** One-tap emergency simplification (Settings → Complexity Mode)

**Impact:** 40% usability → 90% usability across the disability community

### What's the Resources vs Research split? (NEW November 2025)

**Clear separation eliminates confusion:**

**Resources Tab = In-App Interactive Tools**
- Master Tracker Hub
- Letter Wizard (22 templates)
- Appeal Command Center
- Evidence Manager
- NO external links - everything works within the app

**Research Tab = External Resources & Data**
- 96 external resources organized by category
- Province filter (AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT)
- Search functionality
- Clear "opens in browser" indicators
- Categories: Employment, Human Rights, Benefits, Workers' Comp, Crisis

### What's the Evidence Locker?

Your secure, encrypted document vault for storing:
- Photos of workplace incidents
- Medical documents
- Accommodation requests and responses
- Communication records
- Legal evidence

All files are encrypted with military-grade security (AES-256).

**NEW November 2025:** Offline queue - upload without internet, auto-syncs later

**[Learn how to use Evidence Locker →](/user-guide#evidence-locker)**

### What's the Letter Wizard?

Generate professional, legally-sound letters in minutes with **22 pre-built templates:**

- Workplace accommodation requests
- Disability benefit applications
- Human rights complaints
- Housing accessibility requests
- Legal demand letters
- Appeal letters
- And 16 more!

All templates auto-populate from your profile and include field validation.

**[See all letter templates →](/features#letter-wizard---22-professional-letter-templates)**

### Does 3mpwrApp provide medical advice?

**NO.** Our wellness tools (mood tracking, symptom logging, meditation, etc.) are for information and self-tracking only.

❌ We do NOT diagnose, treat, or prevent medical conditions  
❌ We are NOT a replacement for healthcare providers  
✅ Always consult qualified medical professionals for health decisions

**[Read medical disclaimer →](/legal/disclaimers/#1-medical-information-disclaimer)**

### Does 3mpwrApp provide legal advice?

**NO.** Our legal tools (letter templates, workflow automation, resources) are educational only.

❌ We do NOT create attorney-client relationships  
❌ We do NOT provide legal representation  
✅ Always consult licensed attorneys for legal matters

**[Read legal disclaimer →](/legal/disclaimers/#2-legal-information-disclaimer)**

### Does 3mpwrApp work offline?

**YES!** Core features work 100% offline:
- Evidence Locker
- Wellness tracking
- Letter generation
- Resources library
- Settings

**Requires internet:**
- Community features (chat, forums)
- Cloud sync (if you enable it)
- Campaign coordination
- Real-time updates

### Can I use 3mpwrApp without creating an account?

**YES!** Guest Mode lets you use core features without creating an account:

✅ Wellness tracking  
✅ Evidence Locker  
✅ Letter Wizard  
✅ Resources library  

❌ No community features  
❌ No cloud sync  
❌ No campaign coordination

**[Learn about Guest Mode →](/user-guide#getting-started)**

---

## Accessibility

### Is 3mpwrApp accessible?

**YES!** We aim for **WCAG 2.1 Level AAA compliance** (the highest accessibility standard).

Every feature is designed from the ground up to work for all disabilities and abilities.

**[See our Accessibility Statement →](/accessibility)**

### What accessibility features are included?

**Vision:**
- Screen reader optimization (TalkBack, VoiceOver)
- Adjustable text sizes (up to 200%)
- High contrast modes (3 options)
- Colorblind-friendly palettes (5 types)
- Large tap targets (minimum 44x44dp)

**Hearing:**
- Visual alerts for sounds
- Captions for all audio/video
- Text-based alternatives

**Motor/Dexterity:**
- Voice navigation
- Switch control support
- Reduced motion options
- No time limits on actions

**Cognitive:**
- Simple, clear language
- Consistent navigation
- Distraction-free mode
- Step-by-step wizards
- Progress indicators

**[See all accessibility features →](/accessibility-settings)**

### Does 3mpwrApp support Indigenous languages?

**YES!** We support **6 Indigenous languages** in beta:

- Plains Cree (ᓀᐦᐃᔭᐍᐏᐣ / nehiyawewin)
- Ojibwe (ᐊᓂᔑᓈᐯᒧᐎᐣ / Anishinaabemowin)
- Inuktitut (ᐃᓄᒃᑎᑐᑦ)
- Mi'kmaq (Mi'kmawi'simk)
- Mohawk (Kanien'kéha)
- Dene (Dënesųłiné)

We also support syllabics rendering, cultural protocols, and OCAP principles for Indigenous data sovereignty.

**[Learn about Indigenous language support →](/features#-indigenous-language-support-6-languages)**

### Can I customize accessibility settings?

**YES!** Settings → Accessibility lets you customize:

- Text size and font
- Color schemes and contrast
- Motion and animation
- Audio and visual alerts
- Voice navigation
- Keyboard shortcuts
- And much more!

**[Accessibility walkthrough →](/accessibility-walkthrough)**

---

## Beta Testing

### How do I join the beta?

**[Sign up for beta access →](https://forms.gle/46yVp37vfitfitLT9)**

We're accepting beta testers in waves during Phase 1 Closed Beta (October-December 2025).

### What do beta testers do?

Beta testers help us by:

1. **Using the app** in real-world situations
2. **Reporting bugs** when things don't work right
3. **Providing feedback** on features and usability
4. **Testing accessibility** with assistive technologies
5. **Suggesting improvements** based on your needs

### Do I need technical skills to be a beta tester?

**NO!** We need testers of all skill levels:

- First-time smartphone users
- Power users
- Assistive technology users
- Non-technical community members

Your perspective is valuable no matter your tech experience!

### What if I find a bug?

**Report it!** We have several ways to report issues:

1. **In-app:** Settings → Help & Support → Report a Bug
2. **Email:** [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
3. **Forms:** Use our bug report template

**[Bug report template →](/bug-report-template)**

### Will my beta feedback be confidential?

**YES.** All feedback, bug reports, and testing data is kept confidential. We never share individual tester information publicly.

### When does beta testing end?

**Phase 1 Closed Beta:** October - December 2025  
**Phase 2 Open Beta:** Q1 2026  
**Phase 3 Public Launch:** Q2 2026

**[See full roadmap →](/roadmap)**

---

## Troubleshooting

### The app won't open / keeps crashing

**Try these steps:**

1. **Force close the app** and reopen it
2. **Restart your device**
3. **Check for updates** in the App Store / Google Play
4. **Clear app cache** (Settings → Apps → 3mpwrApp → Clear Cache)
5. **Reinstall the app** (won't lose data if you have cloud backup enabled)

Still not working? [Contact support →](/contact)

### I can't log in

**Common solutions:**

- **Check your internet connection** - Login requires internet
- **Reset your password** - Tap "Forgot Password" on login screen
- **Check email for verification link** - May be in spam folder
- **Try a different login method** (email vs. Google vs. Apple)

**[Login troubleshooting guide →](/user-guide#troubleshooting)**

### My cloud sync isn't working

**Check these settings:**

1. **Internet connection** - Cloud sync requires internet
2. **Cloud provider credentials** - May need to re-authenticate
3. **Storage space** - Your cloud may be full
4. **Privacy mode** - Confirm correct mode is selected (Hybrid or Strict BYOC)

**[Cloud sync troubleshooting →](/privacy-controls/#choose-your-privacy-mode)**

### Features are missing / not showing up

**Possible reasons:**

- **Guest Mode** - Some features require an account
- **Beta limitations** - Some features coming in future phases
- **Privacy mode** - Strict BYOC mode disables some cloud features
- **Platform differences** - Some features iOS/Android only

**[See feature availability →](/features#-closed-beta-release)**

### The app is running slowly

**Try these steps:**

1. **Close other apps** to free up memory
2. **Clear app cache** (Settings → Apps → 3mpwrApp → Clear Cache)
3. **Restart your device**
4. **Check device storage** - Low storage slows performance
5. **Update to latest version**

### Screen reader isn't working properly

**Troubleshooting:**

1. **Enable screen reader** in device settings (TalkBack/VoiceOver)
2. **Check app permissions** - May need accessibility permissions
3. **Update the app** - We continuously improve screen reader support
4. **Report specific issues** - [Contact accessibility team →](/contact)

**[Accessibility troubleshooting →](/accessibility-walkthrough)**

---

## Legal & Disclaimers

### What are the main disclaimers I should know?

**5 Critical Disclaimers:**

1. ⚕️ **NOT Medical Advice** - Always consult healthcare professionals
2. ⚖️ **NOT Legal Advice** - Always consult licensed attorneys
3. 💰 **NOT Financial Advice** - Always consult financial advisors
4. 🤖 **AI May Contain Errors** - Verify all AI-generated content with professionals
5. 🆘 **NOT Emergency Services** - Call 911 in emergencies, not the app

**[Read all 10 comprehensive disclaimers →](/legal/disclaimers/)**

### What happens to my data if I delete my account?

**Permanent deletion within 30 days:**

- All account information deleted
- All app data deleted from our servers
- Cloud backups remain in YOUR cloud (you control deletion)
- Community posts anonymized (cannot be undone)

**[Data deletion policy →](/delete-account)**

### Can I use 3mpwrApp for legal cases?

You CAN use 3mpwrApp's **Evidence Locker** to organize documents and the **Letter Wizard** to draft letters, BUT:

❌ This does NOT replace a lawyer  
❌ This does NOT create attorney-client privilege  
✅ Always consult a licensed attorney for legal matters  
✅ Use the Lawyer Finder to connect with disability law specialists

**[Find legal resources →](/user-guide#legal-resources)**

### Is my Evidence Locker admissible in court?

**Possibly, but depends on your jurisdiction and case.**

The Evidence Locker:
- ✅ Provides timestamps
- ✅ Encrypts files securely
- ✅ Maintains chain of custody metadata
- ⚠️ May require authentication by lawyer
- ⚠️ Subject to court rules of evidence

**Always consult your attorney** about evidence admissibility.

### Is there a cost to use 3mpwrApp?

**No, 3mpwrApp is completely FREE.** There are no paid tiers, subscriptions, or in-app purchases. All features are free for everyone, forever. We're a community-funded project focused on disability empowerment, not profit.

**[See Terms of Service →](/terms/)**

### How do I report copyright violations?

Email [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) with:

- Description of copyrighted work
- URL/location of infringing content
- Your contact information
- Statement of good faith belief

**[DMCA policy →](/terms/#7-intellectual-property)**

---

## Still Have Questions?

### Contact Us

📧 **Email:** [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)

📱 **Social Media:**
- [Facebook](https://www.facebook.com/3mpowrapp)
- [X/Twitter](https://x.com/3mpowrApp0816)
- [Instagram](https://www.instagram.com/3mpowrapp/)

📖 **Resources:**
- [Complete User Guide](/user-guide) - Step-by-step tutorials
- [All Features](/features) - Full feature list
- [Beta Guide](/beta-guide) - Beta testing handbook
- [Roadmap](/roadmap) - What's coming next

---

<div class="alternative-formats">
  <p><strong>📄 Alternative Formats</strong></p>
  <p>
    <a href="/downloads/faq.pdf" class="format-link">📄 Download as PDF</a>
    <a href="javascript:window.print()" class="format-link">🖨️ Print-friendly version</a>
    <a href="mailto:?subject=3mpwrApp FAQ&body=Check out these FAQs: https://3mpwrapp.pages.dev/faq" class="format-link">📧 Email to yourself</a>
  </p>
</div>

<div class="crisis-resources" role="alert">
  <p><strong>🆘 Need immediate help?</strong></p>
  <p>24/7 Crisis Line: <a href="tel:1-833-456-4566">1-833-456-4566</a> | <a href="/crisis-resources">More resources →</a></p>
</div>


{%- include page-feedback.html -%}

**3mpwr App - Your voice, your power, your data.**

*Last Updated: November 23, 2025*

<link rel="stylesheet" href="/assets/css/faq.css">

<script src="/assets/js/faq.js" defer></script>
