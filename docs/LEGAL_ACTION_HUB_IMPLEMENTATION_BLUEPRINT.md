# Legal Action Hub PowerTool - Implementation Blueprint
**Phase 1 Implementation Plan**  
**Status**: Research Complete | **Target**: 8+ screens consolidated into unified hub  
**Document Date**: January 3, 2026

---

## 📋 Executive Summary

This blueprint consolidates 12+ legal-related screens scattered across `advocacy/` and `resources/` tabs into a single **Legal Action Hub PowerTool**, reducing cognitive load and screen count. The hub builds on the existing PowerTool architecture (Evidence Command Center, Case Tracker Pro) and is the foundational component for reducing 100+ screens to 40 by January 31, 2026.

**Current Status**: Legal Action Hub structure exists at `app/(tabs)/advocacy/legal-action-hub.tsx` with 5 core tabs. This blueprint expands and refines the consolidation strategy.

---

## 🎯 PHASE 1: SCREENS TO CONSOLIDATE

### **Primary Legal Screens (12 screens identified)**

#### **Advocacy Tab** (`app/(tabs)/advocacy/`)
| Screen | File | Purpose | Consolidation Target |
|--------|------|---------|----------------------|
| Accountability Hub | `accountability-hub.tsx` | Track accountability cases | ✅ **TRACK tab** |
| Case Tracking | `accountability-cases.tsx` | View multiple cases | ✅ **TRACK tab** |
| Case Management | `accountability-case.tsx` | Edit/manage single case | ✅ **TRACK tab** |
| Accountability Coach | `accountability-coach.tsx` | Scripts & guidance | ✅ **COACH tab** |
| Support Network | `accountability-network.tsx` | Connect with allies | ✅ **COACH tab** |
| Lawyer Finder | `lawyer-finder.tsx` | Find legal professionals | ✅ **LEGAL HELP tab** |
| Collective Legal | `collective-legal.tsx` | Class action participation | ✅ **LEGAL HELP tab** |
| Legal DNA | `legal-dna.tsx` | Case strength analysis | ✅ **LEGAL HELP tab** |
| Legal Automation | `legal-automation.tsx` | Workflow automation | ✅ **AUTOMATION tab** |
| Policy Simple | `policy-simple.tsx` | Policy education & advocacy | ✅ **POLICY tab** |

#### **Resources Tab** (`app/(tabs)/resources/`)
| Screen | File | Purpose | Consolidation Target |
|--------|------|---------|----------------------|
| Case Timeline | `case-timeline.tsx` | Visual timeline of case events | ✅ **TRACK tab** (secondary) |
| Letter Factory | `letter-factory.tsx` | Generate legal correspondence | 🔄 *Separate tool* |
| Claims Navigator | `claims-navigator.tsx` | Guide for benefits claims | ✅ **LEGAL HELP tab** (bonus) |
| Justice as a Service | `justice-as-a-service.tsx` | AI legal intelligence | ✅ **AUTOMATION tab** |

### **Supporting Legal Components (not direct screens but integrated)**
- `evidence-command-center.tsx` - Evidence management (linked from hub)
- `LegalAutomationContent.tsx` - Document generation & workflow
- `LetterWizardContent.tsx` - 22+ letter templates
- `LegalWorkflowEngine.tsx` - Guided legal processes

### **Related but NOT consolidated (separate tools)**
- 🏥 **Health Tracking**: `chronic-tracker.tsx`, `medical-gaslighting-detector.tsx`, `meds-tracker.tsx`
- 💰 **Financial Tools**: `financial-safety-net.tsx`, `rights-benefits-calculator.tsx`
- 📋 **Trackers**: `case-tracker-pro.tsx` (Master Tracker Hub)
- 📝 **Document Factory**: Document storage & templates (separate from letters)

---

