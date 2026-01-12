# Implementation Roadmap
## Feature Consolidation & Flywheel Implementation

**Created**: January 1, 2026
**Status**: Ready to implement
**Priority**: High - Reduces user overwhelm by 60%

---

## Phase 1: PowerTool Implementation (Weeks 1-3)

### 1.1 Legal Action Hub PowerTool ⭐ HIGH PRIORITY

**File**: `app/(tabs)/advocacy/legal-action-hub-v2.tsx`

**Structure** (5 tabs):
1. **Track Tab** (Simple Mode) - Personal accountability case management
2. **Coach Tab** (Simple Mode) - AI-powered accountability coaching
3. **Legal Tab** (Standard Mode) - Lawyer finder, Legal DNA, Collective action
4. **Automate Tab** (Power User) - Legal process automation
5. **Policy Tab** (Power User) - Policy simplification

**Implementation Steps**:
```typescript
// 1. Create main file with PowerTool structure
import { PowerTool, PowerToolTab } from '../../../components/PowerTool';

const tabs: PowerToolTab[] = [
  {
    key: 'track',
    title: 'Track',
    icon: '📋',
    complexity: 'simple',
    keywords: ['case', 'track', 'accountability'],
    component: TrackTab,
  },
  {
    key: 'coach',
    title: 'Coach',
    icon: '🧑‍🏫',
    complexity: 'simple',
    keywords: ['AI', 'coach', 'plan'],
    component: CoachTab,
  },
  // ... 3 more tabs
];

// 2. Implement each tab component
// 3. Test complexity mode filtering
// 4. Add to navigation
```

**Source Files to Consolidate**:
- accountability-cases.tsx → Track tab (case list)
- accountability-case.tsx → Track tab (case detail)
- accountability-coach.tsx → Coach tab (mostly as-is)
- lawyer-finder.tsx → Legal tab section
- legal-dna.tsx → Legal tab section
- collective-legal.tsx → Legal tab section
- legal-automation.tsx → Automate tab (lazy load)
- policy-simple.tsx → Policy tab (mostly as-is)

**Estimated Time**: 18 days (per plan)

---

### 1.2 Ally & Support Network Enhancement ⭐ HIGH PRIORITY

**File**: `app/(tabs)/advocacy/ally-support-network.tsx` (ENHANCE EXISTING)

**Action**: Replace placeholder content with real implementations

**Tab Enhancements**:
1. **Directory Tab** - Import real data from `data/support.ts` (50+ orgs)
2. **Allies Tab** - Add AI coaching section from ally-hub.tsx
3. **Self-Coach Tab** - Replace with full self-advocacy-coach.tsx content
4. **Ratings Tab** - Replace with full ratings.tsx (Firestore integration)
5. **World Tab** - Replace with world-map.tsx (real map data)

**Implementation Steps**:
```typescript
// Directory Tab Enhancement
import { supportOrgs } from '../../../data/support';

// Replace mock data:
// const mockOrgs = [...]
// With:
const orgs = supportOrgs;

// Allies Tab Enhancement
import { aiCoachPrompt } from '../../../services/aiAdvocacy';

// Add AI coaching section after ally types

// Self-Coach Tab Replacement
// Copy entire component from self-advocacy-coach.tsx

// Ratings Tab Replacement
// Copy entire component from ratings.tsx
// Include Firestore integration

// World Tab Replacement
// Copy entire component from world-map.tsx
```

**Estimated Time**: 10 days (5 phases)

---

## Phase 2: File Cleanup (Week 1)

### 2.1 Delete Legacy Files ✅ QUICK WIN

**Files to Delete** (10 total):

**AI Tools - Backups** (7 files):
```bash
rm app/(tabs)/advocacy/ai-advocate-translator-old.tsx
rm app/(tabs)/advocacy/ai-case-interpreter-old.tsx
rm app/(tabs)/advocacy/ai-gov-navigator-old.tsx
rm app/(tabs)/advocacy/ai-assistant-old.tsx
rm app/(tabs)/advocacy/ai-command-center-old.tsx
rm app/(tabs)/advocacy/ask-old.tsx
rm app/(tabs)/advocacy/assistant-hub-old.tsx
```

