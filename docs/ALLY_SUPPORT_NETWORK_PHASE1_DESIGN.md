# Ally & Support Network - Phase 1 Enhancement Design Blueprint

**Status:** Research Complete - Design Phase  
**Date:** January 3, 2026  
**Scope:** Peer support discovery, mentorship, and community connection enhancements  
**Phase:** 1 (Foundation & Core Features)  

---

## Executive Summary

The **Ally & Support Network** is currently a Power Tool consolidating 5 support-related features under the Advocacy tab. This design blueprint enhances it to become the **primary peer connection hub** for the 3mpwr app, enabling meaningful peer-to-peer support, mentorship discovery, and community engagement while maintaining consistency with existing Community tab patterns.

**Key Insight:** The app already has robust community infrastructure (threads, comments, presence tracking, Firestore rules) and a sophisticated peer support matching system (`PeerSupportContent.tsx`). Phase 1 focuses on integrating these capabilities, surfacing peer mentors within the Advocacy context, and building a bridge between Advocacy (individual support) and Community (group connection) tabs.

---

## Part 1: Current Feature Audit

### What Exists Today

#### 1.1 Ally & Support Network Screen (`ally-support-network.tsx`)
**Current Implementation:** 5-tab Power Tool consolidating:

| Tab | Purpose | Status | Users |
|-----|---------|--------|-------|
| **Directory** | Support organization directory (disability orgs, crisis lines, legal services) | Simple mode | New users |
| **Allies** | Educational resources for allies (family, friends, coworkers, healthcare) | Standard mode | Educating supporters |
| **Self-Coach** | Self-advocacy skill modules & quick lessons | Standard mode | Active advocates |
| **Ratings** | Provider/employer/insurer reviews | Power user mode | Expert reviewers |
| **World** | Global advocacy map & campaigns (Beta) | Power user mode | Global advocates |

**Current Limitations:**
- ❌ No peer mentor discovery
- ❌ No peer-to-peer matching algorithm
- ❌ No mentorship request workflow
- ❌ No community activity feed
- ❌ No peer recognition/badges system
- ❌ Disconnected from Community tab
- ❌ No support group matching
- ❌ Presence/typing not shown

#### 1.2 Peer Support Matching System (`PeerSupportContent.tsx`)
**Status:** Sophisticated, but isolated in Community tab as `peer-support.tsx` route

**What It Has:**
- ✅ Comprehensive `PeerProfile` interface with:
  - Profile types: mentor, peer, mentee, support_seeker
  - Disabilities & experiences taxonomy
  - Availability slots with timezone support
  - Communication preferences & language support
  - Safety preferences & verification options
  - Cultural background & accessibility needs
  
- ✅ `PeerMatch` interface with:
  - Match scoring system
  - Compatibility factors
  - Communication logs
  - Feedback tracking (safety, helpfulness, recommendation)
  
- ✅ UI Components:
  - Match discovery tab
  - Profile management tab
  - Active connections tab
  - Safety guidelines tab

**Current Limitations:**
- ❌ Uses mock data, not connected to Firestore
- ❌ Only accessible from Community > Peer Support route
- ❌ Not integrated into Advocacy tab
- ❌ No request/invitation workflow
- ❌ No activity feed or notifications
- ❌ No badge/recognition system

#### 1.3 Community Infrastructure (Reusable)
**Existing Patterns We Can Leverage:**

| Feature | Location | Capability |
|---------|----------|-----------|
| **Presence Tracking** | `services/community.ts` | Users tracked in real-time, typing indicators |
| **Direct Messages** | Firestore rules + `mutual-chat.tsx` | 1:1 messaging with Firestore structure |
| **Threads & Comments** | `store/community.tsx` | Community discussion with moderation |
| **Moderation** | `services/moderation.ts` | Flagging, soft-deletes, admin tools |
| **User Profiles** | `components/ProfileCard.tsx`, Firestore `users/` | Display names, photos, admin status |
| **Badges** | `components/badges/UserBadge.tsx` | Beta Tester, Early Adopter, Verified badges |
| **Firestore Rules** | `firebase/firestore.rules` | Permission model (signed-in, admin, block lists) |

#### 1.4 Supporting Components
- ✅ `A11yPressable` - Accessible buttons with hit slop
- ✅ `GapView` - Consistent spacing
- ✅ `PowerTool` & `PowerToolTab` - Tab framework (used by ally-support-network)
- ✅ `OnlineStatusBadge` - Network status indicator
- ✅ `DisclaimerBanner` - AI transparency (can repurpose for peer support context)
- ✅ `DiscordHub` - Community integration (model for external connections)

---

## Part 2: Gap Analysis

### What's Missing

