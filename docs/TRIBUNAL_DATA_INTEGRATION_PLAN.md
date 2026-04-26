# Tribunal Data Integration Plan
**Date:** April 26, 2026  
**Status:** Ready for implementation  
**Authors:** Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot

## Overview
Integrate all CanLII tribunal research (35,928 decisions from 4 Ontario tribunals) into both the website AND the React Native app for maximum accessibility.

---

## Current State

### Website (3mpwrapp.github.io) ✅ **COMPLETE**
- [x] 4 tribunal blog posts (ONWSIAT, ONWSIB, HRTO, ONSBT)
- [x] Research hub with tribunal comparison table
- [x] Knowledge base coverage audit with tribunal findings
- [x] Content optimization templates (Templates 17-24 for ONSBT/ONWSIB)
- [x] Connecting the Dots visualization (keyword co-occurrence + tribunal connections)
- [x] JSON data files in `data/tribunal-decisions/`
  - justice-evidence-table-strict.json
  - tribunal-audit-error-rate-estimates.json
  - issue-slices-summary.json
  - Tier A/B/C files for all 4 tribunals

### App (empowrapp-new) ⚠️ **PARTIAL**
- [x] WSIB Appeals Knowledge Base (uses 1,204 WSIAT decisions - OUTDATED)
- [x] Research master index structure (`data/research-master-index.json`)
- [x] Research hubs structure (`data/research-hubs.json`)
- [x] Research type definitions (`data/research.ts`)
- [ ] ❌ **NEW tribunal analysis NOT integrated** (35,928 decisions)
- [ ] ❌ **Tiered evidence framework NOT in app** (Tier A/B/C)
- [ ] ❌ **Cross-tribunal comparison NOT in app**
- [ ] ❌ **ONSBT/ONWSIB findings NOT in app**
- [ ] ❌ **Issue slices NOT in app** (chronic pain, pre-existing, entitlement)

---

## Integration Architecture

### Phase 1: Data Sync (Website → App JSON)

**Create new data files in `empowrapp-new/data/tribunal-decisions/`:**

```
empowrapp-new/
└── data/
    └── tribunal-decisions/
        ├── tribunal-summary.json           # High-level stats for all 4 tribunals
        ├── tribunal-comparison.json        # Cross-tribunal comparison data
        ├── evidence-tiers.json             # Tier A/B/C breakdown per tribunal
        ├── issue-slices.json               # Chronic pain, pre-existing, entitlement patterns
        ├── audit-confidence.json           # Wilson 95% CI per tribunal
        ├── onsbt/
        │   ├── summary.json                # 13,798 decisions, 67.4% grant rate
        │   ├── top-issues.json             # Person with disability 75.9%, etc.
        │   └── odsp-poverty-context.json   # $1,368 ODSP vs $2,200 rent crisis
        ├── onwsib/
        │   ├── summary.json                # 431 decisions, 95.4% unresolved
        │   ├── top-issues.json             # Worker 80%, work-related injury 12.1%
        │   └── three-stage-system.json     # WSIB→ONWSIB→WSIAT pathway
        ├── wsiat/
        │   ├── summary.json                # 11,430 decisions, 65-73% worker success
        │   └── top-issues.json             # Pre-existing 13.3%, chronic pain patterns
        └── hrto/
            ├── summary.json                # 9,269 decisions, 73.5% abandonment
            └── email-crisis.json           # 70.1% email issues in abandonments
```

**Script to generate these files:**
```bash
# Website scripts directory
node scripts/export-tribunal-data-for-app.js
# Output: Generates all JSON files above from existing tribunal data
```

### Phase 2: TypeScript Types (App)

**Create `empowrapp-new/types/tribunalData.ts`:**

```typescript
export interface TribunalSummary {
  id: 'wsiat' | 'hrto' | 'onsbt' | 'onwsib';
  name: string;
  fullName: string;
  totalCases: number;
  yearRange: string;
  tierA: { count: number; percentage: number };
  tierB: { count: number; percentage: number };
  tierC: { count: number; percentage: number };
  keyFinding: string;
  successRate?: string; // e.g., "67.4% grant rate"
  topIssues: Array<{ issue: string; percentage: number; count: number }>;
  auditCI?: {
    tierBError: string;  // e.g., "0.0% (0.0-3.1)"
    tierCMissed: string; // e.g., "0.0% (0.0-3.1)"
  };
}

export interface IssueSlice {
  issue: string;
  totalCases: number;
  byTribunal: Record<string, number>;
  byTier: { tierA: number; tierB: number; tierC: number };
  description: string;
}

export interface TribunalComparison {
  tribunals: TribunalSummary[];
  totalCases: number;
  analysisDate: string;
  methodology: string;
}
```

