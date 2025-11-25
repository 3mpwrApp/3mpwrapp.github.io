# 3mpwr App — Data Ownership and Security Statement

**Last updated:** November 24, 2025  
**Version: 2.0 (November 2025 Consolidation Update)**

## 🆕 **November 2025 Updates**

Our commitment to 100% user data ownership extends to all new November 2025 features:
- **Master Tracker Hub:** All 6 tracking tools (Symptom, Mood, Medication, Appointment, Activity, Energy) store data locally on your device
- **Appeal Command Center:** All legal case data, deadlines, and timelines remain on your device - no external transmission
- **4 Wellness Hubs:** Energy & Mood Hub, Mental Wellness Toolkit, Physical Wellness Hub, Pacing Partner AI - all data local-first
- **Offline Queue:** Queued actions stored locally, processed only when you're online and ready
- **Profile Data:** Bio, location, pronouns, accessibility needs - all optional and stored in your cloud or locally only
- **Campaign Submissions:** You explicitly choose what to submit to 3mpwr - nothing shared without your consent
- **Complexity Mode:** Your experience level and Bad Day Mode preferences stored locally only

**Privacy-First Architecture Maintained:** All November 2025 features follow the same local-first, user-owned data model.

---

## Our Commitment to 100% User Data Ownership

3mpwr App is built on the fundamental principle that **your data belongs entirely to you**. This statement outlines our unwavering commitment to user data sovereignty and privacy-by-design architecture.

---

## 1. 100% User Data Ownership

**All user information created or stored within 3mpwr App belongs entirely to the user.**

- The app does not collect, store, transmit, or access any user data on external servers, repositories, or developer systems
- **We control the app, users control their data — always**
- No user data is ever owned, claimed, or retained by 3mpwr App or its developers
- Users maintain complete sovereignty over all personal information, notes, preferences, and content

### Technical Implementation:
- Local-first architecture with AsyncStorage for device-only persistence
- BYOC (Bring Your Own Cloud) strict mode available for users who want 100% user-owned storage
- No default cloud storage or remote data collection
- All data persistence controlled by user choices and settings

---

## 2. Local-Only and Air-Gapped by Design

**3mpwr App is built for privacy. All activity, notes, and logs are processed directly on your device.**

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
- **No data passes through or is accessible by 3mpwr App or its developers**
- User authenticates directly with their chosen cloud provider
- App acts only as a client, never as an intermediary or data handler

### BYOC Strict Mode:
- When `EXPO_PUBLIC_DATA_POLICY=strict_byoc` is enabled, Firebase and all app-owned storage are completely disabled
- Users can connect ANY storage provider they want (WebDAV, Nextcloud, Google Drive, Dropbox, OneDrive, AWS S3, iCloud, or any other cloud service) for 100% user-owned storage
- Credentials are session-only and never persisted by the app
- All writes go directly to user's endpoint, bypassing any app infrastructure

---

## 4. No Tracking, Analytics, or Third-Party Access

**3mpwr App contains no embedded analytics, trackers, or third-party integrations that collect user information.**

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
- No 3mpwr App keys, backdoors, or access mechanisms to user data

### Current Encryption Features:
- Device AsyncStorage respects OS-level encryption settings
- Evidence Locker content encryption (future: Argon2id KDF + AES-GCM)
- HTTPS/TLS for any optional network communications
- No plaintext storage of sensitive information

---

## 6. Transparency and Open Development

**3mpwr App codebase contains no data-logging or remote storage functions.**

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

## Implementation in 3mpwr App

### Current Privacy Features:
- **Local-First Storage:** All data stored on-device by default (Master Tracker Hub, Appeal Command Center, Wellness Hubs, Offline Queue)
- **Guest Mode:** Full app functionality without any account creation
- **BYOC Strict Mode:** 100% user-owned storage option
- **Privacy Controls:** Granular opt-in for all network features, Campaign Submissions explicitly opt-in
- **Data Management:** Export, clear, and retention controls for all tracking data
- **Encryption:** Device-level and Evidence Locker content encryption
- **Offline-First:** Offline Queue ensures data integrity without forced cloud sync
- **Profile Privacy:** All profile fields optional, shared only if you enable community features
- **AI Processing:** Local AI tools (Gaslighting Detector, Negotiation Coach, AI Case Interpreter) process on-device only

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
- **Privacy Questions:** Contact us at empowrapp08162025@gmail.com
- **Security Concerns:** Report via our transparent disclosure process
- **Third-Party Audit:** We welcome independent security and privacy audits

### Verification Checklist:
- [ ] Confirm BYOC strict mode operation
- [ ] Verify no default cloud storage initialization
- [ ] Review data governance documentation
- [ ] Inspect network call patterns
- [ ] Validate local-only data flows

---

## Our Promise

**3mpwr App will never:**
- Sell, rent, or share your personal data
- Store your data on servers you don't control
- Access your data without explicit permission
- Hide data collection or tracking from users
- Implement backdoors or unauthorized access methods

**3mpwr App will always:**
- Respect your complete data ownership
- Provide transparent privacy controls
- Maintain local-first, privacy-by-design architecture
- Give you full control over your information
- Enable you to verify our privacy claims

---

*This statement represents our core commitment to user data sovereignty. For detailed technical implementation, see our [Data Governance documentation](../DATA_GOVERNANCE.md) and [BYOC Policy](../BYOC_POLICY.md).*