## 🏗️ HUB ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│         LEGAL ACTION HUB (app/(tabs)/advocacy/legal-action-hub.tsx)        │
│                          PowerTool Pattern                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
   │ Simple Mode │    │ Standard Mode │    │ Power User   │
   └─────────────┘    └──────────────┘    └──────────────┘
        │                   │                     │
        
   TAB 1: ACCOUNTABILITY (Simple)
   ├─ Active Cases (from accountability-tracker service)
   │  ├─ accountability-cases.tsx (redirect → hub/track)
   │  └─ accountability-case.tsx (redirect → hub/track)
   ├─ Quick Actions
   │  ├─ Start New Case
   │  ├─ View All Cases
   │  ├─ Get Coach Guidance
   │  └─ Support Network
   └─ Consolidation: accountability-hub.tsx → hub/track

   TAB 2: COACH (Simple)
   ├─ Top Coach Scripts
   │  ├─ Evidence ask script
   │  ├─ Timeline demand script
   │  ├─ Accommodation script
   │  └─ Appeal prep checklist
   ├─ Actions
   │  ├─ Open Accountability Coach (accountability-coach.tsx → here)
   │  ├─ Ask Allies (accountability-network.tsx → here)
   │  └─ Attach Evidence (links to Evidence Command Center)
   └─ Consolidation: accountability-coach.tsx, accountability-network.tsx → hub/coach

   TAB 3: LEGAL HELP (Standard)
   ├─ Legal Resources
   │  ├─ Find a Lawyer (lawyer-finder.tsx → here)
   │  ├─ Collective Legal Action (collective-legal.tsx → here)
   │  ├─ Legal Aid Services
   │  └─ Legal DNA (legal-dna.tsx → here)
   ├─ Recent Matches
   │  └─ Recommended lawyers (cached from lawyer-finder)
   └─ Consolidation: lawyer-finder.tsx, collective-legal.tsx, legal-dna.tsx → hub/legal

   TAB 4: AUTOMATION (Power User - Beta)
   ├─ Automation Tools
   │  ├─ Deadline Automation (from legal-automation.tsx)
   │  ├─ Legal Templates
   │  ├─ FOIA Request Generator
   │  └─ Complaint Filing
   ├─ Justice as a Service
   │  ├─ Case Review (justice-as-a-service.tsx → here)
   │  ├─ Strategy Builder
   │  └─ Outcome Simulator
   └─ Consolidation: legal-automation.tsx, justice-as-a-service.tsx → hub/automation

   TAB 5: POLICY (Power User)
   ├─ Policy Areas
   │  ├─ Disability Policy
   │  ├─ Healthcare Policy
   │  ├─ Employment Law
   │  └─ Housing Rights
   ├─ Take Action
   │  ├─ Write to Your MP (policy-simple.tsx → here)
   │  ├─ Sign Petitions
   │  └─ Join Campaigns
   └─ Consolidation: policy-simple.tsx → hub/policy

   SUPPORTING SYSTEMS
   ├─ Evidence Command Center (separate tool, linked)
   ├─ Letter Generator (22 templates, separate in resources)
   └─ Case Tracker Pro (separate tool, linked)
```

---

## 📊 CONSOLIDATION MAPPING

### **Quick Reference: Old Paths → New Hub Paths**

```
ACCOUNTABILITY SCREENS:
  /advocacy/accountability-hub          → /advocacy/legal-action-hub?tab=accountability
  /advocacy/accountability-cases        → /advocacy/legal-action-hub?tab=accountability
  /advocacy/accountability-case?id=:id  → /advocacy/legal-action-hub?tab=accountability&case=:id
  /advocacy/accountability-coach        → /advocacy/legal-action-hub?tab=coach
  /advocacy/accountability-network      → /advocacy/legal-action-hub?tab=coach

LEGAL HELP SCREENS:
  /advocacy/lawyer-finder               → /advocacy/legal-action-hub?tab=legal
  /advocacy/collective-legal            → /advocacy/legal-action-hub?tab=legal
  /advocacy/legal-dna                   → /advocacy/legal-action-hub?tab=legal

AUTOMATION SCREENS:
  /advocacy/legal-automation            → /advocacy/legal-action-hub?tab=automation
  /resources/justice-as-a-service       → /advocacy/legal-action-hub?tab=automation

POLICY SCREENS:
  /advocacy/policy-simple               → /advocacy/legal-action-hub?tab=policy
```

---

## 🎯 IMPLEMENTATION STRATEGY

### **Phase 1A: Redirect Wrappers (Week 1)**
Create thin wrapper files that redirect old paths to new hub:

```
/advocacy/accountability-hub.tsx
  → Redirect to legal-action-hub with tab=accountability

/advocacy/accountability-cases.tsx
  → Redirect to legal-action-hub with tab=accountability

/advocacy/accountability-coach.tsx
  → Redirect to legal-action-hub with tab=coach