**Daily Planner Duplicates** (2 files):
```bash
rm app/(tabs)/wellness/daily-planner-backup.tsx
rm app/(tabs)/wellness/daily-planner-enhanced.tsx
# Keep: daily-planner.tsx
```

**Legacy Energy Hub** (1 file):
```bash
rm app/(tabs)/wellness/energy-hub.tsx
# Superseded by: energy-command-center.tsx
```

**Git Commit**:
```bash
git add -A
git commit -m "cleanup: Remove 10 duplicate and legacy files"
```

**Estimated Time**: 30 minutes

---

### 2.2 Create Redirect Files 📌 MEDIUM PRIORITY

**Redirect Pattern**:
```typescript
import { Redirect } from 'expo-router';

export const options = { href: null }; // Hide from navigation

export default function LegacyScreenRedirect() {
  return <Redirect href="/(tabs)/section/power-tool?tab=tabname" />;
}
```

**Evidence Screens** → Evidence Command Center:
- evidence-locker.tsx → ?tab=locker
- evidence-manager.tsx → ?tab=locker
- evidence-vault.tsx → ?tab=locker
- evidence-queue.tsx → ?tab=locker

**Document Screens** → Document Factory:
- letter-wizard.tsx → ?tab=letters
- letter-factory.tsx → ?tab=letters
- letters.tsx → ?tab=letters
- templates-gallery.tsx → ?tab=templates
- accommodation-request.tsx → ?tab=accommodation
- prepare-appeal.tsx → ?tab=appeals
- appeal-coach.tsx → ?tab=appeals

**Health Screens** → Unified Health Hub:
- health-tracker.tsx → main page
- symptom-tracker.tsx → ?tab=symptoms
- medications.tsx → ?tab=meds
- meds-tracker.tsx → ?tab=meds
- doctor-visit-prep.tsx → ?tab=doctor

**Energy Screens** → Energy Command Center:
- spoon-economist.tsx → ?tab=dashboard
- pacing-partner.tsx → ?tab=pacing
- pain-forecast.tsx → ?tab=forecast
- sleep-energy-tracker.tsx → ?tab=sleep

**Mental Health Screens** → Mental Wellness Toolkit:
- cbt-coach.tsx → ?tab=cbt
- dbt.tsx → ?tab=dbt
- opposite-action.tsx → ?tab=opposite
- radical-acceptance.tsx → ?tab=acceptance

**Estimated Time**: 2 days (create 50+ redirect files)

---

## Phase 3: Flywheel Implementation (Weeks 4-8)

### 3.1 Evidence Flywheel 🔄 HIGH IMPACT

**Goal**: Users sharing wins creates viral growth

**Components to Build**:

**1. Win Detection System**
```typescript
// services/winDetection.ts
export interface WinReport {
  id: string;
  caseId: string;
  userId: string;
  winType: 'accommodation' | 'appeal' | 'settlement' | 'policy_change';
  title: string;
  description: string;
  evidenceIds?: string[]; // Optional evidence attachments
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: Date;
  metrics: {
    views: number;
    helpfulVotes: number;
    inspired: number; // How many copied this approach
  };
}

export async function reportWin(win: WinReport): Promise<void> {
  // Save to Firestore
  // Notify community
  // Trigger share prompt
}
```

**2. Win Sharing UI**
```typescript
// components/WinShareModal.tsx
// Shows after case status → "Won"
// Pre-filled social media templates
// Option to attach evidence (anonymized)
// Privacy controls (anonymous/public/community-only)
```

**3. Wins Showcase**
```typescript
// app/(tabs)/community/wins.tsx
// Feed of community wins
// Filter by win type
// Sort by recent/helpful
// Search functionality
```

**4. Viral Mechanics**
- SEO-friendly win pages
- Open Graph meta tags
- Twitter/Facebook share buttons
- Embed codes for external sites

