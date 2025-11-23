# Complexity Mode Integration Progress

**Date:** November 23, 2025  
**Status:** In Progress

---

## ✅ COMPLETED

### 1. Core Infrastructure
- [x] Feature catalog created (`constants/featureCatalog.ts`)
  - Defines 5 Simple Mode features
  - Defines 20 Standard Mode features
  - Power User Mode = all features
  - Helper functions for feature visibility
  - Tab-level visibility mapping
  - Mode descriptions and feature counts

### 2. Campaigns Tab Integration
- [x] Added complexity mode imports
- [x] Added `useComplexityMode()` hook
- [x] Added `SimpleModeWelcome` component
- [x] Filtered campaigns in Simple Mode (max 5, featured only)
- [x] Changed section titles in Simple Mode
- [x] Hidden "Create Campaign" feature in Simple Mode
- [x] Updated dependencies in `sections` useMemo

**Result:** Campaigns tab now shows only 5 featured campaigns in Simple Mode!

---

## 🚧 IN PROGRESS

### 3. Community Tab Integration
**Next steps:**
- [ ] Add complexity mode imports to `app/(tabs)/community/index.impl.tsx`
- [ ] Add `SimpleModeWelcome` component
- [ ] Filter channels in Simple Mode (show only Beta Chat channel)
- [ ] Hide advanced features (thread creation, etc.)

---

## ⏳ REMAINING WORK

### 4. Research Tab
**File:** `app/research/index.tsx`  
**Status:** Not started

**Tasks:**
- [ ] Add complexity mode imports
- [ ] Add `SimpleModeWelcome` (if needed - Research might be Standard+ only)
- [ ] Filter research sections if needed

### 5. Individual Feature Screens
**Estimated:** 20-30 files need updates

**Pattern to apply:**
```typescript
import { useComplexityMode } from '../store/complexityMode';

const { isFeatureVisible } = useComplexityMode();

// Wrap feature in conditional
{isFeatureVisible('standard') && (
  <AdvancedFeature />
)}
```

**High-priority screens:**
- [ ] Wellness individual screens (mood-tracker, energy-tracker, etc.)
- [ ] Resources individual screens (most already have hubs)
- [ ] Profile screens
- [ ] Settings screens (some)

### 6. Testing & Validation
- [ ] Test Simple Mode shows exactly 5 features in Campaigns
- [ ] Test Standard Mode shows 20 features
- [ ] Test Power User Mode shows all features
- [ ] Test Bad Day Mode forces Simple Mode
- [ ] Test mode persistence across app restarts
- [ ] Screen reader testing with each mode
- [ ] Performance testing with mode switching

---

## 📊 CURRENT STATUS

**Complexity Mode Integration:**
- ✅ Core infrastructure: 100%
- ✅ Feature catalog: 100%
- ✅ Campaigns tab: 100%
- 🚧 Community tab: 0%
- ⏳ Research tab: 0%
- ⏳ Individual screens: 0%

**Overall Progress:** ~15% complete

**Estimated remaining time:**
- Community tab: 30 minutes
- Research tab: 15 minutes
- Individual screens: 4-6 hours
- Testing: 2-3 hours
- **Total:** 1-2 days

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Complete Community tab** (30 min)
   - Add imports
   - Add SimpleModeWelcome
   - Filter to Beta Chat only in Simple Mode

2. **Complete Research tab** (15 min)
   - Decide if Research needs complexity filtering
   - Add SimpleModeWelcome if needed

3. **Document feature assignments** (30 min)
   - Create comprehensive list of which screens belong to which tier
   - Update featureCatalog.ts with ALL feature IDs

4. **Systematic screen updates** (4-6 hours)
   - Go through each feature screen
   - Add `isFeatureVisible()` checks
   - Test each one

5. **Final testing** (2-3 hours)
   - Mode switching
   - Feature visibility
   - Persistence
   - Accessibility

---

## 💡 KEY INSIGHTS

1. **SimpleModeWelcome is powerful:** Shows users what's available and what's hidden - reduces confusion

2. **Filtering strategies:**
   - Campaigns: Filter by `featured` or `petitionId`, limit to 5
   - Community: Show only essential channels (Beta Chat)
   - Resources: Already has hubs, just hide advanced tools
   - Wellness: Show only basic tracking, hide advanced features

3. **Mode naming matters:**
   - Simple: "Featured" not "Your" for section titles
   - Makes it clear it's curated content

4. **Performance:**
   - useMemo dependencies must include `mode`
   - Prevents unnecessary re-renders

---

## 🚀 QUICK REFERENCE

**Add to any tab/screen:**

```typescript
// 1. Import
import { useComplexityMode } from '../store/complexityMode';
import SimpleModeWelcome from '../components/SimpleModeWelcome';

// 2. Use hook
const { mode, isFeatureVisible } = useComplexityMode();

// 3. Add welcome
<SimpleModeWelcome 
  tabName="TabName"
  availableFeatures={['Feature 1', 'Feature 2']}
  hiddenCount={mode === 'simple' ? numberOfHiddenItems : 0}
/>

// 4. Filter content
if (mode === 'simple') {
  items = items.filter(/* simple criteria */).slice(0, 5);
}

// 5. Hide advanced features
{isFeatureVisible('standard') && (
  <AdvancedFeature />
)}
```

---

**Continue implementation from here!**