... (repeat for all 10 old screens)
```

**Benefits:**
- ✅ Deep links still work
- ✅ Existing navigation unbroken
- ✅ Users land on hub, can explore other tabs
- ✅ No immediate migration burden

### **Phase 1B: Hub Enhancement (Week 1-2)**
Expand existing `legal-action-hub.tsx`:

1. **Add Parameter Support**
   - `?tab=accountability|coach|legal|automation|policy`
   - `?case=:id` for specific case
   - `?search=:query` for internal search

2. **Enhance Data Loading**
   - Load active cases on mount
   - Cache lawyer directory data
   - Pre-fetch templates on tab change

3. **Add In-Hub Navigation**
   - Buttons to switch between tabs
   - Links from case → coach guidance
   - Links from coach → legal help
   - Breadcrumb or history

### **Phase 1C: Analytics & UX (Week 2)**
Track user navigation:
- `legal_action_hub.tab_switch` - Which tabs users visit
- `legal_action_hub.redirect_from_old_path` - How many use old paths vs direct
- `legal_action_hub.internal_navigation` - Cross-tab navigation patterns

---

## 💾 FILE STRUCTURE

### **New Files to Create**

```
app/(tabs)/advocacy/
├── legal-action-hub.tsx                    ✅ EXISTING (enhance)
├── legal-action-hub/
│   ├── tabs/
│   │   ├── AccountabilityTab.tsx           (extract from hub)
│   │   ├── CoachTab.tsx                    (extract from hub)
│   │   ├── LegalHelpTab.tsx                (extract from hub)
│   │   ├── AutomationTab.tsx               (extract from hub)
│   │   └── PolicyTab.tsx                   (extract from hub)
│   ├── components/
│   │   ├── CaseCard.tsx                    (reusable)
│   │   ├── LawyerCard.tsx                  (reusable)
│   │   ├── ResourceCard.tsx                (reusable)
│   │   ├── LegalAction.tsx                 (CTA button)
│   │   └── TabNavigation.tsx               (in-hub nav)
│   └── hooks/
│       ├── useLegalCases.ts                (load cases)
│       ├── useLawyerSearch.ts              (find lawyers)
│       └── useLegalTemplates.ts            (load templates)
│
└── [REDIRECT WRAPPERS - Keep as thin wrappers]
    ├── accountability-hub.tsx               → redirect to legal-action-hub
    ├── accountability-cases.tsx             → redirect to legal-action-hub
    ├── accountability-case.tsx              → redirect to legal-action-hub
    ├── accountability-coach.tsx             → redirect to legal-action-hub
    ├── accountability-network.tsx           → redirect to legal-action-hub
    ├── lawyer-finder.tsx                    → redirect to legal-action-hub
    ├── collective-legal.tsx                 → redirect to legal-action-hub
    ├── legal-dna.tsx                        → redirect to legal-action-hub
    ├── legal-automation.tsx                 → redirect to legal-action-hub
    └── policy-simple.tsx                    → redirect to legal-action-hub

resources/(tools)/
├── [KEEP AS SEPARATE TOOLS]
    ├── case-tracker-pro.tsx                 (Master Tracker Hub)
    ├── letter-factory.tsx                   (Letter templates)
    └── justice-as-a-service.tsx             (redirect to hub/automation)
```

### **Redirect Pattern**

```tsx
// Example: advocacy/accountability-hub.tsx (redirect wrapper)
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AccountabilityHubRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/(tabs)/advocacy/legal-action-hub?tab=accountability');
  }, [router]);
  
  return null; // Instant redirect
}
```

---

## 🔄 ROUTING STRATEGY

### **URL Scheme**

```
// Main entry point
/(tabs)/advocacy/legal-action-hub

// With tab navigation
/(tabs)/advocacy/legal-action-hub?tab=accountability
/(tabs)/advocacy/legal-action-hub?tab=coach
/(tabs)/advocacy/legal-action-hub?tab=legal
/(tabs)/advocacy/legal-action-hub?tab=automation
/(tabs)/advocacy/legal-action-hub?tab=policy

// With specific case
/(tabs)/advocacy/legal-action-hub?tab=accountability&case=case-123

// With search
/(tabs)/advocacy/legal-action-hub?tab=legal&search=disability+rights

// Legacy paths (auto-redirect)
/(tabs)/advocacy/accountability-hub → /(tabs)/advocacy/legal-action-hub?tab=accountability
/(tabs)/advocacy/lawyer-finder → /(tabs)/advocacy/legal-action-hub?tab=legal
/(tabs)/advocacy/legal-automation → /(tabs)/advocacy/legal-action-hub?tab=automation
```

### **Deep Linking**

```typescript
// From anywhere in app:
router.push({
  pathname: '/(tabs)/advocacy/legal-action-hub',
  params: { tab: 'coach' }
} as any);