| Gap | Impact | Priority | Current Workaround |
|-----|--------|----------|-------------------|
| **Peer Mentor Discovery** | Users can't find mentors by experience or topic | HIGH | None; requires manual networking |
| **Support Group Matching** | Can't connect by shared condition/journey | HIGH | Community threads (unstructured) |
| **Mentorship Requests** | No formal ask/accept workflow | HIGH | DMs (unstructured) |
| **Activity Feed** | Can't see peer milestones, support events, community wins | MEDIUM | Twitter/Discord (external) |
| **Peer Recognition** | No incentive or visibility for helpful peers | MEDIUM | None; informal acknowledgment |
| **Integration Bridge** | Advocacy & Community tabs feel disconnected | MEDIUM | Manual navigation |
| **Availability Visibility** | Mentors' open hours not visible when searching | LOW | DMs to ask (friction) |
| **Safety Mechanisms** | No verification, references, or background checks | MEDIUM | Community trust (informal) |
| **Skill Endorsements** | Can't see mentor expertise or verify qualifications | LOW | Bio text (unstructured) |
| **Analytics** | No metrics on mentor effectiveness, match quality | LOW | Manual feedback only |

---

## Part 3: Enhancement Roadmap (5 New Features)

### Phase 1A: Peer Mentor Discovery (NEW SCREEN)
**Goal:** Help users find mentors by experience/topic; integrate into Advocacy tab

**Feature Name:** "Find a Mentor" or "Mentor Directory"

**User Flows:**
1. User opens Advocacy > Ally & Support Network
2. Taps new "Mentors" tab (replaces or supplements existing tabs)
3. Sees list of available mentors filtered by:
   - Experience category (workplace advocacy, healthcare navigation, legal, benefits, etc.)
   - Disability type/similarity
   - Language & cultural background
   - Availability (online now, weekly slots, flexible)
4. Taps mentor card → sees full profile + availability
5. Taps "Request Mentorship" → starts workflow

**Firestore Data Model:**
```
collection/mentorProfiles/{userId}
  - userId (string, indexed)
  - displayName (string)
  - bio (string)
  - profileType: 'mentor' | 'peer' | 'mentee'
  - disabilities: string[] (indexed)
  - experiences: string[] (indexed)
  - expertise: {
      category: string,
      yearsOfExperience: number,
      description: string
    }[]
  - availability: {
      dayOfWeek: number,
      startTime: string,
      endTime: string,
      timezone: string,
      isFlexible: boolean
    }[]
  - communicationMethods: string[] (video_call, voice_call, text_chat, etc.)
  - languages: string[]
  - culturalBackground?: string
  - acceptingMentees: boolean (indexed)
  - rating: number (1-5)
  - totalMatches: number
  - successfulMatches: number
  - verificationStatus: 'unverified' | 'email_verified' | 'reference_verified'
  - createdAt: timestamp
  - updatedAt: timestamp
```

**UI Components:**
- `MentorDirectoryScreen` - Main list/filter view
- `MentorCard` - Compact mentor preview
- `MentorProfileView` - Full profile + availability slots
- `MentorFilterSheet` - Filter by experience, disability, language, availability

**Integration Points:**
- Add `mentors` tab to existing `ally-support-network.tsx` Power Tool
- Use pattern from `mutual-aid.impl.tsx` for Firestore queries + filtering
- Reuse `ProfileCard` component for displaying mentor info

---

### Phase 1B: Support Group Matching (NEW SCREEN)
**Goal:** Help users find peer communities by shared condition/journey

**Feature Name:** "Join a Support Circle" or "Support Groups"

**User Flows:**
1. User opens Advocacy > Ally & Support Network
2. Taps "Support Circles" tab
3. Sees curated groups by:
   - Condition/disability (chronic illness, neurodivergent, physical disability, etc.)
   - Life journey (newly diagnosed, workplace transition, benefits navigation)
   - Topic (grief, family dynamics, legal strategy)
4. Taps group → sees members, activity, and join button
5. Joins → added to Firestore collection, notifications enabled

**Firestore Data Model:**
```
collection/supportGroups/{groupId}
  - groupId (string)
  - name (string)
  - description (string)
  - category: string (indexed)
  - subCategories: string[]
  - creator: {
      uid: string,
      displayName: string
    }
  - members: {
      count: number
    }
  - memberList: string[] (array of uids, indexed)
  - tags: string[] (chronic illness, workplace, family, etc.)
  - isPrivate: boolean
  - description: string
  - icon: string (emoji or icon name)
  - activity: {
      lastMessageAt: timestamp,
      messageCount: number
    }
  - moderators: string[]
  - createdAt: timestamp
  - rules: string

collection/supportGroups/{groupId}/members/{userId}
  - uid: string
  - joinedAt: timestamp
  - role: 'member' | 'moderator'
  - mutedUntil?: timestamp

collection/supportGroups/{groupId}/messages/{messageId}
  - id: string
  - authorUid: string
  - authorName: string
  - content: string
  - createdAt: timestamp
  - reactions: { emoji: string, count: number, uids: string[] }[]
  - replyToId?: string
```

