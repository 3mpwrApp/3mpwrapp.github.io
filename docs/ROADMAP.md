# 3mpwr App Feature Roadmap

This roadmap tracks feature development for the 3mpwr App, organized by implementation status.

## ✅ Implemented Features (November 2024)

### 1. Daily Win Micro-Celebrations
**Status:** Complete  
**Files:** `services/celebrations.ts`, `components/CelebrationToast.tsx`

Instant gratification system that celebrates small wins:
- 15 celebration triggers (mood streaks, first-time achievements, pacing milestones)
- Animated toast with confetti effect
- Haptic feedback for tactile reward
- Points system (5-100 points per achievement)
- AsyncStorage persistence for offline tracking

**Integration:** Hooks into mood logging, pacing, evidence uploads, letter sending, DBT skills

---

### 2. Impact Score Dashboard
**Status:** Complete  
**Files:** `services/impactScore.ts`, `app/(tabs)/settings/impact-dashboard.tsx`

Gamification system that quantifies advocacy impact:
- 8-level progression system (Getting Started → Movement Builder)
- Point calculation: letters=10pts, appeals=100pts, benefits=$100/year=1pt
- Shareable impact card for social media
- Tracks 12 metrics (letters sent, appeals won, benefits secured, community helped, etc.)
- Auto-sync from existing data sources

**Integration:** Links to mood, pacing, evidence locker, advocacy letters

---

### 3. Accountability Network MVP
**Status:** Complete  
**Files:** `services/accountabilityNetwork.ts`, `app/advocacy/accountability-network/index.tsx`

Crowdsourced review system (Glassdoor for disability):
- 5 entity types: employers, insurers, lawyers, medical providers, government agencies
- 8 issue types: accommodation refusal, benefit denial, discrimination, etc.
- Star ratings (1-5) + success rate tracking
- Entity summary generation with network-wide statistics
- Search, filter, and top-rated queries

**Integration:** Evidence locker (attach proof), community (discuss entities)

---

### 4. Medical Gaslighting Detector
**Status:** Service Complete, UI Pending  
**Files:** `services/medicalGaslighting.ts`

Privacy-preserving analysis of medical notes:
- 6 pattern databases: dismissive, minimization, blame, invalidation, appropriate, supportive
- Regex-based pattern matching (local processing only)
- 0-100 gaslighting score with risk levels (low/moderate/high)
- Multi-note comparison for trend detection
- Provider comparison functionality

**Integration:** Evidence locker (save analysis), community (share patterns anonymously)

**TODO:**
- Create analyzer UI screen
- Add results visualization with pattern highlighting
- Integrate with evidence locker auto-save

---

### 5. Voice-First Mode Basics
**Status:** Service Complete, UI Pending  
**Files:** `services/voiceFirst.ts`

Hands-free navigation and data entry:
- 7 navigation voice commands ("open mood check", "show campaigns", etc.)
- Natural language parsing for mood entry ("I'm feeling anxious")
- Natural language parsing for pacing entry ("I'm at 60% energy")
- expo-speech integration for text-to-speech feedback

**Integration:** Mood check, pacing, wellness screens

**TODO:**
- Create voice button UI component
- Add listening indicator animation
- Build command suggestions overlay
- Create voice tutorial screen

---

### 6. Spoon Theory Marketplace
**Status:** Service Complete, UI Pending  
**Files:** `services/spoonMarketplace.ts`

Community marketplace for trading energy and help:
- Post offers: "High energy today, can help with research"
- Post requests: "Need help proofreading appeal letter"
- Energy coins (spoons) as currency
- Smart matching algorithm (type, skills, urgency, energy cost)
- Reputation system (0-100)
- Leaderboard of top helpers

**Integration:** Community tab, pacing (suggest offers on high-energy days)

**TODO:**
- Create marketplace browse screen
- Build offer/request posting forms
- Add "Request Help" quick action buttons throughout app
- Create reputation badges

---

### 7. AI Co-Pilot Proactive Mode
**Status:** Service Complete, UI Pending  
**Files:** `services/copilotProactive.ts`

Behavioral AI that suggests next steps automatically:
- Behavior logging system (tracks 1000 recent events)
- 6 suggestion types: mood-log, pacing-break, evidence-capture, appeal-deadline, community-checkin, wellness-tip
- Pattern detection (e.g., lots of activity without break)
- Smart workflow automation (e.g., after winning appeal → suggest sharing + updating impact score)
- Quiet hours and notification preferences

**Integration:** All screens (watches behavior app-wide)

**TODO:**
- Create suggestion notification component
- Build preferences screen
- Add "Why this suggestion?" explainer
- Create dismissal/snooze controls

---

### 8. Accommodation Negotiation Coach
**Status:** Service Complete, UI Pending  
**Files:** `services/negotiationCoach.ts`

Real-time guidance during accommodation meetings:
- **Prep phase:** Opening scripts, reframe templates, red flag warnings, evidence checklist
- **Live phase:** Meeting recording (where legal), live note-taking, contextual coaching responses
- **Debrief phase:** Follow-up email generator, outcome tracking, evidence locker integration
- 4 session types: accommodation request, appeal hearing, disability disclosure, performance review
- Script template library (respond to pushback, escalate denial, request interim accommodation)

**Integration:** Evidence locker (save recording/notes), community (share outcomes)

**TODO:**
- Create session start wizard
- Build live coach UI with floating notes button
- Add script quick-copy buttons
- Create debrief review screen
- Build follow-up email generator UI

---

## 🗺️ Future Roadmap (Tier 2-5)