// or with case ID:
router.push({
  pathname: '/(tabs)/advocacy/legal-action-hub',
  params: { tab: 'accountability', case: 'case-123' }
} as any);
```

---

## 🎨 COMPONENT STRUCTURE

### **Tab Organization Strategy**

#### **Complexity Levels**
- **Simple Mode** (New users, basic needs)
  - Accountability Tab
  - Coach Tab
  - Basic actions & navigation

- **Standard Mode** (Some legal experience)
  - Legal Help Tab
  - Access to detailed resources
  - Advanced filtering & search

- **Power User Mode** (Expert, all features)
  - Automation Tab
  - Policy Tab
  - Advanced analysis tools
  - Custom workflows

#### **PowerTool Integration**

```typescript
// Hub inherits from PowerTool pattern
const tabs: PowerToolTab[] = [
  {
    id: 'accountability',
    label: 'Accountability',
    icon: '📋',
    component: AccountabilityTab,
    complexity: 'simple',
    keywords: ['case', 'accountability', 'track', 'entity'],
  },
  {
    id: 'coach',
    label: 'Coach',
    icon: '🧑‍🏫',
    component: CoachTab,
    complexity: 'simple',
    keywords: ['coach', 'script', 'support', 'network'],
  },
  {
    id: 'legal',
    label: 'Legal Help',
    icon: '⚖️',
    component: LegalHelpTab,
    complexity: 'standard',
    keywords: ['lawyer', 'legal aid', 'collective', 'dna'],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: '⚡',
    component: AutomationTab,
    complexity: 'power_user',
    badge: 'beta',
    keywords: ['automate', 'deadline', 'template', 'FOIA'],
  },
  {
    id: 'policy',
    label: 'Policy',
    icon: '📜',
    component: PolicyTab,
    complexity: 'power_user',
    keywords: ['policy', 'law', 'advocacy', 'campaign'],
  },
];
```

---

## 📱 FEATURES PER TAB

### **Tab 1: ACCOUNTABILITY**
**Complexity**: Simple | **Users**: First-time legal action takers

```
┌─ Active Cases
│  ├─ Case list with status
│  ├─ Quick filters (urgent, recent, all)
│  └─ See all button
├─ Quick Actions
│  ├─ 📋 Start New Case
│  ├─ 📑 View All Cases
│  ├─ 🧑‍🏫 Accountability Coach
│  └─ 🤝 Support Network
└─ [Find Legal Help] → Legal tab
```

**Data Sources**:
- `listCases()` from `accountabilityTracker` service
- Case status colors (active, pending, resolved)
- Case summary: entity + issue + update date

---

### **Tab 2: COACH**
**Complexity**: Simple | **Users**: Need guidance & scripts

```
┌─ Top Coach Scripts (4)
│  ├─ 🧾 Evidence ask
│  ├─ ⏱️ Timeline demand
│  ├─ 🛟 Accommodation script
│  └─ 🧭 Appeal prep
├─ Do This Next (3 actions)
│  ├─ 🧑‍🏫 Open Coach
│  ├─ 🤝 Ask Allies
│  └─ 📂 Attach Evidence
└─ [Find Legal Help] → Legal tab
```

**Data Sources**:
- Script templates from `accountabilityCoach` service
- Integration with Evidence Command Center
- Support network data from `accountability-network`

---

### **Tab 3: LEGAL HELP**
**Complexity**: Standard | **Users**: Need professional help

```
┌─ Legal Resources (4)
│  ├─ 👨‍⚖️ Find a Lawyer (featured)
│  ├─ 👥 Collective Legal Action
│  ├─ 🆓 Legal Aid Services
│  └─ 🧬 Legal DNA (case analysis)
├─ Recommended Lawyers (3)
│  └─ [Horizontal scroll with ratings]
└─ [Legal Automation] → Automation tab
```

**Data Sources**:
- `advocates` from `data/lawyers`
- `lawyerDirectory` with ratings
- Jurisdiction-specific legal aid links
- Legal DNA analysis from service

---

### **Tab 4: AUTOMATION** (Beta)
**Complexity**: Power User | **Users**: Advanced legal workflows

```
┌─ Automation Tools (4)
│  ├─ ⏰ Deadline Automation (active)
│  ├─ 📝 Legal Templates (active)
│  ├─ 📄 FOIA Generator (setup)
│  └─ ⚠️ Complaint Filing (setup)
├─ Justice as a Service
│  ├─ 🔍 Case Review (beta)
│  ├─ 🎯 Strategy Builder (beta)
│  └─ 🎮 Outcome Simulator (beta)
└─ [Policy & Advocacy] → Policy tab
```

**Data Sources**:
- Automation tool status from `legalAutomation` service
- Justice services from `justiceAsAService` component
- Document templates from `LegalAutomationContent`

---

### **Tab 5: POLICY**
**Complexity**: Power User | **Users**: Systemic change advocates

```
┌─ Policy Areas (grid, 4 items)
│  ├─ ♿ Disability Policy
│  ├─ 🏥 Healthcare Policy
│  ├─ 💼 Employment Law
│  └─ 🏠 Housing Rights
├─ Take Action (3 actions)
│  ├─ 📝 Write to MP
│  ├─ ✍️ Sign Petitions
│  └─ 📣 Join Campaigns
└─ [Back to Accountability] → Accountability tab
```

**Data Sources**:
- Policy data from `policySimple` component
- Template letters from `LetterWizardContent`
- Government contact data
- Active campaign list

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                   LEGAL ACTION HUB                           │
│                  (Single Entry Point)                        │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────────────────────────────────────────────┐
    │                                                           │
    ▼                                                           ▼
┌──────────────────────┐                        ┌──────────────────────┐
│   LOCAL SERVICES     │                        │   FIRESTORE / API    │
├──────────────────────┤                        ├──────────────────────┤
│ accountabilityTracker│                        │ lawyerDirectory      │
├──────────────────────┤                        ├──────────────────────┤
│ store/jurisdiction   │                        │ legalAidResources    │
├──────────────────────┤                        ├──────────────────────┤
│ store/auth           │                        │ legalDNA analyzer    │
└──────────────────────┘                        └──────────────────────┘
    │                                                           │
    └───────────────────────────┬──────────────────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
                    ▼                        ▼
            ┌──────────────┐        ┌────────────────┐
            │   CASE DATA  │        │  LEGAL DATA    │
            ├──────────────┤        ├────────────────┤
            │ Active cases │        │ Lawyer profiles│
            │ Deadlines    │        │ Templates      │
            │ Timeline     │        │ Resources      │
            └──────────────┘        └────────────────┘
```