**UI Components:**
- `SupportGroupsScreen` - Curated list + discovery
- `GroupCard` - Preview with member count, last activity
- `GroupDetailView` - Full group profile + recent messages
- `GroupSearchSheet` - Search & filter by condition/topic
- `JoinGroupButton` - Handle membership workflow

**Integration Points:**
- Add to Power Tool as new tab
- Reuse community channel patterns from `community/index.impl.tsx`
- Adapt moderation rules from `services/moderation.ts`
- Use presence tracking from `services/community.ts`

---

### Phase 1C: Mentorship Request Workflow (WORKFLOW)
**Goal:** Formal request/accept/begin mentorship; track relationship

**Feature Name:** "Start Mentorship" workflow

**User Flow:**
1. User views mentor profile (from Phase 1A discovery)
2. Taps "Request Mentorship" button
3. Modal appears with:
   - Text field: "Tell them why you're reaching out" (max 200 chars)
   - Checkbox: "I'm comfortable with audio calls"
   - Checkbox: "I prefer text-only initially"
4. Submit → request created in Firestore
5. Mentor gets notification + sees requests in dashboard
6. Mentor taps "Accept" or "Decline"
7. If accepted:
   - Direct message thread created
   - Mentor marked as "active mentor" for user
   - Both receive welcome message + initial guidance
   - Mentorship relationship tracked (for analytics)

**Firestore Data Model:**
```
collection/mentorshipRequests/{requestId}
  - id: string
  - mentorUid: string (indexed)
  - seekerUid: string
  - seekerDisplayName: string
  - seekerDisabilities: string[]
  - message: string
  - preferredMethods: string[] (audio_call, video_call, text_chat)
  - status: 'pending' | 'accepted' | 'declined' (indexed)
  - threadId?: string (reference to dm_threads when accepted)
  - createdAt: timestamp
  - respondedAt?: timestamp

collection/activeRelationships/{relationshipId}
  - id: string
  - mentorUid: string
  - seekerUid: string
  - requestId: string
  - threadId: string
  - startedAt: timestamp
  - lastActivityAt: timestamp
  - status: 'active' | 'paused' | 'completed'
  - feedback?: {
      rating: number,
      helpful: boolean,
      safetyRating: number,
      comments: string,
      createdAt: timestamp
    }
```

**UI Components:**
- `MentorshipRequestModal` - Send request form
- `RequestNotificationCard` - In dashboard/inbox
- `RequestDecisionSheet` - Accept/decline options
- `WelcomeMessageToMentee` - Initial guidance after pairing

**Integration Points:**
- Modify `MentorProfileView` from Phase 1A to include request button
- Create mentor dashboard (part of Phase 1D)
- Use DM infrastructure from `dm_threads` (already in Firestore)
- Adapt notification system from `services/notifications.ts`

---

### Phase 1D: Peer Recognition & Badges System (GAMIFICATION)
**Goal:** Incentivize and recognize helpful mentors; visible achievement system

**Feature Name:** "Mentor Badges" or "Community Badges"

**Badge Types:**
| Badge | Criteria | Display |
|-------|----------|---------|
| 🌱 **Emerging Mentor** | Complete first mentorship (10 hours or 1 month) | Bronze badge |
| ⭐ **Trusted Advisor** | 5+ successful matches, avg rating ≥4.0 | Silver badge |
| 🏆 **Expert Guide** | 10+ successful matches, avg rating ≥4.5 | Gold badge |
| 🔍 **Verified Expert** | Peer review verification completed | Special badge with checkmark |
| 🌍 **Global Advocate** | Active across multiple support groups | Tier badge |
| 💚 **Compassionate Listener** | High "safety" & "helpfulness" ratings | Heart badge |
| 🎯 **Impact Maker** | Help 3+ mentees reach documented goals | Impact badge |

**Firestore Data Model:**
```
collection/peerBadges/{userId}
  - userId: string
  - badges: {
      badge_id: {
        type: string
        awardedAt: timestamp
        progress?: {
          current: number
          target: number
        }
      }
    }
  - totalPoints: number (hidden metric for analytics)

collection/badgeDefinitions/{badgeId}
  - id: string
  - name: string
  - description: string
  - icon: string (emoji)
  - tier: 'bronze' | 'silver' | 'gold'
  - criteria: string
  - progress?: {
      type: 'count' | 'rating' | 'time'
      target: number
      currentField: string (reference field in peerBadges)
    }
```

**UI Components:**
- `BadgeDisplay` - Single badge with tooltip (extend `UserBadge.tsx`)
- `BadgeProgressCard` - Shows progress toward badge (if not yet earned)
- `BadgesLeaderboard` - Top mentors by badges earned
- `BadgeToast` - Notification when badge earned

