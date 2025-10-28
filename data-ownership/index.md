---
layout: default
title: Data Ownership Statement
permalink: /data-ownership/
description: Our unwavering commitment to 100% user data ownership and sovereignty.
---

<div class="status-banner" role="status" aria-live="polite">
  <span class="status-indicator">✅</span> App Status: Phase 1 Beta - Now Accepting Signups | Website live | Daily updates
</div>

# 3mpwrApp — Data Ownership and Security Statement

**Last updated:** October 25, 2025

📖 **8 minute read** | ⚡ Quick summary below

<details class="tldr-box" open>
  <summary>⚡ Quick Summary (30 seconds)</summary>
  <ul>
    <li><strong>100% Ownership:</strong> Your data belongs entirely to YOU - not us, not anyone else</li>
    <li><strong>Local-First:</strong> Everything stays on YOUR device by default</li>
    <li><strong>We Can't See It:</strong> We don't collect, store, or access your data - ever</li>
    <li><strong>BYOC Options:</strong> Choose your own cloud storage if you want backup</li>
    <li><strong>Military Encryption:</strong> AES-256 encryption protects your data</li>
    <li><strong>Delete Anytime:</strong> Full control to export or delete everything instantly</li>
  </ul>
</details>

## Our Commitment to 100% User Data Ownership

3mpwrApp is built on the fundamental principle that **your data belongs entirely to you**. This statement outlines our unwavering commitment to user data sovereignty and privacy-by-design architecture.

---

## 1. 100% User Data Ownership

**All user information created or stored within 3mpwrApp belongs entirely to the user.**

- The app does not collect, store, transmit, or access any user data on external servers, repositories, or developer systems
- **We control the app, users control their data — always**
- No user data is ever owned, claimed, or retained by 3mpwrApp or its developers
- Users maintain complete sovereignty over all personal information, notes, preferences, and content

### Technical Implementation:
- **Local-first architecture** - Your data stays on your device first, always
- **Device storage** - Uses secure local storage built into your phone/tablet
- **BYOC (Bring Your Own Cloud)** modes available - Choose your preferred privacy level
- No default cloud storage or remote data collection
- All data persistence controlled by user choices and settings

---

## 2. Local-Only and Air-Gapped by Design

**3mpwrApp is built for privacy. All activity, notes, and logs are processed directly on your device.**

- Data remains in user possession unless user chooses to back it up or sync it to their own cloud or storage environment
- Evidence Locker, wellness tracking, and personal notes are stored exclusively on-device
- AI coaching and processing happens locally without external server dependencies
- No automatic uploads, syncing, or external data transmission

### Technical Verification:
- Evidence Locker uses encrypted local storage only
- Settings and preferences stored on your device only (never sent anywhere)
- Wellness data and tracking kept in local storage on your device
- Analytics and telemetry disabled by default (opt-in only)

---

## 3. User Cloud, User Control — Three Privacy Modes

**You choose how 3mpwrApp handles your data with three privacy modes:**

### 🔵 **Default Mode** (Easiest)
- Your data stays on your device by default
- Optional backup to Firebase (our secure cloud) if you want
- Easy login with email, Google, or Apple
- **Best for:** Most users who want convenience + privacy

### 🟢 **Hybrid BYOC Mode** (Best of Both Worlds) ⭐ **RECOMMENDED**
- **Easy login:** Use email, Google, or Apple to sign in (handled by Firebase)
- **Your data, your cloud:** ALL your data goes to YOUR chosen cloud storage (not ours!)
- **Zero data on our servers:** We only handle your login, never your content
- **Best for:** Users who want easy login BUT 100% control of their data

**What this means:** You get the convenience of easy sign-in, but 3mpwrApp never sees or stores your posts, evidence, wellness data, or anything personal. It all goes directly to YOUR cloud (Google Drive, Dropbox, Nextcloud, iCloud, OneDrive, etc.).

### 🟣 **Strict BYOC Mode** (Maximum Privacy)
- **Complete air-gap:** Firebase completely disabled (no Firebase at all)
- **100% user-owned storage:** Connect ANY cloud provider you want
- **Session-only credentials:** Your cloud password never saved by the app
- **Best for:** Maximum privacy advocates, healthcare settings, sensitive legal work

**What this means:** The app becomes a tool on your device that only talks to YOUR cloud. No Firebase, no third-party services at all.

---

### How to Choose Your Mode

| Mode | Login Method | Data Storage | Our Access | Best For |
|------|-------------|--------------|------------|----------|
| **Default** | Firebase | Device + Optional Firebase | Only if you enable backup | Most users |
| **Hybrid BYOC** ⭐ | Firebase | YOUR cloud only | Never (auth only) | Privacy + Convenience |
| **Strict BYOC** | Custom/None | YOUR cloud only | Never | Maximum privacy |

**Note:** Backup/sync connects to user's own services: ANY cloud provider you want (Google Drive, iCloud, WebDAV, Nextcloud, Dropbox, OneDrive, AWS S3, Azure Storage, or any other service). No data passes through or is accessible by 3mpwrApp or its developers.

---

## 4. No Tracking, Analytics, or Third-Party Access

**3mpwrApp contains no embedded analytics, trackers, or third-party integrations that collect user information.**

- No hidden network calls or telemetry
- No embedded tracking pixels, analytics frameworks, or data collection SDKs
- No advertising networks, social media trackers, or marketing tools
- No fingerprinting, device profiling, or behavioral analysis

### Optional Features (User-Controlled):
- Analytics: Completely disabled by default, explicit opt-in required
- Error reporting: Optional crash reports with user consent only
- Community features: Requires explicit cloud features toggle activation
- Push notifications: Opt-in only, uses minimal device token for delivery