### Phase 3: App Screens & Components

**Create new research screens:**

```
empowrapp-new/app/(tabs)/resources/
├── tribunal-research.tsx          # Main tribunal research landing page
├── tribunal-comparison.tsx        # Cross-tribunal comparison (replaces old WSIB-only)
├── onsbt-analysis.tsx             # ONSBT 13,798 decisions + ODSP poverty
├── onwsib-analysis.tsx            # ONWSIB 431 decisions + 3-stage system
├── wsiat-analysis.tsx             # WSIAT 11,430 decisions (UPDATE existing)
└── hrto-analysis.tsx              # HRTO 9,269 decisions + email crisis
```

**Update existing WSIB Appeals screen:**
```typescript
// empowrapp-new/app/(tabs)/resources/wsib-appeals.tsx
// OLD: "Evidence-based guides from 1,204 real Ontario tribunal decisions"
// NEW: "Evidence-based guides from 11,430 WSIAT decisions (2020-2026)"
//      Plus cross-tribunal analysis of 35,928 decisions across WSIAT/HRTO/ONSBT/ONWSIB
```

### Phase 4: Navigation Integration

**Update Resources index:**
```typescript
// empowrapp-new/app/(tabs)/resources/index.tsx
// ADD NEW CARDS:

<A11yPressable onPress={() => router.push('/(tabs)/resources/tribunal-research')}>
  <Text>⚖️ Tribunal Research Hub</Text>
  <Text>35,928 decisions analyzed across 4 Ontario tribunals</Text>
</A11yPressable>

<A11yPressable onPress={() => router.push('/(tabs)/resources/onsbt-analysis')}>
  <Text>🏛️ ONSBT Analysis (ODSP/OW Appeals)</Text>
  <Text>13,798 decisions | 67.4% grant rate | ODSP poverty crisis context</Text>
</A11yPressable>

<A11yPressable onPress={() => router.push('/(tabs)/resources/tribunal-comparison')}>
  <Text>📊 Cross-Tribunal Comparison</Text>
  <Text>WSIAT vs HRTO vs ONSBT vs ONWSIB - Pattern Analysis</Text>
</A11yPressable>
```

### Phase 5: Knowledge Base Integration

**Update Knowledge Base with tribunal findings:**
```typescript
// empowrapp-new/app/(tabs)/resources/knowledge-base.tsx
// ADD NEW TABS:

{
  id: 'tribunals',
  label: 'Tribunals',
  icon: '⚖️',
  component: TribunalsTab,
  complexity: 'standard',
  keywords: ['tribunal', 'appeal', 'wsiat', 'hrto', 'onsbt', 'decision'],
}
```

**Create tribunal-specific articles:**
- "Understanding Tier A/B/C Evidence Classification"
- "ONSBT Success Rate: 67.4% Grant Rate Explained"
- "ONWSIB Internal Review: Should You Skip to WSIAT?"
- "Pre-Existing Condition Pattern: 6.7% at ONWSIB → 13.3% at WSIAT"
- "ODSP Poverty Math: Why $1,368/month Doesn't Cover Rent"
- "Substantial Impairment Test: What ONSBT Really Looks For"

### Phase 6: Visualization Integration (Optional)

**Option A:** Embed web visualization as WebView
```typescript
// empowrapp-new/app/(tabs)/resources/tribunal-network.tsx
import { WebView } from 'react-native-webview';

export default function TribunalNetworkScreen() {
  return (
    <WebView 
      source={{ uri: 'https://3mpwrapp.ca/connecting-the-dots-canlii-keyword-visualization-network.html' }}
      style={{ flex: 1 }}
    />
  );
}
```

**Option B:** Native React Native D3 visualization (more complex, better UX)

---

## Implementation Checklist

### Website Tasks (Already Complete) ✅
- [x] Update blog post authors to "Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot"
- [x] ONSBT blog with poverty context + 9 external URLs
- [x] ONWSIB blog with 3-stage system explanation
- [x] WSIAT comparison blog with cross-tribunal table
- [x] Research hub with 4-tribunal table
- [x] Knowledge base coverage audit updated
- [x] Content templates (Templates 17-24 added)