**Integration Points:**
- Extend existing `components/badges/UserBadge.tsx` system
- Use `store/profileLocal.tsx` badge infrastructure
- Add achievement notification hooks to mentorship completion
- Display badges on mentor cards (Phase 1A)

---

### Phase 1E: Community Activity Feed (DISCOVERY)
**Goal:** Surface peer milestones, support events, and community wins

**Feature Name:** "Community Pulse" or "What's Happening"

**Content Types in Feed:**
- 📢 New mentors joined (from Phase 1A)
- 🎯 Peer announced support group (from Phase 1B)
- 🏆 Mentor earned badge (from Phase 1D)
- ✅ User completed advocacy goal (from Wellness/Coach)
- 💬 Popular discussion in support circle (from Phase 1B)
- 📅 Upcoming community event (from Events)
- 🎉 Community milestone (e.g., "100 mentorships completed!")

**User Flows:**
1. User opens Activity Feed screen (new, or tab in ally-support-network)
2. Sees chronological feed of peer activities
3. Can filter by:
   - Type (mentors, badges, goals, groups, events)
   - Relevance (my disabilities, my interests)
   - Time (today, this week, all time)
4. Taps item → navigates to relevant detail (mentor profile, group, etc.)

**Firestore Data Model:**
```
collection/communityActivity/{activityId}
  - id: string
  - type: 'mentor_joined' | 'badge_earned' | 'group_created' | 'goal_completed' | 'discussion_popular' | 'event_upcoming' | 'milestone'
  - actorUid: string
  - actorName: string
  - targetId?: string (mentor uid, group id, badge id, etc.)
  - targetName?: string
  - relevantTags: string[] (indexed) [disabilities, topics, etc.]
  - isPublic: boolean (indexed)
  - createdAt: timestamp
  - expiresAt?: timestamp (for events, milestones)
  - engagementCount: number (likes, shares)
  - metadata: {
      mentorDisabilities?: string[]
      groupCategory?: string
      badgeType?: string
      goalCategory?: string
    }
```

**UI Components:**
- `ActivityFeed` - Main scrollable feed
- `ActivityItem` - Single activity card with type-specific rendering
- `ActivityFilterSheet` - Type & relevance filters
- `ActivityEmptyState` - Skeleton/placeholder

**Integration Points:**
- Add new tab to `ally-support-network.tsx` Power Tool
- Create triggers in mentorship workflow (Phase 1C) to log activities
- Hook into badge system (Phase 1D) for badge_earned events
- Reuse support group patterns (Phase 1B) for group_created events
- Use activity icon/emoji patterns from mutual-aid.tsx

---

## Part 4: Firestore Data Model Updates

### New Collections Summary
```
firestore/
├── mentorProfiles/
│   └── {userId}
│       ├── displayName, bio, disabilities, experiences
│       ├── expertise[], availability[], communicationMethods[], languages[]
│       ├── acceptingMentees, rating, totalMatches, successfulMatches
│       └── verificationStatus, createdAt, updatedAt
│
├── supportGroups/
│   └── {groupId}
│       ├── name, description, category, subCategories
│       ├── creator, members (count), memberList[], tags
│       ├── isPrivate, icon, activity, moderators
│       ├── rules, createdAt
│       └── /members/{userId}
│           ├── uid, joinedAt, role, mutedUntil
│           └── /messages/{messageId}
│               ├── id, authorUid, authorName, content, createdAt
│               └── reactions[], replyToId
│
├── mentorshipRequests/
│   └── {requestId}
│       ├── mentorUid, seekerUid, seekerDisplayName
│       ├── message, preferredMethods[], status
│       ├── threadId (references dm_threads)
│       └── createdAt, respondedAt
│
├── activeRelationships/
│   └── {relationshipId}
│       ├── mentorUid, seekerUid, requestId, threadId
│       ├── startedAt, lastActivityAt, status
│       └── feedback (rating, helpful, safetyRating, comments)
│
├── communityActivity/
│   └── {activityId}
│       ├── type, actorUid, actorName, targetId, targetName
│       ├── relevantTags[], isPublic, createdAt, expiresAt
│       ├── engagementCount, metadata
│       └── ...
│
└── peerBadges/
    └── {userId}
        ├── badges { badge_id: { type, awardedAt, progress } }
        └── totalPoints
```