---

## 5. Encryption and Privacy

**All user local data can be encrypted using your device security settings.**

- Device-level encryption supported through OS security features
- Evidence Locker implements additional content encryption for sensitive documents
- When connected to user's own cloud, encryption and authentication handled entirely by user's chosen provider
- No 3mpwrApp keys, backdoors, or access mechanisms to user data

### Current Encryption Features:
- Device storage respects your phone's built-in encryption settings
- Evidence Locker uses **military-grade encryption** (bank-level security)
- Secure HTTPS connections for any optional cloud sync
- No storage of sensitive information in readable plain text

---

## 6. Transparency and Open Development

**3mpwrApp codebase contains no data-logging or remote storage functions.**

- **Users and developers may inspect or verify this behavior at any time**
- Open development process with transparent privacy implementations
- All data handling code is auditable and verifiable
- Privacy-by-design architecture documented and maintained

### Technical Verification Methods:
1. **Build Inspection:** Verify Strict Privacy Mode completely disables Firebase
2. **Runtime Verification:** Confirm no Firebase database connection in strict mode
3. **Network Monitoring:** Verify only your chosen cloud storage is contacted
4. **Code Audit:** Review our open-source storage and data governance code

**For developers:** Check that `EXPO_PUBLIC_DATA_POLICY=strict_byoc` disables Firebase, confirm `require('firebase/config').db === null` in strict mode, and review `services/firestore.ts` and `services/storageProviders.ts`.

---

## Implementation in 3mpwrApp

### Current Privacy Features:
- **Local-First Storage:** All data stored on-device by default
- **Guest Mode:** Full app functionality without any account creation
- **BYOC Strict Mode:** 100% user-owned storage option
- **Privacy Controls:** Granular opt-in for all network features
- **Data Management:** Export, clear, and retention controls
- **Encryption:** Device-level and Evidence Locker content encryption

### Privacy Settings Location:
- Navigate to **Settings → Privacy & Security**
- Access **Data Management** tools
- Configure **Cloud Features** (disabled by default)
- Enable **BYOC Strict Mode** for ultimate privacy
- Review **Data Ownership Statement** (this document)

### User Rights and Controls:
- **Export:** Full data export in JSON format
- **Clear:** Complete local data deletion
- **Opt-out:** Disable all analytics and telemetry
- **Cloud Toggle:** Enable/disable optional cloud features
- **BYOC Configuration:** Connect your own storage endpoints

---

## Compliance and Verification

### Standards Alignment:
- **GDPR:** Data minimization, user control, explicit consent
- **PIPEDA:** Privacy-by-design, user ownership, transparency
- **CCPA:** User rights, data portability, deletion rights

### Regular Audits:
- Monthly privacy implementation reviews
- Quarterly data governance assessments
- Annual security and privacy audits
- Community-driven transparency reports

---

## Contact and Verification

For questions about data ownership or to verify these claims:

- **Technical Verification:** Inspect the open-source codebase
- **Privacy Questions:** Contact us at [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- **Security Concerns:** Report via our transparent disclosure process
- **Third-Party Audit:** We welcome independent security and privacy audits

### Verification Checklist:
- ✅ Confirm BYOC strict mode operation
- ✅ Verify no default cloud storage initialization
- ✅ Review data governance documentation
- ✅ Inspect network call patterns
- ✅ Validate local-only data flows

---

## Our Promise

**3mpwrApp will never:**
- ❌ Sell, rent, or share your personal data
- ❌ Store your data on servers you don't control
- ❌ Access your data without explicit permission
- ❌ Hide data collection or tracking from users
- ❌ Implement backdoors or unauthorized access methods

**3mpwrApp will always:**
- ✅ Respect your complete data ownership
- ✅ Provide transparent privacy controls
- ✅ Maintain local-first, privacy-by-design architecture
- ✅ Give you full control over your information
- ✅ Enable you to verify our privacy claims

---

## Related Documents

- [Privacy Policy](/privacy/) - Our comprehensive privacy policy
- [Terms of Service](/terms/) - Terms and conditions for using our services
- [Accessibility](/accessibility/) - Our accessibility features and compliance
- [Features](/features/) - Complete feature list with privacy details

---

<div class="alternative-formats">
  <p><strong>📄 Alternative Formats</strong></p>
  <p>
        <!-- PDF download removed - generate if needed -->
  </div>
    <a href="javascript:window.print()" class="format-link">🖨️ Print-friendly version</a>
    <a href="mailto:?subject=3mpwrApp Data Ownership Statement&body=Read about data ownership: https://3mpwrapp.pages.dev/data-ownership" class="format-link">📧 Email to yourself</a>
  </p>
</div>

<div class="crisis-resources" role="alert">
  <p><strong>🆘 Need immediate help?</strong></p>
  <p>24/7 Crisis Line: <a href="tel:1-833-456-4566">1-833-456-4566</a> | <a href="/crisis-resources">More resources →</a></p>
</div>

<div class="page-feedback">
  <p><strong>Was this statement helpful?</strong></p>
  <a href="/feedback?page=data-ownership&helpful=yes" class="feedback-btn feedback-yes">👍 Yes, very helpful</a>
  <a href="/feedback?page=data-ownership&helpful=no" class="feedback-btn feedback-no">👎 Needs improvement</a>
  <a href="/feedback?page=data-ownership&type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
  <p class="page-meta">Last updated: October 25, 2025 | Next review: December 2025</p>
</div>

*This statement represents our core commitment to user data sovereignty. Your privacy and data ownership are not just promises—they're technically guaranteed by our architecture.*

**Version:** 2.0
**Effective:** October 25, 2025