### App Tasks (Ready to Start) 📋

**Data Layer:**
- [ ] Create `scripts/export-tribunal-data-for-app.js` (website repo)
- [ ] Run export script to generate JSON files
- [ ] Copy JSON files to `empowrapp-new/data/tribunal-decisions/`
- [ ] Create `types/tribunalData.ts` with TypeScript interfaces

**UI Layer:**
- [ ] Create `tribunal-research.tsx` (main hub)
- [ ] Create `onsbt-analysis.tsx` (13,798 decisions)
- [ ] Create `onwsib-analysis.tsx` (431 decisions)
- [ ] Update `wsib-appeals.tsx` (11,430 not 1,204)
- [ ] Create `hrto-analysis.tsx` (9,269 decisions)
- [ ] Create `tribunal-comparison.tsx` (cross-tribunal)
- [ ] Update `resources/index.tsx` navigation cards
- [ ] Add "Tribunals" tab to knowledge-base.tsx

**Content Layer:**
- [ ] Write tribunal-specific KB articles (6-8 articles)
- [ ] Update `data/research-master-index.json` with tribunal links
- [ ] Update `data/wsibKnowledgeBase.ts` to reference 11,430 cases

**Testing:**
- [ ] Test all new screens on iOS
- [ ] Test all new screens on Android
- [ ] Test all new screens on web
- [ ] Verify offline functionality (JSON bundled in app)
- [ ] Check accessibility (screen reader support)

---

## Benefits of App Integration

### For Users:
1. **Offline access** to tribunal research (data bundled in app)
2. **Deep linking** from evidence locker to relevant tribunal patterns
3. **Contextual help** while documenting evidence (e.g., "75.9% of ONSBT cases need 'person with disability' proof")
4. **Cross-platform** access (iOS, Android, web)

### For Advocacy:
1. **Transparency** - Full tribunal data accessible without internet
2. **Education** - Users understand their real statistical chances
3. **Empowerment** - "67.4% grant rate" counters hopelessness messaging
4. **Strategic guidance** - "Skip ONWSIB, go straight to WSIAT" advice

### For 3mpwrApp:
1. **Data authority** - Only app with 35,928 tribunal decisions analyzed
2. **Unique value** - No other app has this level of tribunal intelligence
3. **SEO boost** - App store keywords: "ONSBT appeal", "WSIAT success rate", "tribunal analysis"
4. **Community trust** - Open data methodology = credibility

---

## Timeline Estimate

**Fast track (3-5 days):**
- Day 1: Export script + JSON files + TypeScript types
- Day 2-3: Create 5 new screens (tribunal-research, onsbt, onwsib, wsiat update, hrto)
- Day 4: Navigation integration + knowledge base tabs
- Day 5: Testing + polish

**Full implementation (1-2 weeks):**
- Week 1: Data + screens + navigation
- Week 2: Visualization integration + comprehensive testing + accessibility audit

---

## Open Questions

1. **Visualization:** WebView embed OR native D3 implementation?
2. **Update frequency:** How often to sync tribunal data (monthly? quarterly?)
3. **Search:** Should tribunal research be searchable from main app search?
4. **Notifications:** Push notification when tribunal stats update?
5. **Personalization:** Remember user's preferred tribunal (e.g., if user is in ONSBT appeal, surface ONSBT content first)?

---

## Success Metrics

**App engagement:**
- Tribunal research screen views
- Average time on tribunal analysis screens
- Cross-references from evidence locker to tribunal patterns

**User outcomes:**
- App Store reviews mentioning tribunal data
- Social media shares of tribunal statistics
- Knowledge base article reads (tribunal-specific)

**Advocacy impact:**
- Media citations of tribunal statistics
- Advocacy group adoption of Tier A/B/C framework
- WSIB/ODSP policy changes citing transparency gaps

---

## Next Steps

**Immediate (Today):**
1. Create `scripts/export-tribunal-data-for-app.js` (Copilot can generate this)
2. Run export script
3. Copy JSON files to app repo
4. Create TypeScript types

**This Week:**
1. Build 5 tribunal screens
2. Update navigation
3. Test on all platforms

**This Month:**
1. Knowledge base articles
2. Deep linking implementation
3. Comprehensive accessibility audit

---

**Status:** Ready for implementation. All data collected. Website complete. App infrastructure ready. Just needs data sync + UI screens.
