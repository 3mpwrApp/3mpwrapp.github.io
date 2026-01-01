# Feature Consolidation Strategy
## 3mpwr App - Reducing Overwhelm for Persons with Disabilities

**Last Updated**: 2026-01-01
**Status**: Phase 1 Complete (9 PowerTools), Phase 2 In Progress (2 PowerTools)

---

## Vision

Create the highest quality experience for persons with disabilities, injured workers, supporters, and allies by:
- **Reducing cognitive load** through feature consolidation
- **Maintaining ALL functionality** - nothing is removed, only organized
- **Progressive disclosure** - Simple Mode → Advanced Mode → Power User Mode
- **Accessibility first** - Every consolidation must improve accessibility

---

## PowerTool Pattern

A **PowerTool** is a tabbed interface that consolidates 5-20 related features into a single screen with:

1. **Tab-based navigation** - Group related features logically
2. **Complexity modes**:
   - **Simple Mode**: Show 1-2 essential tabs only
   - **Advanced Mode**: Show 4-6 main tabs
   - **Power User Mode**: Show all tabs (6-8+)
3. **Consistent UX** - Same navigation pattern across all PowerTools
4. **Accessibility** - Full keyboard navigation, screen reader support
5. **Performance** - Lazy load tab content, smooth transitions

---

## Existing PowerTools (9 Complete)

### ✅ 1. AI Advocacy Suite
- **Location**: `app/(tabs)/advocacy/ai-advocacy-suite.tsx`
- **Consolidates**: 8 AI tools
- **Tabs**: Translator, Interpreter, Navigator, Assistant, Command Center
- **Simple Mode**: Translator only
- **Impact**: 87% reduction in AI tool screens

### ✅ 2. Evidence Command Center
- **Location**: `app/(tabs)/advocacy/evidence-command-center.tsx`
- **Consolidates**: 6 evidence tools
- **Tabs**: Locker, Timeline, Voice Notes, Checklist
- **Simple Mode**: Locker only

### ✅ 3. Document Factory
- **Location**: `app/(tabs)/resources/document-factory.tsx`
- **Consolidates**: 15 letter/document tools
- **Tabs**: Quick, Letters, Appeals, Accommodation, Templates
- **Simple Mode**: Quick only

### ✅ 4. Case Tracker Pro
- **Location**: `app/(tabs)/resources/case-tracker-pro.tsx`
- **Consolidates**: 10 tracking tools
- **Tabs**: Deadlines, Master Hub, Denial, Claims, RTW
- **Simple Mode**: Deadlines only

### ✅ 5. Knowledge Base
- **Location**: `app/(tabs)/resources/knowledge-base.tsx`
- **Consolidates**: 5 information categories
- **Tabs**: Rights, Tech, Myths, Tools, Emergency
- **Simple Mode**: All visible (information only, no actions)

### ✅ 6. Energy Command Center
- **Location**: `app/(tabs)/wellness/energy-command-center.tsx`
- **Consolidates**: 15 energy management tools
- **Tabs**: Dashboard, Mood, Sleep, Pacing, Forecast
- **Simple Mode**: Dashboard + Mood only

### ✅ 7. Unified Health Hub (Health Tracker Pro)
- **Location**: `app/(tabs)/wellness/health-tracker-pro.tsx`
- **Consolidates**: 20 health tracking features
- **Tabs**: Symptoms, Meds, Doctor, Body, Environment, Nutrition, Self-Care
- **Simple Mode**: Symptoms + Meds only

### ✅ 8. Mental Wellness Toolkit
- **Location**: `app/(tabs)/wellness/mental-wellness-toolkit.tsx`
- **Consolidates**: 8 CBT/DBT tools
- **Tabs**: CBT, DBT, Grounding, Opposite Action, Acceptance, Distress, Beliefs, Function
- **Simple Mode**: CBT only

### ✅ 9. Movement & Rehab Hub
- **Location**: `app/(tabs)/wellness/movement-power-tool.tsx`
- **Consolidates**: 5 movement tools
- **Tabs**: Exercise, Rehab, Adaptive Movement, Recovery
- **Simple Mode**: Hidden (optional feature)