### Tier 2: Differentiation (3-6 months)
- **Symptom-Specific Advocacy Playbooks:** Chronic pain, ADHD, PTSD, etc. with tailored strategies
- **Interactive Denial Pattern Library:** Search/filter prior denials to predict outcomes
- **Energy Prediction:** ML model predicts tomorrow's energy based on today's activity
- **Benefits Stacking Calculator:** Maximize income across SSI, SSDI, state programs, etc.
- **Community Crowdsourced Templates:** User-submitted letter templates with success rates
- **Crisis Mode UI:** Simplified interface with 3 giant buttons during flare-ups

### Tier 3: Sustainability (6-12 months)
- **Advocate Directory:** Vetted lawyers, peer advocates, disability consultants
- **Group Advocacy Campaigns:** Organize collective actions (e.g., petition for policy change)
- **DBT Skills Library:** In-app modules teaching Dialectical Behavior Therapy
- **Workplace Accommodation Success Score:** Predict approval likelihood before requesting
- **Anonymous Employer Reviews:** Disability-friendly workplace ratings
- **Telemedicine Integration:** Book appointments with disability-competent providers

### Tier 4: Monetization (12-18 months)
- **Premium AI Legal Review:** $9.99/month for letter critiques
- **Priority Evidence Cloud Storage:** $4.99/month for 50GB secure storage
- **1-on-1 Peer Advocate Matching:** $29/session for video calls
- **Expert Webinars:** $19.99 for recorded strategy sessions
- **Employer Partnerships:** B2B licensing for HR teams
- **Affiliate Commissions:** Assistive tech, therapy services referrals

### Tier 5: Long-Term Vision (18+ months)
- **State/Federal API Integration:** Auto-check benefits eligibility
- **Clinical Trial Matching:** Connect users to research opportunities
- **Disability Rights Legal Fund:** Crowdfunded litigation support
- **Policy Change Tracker:** Track legislation affecting disability rights
- **Global Expansion:** Translate to Spanish, adapt for EU/UK systems
- **Research Data Sharing:** Anonymized aggregate data for public health studies

---

## Integration Priorities

### High-Priority Integrations
1. **Medical Gaslighting UI:** Finish analyzer screen + evidence locker integration
2. **Voice-First UI:** Voice button + tutorial (accessibility win)
3. **Spoon Marketplace UI:** Complete posting + matching screens
4. **Co-Pilot Notifications:** Build suggestion display system
5. **Negotiation Coach Wizard:** Session start flow + live mode

### Medium-Priority Integrations
- Link celebrations to community (share achievements)
- Add voice commands to all major screens
- Integrate impact score into onboarding
- Cross-promote marketplace from pacing screen
- Surface co-pilot suggestions on home screen

### Low-Priority Polish
- Celebration animation variations
- Impact score level-up animations
- Marketplace reputation badges
- Negotiation coach script favorites
- Voice command customization

---

## Implementation Notes

### Completed Service Architecture
All 8 features have complete service implementations with:
- TypeScript interfaces for type safety
- AsyncStorage persistence for offline-first
- Error handling and fallbacks
- Privacy-preserving local processing (where applicable)
- Integration hooks to existing features

### UI Development Approach
For remaining UI work, follow this pattern:
1. Create screen component in appropriate `app/` directory
2. Use existing theme system (`useAppPalette`)
3. Follow WCAG AAA accessibility guidelines
4. Add celebration triggers where appropriate
5. Log behavior events for co-pilot
6. Test on both iOS and Android

### Testing Strategy
- **Celebrations:** Trigger all 15 celebration types
- **Impact Score:** Test with mock data across all 8 levels
- **Accountability:** Submit reviews for all entity types
- **Gaslighting:** Test with sample medical notes (dismissive vs supportive)
- **Voice:** Test all 7 commands + natural language parsing
- **Marketplace:** Post offers/requests, test matching algorithm
- **Co-Pilot:** Generate behavior patterns that trigger all suggestion types
- **Negotiation:** Walk through all 3 phases (prep, live, debrief)

---

## Developer Quick Reference

### Adding New Features
1. Create service in `services/<feature>.ts`
2. Define TypeScript interfaces
3. Implement AsyncStorage persistence
4. Add integration hooks
5. Create UI screens in `app/`
6. Add celebration triggers
7. Add co-pilot behavior logging
8. Update this roadmap

### Service File Locations
```
services/
├── celebrations.ts          # Daily win system
├── impactScore.ts          # Gamification scoring
├── accountabilityNetwork.ts # Review system
├── medicalGaslighting.ts   # Pattern detection
├── voiceFirst.ts           # Voice commands
├── spoonMarketplace.ts     # Energy trading
├── copilotProactive.ts     # AI suggestions
└── negotiationCoach.ts     # Meeting guidance
```

### UI File Locations
```
app/
├── (tabs)/settings/impact-dashboard.tsx
├── advocacy/accountability-network/index.tsx
└── [pending UI screens for other features]

components/
└── CelebrationToast.tsx
```

---

## Contribution Guidelines

When implementing roadmap features:
1. Follow existing code patterns in similar features
2. Use TypeScript strictly (no `any` types)
3. Add JSDoc comments to all public functions
4. Include accessibility labels (`accessibilityLabel`, `accessibilityHint`)
5. Test with VoiceOver/TalkBack enabled
6. Support offline-first operation
7. Respect user privacy (local processing preferred)
8. Add error handling for all async operations

---

**Last Updated:** November 2024  
**Next Review:** After completing pending UI screens (items 4-8)
