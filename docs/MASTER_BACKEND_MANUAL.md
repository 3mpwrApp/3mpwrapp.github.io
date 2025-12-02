# 3mpwr App - Master Technical & Operations Manual
**Version:** 1.0.0  
**Last Updated:** December 2, 2025  
**Classification:** Internal Operations Document  
**Contact:** empowrapp08162025@gmail.com

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Infrastructure & Services](#3-infrastructure--services)
4. [Admin Operations](#4-admin-operations)
5. [Security Framework](#5-security-framework)
6. [Data Governance](#6-data-governance)
7. [Legal & Compliance](#7-legal--compliance)
8. [Financial Overview](#8-financial-overview)
9. [Roadmap & Future Development](#9-roadmap--future-development)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

### Project Overview
**3mpwr App** is a comprehensive accessibility-first platform for people with disabilities, injured workers, and their supporters. Built with React Native/Expo, it provides tools for advocacy, wellness tracking, community connection, and resource navigation.

### Key Metrics
| Metric | Status |
|--------|--------|
| Codebase Readiness | 99/100 |
| WCAG Compliance | AAA Target (90%+) |
| Feature Count | 60+ |
| Test Coverage | 512 tests passing |
| Languages | English (French planned) |
| Platforms | iOS, Android, Web |

### Mission Statement
*To empower people with disabilities through accessible technology, mutual aid, and advocacy tools that preserve dignity, autonomy, and community connection.*

---

## 2. Technical Architecture

### Stack Overview
```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  React Native 0.76.x + Expo SDK 52                      │
│  TypeScript (Strict Mode) + Expo Router (File-Based)    │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                      │
│  React Context + Zustand + AsyncStorage                  │
│  BYOC (Bring Your Own Cloud) for User Data              │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                      │
│  Firebase (Auth, Firestore, Storage, FCM)               │
│  Cloudflare Workers (Events, Campaigns, Calendar APIs)  │
│  Optional: LLM Backend for AI Features                  │
└─────────────────────────────────────────────────────────┘
```

### Key Technologies
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native | 0.76.x |
| Platform | Expo SDK | 52 |
| Language | TypeScript | 5.3+ |
| Navigation | Expo Router | 4.x |
| State | Context + Zustand | Latest |
| Storage | AsyncStorage + SecureStore | Latest |
| Auth | Firebase Auth | 10.x |
| Database | Firestore | 10.x |
| Hosting | Cloudflare Pages/Workers | Latest |

### Repository Structure
```
empowrapp/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/            # Main tab navigator
│   │   ├── index.tsx      # Home
│   │   ├── campaigns.tsx  # Campaigns
│   │   ├── community/     # Community (nested routes)
│   │   ├── events/        # Events
│   │   ├── wellness/      # Wellness (nested routes)
│   │   ├── resources/     # Resources
│   │   ├── research/      # Research
│   │   └── settings/      # Settings (nested routes)
│   └── advocacy/          # Advocacy tools
├── components/            # Reusable UI components
├── context/              # React Context providers
├── data/                 # Local/seed data
├── firebase/             # Firebase configuration
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
├── locales/              # Translation files
├── services/             # Business logic & APIs
├── store/                # State management
├── theme/                # Colors, typography, shadows
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── docs/                 # Documentation
```

### Build Configuration

**Development:**
```bash
npx expo start           # Start development server
npm run lint             # Run ESLint
npm test                 # Run Jest tests
```

**EAS Build Profiles (eas.json):**
| Profile | Channel | Purpose |
|---------|---------|---------|
| development | development | Dev client with debugger |
| preview | preview | Internal testing APKs |
| production | production | Store releases |

---

## 3. Infrastructure & Services

### Firebase Configuration
**Project ID:** empowrapp

| Service | Status | Purpose |
|---------|--------|---------|
| Authentication | ✅ Active | Email/password, anonymous auth |
| Firestore | ✅ Active | Community, events, campaigns |
| Cloud Storage | ✅ Active | Evidence locker files |
| Cloud Messaging | ✅ Active | Push notifications |
| Cloud Functions | ✅ Deployed | Admin operations |

**Firestore Collections:**
| Collection | Purpose | BYOC Mode |
|------------|---------|-----------|
| events_production | Published events | Public (always available) |
| events_preview | Preview/testing events | Public (always available) |
| campaigns | Active campaigns | Public (always available) |
| community_threads | Forum threads | Requires auth |
| user_private/{uid} | User's private data | BYOC controlled |

### Cloudflare Workers
| Worker | URL | Purpose |
|--------|-----|---------|
| Events Calendar | 3mpwrapp-calendar.empowrapp08162025.workers.dev | Calendar subscription (webcal://) |
| Campaigns | empowrapp-campaigns.empowrapp08162025.workers.dev | Campaign API |
| Website | 3mpwrapp.pages.dev | Landing page, docs |

### Cost Structure (Monthly)

| Service | Free Tier | Paid (1K users) | Paid (10K users) |
|---------|-----------|-----------------|------------------|
| Expo | $0 | $29 | $29 |
| Firebase | $0 | $35 | $200 |
| Cloudflare | $0 | $0 | $5 |
| Sentry | $0 | $0 | $26 |
| **Total** | **$0** | **$64** | **$260** |

---

## 4. Admin Operations

### Admin Access Control
**Current Admin:** empowrapp08162025@gmail.com

**Granting Admin Access:**
```bash
# Via npm script
npm run admin:set -- <user-uid>

# Via Firebase Console
# Users → Select User → Custom Claims → {"admin": true}
```

### Admin Panel Features
Access via: Settings → Admin Panel

| Feature | Description |
|---------|-------------|
| Dashboard | User count, campaign count, activity metrics |
| Audit Log | All admin actions with timestamps |
| Broadcast | Send platform-wide announcements |
| User Management | View/manage user accounts |
| Content Moderation | Review flagged content |

### Admin Scripts
Located in `/scripts/`:

| Script | Purpose |
|--------|---------|
| admin-cli.mjs | Set admin claims |
| push-all.mjs | Send push to all users |
| send-expo-push.mjs | Test push notifications |
| restore-firestore.mjs | Restore Firestore backup |

### Firestore Rules Deployment
```bash
npm run rules:deploy    # Deploy firestore.rules
```

---

## 5. Security Framework

### Security Principles
1. **Zero Trust Architecture** - No implicit trust in any component
2. **Air-Gapped by Default** - Local processing, optional cloud
3. **Defense in Depth** - Multiple security layers
4. **User Data Sovereignty** - Users own their data

### Data Protection

| Layer | Implementation |
|-------|----------------|
| Encryption at Rest | AES-256-GCM (device keystore) |
| Encryption in Transit | TLS 1.3 |
| Authentication | Firebase Auth + Custom Claims |
| Authorization | Firestore Security Rules |
| Input Validation | Schema validation + sanitization |

### BYOC (Bring Your Own Cloud) Mode
Users can choose where their private data is stored:

| Mode | Description |
|------|-------------|
| Default | Uses 3mpwr's Firebase (demo project) |
| Hybrid | Auth via 3mpwr, data in user's cloud |
| Strict | All data in user's cloud (no 3mpwr services) |

**Supported BYOC Backends:**
- Google Drive
- Nextcloud (WebDAV)
- iCloud
- Any WebDAV-compatible server

### Privacy Controls
Users can in Settings → Privacy:
- Export all data (JSON)
- Delete all data
- Opt out of analytics
- Disable crash reporting
- Control search history

---

## 6. Data Governance

### Data Categories

| Category | Storage | User Control | BYOC |
|----------|---------|--------------|------|
| Evidence Locker | Local + optional cloud | Full | Yes |
| Mood/Wellness | Local | Full | Yes |
| Community Posts | Firestore | Edit/Delete | No |
| Events (created) | Firestore | Edit/Delete | No |
| Profile | Local + Firestore | Full | Partial |

### Data Retention
- **Local data:** Persists until user deletes
- **Firestore data:** Retained per user request
- **Analytics:** Aggregated only, no PII
- **Crash reports:** 30-day retention (opt-in)

### Backup & Recovery
- **Manual export:** Settings → Privacy → Export Data
- **Automatic backup:** To user's connected cloud (BYOC)
- **Firestore backup:** Admin can restore from JSON

---

## 7. Legal & Compliance

### Legal Documents
| Document | Location | Status |
|----------|----------|--------|
| Terms of Service | docs/release-prep/legal/ | ✅ Complete |
| Privacy Policy | docs/release-prep/legal/ | ✅ Complete |
| Mission Statement | docs/legal/MISSION_STATEMENT.md | ✅ Complete |
| IP Assignment | docs/legal/IP_ASSIGNMENT_AGREEMENT.md | ✅ Template |

### Compliance Requirements

| Standard | Status | Notes |
|----------|--------|-------|
| WCAG 2.2 AAA | 90% | Target achieved |
| PIPEDA (Canada) | ✅ Compliant | Privacy controls implemented |
| CASL (Canada) | ✅ Compliant | Opt-in for all communications |
| GDPR (EU) | ✅ Prepared | Data export/delete ready |
| CCPA (California) | ✅ Prepared | Disclosure ready |

### App Store Requirements

**Google Play:**
- Data safety form: Completed
- Content rating: Everyone
- Permissions: Minimal (storage, camera, microphone optional)

**Apple App Store:**
- App privacy nutrition labels: Ready
- Review guidelines: Compliant
- Age rating: 4+

---

## 8. Financial Overview

### Current Financial Status
| Item | Status |
|------|--------|
| Operating Costs | $0/month (free tier) |
| One-Time Costs | $124 USD (App Store fees) |
| Projected Year 1 | ~$1,200 CAD total |

### Revenue Model
**"Always Free for Those Who Need It"**

| Source | Target (Year 1) | Target (Year 3) |
|--------|-----------------|-----------------|
| Grants | $25,000 | $200,000 |
| Individual Supporters | $3,000 | $120,000 |
| Organizational Partners | $0 | $120,000 |
| **Total** | **$28,000** | **$440,000** |

### Grant Targets
| Grant | Amount | Deadline |
|-------|--------|----------|
| Accessible Canada Act Fund | $50k-$200k | Q1 2026 |
| Ontario Trillium Foundation | $75k-$150k | Rolling |
| ESDC Social Development | $50k-$500k | Annual |

### Mutual Aid Fund (Future)
**Planned allocation:** 40% of net profit → direct user grants
- Emergency grants: $200-$2,000
- Spoon Bank micro-grants: $50-$500
- Advocacy support: $500-$5,000

---

## 9. Roadmap & Future Development

### Phase 1: Beta Launch (Current - Q1 2026)
- [x] Core features complete
- [x] WCAG AAA compliance
- [x] Closed beta testing
- [ ] Apple App Store submission
- [ ] Google Play Store submission
- [ ] Public beta launch

### Phase 2: Growth (Q2-Q4 2026)
- [ ] French localization
- [ ] 1,000 active users
- [ ] First grant secured
- [ ] Organizational pilots

### Phase 3: Scale (2027)
- [ ] 10,000 active users
- [ ] Mutual Aid Fund launch
- [ ] Indigenous language support
- [ ] API for third-party integrations

### Feature Roadmap

| Feature | Status | Target |
|---------|--------|--------|
| Voice-First Mode UI | Service ready | Q2 2026 |
| Gaslighting Detector UI | Service ready | Q1 2026 |
| Spoon Marketplace | Service ready | Q3 2026 |
| Impact Score Sharing | Complete | Released |
| Accountability Network | Complete | Released |

### Technical Debt Priorities
1. ~~TypeScript strict mode migration~~ ✅
2. ~~Deprecation warnings cleanup~~ ✅
3. Performance optimization (ongoing)
4. Test coverage expansion
5. Documentation consolidation

---

## 10. Appendices

### A. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| EXPO_PUBLIC_YT_API_KEY | YouTube API | Optional |
| EXPO_PUBLIC_LLM_BASE | AI backend URL | Optional |
| EXPO_PUBLIC_ADVOCATE_API | Advocate directory | Optional |
| EXPO_PUBLIC_DATA_POLICY | BYOC mode setting | Optional |
| EXPO_PUBLIC_SENTRY_DSN | Error reporting | Optional |

### B. Key Contacts

| Role | Contact |
|------|---------|
| Project Lead | empowrapp08162025@gmail.com |
| GitHub | github.com/3mpwrApp |
| Website | 3mpwrapp.pages.dev |

### C. Emergency Procedures

**If Firebase goes down:**
1. App continues working offline
2. Users see cached data
3. Sync resumes when restored

**If app store removal:**
1. Sideloading available for Android
2. Web version at 3mpwrapp.pages.dev
3. OTA updates via Expo

**If security breach:**
1. Revoke affected tokens
2. Rotate Firebase keys
3. Push emergency update
4. Notify affected users

### D. Quick Commands Reference

```bash
# Development
npm install                    # Install dependencies
npx expo start                 # Start dev server
npm run lint                   # Run linter
npm test                       # Run tests

# Building
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform all --profile production

# Deployment
eas update --channel production  # OTA update
npm run rules:deploy             # Firestore rules

# Admin
npm run admin:set -- <uid>       # Grant admin
node scripts/push-all.mjs        # Send push notification
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Dec 2, 2025 | System | Initial consolidation |

---

*This document consolidates information from: ADMIN.md, FINANCIAL_OVERVIEW.md, ROADMAP.md, SECURITY_ARCHITECTURE.md, and various technical documentation.*

*For user-facing documentation, see: user-guide.md*  
*For demo guidance, see: DEMO_PRESENTATION_WALKTHROUGH.md*