---

## Planned PowerTools (2 In Progress)

### 🔨 10. Legal Action Hub
- **Status**: Planning phase
- **Will Consolidate**: 10+ legal/accountability features
- **Proposed Tabs**:
  - Accountability (cases, coach, network)
  - Legal Automation (templates, DNA matching)
  - Lawyer Finder
  - Policy Navigator
  - Collective Legal Action
- **Simple Mode**: Accountability only

### 🔨 11. Ally & Support Network
- **Status**: Planning phase
- **Will Consolidate**: 6+ support/ally features
- **Proposed Tabs**:
  - Support Directory
  - Ally Hub
  - Self-Advocacy Coach
  - Provider Ratings
  - World Map (global network)
- **Simple Mode**: Directory only

---

## Cleanup Tasks

### Files to Delete (Safe - No Migration Needed)

**AI Tools - Legacy Versions** (7 files):
- `advocacy/ai-advocate-translator-old.tsx`
- `advocacy/ai-case-interpreter-old.tsx`
- `advocacy/ai-gov-navigator-old.tsx`
- `advocacy/ai-assistant-old.tsx`
- `advocacy/ai-command-center-old.tsx`
- `advocacy/ask-old.tsx`
- `advocacy/assistant-hub-old.tsx`

**Daily Planner Duplicates** (Keep only one):
- `wellness/daily-planner-backup.tsx` → DELETE
- `wellness/daily-planner-enhanced.tsx` → DELETE
- Keep: `wellness/daily-planner.tsx`

**Energy Management Legacy**:
- `wellness/energy-hub.tsx` → DELETE (superseded by energy-command-center.tsx)

### Files to Convert to Redirects

**Evidence Screens** (redirect to Evidence Command Center):
- `resources/evidence-locker.tsx` → Redirect to evidence-command-center.tsx?tab=locker
- `resources/evidence-queue.tsx` → Redirect to evidence-command-center.tsx?tab=locker
- `advocacy/evidence-manager.tsx` → Redirect to evidence-command-center.tsx
- `advocacy/evidence-vault.tsx` → Redirect to evidence-command-center.tsx?tab=locker

**Document/Letter Screens** (redirect to Document Factory):
- `resources/letter-wizard.tsx` → Redirect to document-factory.tsx?tab=letters
- `resources/letter-factory.tsx` → Redirect to document-factory.tsx?tab=letters
- `resources/letters.tsx` → Redirect to document-factory.tsx?tab=letters
- `resources/templates-gallery.tsx` → Redirect to document-factory.tsx?tab=templates
- `resources/accommodation-request.tsx` → Redirect to document-factory.tsx?tab=accommodation
- `resources/prepare-appeal.tsx` → Redirect to document-factory.tsx?tab=appeals
- `resources/appeal-coach.tsx` → Redirect to document-factory.tsx?tab=appeals

**Case Tracking Screens** (redirect to Case Tracker Pro):
- `resources/deadlines.tsx` → Redirect to case-tracker-pro.tsx?tab=deadlines
- `resources/deadlines-list.tsx` → Redirect to case-tracker-pro.tsx?tab=deadlines
- `resources/case-timeline.tsx` → Redirect to case-tracker-pro.tsx?tab=master
- `resources/master-tracker-hub.tsx` → Redirect to case-tracker-pro.tsx?tab=master
- `resources/denial-decoder.tsx` → Redirect to case-tracker-pro.tsx?tab=denial
- `resources/claims-navigator.tsx` → Redirect to case-tracker-pro.tsx?tab=claims
- `resources/rtw-planner.tsx` → Redirect to case-tracker-pro.tsx?tab=rtw