### Modified Firestore Rules Additions
```firestore-rules
// mentorProfiles: Mentors own their profiles; public read
match /mentorProfiles/{uid} {
  allow read: if true;
  allow create, update, delete: if isSignedIn() && request.auth.uid == uid;
}

// supportGroups: Members can read; moderators can update
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

// mentorshipRequests: Seeker creates; mentor reads own
match /mentorshipRequests/{requestId} {
  allow create: if isSignedIn() && request.resource.data.seekerUid == request.auth.uid;
  allow read: if isSignedIn() && (request.auth.uid == resource.data.seekerUid || request.auth.uid == resource.data.mentorUid);
  allow update, delete: if isSignedIn() && (request.auth.uid == resource.data.seekerUid || request.auth.uid == resource.data.mentorUid);
}

// activeRelationships: Participants read/update feedback
match /activeRelationships/{relId} {
  allow read: if isSignedIn() && (request.auth.uid == resource.data.mentorUid || request.auth.uid == resource.data.seekerUid);
  allow update: if isSignedIn() && (request.auth.uid == resource.data.mentorUid || request.auth.uid == resource.data.seekerUid);
}

// communityActivity: Public read; logging only
match /communityActivity/{activityId} {
  allow read: if true;
  allow create: if isSignedIn();
  allow update, delete: if isAnyAdmin();
}

// peerBadges: User can read own; system awards
match /peerBadges/{uid} {
  allow read: if isSignedIn() && (request.auth.uid == uid || isAnyAdmin());
  allow create, update: if isAnyAdmin(); // Only admin/trigger functions award badges
}
```

---

## Part 5: UI/UX Mockup Descriptions (Text Format)

### 5.1 Mentor Discovery Screen
```
┌─────────────────────────────────────────┐
│ Ally & Support Network                  │ (Header)
├─────────────────────────────────────────┤
│ [Directory] [Allies] [Mentors] [Circles] [Pulse] [Ratings]
├─────────────────────────────────────────┤
│                                         │
│ 🔍 Search mentors by experience...      │ (Search)
│ [×] Filter                              │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🌟 Sarah M.                         ││ (Mentor Card)
│ │ Workplace Advocacy Expert           ││
│ │ 8 years experience | ⭐⭐⭐⭐⭐ (4.9) │
│ │                                     ││
│ │ Specialties:                        ││
│ │ • Disability disclosure             ││
│ │ • Accommodation negotiation         ││
│ │ • Combating discrimination          ││
│ │                                     ││
│ │ Disabilities: ADHD, Autism          ││
│ │ Languages: English, French          ││
│ │ Available: Mon, Wed, Fri 7-9 PM     ││
│ │                                     ││
│ │ [View Profile] [Request Mentorship] ││
│ └─────────────────────────────────────┘│
│                                         │
│ (Similar cards for other mentors)      │
│                                         │
└─────────────────────────────────────────┘
```

