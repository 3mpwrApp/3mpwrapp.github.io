# Ally & Support Network Phase 1 - Quick Reference & Checklists

---

## Feature at a Glance

### Phase 1A: Peer Mentor Discovery
**What:** Directory of mentors by experience, disability, language, availability  
**Why:** Users can't currently find peer mentors; uses external networking  
**How:** Filter-based UI + Firestore mentor profiles  
**New Collections:** `mentorProfiles`  
**Timeline:** Weeks 1-2  
**Lines of Code:** ~800 (component + service)  

**Acceptance Criteria:**
- [ ] List mentors with filters (experience, disability, language, availability)
- [ ] View full mentor profile with all details
- [ ] Real-time filtering performance <2s
- [ ] Offline fallback shows cached mentors
- [ ] A11y compliant (tested with screen reader)

---

### Phase 1B: Support Group Matching
**What:** Curated peer support groups by condition/journey with messaging  
**Why:** No way to find structured peer support communities; rely on threads  
**How:** Pre-seeded groups + group discovery UI + real-time messaging  
**New Collections:** `supportGroups`, `supportGroups/*/members`, `supportGroups/*/messages`  
**Timeline:** Weeks 3-4  
**Lines of Code:** ~1,200 (components + service + moderation hooks)  

**Acceptance Criteria:**
- [ ] Browse curated groups with search/filter
- [ ] View group profile (members, description, recent messages)
- [ ] Join/leave group (Firestore membership update)
- [ ] Real-time group messages with presence
- [ ] Typing indicators & online roster
- [ ] A11y + moderation hooks in place

---

### Phase 1C: Mentorship Request Workflow
**What:** Formal request→accept→create DM path between mentee & mentor  
**Why:** No way to formally ask for mentorship; currently done via ad-hoc DMs  
**How:** Modal request form + mentor inbox + DM auto-creation  
**New Collections:** `mentorshipRequests`, `activeRelationships`  
**Timeline:** Weeks 5-6  
**Lines of Code:** ~1,400 (components + workflow service)  