**Data Model**:
```typescript
// Firestore collection: wins
{
  id: string,
  userId: string,
  caseId: string,
  winType: string,
  title: string,
  description: string,
  evidenceUrls: string[], // Anonymized, user-controlled
  tags: string[],
  isAnonymous: boolean,
  visibility: 'public' | 'community' | 'private',
  metrics: {...},
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Estimated Time**: 12 days

---

### 3.2 Collective Action Flywheel 🔄 HIGH IMPACT

**Goal**: Users coordinating together creates exponential impact

**Components to Build**:

**1. Pattern Matching Engine**
```typescript
// services/patternMatching.ts
export interface ViolationPattern {
  entityId: string; // Hashed entity identifier
  violationType: string;
  reportCount: number;
  users: string[]; // Anonymized user IDs
  similarity: number; // 0-1 score
}

export async function detectPatterns(): Promise<ViolationPattern[]> {
  // Analyze collective-legal reports
  // Group by entity + violation type
  // Return patterns with 3+ users
}

export async function notifyMatched(pattern: ViolationPattern): Promise<void> {
  // Notify users: "5 others reported XYZ for same issue"
  // Offer to connect (opt-in)
}
```

**2. Private Coordination Groups**
```typescript
// app/(tabs)/community/collective-groups/[id].tsx
// Private group for matched users
// Shared evidence repository (opt-in)
// Strategy planning tools
// Timeline coordination
// Collective deadlines
```

**3. Collective Action Tools**
```typescript
// components/CollectiveActionTools.tsx
// Joint letter templates (co-signed)
// Collective complaint filing
// Media campaign templates
// Petition creation
// Social media coordination (hashtag, timing)
```

**4. Public Campaign Pages**
```typescript
// app/(tabs)/campaigns/[id].tsx
// SEO-friendly public page
// Live progress tracking (# people, signatures)
// Social proof widgets
// Share buttons
// Media kit (press release, images)
```

**Data Model**:
```typescript
// Firestore collections:
// 1. violation_reports (anonymous submissions)
// 2. patterns (detected matches)
// 3. collective_groups (private coordination)
// 4. campaigns (public actions)
```

**Estimated Time**: 15 days

---

### 3.3 Knowledge Network Flywheel 🔄 MEDIUM IMPACT

**Goal**: Community contributions compound knowledge quality

**Components to Build**:

**1. Contribution System**
```typescript
// services/contributions.ts
export interface Contribution {
  id: string;
  userId: string;
  articleId: string; // Knowledge Base article
  type: 'tip' | 'update' | 'correction' | 'case_study' | 'faq';
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: {
    helpful: number;
    notHelpful: number;
  };
  createdAt: Date;
}

export async function submitContribution(contrib: Contribution): Promise<void> {
  // Save to moderation queue
  // Notify admins
  // Award points to user
}
```

**2. Quality Mechanisms**
```typescript
// components/ContributionVoting.tsx
// Helpful/Not Helpful buttons
// Flagging (outdated/incorrect)
// Editing (trusted users)
// Revision history
```

**3. Reputation System**
```typescript
// services/reputation.ts
export interface UserReputation {
  userId: string;
  points: number;
  level: 1 | 2 | 3; // 1: suggest, 2: edit, 3: approve
  badges: ('contributor' | 'expert' | 'trusted_editor')[];
  contributions: number;
  acceptedContributions: number;
}