---

## 🔌 INTEGRATION POINTS

### **Services to Connect**
```typescript
// 1. Accountability Tracking
import { listCases } from '../../../services/accountabilityTracker';

// 2. Jurisdiction Data
import { useJurisdiction } from '../../../store/jurisdiction';

// 3. Analytics
import { trackEvent } from '../../../services/analyticsClient';

// 4. Lawyer Directory
import { advocates } from '../../../data/lawyers';

// 5. Legal Automation
import { useLegalDNASequencer } from '../../../services/legalDNASequencer';

// 6. Localization
import { useTranslation } from '../../../i18n';

// 7. Theme
import { useAppPalette } from '../../../theme/usePalette';
```

### **External Tools (Linked, Not Embedded)**
```
Evidence Command Center
├─ Link: /advocacy/evidence-command-center
├─ When: From coach → "Attach Evidence"
└─ Data: Share case context

Case Tracker Pro
├─ Link: /resources/case-tracker-pro
├─ When: From coach → "View Deadlines"
└─ Data: Sync deadlines

Letter Factory
├─ Link: /resources/letter-factory
├─ When: From automation → "Generate Document"
└─ Data: Pre-fill with case data
```

---

## 🎯 REDIRECT IMPLEMENTATION

### **Option 1: Expo Router Redirect (RECOMMENDED)**

```tsx
// app/(tabs)/advocacy/accountability-hub.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * REDIRECT WRAPPER
 * Old path: /advocacy/accountability-hub
 * New path: /advocacy/legal-action-hub?tab=accountability
 * 
 * This maintains deep-linking while redirecting to hub.
 */
export default function AccountabilityHubRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/(tabs)/advocacy/legal-action-hub?tab=accountability');
  }, [router]);
  
  return null; // Instant redirect, no render
}
```

### **Option 2: URL Param Detection (ADVANCED)**

```tsx
// Single component that detects old vs new paths
export default function LegalHubRouter({ params }: any) {
  const router = useRouter();
  const { tab } = params || {};
  
  // If old path, redirect
  if (router.pathname.includes('accountability-hub')) {
    return <Redirect href="/legal-action-hub?tab=accountability" />;
  }
  
  // Otherwise show hub with requested tab
  return <LegalActionHub defaultTab={tab || 'accountability'} />;
}
```