### 5.2 Mentor Profile View
```
┌─────────────────────────────────────────┐
│ ← Sarah M. (Workplace Advocate)         │ (Header with back)
├─────────────────────────────────────────┤
│                                         │
│ [Avatar] Sarah M.                       │ (Profile Header)
│ 🏆 Trusted Advisor 🌍 Global Advocate  │ (Badges)
│ ⭐⭐⭐⭐⭐ 4.9 (234 mentees rate)         │
│                                         │
│ About                                   │ (Sections)
│ I've navigated workplace disability     │
│ disclosure 3 times and want to help     │
│ others advocate for accommodations.     │
│ I specialize in tech companies.         │
│                                         │
│ Experience                              │
│ • Workplace Advocacy — 8 years          │
│ • Benefits Navigation — 5 years         │
│ • Legal Advocacy — 3 years              │
│                                         │
│ Communication                           │
│ • 💬 Text Chat (preferred)              │
│ • 📞 Voice Calls                        │
│ • 📹 Video (occasional)                 │
│                                         │
│ Availability                            │
│ Mon 7-9 PM EST  |  Wed 7-9 PM EST       │
│ Fri 7-9 PM EST  |  Flexible weekends    │
│                                         │
│ Languages: English, French, Spanish     │
│ Cultural Background: Canadian           │
│                                         │
│ Verification                            │
│ ✓ Email verified                        │
│ • References pending                    │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ [Request Mentorship]                ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### 5.3 Mentorship Request Modal
```
┌─────────────────────────────────────────┐
│ Request Mentorship                      │ (Modal Header)
│ with Sarah M.                           │
├─────────────────────────────────────────┤
│                                         │
│ Tell Sarah why you're interested:       │ (Text Input)
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ I'm navigating a workplace          ││
│ │ accommodation request and want to    ││
│ │ learn from someone with experience. ││
│ │                                     ││ (200 char counter)
│ │ [150/200 characters]                ││
│ └─────────────────────────────────────┘│
│                                         │
│ ☐ I'm comfortable with audio/video     │ (Preferences)
│ ☑ I prefer text-only initially         │
│                                         │
│ Safe mentorship promise                 │ (Info block)
│ We take safety seriously. All mentors  │
│ are verified. Block/report features    │
│ available anytime.                     │
│                                         │
│ [Cancel] [Send Request]                │ (Actions)
│                                         │
└─────────────────────────────────────────┘
```

### 5.4 Support Circles/Groups Screen
```
┌─────────────────────────────────────────┐
│ Support Circles                         │ (Header)
├─────────────────────────────────────────┤
│                                         │
│ 🔍 Find your community...               │ (Search)
│ [×] Filter by condition                 │
│                                         │
│ Browse Categories                       │ (Curated)
│ [ADHD & Neurodivergent] [Chronic Pain]  │
│ [Mental Health] [Advocacy]              │
│ [Workplace] [Family Support]            │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 💜 ADHD & Work                      ││ (Group Card)
│ │ 247 members | Active now             ││
│ │                                     ││
│ │ Share experiences navigating        ││
│ │ ADHD in professional settings       ││
│ │                                     ││
│ │ 💬 Last message 5 min ago           ││
│ │                                     ││
│ │ [Join Circle]                       ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🧠 Newly Diagnosed Support          ││
│ │ 89 members | Active 2 hours ago     ││
│ │                                     ││
│ │ For people recently diagnosed with  ││
│ │ disability; navigating emotions,    ││
│ │ medical system, and self-identity   ││
│ │                                     ││
│ │ 💬 Last message 2 hours ago         ││
│ │                                     ││
│ │ [Join Circle]                       ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### 5.5 Community Activity Feed
```
┌─────────────────────────────────────────┐
│ Community Pulse                         │ (Header)
├─────────────────────────────────────────┤
│                                         │
│ [×] Filter by type, relevance           │ (Filters)
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🏆 James earned "Expert Guide"      ││ (Activity Item)
│ │    badge                            ││
│ │ 2 hours ago                         ││
│ │ [View Profile]                      ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🌟 New Mentor: Maya T. is here!     ││
│ │    Specializes in Healthcare        ││
│ │    Navigation                       ││
│ │ 1 day ago                           ││
│ │ [View Profile] [Request]            ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🎯 New Support Circle: Grief &      ││
│ │    Loss Support                     ││
│ │ 3 days ago | 12 members already     ││
│ │ [Join Circle]                       ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 💬 Hot Discussion: "Telling your    ││
│ │    employer about invisible         ││
│ │    disability" 47 replies          ││
│ │ 5 days ago                          ││
│ │ [Read Thread]                       ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

## Part 6: Integration Points with Community Tab

### Consistency Patterns
The Community tab will inform Ally & Support Network design:

| Pattern | Community Impl. | Ally & Support Usage |
|---------|-----------------|---------------------|
| **Presence Tracking** | `services/community.ts::touchPresence()` | Show mentor online status, "active now" indicators |
| **Direct Messages** | `dm_threads` collection + rules | Mentorship request → auto-create DM thread |
| **Moderation** | `services/moderation.ts::flagItem()` | Report unsafe mentors, block users |
| **Channels** | `CommunityChannel` + threads | Support groups as "channels" with thread discussions |
| **User Profiles** | `users/` collection + photo URL | Mentor profiles leverage existing user data |
| **Badge System** | `components/badges/UserBadge.tsx` | Display peer recognition badges same way |
| **Offline-First** | Community store with AsyncStorage cache | Store mentor discovery locally |
| **Firestore Rules** | Permission model in rules file | New collections follow same admin/user patterns |
| **Navigation** | Lazy-loaded route wrappers | Use same Suspense + ScreenSkeleton pattern |
| **Accessibility** | A11yPressable, useFocusOnRefOnMount | Reuse A11y hooks and components |

### Cross-Tab Navigation
```
Community Tab                           Ally & Support Network Tab
┌─────────────────────┐                 ┌──────────────────────┐
│ • Peer Support      │ ←─ References ─→ │ • Find a Mentor    │
│   (currently lazy)  │                 │ • Support Circles  │
│ • Mutual Chat       │                 │ • Activity Feed    │
│ • Mutual Aid        │                 │ • Mentorship Req's │
│ • Threads/Discuss   │                 │ (+ existing tabs)  │
└─────────────────────┘                 └──────────────────────┘