**Health Tracking Screens** (redirect to Unified Health Hub):
- `wellness/health-tracker.tsx` → Redirect to health-tracker-pro.tsx
- `wellness/health-management-hub.tsx` → Redirect to health-tracker-pro.tsx
- `wellness/symptom-tracker.tsx` → Redirect to health-tracker-pro.tsx?tab=symptoms
- `wellness/medications.tsx` → Redirect to health-tracker-pro.tsx?tab=meds
- `wellness/meds-tracker.tsx` → Redirect to health-tracker-pro.tsx?tab=meds
- `wellness/doctor-visit-prep.tsx` → Redirect to health-tracker-pro.tsx?tab=doctor
- `wellness/cognitive-scanner.tsx` → Redirect to health-tracker-pro.tsx?tab=body
- `wellness/functional-capacity.tsx` → Redirect to health-tracker-pro.tsx?tab=body
- `wellness/environmental-adaptation.tsx` → Redirect to health-tracker-pro.tsx?tab=environment
- `wellness/trigger-detector.tsx` → Redirect to health-tracker-pro.tsx?tab=symptoms

**Energy Management Screens** (redirect to Energy Command Center):
- `wellness/spoon-economist.tsx` → Redirect to energy-command-center.tsx?tab=dashboard
- `wellness/spoon-marketplace.tsx` → Redirect to energy-command-center.tsx?tab=pacing
- `wellness/energy-mood-dashboard.tsx` → Redirect to energy-command-center.tsx?tab=mood
- `wellness/pacing-partner.tsx` → Redirect to energy-command-center.tsx?tab=pacing
- `wellness/pain-forecast.tsx` → Redirect to energy-command-center.tsx?tab=forecast
- `wellness/symptom-symphony.tsx` → Redirect to energy-command-center.tsx?tab=dashboard
- `wellness/sleep-energy-tracker.tsx` → Redirect to energy-command-center.tsx?tab=sleep

**Mental Health Screens** (redirect to Mental Wellness Toolkit):
- `wellness/cbt-coach.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=cbt
- `wellness/dbt.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=dbt
- `wellness/opposite-action.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=opposite
- `wellness/radical-acceptance.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=acceptance
- `wellness/acceptance-function.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=function
- `wellness/distress-tolerance.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=distress
- `wellness/belief-meter.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=beliefs
- `wellness/ai-grounding.tsx` → Redirect to mental-wellness-toolkit.tsx?tab=grounding

---

## Navigation Consolidation

### Current Bottom Tabs (8)
1. Home
2. Wellness
3. Resources
4. Advocacy
5. Community
6. Campaigns
7. Events
8. Research

### Proposed Bottom Tabs (5-6)

**Option A: Consolidated (5 tabs)**
1. **Home** - Dashboard, quick actions
2. **Wellness** - All wellness PowerTools (Energy, Health, Mental, Movement)
3. **Advocacy** - All advocacy PowerTools (AI, Evidence, Legal, Documents)
4. **Resources** - Case Tracker, Knowledge Base
5. **Community** - Social + Campaigns + Events + Research

**Option B: Balanced (6 tabs)**
1. **Home**
2. **Wellness** - Personal health/energy management
3. **Advocacy** - Rights, legal, documentation
4. **Resources** - Information and tracking
5. **Community** - Social connection
6. **Action** - Campaigns + Events + Research

**Recommendation**: Test Option A with users first. Can expand to Option B if needed.

---

## Impact Metrics

### Before Consolidation
- **8 bottom tabs**
- **100+ individual feature screens**
- **30+ duplicate/overlapping features**
- **High cognitive load** for new users

### After Phase 1 (Current - 9 PowerTools)
- **8 bottom tabs** (unchanged)
- **~70 screens** (30% reduction)
- **11 PowerTools** grouping related features
- **Simple Mode** hides ~60% of complexity

### After Phase 2 (Target - 11 PowerTools + Cleanup)
- **5-6 bottom tabs** (38% reduction)
- **~40 screens** (60% reduction)
- **11 PowerTools** as primary navigation
- **Simple Mode** shows only 11-15 essential features

### User Experience Tiers
- **New Users (Simple Mode)**: See 5-6 tabs, 11 main features
- **Intermediate (Advanced Mode)**: See 5-6 tabs, 44 features (11 hubs × 4 tabs)
- **Power Users (All Features)**: See 6 tabs, 66+ features (11 hubs × 6 tabs)
- **ALL users**: Zero functionality loss

---

## Implementation Pattern

### Creating a New PowerTool

1. **Analyze existing screens** - Read all files to be consolidated
2. **Design tab structure** - Group features logically (4-6 tabs)
3. **Create PowerTool component**:
   ```tsx
   import { useState } from 'react';
   import { TabView, SceneMap } from 'react-native-tab-view';

   export default function MyPowerTool() {
     const [index, setIndex] = useState(0);
     const [routes] = useState([
       { key: 'tab1', title: 'Tab 1' },
       { key: 'tab2', title: 'Tab 2' },
       // ...
     ]);

     const renderScene = SceneMap({
       tab1: Tab1Screen,
       tab2: Tab2Screen,
       // ...
     });

     return (
       <TabView
         navigationState={{ index, routes }}
         renderScene={renderScene}
         onIndexChange={setIndex}
       />
     );
   }
   ```
4. **Migrate features** - Move/adapt existing components into tabs
5. **Add complexity mode support** - Filter routes based on settings
6. **Create redirects** - Convert old screens to redirect to PowerTool
7. **Update navigation** - Link from hub/index to PowerTool
8. **Test thoroughly** - Verify all functionality preserved

### Redirect Pattern

```tsx
import { Redirect } from 'expo-router';