**Chosen Approach**: Option 1 (thin wrapper files)
- ✅ Simplest to implement
- ✅ No performance impact
- ✅ Preserves history
- ✅ Works with all route patterns

---

## 📈 SCREEN REDUCTION METRICS

### **Before Consolidation**
```
Advocacy Tab Screens:        10 screens
Resources Tab (legal-only):   4 screens
─────────────────────────────────────
Total Legal Screens:         14 screens

Supporting screens:           5 screens (timeline, templates, etc)
TOTAL LEGAL FOOTPRINT:       19 screens
```

### **After Phase 1 Consolidation**
```
Legal Action Hub:             1 screen (5 tabs internally)
Redirects (inactive):        10 screens (thin wrappers)
────────────────────────────────────────
"Active" Legal Screens:        1 screen
Total Footprint:             11 screens

Supporting screens:           4 screens (Evidence Command Center, etc)
TOTAL LEGAL FOOTPRINT:       15 screens

REDUCTION: 19 → 15 screens (21% reduction in Phase 1)
```

### **After Phase 1 + 2 (Full Integration)**
```
Legal Action Hub:             1 screen
Supporting Tools:             2 screens (Letter Factory, Case Tracker)
────────────────────────────────────────
TOTAL LEGAL FOOTPRINT:        3 screens

REDUCTION: 19 → 3 screens (84% reduction)
IMPACT: Enables 50+ additional screens elsewhere
```

---

## 🚀 IMPLEMENTATION TIMELINE

### **Week 1: Redirect Infrastructure**
- [ ] Create redirect wrapper files (10 files)
- [ ] Test deep linking on each redirect
- [ ] Verify old paths still work
- [ ] Track redirect analytics

### **Week 2: Component Extraction**
- [ ] Extract AccountabilityTab → separate component
- [ ] Extract CoachTab → separate component
- [ ] Extract LegalHelpTab → separate component
- [ ] Extract AutomationTab → separate component
- [ ] Extract PolicyTab → separate component

### **Week 3: Enhanced Features**
- [ ] Add tab parameter support
- [ ] Add case ID parameter support
- [ ] Add internal search
- [ ] Add breadcrumb navigation
- [ ] Add tab-switching analytics

### **Week 4: Testing & Refinement**
- [ ] Unit tests for each tab component
- [ ] Integration tests for redirect flow
- [ ] Accessibility audit
- [ ] Performance profiling
- [ ] User testing with beta group

---

## ✅ SUCCESS CRITERIA

- [ ] All 10 old screens redirect to hub without errors
- [ ] Deep links work (share URLs from hub)
- [ ] Analytics track tab switches & user behavior
- [ ] Hub loads within 2 seconds
- [ ] All 5 tabs fully functional
- [ ] Accessibility score ≥ 95/100
- [ ] Screen count reduced from 14 to 1 (active)

---

## 🔗 RELATED DOCUMENTS

- [Legal Action Hub Existing Code](../../app/(tabs)/advocacy/legal-action-hub.tsx)
- [Evidence Command Center Structure](../../app/(tabs)/advocacy/evidence-command-center.tsx)
- [Case Tracker Pro Structure](../../app/(tabs)/resources/case-tracker-pro.tsx)
- [PowerTool Component API](../../components/PowerTool.tsx)
- [Consolidation Status](./CONSOLIDATION_STATUS.md)

---

## 📝 NOTES FOR DEVELOPERS

### **Key Design Principles**
1. **Preserve Deep Linking**: Old URLs must still work (redirect, not 404)
2. **Progressive Enhancement**: Simple mode first, power user features optional
3. **Modular Tabs**: Each tab can be updated independently
4. **Performance**: Lazy-load heavy components (templates, analysis tools)
5. **Analytics First**: Track all user actions to measure success

### **Known Constraints**
- Letter Factory stays separate (too large, 100+ templates)
- Case Tracker Pro stays separate (handles medical + legal cases)
- Evidence Command Center stays separate (core evidence management)
- These 3 link INTO the hub, not embedded

### **Future Enhancements (Phase 2)**
- Multi-language support for all legal templates
- Jurisdiction-specific legal forms auto-fill
- AI case analysis integration
- Offline access to templates & resources
- Push notifications for legal deadlines
- Collaboration features (share cases with advocates)

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Status**: ✅ Ready for Implementation  
**Next Step**: Begin Week 1 redirect infrastructure