**Acceptance Criteria:**
- [ ] Mentorship request modal (message + preferences)
- [ ] Mentor can see all requests (inbox/dashboard)
- [ ] Accept/decline decision
- [ ] Auto-create DM thread on accept
- [ ] Send welcome messages to both parties
- [ ] Track active mentorships
- [ ] Test block list interaction (can't request if blocked)

---

### Phase 1D: Peer Recognition Badges
**What:** Badge system for mentors (Emerging, Trusted Advisor, Expert, Verified, Global, Compassionate, Impact)  
**Why:** No incentive for helping; hard to identify expertise  
**How:** Badge definitions + progress tracking + auto-award triggers  
**New Collections:** `peerBadges`, `badgeDefinitions`  
**Timeline:** Weeks 7-8  
**Lines of Code:** ~900 (components + badge service + triggers)  

**Acceptance Criteria:**
- [ ] Define 7+ badge types with clear criteria
- [ ] Award triggers work (mentorship count, ratings, verification)
- [ ] Progress cards show path to next badge
- [ ] Badges display on mentor cards
- [ ] Badge leaderboard (optional for Phase 1)
- [ ] Achievement notifications on earn
- [ ] Test badge display on user profiles

---

### Phase 1E: Community Activity Feed
**What:** Curated feed of peer milestones, badges, new mentors, groups, events  
**Why:** Can't discover peer wins; community feels disconnected  
**How:** Real-time activity logging + filterable feed  
**New Collections:** `communityActivity`  
**Timeline:** Weeks 9-10  
**Lines of Code:** ~900 (components + activity service + triggers)  

**Acceptance Criteria:**
- [ ] Log activities (mentor_joined, badge_earned, group_created, discussion_popular)
- [ ] Display feed with type-specific rendering
- [ ] Filter by type & relevance (my disabilities/interests)
- [ ] Tap item navigates to detail (mentor, group, etc.)
- [ ] Real-time updates via Firestore listeners
- [ ] Privacy: only public activities shown
- [ ] A11y: feed items read correctly

---

## Quick Task Checklist (12 Weeks)

### Week 1: Mentor Discovery Setup
- [ ] Design `mentorProfiles` Firestore schema
- [ ] Add mentor collection rules to firestore.rules
- [ ] Create `services/mentorDiscovery.ts` module
- [ ] Build `MentorCard.tsx` component
- [ ] Build `MentorDirectoryScreen.tsx` main screen
- [ ] Build `MentorFilterSheet.tsx` filters
- [ ] Create seed data (10 sample mentors)
- [ ] Add "Mentors" tab to `ally-support-network.tsx`
- [ ] Test mentor discovery flows
- [ ] A11y audit

### Week 2: Mentor Profile & Polish
- [ ] Build `MentorProfileView.tsx` full profile screen
- [ ] Add availability slot display
- [ ] Add "Request Mentorship" button (no-op for now)
- [ ] Add mentor badges section (placeholder)
- [ ] Implement Firestore query + filtering
- [ ] Performance test (load 100 mentors)
- [ ] Offline caching with AsyncStorage
- [ ] Bug fixes & polish
- [ ] Beta tester feedback
- [ ] Deploy to staging

### Week 3: Support Groups Setup
- [ ] Design `supportGroups` Firestore schema
- [ ] Add group collection rules to firestore.rules
- [ ] Create `services/supportGroups.ts` module
- [ ] Build `SupportGroupsScreen.tsx` discovery UI
- [ ] Build `GroupCard.tsx` component
- [ ] Build `GroupDetailView.tsx` full group screen
- [ ] Create seed data (15 groups: ADHD, Chronic Pain, Newly Diagnosed, etc.)
- [ ] Implement group join/leave membership
- [ ] Test group discovery flows

### Week 4: Support Group Messaging & Polish
- [ ] Implement real-time group messages
- [ ] Add presence/typing indicators
- [ ] Add online roster display
- [ ] Build `GroupSearchSheet.tsx` search/filter
- [ ] Add moderation hooks (flag, report)
- [ ] Test message delivery
- [ ] A11y audit
- [ ] Performance test (load 1000 messages)
- [ ] Bug fixes & polish
- [ ] Add "Support Circles" tab to ally-support-network.tsx

### Week 5: Mentorship Request Setup
- [ ] Design `mentorshipRequests` & `activeRelationships` schemas
- [ ] Add mentorship collection rules to firestore.rules
- [ ] Create `services/mentorshipWorkflow.ts` module
- [ ] Build `MentorshipRequestModal.tsx` form
- [ ] Integrate modal into `MentorProfileView.tsx`
- [ ] Build mentor inbox/dashboard screen
- [ ] Implement request accept/decline logic
- [ ] Test request form submission

### Week 6: Mentorship Workflow Completion
- [ ] Implement auto-create DM thread on accept
- [ ] Generate welcome messages for both parties
- [ ] Track `activeRelationships` creation
- [ ] Build request notification UI
- [ ] Test full flow: request → accept → DM appears
- [ ] Add request history/archived requests
- [ ] Test block list interaction
- [ ] A11y audit
- [ ] Bug fixes & polish

### Week 7: Badge System Setup
- [ ] Design 7+ badge types & criteria
- [ ] Create `badgeDefinitions` seed data
- [ ] Design `peerBadges` Firestore schema
- [ ] Add badge collection rules to firestore.rules
- [ ] Create `services/peerBadges.ts` module
- [ ] Build `BadgeProgressCard.tsx` component
- [ ] Extend `UserBadge.tsx` for peer badges
- [ ] Set up badge award triggers (logic)

### Week 8: Badge Awards & Display
- [ ] Implement mentorship award trigger ("Emerging Mentor")
- [ ] Implement rating-based award trigger ("Trusted Advisor")
- [ ] Implement verification-based award trigger ("Verified Expert")
- [ ] Add badge notification on earn
- [ ] Display badges on mentor cards
- [ ] Build badge leaderboard (optional)
- [ ] Test all award conditions
- [ ] A11y audit
- [ ] Performance test (load 100 user badges)

### Week 9: Activity Feed Setup
- [ ] Design `communityActivity` Firestore schema
- [ ] Add activity collection rules to firestore.rules
- [ ] Create `services/communityActivity.ts` module
- [ ] Build `ActivityFeed.tsx` main feed component
- [ ] Build `ActivityItem.tsx` with type-specific rendering
- [ ] Build `ActivityFilterSheet.tsx` filters
- [ ] Create logging triggers in mentorship flow
- [ ] Test activity creation on mentor signup

### Week 10: Activity Feed Polish
- [ ] Add logging triggers for badge awards
- [ ] Add logging triggers for group creation
- [ ] Implement real-time Firestore listeners
- [ ] Test activity privacy (public only)
- [ ] Filter by type & relevance
- [ ] Tap navigation to detail screens
- [ ] Add "Community Pulse" tab to ally-support-network.tsx
- [ ] A11y audit
- [ ] Performance test (load 500 activities)

### Week 11: Integration & E2E Testing
- [ ] Full mentorship discovery flow (find → view → request)
- [ ] Full group flow (browse → view → join → message)
- [ ] Mentorship completion with feedback
- [ ] Badge earn scenario (mentorship → badge awarded → activity logged)
- [ ] Activity feed interaction (browse → tap → navigate)
- [ ] Cross-tab navigation (Community DMs → Advocacy mentorship)
- [ ] Offline behavior (all tabs cache properly)
- [ ] Error scenarios (network down, Firestore rules denied, etc.)
- [ ] Security audit (Firestore rules, permission model)

### Week 12: Polish & Launch Prep
- [ ] A11y full audit (`npm run a11y:scan`)
- [ ] Manual a11y testing with screen reader
- [ ] Performance profiling & optimization
- [ ] Firestore index creation (auto-suggested)
- [ ] Error logging & monitoring setup
- [ ] Analytics event tracking verification
- [ ] Notification system integration
- [ ] Beta tester feedback & iterations
- [ ] Bug fixes & last-minute polish
- [ ] Documentation & launch prep
- [ ] Ready for production deployment

---

## Firestore Collections Checklist

### mentorProfiles/{userId}
- [ ] userId (string, indexed)
- [ ] displayName (string)
- [ ] bio (string)
- [ ] profileType: 'mentor' | 'peer' | 'mentee' (string, indexed)
- [ ] disabilities: string[] (indexed by disability)
- [ ] experiences: string[] (indexed by experience)
- [ ] expertise: Expertise[] (category, yearsOfExperience, description)
- [ ] availability: AvailabilitySlot[] (dayOfWeek, startTime, endTime, timezone, isFlexible)
- [ ] communicationMethods: string[] (video_call, voice_call, text_chat, etc.)
- [ ] languages: string[]
- [ ] culturalBackground?: string
- [ ] acceptingMentees: boolean (indexed)
- [ ] rating: number (1-5, indexed)
- [ ] totalMatches: number
- [ ] successfulMatches: number
- [ ] verificationStatus: 'unverified' | 'email_verified' | 'reference_verified'
- [ ] createdAt: timestamp (indexed)
- [ ] updatedAt: timestamp

### supportGroups/{groupId}
- [ ] groupId: string
- [ ] name: string
- [ ] description: string
- [ ] category: string (indexed)
- [ ] subCategories: string[]
- [ ] creator: { uid, displayName }
- [ ] members: { count }
- [ ] memberList: string[] (indexed)
- [ ] tags: string[]
- [ ] isPrivate: boolean
- [ ] icon: string
- [ ] activity: { lastMessageAt, messageCount }
- [ ] moderators: string[]
- [ ] rules: string
- [ ] createdAt: timestamp (indexed)

### supportGroups/{groupId}/members/{userId}
- [ ] uid: string
- [ ] joinedAt: timestamp
- [ ] role: 'member' | 'moderator'
- [ ] mutedUntil?: timestamp

### supportGroups/{groupId}/messages/{messageId}
- [ ] id: string
- [ ] authorUid: string
- [ ] authorName: string
- [ ] content: string
- [ ] createdAt: timestamp (indexed)
- [ ] reactions?: { emoji, count, uids }[]
- [ ] replyToId?: string

### mentorshipRequests/{requestId}
- [ ] id: string
- [ ] mentorUid: string (indexed)
- [ ] seekerUid: string
- [ ] seekerDisplayName: string
- [ ] seekerDisabilities: string[]
- [ ] message: string
- [ ] preferredMethods: string[]
- [ ] status: 'pending' | 'accepted' | 'declined' (indexed)
- [ ] threadId?: string
- [ ] createdAt: timestamp (indexed)
- [ ] respondedAt?: timestamp

### activeRelationships/{relationshipId}
- [ ] id: string
- [ ] mentorUid: string
- [ ] seekerUid: string
- [ ] requestId: string
- [ ] threadId: string
- [ ] startedAt: timestamp
- [ ] lastActivityAt: timestamp
- [ ] status: 'active' | 'paused' | 'completed' (indexed)
- [ ] feedback?: { rating, helpful, safetyRating, comments, createdAt }

### peerBadges/{userId}
- [ ] userId: string
- [ ] badges: { [badgeId]: { type, awardedAt, progress } }
- [ ] totalPoints: number

### badgeDefinitions/{badgeId}
- [ ] id: string
- [ ] name: string
- [ ] description: string
- [ ] icon: string
- [ ] tier: 'bronze' | 'silver' | 'gold'
- [ ] criteria: string
- [ ] progress?: { type, target, currentField }

### communityActivity/{activityId}
- [ ] id: string
- [ ] type: string (indexed: mentor_joined, badge_earned, group_created, etc.)
- [ ] actorUid: string
- [ ] actorName: string
- [ ] targetId?: string
- [ ] targetName?: string
- [ ] relevantTags: string[] (indexed)
- [ ] isPublic: boolean (indexed)
- [ ] createdAt: timestamp (indexed)
- [ ] expiresAt?: timestamp
- [ ] engagementCount: number
- [ ] metadata: object

---

## Component List (New Files)

### User-Facing Screens/Modals
- [ ] `MentorDirectoryScreen.tsx` — Main mentor discovery UI
- [ ] `MentorProfileView.tsx` — Full mentor profile
- [ ] `MentorshipRequestModal.tsx` — Request form
- [ ] `SupportGroupsScreen.tsx` — Group discovery
- [ ] `GroupDetailView.tsx` — Full group profile + messages
- [ ] `ActivityFeed.tsx` — Community activity feed
- [ ] (Optional) `MentorDashboard.tsx` — Mentor inbox

### Reusable Components
- [ ] `MentorCard.tsx` — Compact mentor preview
- [ ] `GroupCard.tsx` — Compact group preview
- [ ] `ActivityItem.tsx` — Single activity item (type-specific)
- [ ] `BadgeProgressCard.tsx` — Progress toward badge
- [ ] `MentorFilterSheet.tsx` — Filter modal
- [ ] `GroupSearchSheet.tsx` — Search/filter modal
- [ ] `ActivityFilterSheet.tsx` — Activity filter modal

### Services/Modules (New Files)
- [ ] `services/mentorDiscovery.ts` — Mentor queries, filters
- [ ] `services/supportGroups.ts` — Group management
- [ ] `services/mentorshipWorkflow.ts` — Request/accept workflow
- [ ] `services/peerBadges.ts` — Badge queries, award logic
- [ ] `services/communityActivity.ts` — Activity logging, queries

### Route Wrappers (Lazy)
- [ ] `app/(tabs)/advocacy/mentor-discovery.tsx` — Lazy wrapper
- [ ] `app/(tabs)/advocacy/support-groups.tsx` — Lazy wrapper
- [ ] `app/(tabs)/advocacy/activity-feed.tsx` — Lazy wrapper

### Modified Files
- [ ] `app/(tabs)/advocacy/ally-support-network.tsx` — Add 3 new tabs
- [ ] `firebase/firestore.rules` — Add 5 new collection rules
- [ ] `types/models.ts` — Add TypeScript interfaces (optional)
- [ ] `components/badges/UserBadge.tsx` — Extend for peer badges (optional)
- [ ] `store/profileLocal.tsx` — Extend for badge storage (optional)

---

## Firestore Rules Additions (Template)

```firestore-rules
// Mentor profiles
match /mentorProfiles/{uid} {
  allow read: if true;
  allow create, update, delete: if isSignedIn() && request.auth.uid == uid;
}

// Support groups
function isGroupMember(groupId) {
  return request.auth.uid in get(/databases/$(database)/documents/supportGroups/$(groupId)).data.memberList;
}
function isGroupModerator(groupId) {
  return request.auth.uid in get(/databases/$(database)/documents/supportGroups/$(groupId)).data.moderators;
}
match /supportGroups/{groupId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn();
  allow update, delete: if isGroupModerator(groupId) || isAnyAdmin();
}
match /supportGroups/{groupId}/members/{uid} {
  allow read: if isSignedIn();
  allow create: if isSignedIn() && uid == request.auth.uid;
  allow delete: if isSignedIn() && uid == request.auth.uid;
}
match /supportGroups/{groupId}/messages/{msgId} {
  allow read: if isGroupMember(groupId);
  allow create: if isGroupMember(groupId) && request.resource.data.authorUid == request.auth.uid;
  allow delete: if isAnyAdmin() || (isGroupMember(groupId) && request.auth.uid == resource.data.authorUid);
}

// Mentorship requests
match /mentorshipRequests/{requestId} {
  allow create: if isSignedIn() && request.resource.data.seekerUid == request.auth.uid;
  allow read: if isSignedIn() && (request.auth.uid == resource.data.seekerUid || request.auth.uid == resource.data.mentorUid);
  allow update, delete: if isSignedIn() && (request.auth.uid == resource.data.seekerUid || request.auth.uid == resource.data.mentorUid);
}

// Active relationships
match /activeRelationships/{relId} {
  allow read: if isSignedIn() && (request.auth.uid == resource.data.mentorUid || request.auth.uid == resource.data.seekerUid);
  allow update: if isSignedIn() && (request.auth.uid == resource.data.mentorUid || request.auth.uid == resource.data.seekerUid);
}

// Community activity
match /communityActivity/{activityId} {
  allow read: if true;
  allow create: if isSignedIn();
  allow update, delete: if isAnyAdmin();
}

// Peer badges
match /peerBadges/{uid} {
  allow read: if isSignedIn() && (request.auth.uid == uid || isAnyAdmin());
  allow create, update: if isAnyAdmin();
}
```

---

## Testing Scenarios

### Phase 1A: Mentor Discovery
- [ ] List all mentors (no filters)
- [ ] Filter by experience (workplace_advocacy, healthcare_navigation)
- [ ] Filter by disability (ADHD, Chronic Pain)
- [ ] Filter by language (English, French, Spanish)
- [ ] Filter by availability (today, this week, weekends)
- [ ] Multi-filter combination
- [ ] Search by name
- [ ] Offline: cached mentors still visible
- [ ] Online: real-time updates when mentor joins
- [ ] Load performance: <2s for 100 mentors

### Phase 1B: Support Groups
- [ ] Browse all groups
- [ ] Search by group name
- [ ] Filter by category
- [ ] View group with 0 members, 10 members, 1000 members
- [ ] Join group
- [ ] See myself in members list
- [ ] Send message in group
- [ ] See other member's message in real-time
- [ ] See typing indicator when someone types
- [ ] Leave group
- [ ] Can't send message after leaving
- [ ] Offline: cached messages visible

### Phase 1C: Mentorship Requests
- [ ] Send request with message + preferences
- [ ] Request appears in mentor inbox
- [ ] Mentor accept request
- [ ] DM thread auto-created
- [ ] Both parties see welcome message
- [ ] Can now message freely
- [ ] Mentor decline request
- [ ] Request marked declined
- [ ] Seeker can request again later
- [ ] Block list: can't request if blocked
- [ ] Request appears in activity feed

### Phase 1D: Badges
- [ ] User with 0 mentorships (no badge)
- [ ] User completes 1 mentorship → "Emerging Mentor" earned
- [ ] Badge appears on profile
- [ ] Badge appears on mentor card
- [ ] User with 5 mentorships & 4.2 avg rating → "Trusted Advisor"
- [ ] User with unverified status → no "Verified" badge
- [ ] User with email verification → "Verified" badge unlocked
- [ ] Badge progress card shows "4/5 mentorships to next badge"
- [ ] Notification sent on badge earn

### Phase 1E: Activity Feed
- [ ] Feed shows mentor_joined activities
- [ ] Feed shows badge_earned activities
- [ ] Feed shows group_created activities
- [ ] Filter by type (show only badges, for example)
- [ ] Filter by relevance (show only ADHD-related)
- [ ] Tap mentor_joined → navigate to mentor profile
- [ ] Tap badge_earned → navigate to mentor
- [ ] Tap group_created → navigate to group
- [ ] Real-time: new activity appears immediately
- [ ] Privacy: only public activities (creator.isPublic == true)
- [ ] Old activities auto-expire

---

## Success Metrics Tracking

### Adoption (Target: 6 months)
- [ ] Active mentors: 50+ (track: `mentorProfiles` with acceptingMentees: true)
- [ ] Support groups created: 20+ (track: `supportGroups` count)
- [ ] Mentorship requests sent: 200+ (track: `mentorshipRequests` count)
- [ ] Successful pairings: 150+ (track: `activeRelationships` with status: 'active')
- [ ] Support group members: 500+ (track: sum of all `supportGroups/*/members`)
- [ ] Community activity posts: 1000+ (track: `communityActivity` count)

### Engagement (Target ongoing)
- [ ] Mentor response time: <24 hours median
- [ ] Mentorship completion: 80%+ of active relationships end with feedback
- [ ] Helpfulness rating: 4.0+ average (`activeRelationships.feedback.rating`)
- [ ] Group activity: 5+ messages/day per group
- [ ] Badge earn rate: 30%+ of mentors earn at least 1 badge
- [ ] Feed engagement: 20% of users interact with activities

### Quality (Target: launch)
- [ ] Safety ratings: 4.5+ average (`activeRelationships.feedback.safetyRating`)
- [ ] A11y compliance: 100% (wcag 2.1 AA)
- [ ] Load performance: <2s mentor discovery, <1.5s feed
- [ ] Error rate: <1% of requests (monitor Sentry)
- [ ] Firestore indexes: auto-optimized for all queries

---

## Known Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Mentor no-shows | Churn | Medium | Ratings + reliability badges |
| Unsafe behavior | Safety | Low | Verification + blocking + reporting |
| Firestore costs | Budget | Low | Indexes + query optimization |
| Data privacy | GDPR | Low | Privacy policy + explicit opt-in |
| Low mentor adoption | ROI | Medium | Onboarding flow + badge incentives |
| Poor feedback quality | Trust erosion | Low | Rating guidelines + moderation |
| Integration bugs | Feature failure | Low | E2E testing + staging env |

---

## Launch Checklist (Week 13+)

- [ ] All features tested & approved
- [ ] Firestore rules deployed to production
- [ ] Analytics events tracked (mentor_discovered, group_joined, etc.)
- [ ] Error monitoring enabled (Sentry)
- [ ] Performance baselines established
- [ ] Beta testers given early access
- [ ] User documentation written
- [ ] In-app tutorial created (or onboarding flow)
- [ ] Support plan ready (FAQ, help docs)
- [ ] Marketing announcement prepared
- [ ] Team trained on new features
- [ ] Monitoring dashboards set up
- [ ] Rollback plan documented
- [ ] Soft launch to 10% users (gradual rollout)
- [ ] Monitor metrics for 1 week
- [ ] Full launch to 100% users
- [ ] Post-launch support & monitoring

---

**Last Updated:** January 3, 2026  
**Format:** Quick reference checklists (print-friendly)  
**Use:** Print or bookmark for implementation tracking