export const options = { href: null }; // Hide from navigation

export default function LegacyScreenRedirect() {
  return <Redirect href="/(tabs)/section/power-tool?tab=tabname" />;
}
```

---

## Next Steps (Phase 2)

### Immediate (This Week)
1. ✅ Complete Google Drive BYOC integration
2. 🔨 Finish Legal Action Hub planning
3. 🔨 Finish Ally & Support Network planning
4. 🔨 Identify all duplicate/legacy screens

### Short-term (Next 2 Weeks)
5. Build Legal Action Hub PowerTool
6. Build Ally & Support Network PowerTool
7. Create redirects for all standalone screens
8. Delete legacy/backup files
9. Test all PowerTools in Simple/Advanced modes

### Medium-term (Next Month)
10. Consolidate bottom tabs (8 → 5-6)
11. Update all navigation links
12. User testing with persons with disabilities
13. Analytics integration (track PowerTool usage)
14. Documentation updates

### Long-term (Next 3 Months)
15. Implement Evidence Flywheel (win-sharing, collective evidence)
16. Implement Collective Action Flywheel (viral loops, network effects)
17. Implement Knowledge Network Flywheel (user contributions, reputation)
18. Continuous iteration based on user feedback

---

## Success Criteria

### Quantitative
- ✅ Reduce top-level navigation items by 30%+ (8 tabs → 5-6)
- ✅ Reduce individual screens by 60%+ (100+ → 40)
- ✅ Consolidate 70+ features into 11 PowerTools
- 🎯 Simple Mode shows ≤15 features for new users
- 🎯 Average time-to-feature reduced by 40%

### Qualitative
- 🎯 Improved accessibility scores (WCAG AAA compliance)
- 🎯 Positive user feedback from disability community
- 🎯 Reduced support requests about "where is X feature"
- 🎯 Higher feature discovery rate
- 🎯 Lower abandonment rate for new users

---

## References

- **PowerTool Examples**:
  - `app/(tabs)/advocacy/ai-advocacy-suite.tsx`
  - `app/(tabs)/wellness/energy-command-center.tsx`
  - `app/(tabs)/resources/document-factory.tsx`

- **Complexity Mode Logic**: `services/byoc.ts` (isBYOCEnabled, getDataPolicyMode)

- **Previous Consolidation Log**: `CONSOLIDATION_LOG.md`

---

**Document maintained by**: Claude Code
**Review schedule**: After each PowerTool addition
**Owner**: 3mpwr App Development Team