Flows:
1. Mentor discovered in Advocacy → can message in Community DMs
2. Support group joined in Advocacy → group discussions in Community channels
3. Community discussion about a topic → suggest relevant mentors in Advocacy
4. User completes wellness goal → activity badge surfaces in both tabs
```

---

## Part 7: Implementation Plan (Phased, Non-Breaking)

### Phase 1A: Peer Mentor Discovery (Weeks 1-2)
**Task Sequence:**
1. ✅ Create `mentorProfiles` Firestore collection schema
2. ✅ Add Firestore rules for `mentorProfiles`
3. ✅ Create `MentorCard` component (reuse ProfileCard patterns)
4. ✅ Create `MentorDirectoryScreen` with Firestore query + filtering
5. ✅ Create `MentorProfileView` with full details
6. ✅ Add "Mentors" tab to `ally-support-network.tsx`
7. ✅ Seed mock mentor data for testing
8. ✅ A11y audit + testing

**Non-Breaking:** New tab, existing tabs unchanged

---

### Phase 1B: Support Group Matching (Weeks 3-4)
**Task Sequence:**
1. ✅ Create `supportGroups` collection schema
2. ✅ Add Firestore rules for groups + members + messages
3. ✅ Create `SupportGroupsScreen` with curated groups
4. ✅ Create `GroupDetailView` with member list + recent messages
5. ✅ Implement group join/leave membership
6. ✅ Add "Support Circles" tab to `ally-support-network.tsx`
7. ✅ Connect to community presence tracking
8. ✅ Seed initial groups (ADHD, Chronic Pain, Newly Diagnosed, etc.)
9. ✅ A11y audit + testing

**Non-Breaking:** New tab, reuses Community messaging patterns

---

### Phase 1C: Mentorship Request Workflow (Weeks 5-6)
**Task Sequence:**
1. ✅ Create `mentorshipRequests` collection schema
2. ✅ Create `activeRelationships` collection schema
3. ✅ Add Firestore rules for requests + relationships
4. ✅ Create `MentorshipRequestModal` form
5. ✅ Integrate modal into `MentorProfileView`
6. ✅ Create mentor dashboard/inbox for viewing requests
7. ✅ Implement accept/decline workflow
8. ✅ Auto-create DM thread on acceptance
9. ✅ Send welcome messages to both parties
10. ✅ Track mentorship in `activeRelationships`
11. ✅ A11y audit + testing

**Non-Breaking:** Feature layers on top of existing mentor discovery

---

### Phase 1D: Peer Recognition & Badges (Weeks 7-8)
**Task Sequence:**
1. ✅ Design badge types & criteria (define in code comments)
2. ✅ Create `peerBadges` collection schema
3. ✅ Create `badgeDefinitions` collection (seed data)
4. ✅ Add Firestore rules for peerBadges
5. ✅ Extend `UserBadge.tsx` to include peer badges
6. ✅ Create badge award triggers (Cloud Function or app logic):
      - "Emerging Mentor" when mentorship starts
      - "Trusted Advisor" when 5+ matches with avg 4.0+ rating
      - etc.
7. ✅ Create `BadgeProgressCard` showing progress toward next badge
8. ✅ Add badge notifications on earn
9. ✅ Display badges on mentor cards
10. ✅ Create leaderboard view (bonus)
11. ✅ A11y audit + testing

**Non-Breaking:** Gamification layer, doesn't break existing features

---

### Phase 1E: Community Activity Feed (Weeks 9-10)
**Task Sequence:**
1. ✅ Design activity types (mentor_joined, badge_earned, etc.)
2. ✅ Create `communityActivity` collection schema
3. ✅ Add Firestore rules for communityActivity
4. ✅ Create activity logging triggers in:
      - Mentor signup flow
      - Badge award system
      - Support group creation
      - Mentorship completion
5. ✅ Create `ActivityFeed` component
6. ✅ Create `ActivityItem` with type-specific rendering
7. ✅ Implement type + relevance filters
8. ✅ Add "Community Pulse" tab to `ally-support-network.tsx`
9. ✅ Real-time updates via Firestore listeners
10. ✅ A11y audit + testing

**Non-Breaking:** New tab, aggregates events from other features

---

### Testing & Refinement (Weeks 11-12)
- ✅ End-to-end testing of mentorship flows
- ✅ Firestore performance tuning (indexes)
- ✅ Offline fallback behavior
- ✅ Accessibility scan (`npm run a11y:scan`)
- ✅ A11y manual testing
- ✅ Security audit (Firestore rules)
- ✅ Beta tester feedback
- ✅ Bug fixes & polish

---

## Part 8: Success Metrics

### Adoption Metrics
| Metric | Target (6 months) | How to Measure |
|--------|------------------|-----------------|
| Active mentors | 50+ | `mentorProfiles` with `acceptingMentees: true` |
| Support groups created | 20+ | `supportGroups` collection count |
| Mentorship requests sent | 200+ | `mentorshipRequests` table |
| Successful pairings | 150+ | `activeRelationships` with status: 'active' |
| Support group members | 500+ | `supportGroups/*/members` aggregate |
| Community activity posts | 1000+ | `communityActivity` collection count |

### Engagement Metrics
| Metric | Target | How to Measure |
|--------|--------|-----------------|
| Mentor response time | <24 hrs | `mentorshipRequests` respondedAt - createdAt |
| Mentorship completion rate | 80%+ | (Completed relationships / Active relationships) |
| Peer helpfulness rating | 4.0+ avg | `activeRelationships.feedback.rating` |
| Support group activity | 5+ msgs/day per group | `supportGroups/*/messages` count |
| Badge earned rate | 30%+ of mentors | `peerBadges` with > 0 badges |
| Activity feed engagement | 20% of users | Analytics: tap rate on feed items |

### Quality Metrics
| Metric | Target | How to Measure |
|--------|--------|-----------------|
| Safety ratings | 4.5+ avg | `activeRelationships.feedback.safetyRating` |
| User satisfaction (NPS) | 40+ | In-app survey after mentorship |
| A11y compliance | 100% | Automated + manual a11y testing |
| Performance | <2s load | Mentor discovery list load time |
| Error rate | <1% | Error logs in analytics |

---

## Part 9: Risk Analysis & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| **Mentor no-shows** | User frustration, churn | Medium | Reputation system, reliability badges, reminders |
| **Unsafe behavior** | Safety concerns, liability | Low | Verification, blocking, moderation, reporting |
| **Firestore costs** | Budget overrun | Low | Indexes, query optimization, caching strategy |
| **Data privacy** | GDPR/compliance issues | Low | Privacy policy, opt-in, data retention rules |
| **Feature creep** | Phase 1 delays | Medium | Strict scope (5 features), phased rollout |
| **Poor mentor quality** | Users trust low | Medium | Rating system, badges, reference verification |
| **Low adoption** | ROI concerns | Medium | Marketing, onboarding, incentives (badges) |
| **Integration bugs** | Mentor DMs fail | Low | E2E testing, staging environment |

---

## Part 10: Future Phases (Roadmap)

### Phase 2: Advanced Mentorship (Future)
- Video calling integration (Agora/Twilio)
- Scheduled meeting calendar
- Mentorship curriculum/milestones
- Peer case study library
- Mentor analytics dashboard

### Phase 3: Community Expansion (Future)
- Local in-person meetups
- Peer-led workshops
- Advocacy skill certifications
- Mentor training program
- Community events integration

### Phase 4: AI-Assisted (Future)
- Mentor recommendation algorithm
- Smart match scoring
- AI coaching assistant for mentors
- Peer story transcription + summaries
- Accessibility transcription for group chats

---

## Appendix: Code Organization

### New Files to Create
```
components/
  ├── MentorCard.tsx (mentor preview card)
  ├── MentorProfileView.tsx (full mentor profile)
  ├── MentorFilterSheet.tsx (filter by experience, etc.)
  ├── MentorshipRequestModal.tsx (request form)
  ├── SupportGroupsScreen.tsx (groups discovery)
  ├── GroupDetailView.tsx (group profile + messages)
  ├── GroupSearchSheet.tsx (filter groups)
  ├── ActivityFeed.tsx (main feed component)
  ├── ActivityItem.tsx (activity card, type-specific)
  ├── ActivityFilterSheet.tsx (filter activities)
  └── BadgeProgressCard.tsx (progress toward badge)