export function calculateLevel(points: number): number {
  if (points < 50) return 1;
  if (points < 200) return 2;
  return 3;
}
```

**4. Enhanced Search & Discovery**
```typescript
// app/(tabs)/resources/knowledge-base.tsx
// Enhanced with:
// - User-contributed content indexed
// - "Related questions"
// - "Popular this week"
// - "Recently updated"
// - Rich snippets for SEO
```

**Data Model**:
```typescript
// Firestore collections:
// 1. contributions (user submissions)
// 2. reputation (user points/badges)
// 3. knowledge_articles (enhanced with contributions)
```

**Estimated Time**: 10 days

---

## Phase 4: Navigation Consolidation (Week 9)

### 4.1 Reduce Bottom Tabs: 8 → 5-6

**Current Tabs** (8):
1. Home
2. Wellness
3. Resources
4. Advocacy
5. Community
6. Campaigns
7. Events
8. Research

**Proposed Consolidation** (5 tabs):
1. **Home** - Dashboard, quick actions
2. **Wellness** - All wellness PowerTools
3. **Advocacy** - All advocacy PowerTools + Resources
4. **Community** - Social + Campaigns + Events
5. **More** - Settings, About, Research, Archive

**Alternative** (6 tabs):
1. **Home**
2. **Wellness**
3. **Advocacy**
4. **Resources**
5. **Community**
6. **Action** (Campaigns + Events)

**Implementation**:
```typescript
// app/(tabs)/_layout.tsx
// Update Tabs.Screen configuration
// Test navigation
// Update analytics
```

**Estimated Time**: 3 days

---

## Phase 5: Testing & Polish (Week 10)

### 5.1 Comprehensive Testing

**PowerTools**:
- [ ] Legal Action Hub - all 5 tabs functional
- [ ] Ally & Support Network - all enhancements working
- [ ] All 9 existing PowerTools still working

**Cleanup**:
- [ ] No broken links from deleted files
- [ ] All redirects working correctly
- [ ] Navigation updated everywhere

**Flywheels**:
- [ ] Evidence Flywheel - win reporting works
- [ ] Collective Action - pattern matching works
- [ ] Knowledge Network - contributions work

**Accessibility**:
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Font scaling

**Performance**:
- [ ] Lazy loading working
- [ ] No memory leaks
- [ ] Fast tab switching
- [ ] Smooth scrolling

---

## Success Metrics

### Quantitative Targets
- ✅ Reduce top-level screens by 60% (100+ → 40)
- ✅ Reduce bottom tabs by 25-38% (8 → 5-6)
- ✅ Simple Mode shows ≤15 features
- 🎯 Average time-to-feature reduced by 40%
- 🎯 Feature discovery rate up 50%

### Qualitative Goals
- 🎯 Improved accessibility scores (WCAG AAA)
- 🎯 Positive feedback from disability community
- 🎯 Reduced support requests ("where is X?")
- 🎯 Higher user engagement
- 🎯 Lower abandonment rate for new users

### Viral Growth (Flywheels)
- 🎯 Evidence wins shared → 20% of users
- 🎯 Collective actions formed → 10 per month
- 🎯 Knowledge contributions → 50 per month
- 🎯 Viral coefficient > 1.0 (self-sustaining growth)

---

## Implementation Priority

### Week 1 (Immediate)
1. ✅ Delete 10 legacy files (30 min)
2. 🔨 Build Legal Action Hub (start)

### Weeks 2-3
3. 🔨 Complete Legal Action Hub
4. 🔨 Enhance Ally & Support Network

### Week 4
5. 🔨 Create 50+ redirect files
6. 🔨 Start Evidence Flywheel

### Weeks 5-6
7. 🔨 Complete Evidence Flywheel
8. 🔨 Start Collective Action Flywheel

### Weeks 7-8
9. 🔨 Complete Collective Action Flywheel
10. 🔨 Knowledge Network Flywheel

### Week 9
11. 🔨 Navigation consolidation (tabs reduction)

### Week 10
12. 🧪 Testing, polish, launch

---

## Risk Management

**Technical Risks**:
- PowerTool complexity → Mitigation: Follow proven pattern
- Data migration → Mitigation: Keep original files temporarily
- Performance issues → Mitigation: Lazy loading, optimization

**User Risks**:
- Feature discovery → Mitigation: Onboarding, search, help
- Learning curve → Mitigation: Simple Mode first, tutorials
- Resistance to change → Mitigation: Gradual rollout, feedback

**Business Risks**:
- Development time → Mitigation: Parallel work, agent assistance
- Quality issues → Mitigation: Comprehensive testing
- User churn → Mitigation: A/B testing, rollback plan

---

## Next Action

**Immediate**: Delete 10 legacy files (Quick win, 30 minutes)
**Then**: Start Legal Action Hub PowerTool implementation

**Command to Execute**:
```bash
# Delete legacy files
rm app/\(tabs\)/advocacy/ai-*-old.tsx
rm app/\(tabs\)/wellness/daily-planner-backup.tsx
rm app/\(tabs\)/wellness/daily-planner-enhanced.tsx
rm app/\(tabs\)/wellness/energy-hub.tsx

# Commit
git add -A
git commit -m "cleanup: Remove 10 duplicate and legacy files"
```

---

**Document Created**: January 1, 2026
**Maintained By**: Claude Code
**Review Schedule**: Weekly during implementation
**Owner**: 3mpwr App Development Team
