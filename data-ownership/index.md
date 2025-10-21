---
layout: default
title: Data Ownership Statement
permalink: /data-ownership/
description: Our unwavering commitment to 100% user data ownership and sovereignty.
---

# 3mpwrApp — Data Ownership and Security Statement

**Last updated:** October 20, 2025

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
- Local-first architecture with AsyncStorage for device-only persistence
- BYOC (Bring Your Own Cloud) strict mode available for users who want 100% user-owned storage
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
- Settings and preferences stored in AsyncStorage (device-only)
- Wellness data and tracking kept in local context stores
- Analytics and telemetry disabled by default (opt-in only)

---

## 3. User Cloud, User Control

**If you enable backup or sync features, you connect only to your chosen storage service.**

- Backup/sync connects to user's own services: ANY cloud provider you want (Google Drive, iCloud, WebDAV, Nextcloud, Dropbox, OneDrive, AWS S3, Azure Storage, or any other service)
- **No data passes through or is accessible by 3mpwrApp or its developers**
- User authenticates directly with their chosen cloud provider
- App acts only as a client, never as an intermediary or data handler

### BYOC Strict Mode:
- When `EXPO_PUBLIC_DATA_POLICY=strict_byoc` is enabled, Firebase and all app-owned storage are completely disabled
- Users can connect ANY storage provider they want (WebDAV, Nextcloud, Google Drive, Dropbox, OneDrive, AWS S3, iCloud, or any other cloud service) for 100% user-owned storage
- Credentials are session-only and never persisted by the app
- All writes go directly to user's endpoint, bypassing any app infrastructure

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
- Device AsyncStorage respects OS-level encryption settings
- Evidence Locker content encryption (Argon2id KDF + AES-GCM)
- HTTPS/TLS for any optional network communications
- No plaintext storage of sensitive information

---

## 6. Transparency and Open Development

**3mpwrApp codebase contains no data-logging or remote storage functions.**

- **Users and developers may inspect or verify this behavior at any time**
- Open development process with transparent privacy implementations
- All data handling code is auditable and verifiable
- Privacy-by-design architecture documented and maintained

### Technical Verification Methods:
1. **Build Inspection:** Check that `EXPO_PUBLIC_DATA_POLICY=strict_byoc` disables Firebase completely
2. **Runtime Verification:** Confirm `require('firebase/config').db === null` in strict mode
3. **Network Monitoring:** Verify only user-chosen endpoints are contacted for storage
4. **Code Audit:** Review `services/firestore.ts`, `services/storageProviders.ts`, and data governance implementations

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

*This statement represents our core commitment to user data sovereignty. Your privacy and data ownership are not just promises—they're technically guaranteed by our architecture.*

**Version:** 1.0  
**Effective:** October 20, 2025