services/
  ├── mentorDiscovery.ts (mentor queries, filters)
  ├── supportGroups.ts (group management, messaging)
  ├── mentorshipWorkflow.ts (request/accept logic)
  ├── peerBadges.ts (badge award triggers, queries)
  ├── communityActivity.ts (activity logging, queries)
  └── (extend existing files as needed)

app/(tabs)/advocacy/
  ├── (modify) ally-support-network.tsx (add new tabs)
  ├── mentor-discovery.tsx (route wrapper)
  ├── support-groups.tsx (route wrapper)
  ├── activity-feed.tsx (route wrapper)
  └── mentor-dashboard.tsx (mentor inbox - optional)
```

### Modified Files
```
app/(tabs)/advocacy/ally-support-network.tsx
  - Add 3 new tabs: "Mentors", "Support Circles", "Pulse"

firebase/firestore.rules
  - Add rules for 5 new collections

services/firestore.ts
  - Add helper functions for new collections

types/models.ts
  - Add TypeScript interfaces for all data models

package.json (if needed)
  - No new dependencies required (use existing Firebase)
```

---

## Conclusion

This Phase 1 design provides a **non-breaking, phased approach** to transforming the Ally & Support Network from an information hub into a **peer-to-peer support engine**. By leveraging existing Community tab infrastructure and patterns, we can launch 5 interconnected features that:

✅ Help users discover mentors and build meaningful relationships  
✅ Enable support groups organized by condition/journey  
✅ Create formal mentorship workflows with safety guardrails  
✅ Recognize and incentivize helpful peers with badges  
✅ Surface community milestones and peer achievements  

**Timeline:** 12 weeks (3 months) for complete Phase 1 implementation  
**Non-Breaking:** All features are additive; existing tabs unmodified  
**Success Metrics:** Clear KPIs for adoption, engagement, and quality  
**Future-Ready:** Architecture supports AI, video, certification, and local events in Phase 2+

---

**Document Version:** 1.0  
**Last Updated:** January 3, 2026  
**Status:** ✅ Research & Design Complete | 🔄 Ready for Implementation  
