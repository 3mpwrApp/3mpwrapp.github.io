# Post-Beta Implementation Plan

**Created:** November 23, 2025  
**Goal:** Achieve 90%+ accessibility through full complexity mode integration and Resources/Research reorganization

---

## 🎯 Priority 1: Complete Complexity Mode Integration (2-3 days)

### Step 1: Define Feature Catalog
**File:** `constants/featureCatalog.ts`

Create comprehensive list of all features with tier assignments:

```typescript
export const FEATURE_CATALOG = {
  // SIMPLE MODE (5 core features)
  simple: [
    'evidence-locker',
    'letter-wizard-basic', // Top 3 templates only
    'crisis-resources',
    'mood-tracker-basic',
    'community-beta-chat'
  ],
  
  // STANDARD MODE (adds 15 features)
  standard: [
    ...simple,
    'ai-advocate-translator',
    'energy-mood-hub',
    'wellness-tracking',
    'support-directory',
    'campaigns',
    'events',
    'profile-settings',
    'appeal-command-center-basic',
    'master-tracker-hub',
    'deadlines',
    'denial-decoder',
    'accommodation-request',
    'voice-notes',
    'self-care-library',
    'pacing-partner'
  ],
  
  // POWER USER (all 150+ features)
  power_user: 'all' // Everything visible
}
```

### Step 2: Update Remaining Tabs
**Files to modify:**
- `app/(tabs)/campaigns.tsx` - Add complexity filtering
- `app/(tabs)/community/index.tsx` - Add complexity filtering
- `app/research/index.tsx` - Add complexity filtering (if needed)

### Step 3: Add Feature-Level Checks
**Pattern to apply across app:**

```typescript
import { useComplexityMode } from '../store/complexityMode';

// In component
const { isFeatureVisible } = useComplexityMode();

// Before rendering feature
{isFeatureVisible('standard') && (
  <FeatureComponent />
)}
```

**Files needing updates (estimated 20-30 files):**
- Individual wellness screens
- Individual resources screens
- Campaign detail screens
- Community features
- Profile/settings screens

### Step 4: Update SimpleModeWelcome
Add to remaining tabs with accurate feature counts.

---

## 🎯 Priority 2: Resources vs Research Reorganization (1-2 days)

### Step 1: Create New Research Sections
**File:** `app/research/index.tsx`

Add sections:
- Government Programs & Benefits
- Human Rights & Advocacy
- Employment & Work
- Provincial Resources

### Step 2: Move External Resources
**Create:** `data/externalResources.json`

Move all URL-based resources from `resources.json`:
- Federal programs (canada.ca)
- Provincial programs (all provinces)
- Human rights commissions
- Employment standards
- Advocacy orgs

### Step 3: Clean Up Resources Tab
**File:** `app/(tabs)/resources/index.tsx`

Remove external links section, keep only:
- Featured Tools (in-app)
- Appeals & Advocacy (in-app tools only)
- Documents & Forms (in-app builders)
- Health & Work Planning (in-app tools)

### Step 4: Update Research Tab UI
**Create:** `app/research/government-programs.tsx`
**Create:** `app/research/human-rights.tsx`
**Create:** `app/research/employment-resources.tsx`
**Create:** `app/research/provincial-resources.tsx`

---

## 🎯 Priority 3: Testing & Validation (1 day)

### User Testing Checklist
- [ ] Simple Mode shows only 5 core features
- [ ] Standard Mode shows 20 features
- [ ] Power User Mode shows all features
- [ ] Bad Day Mode correctly forces Simple Mode
- [ ] Resources tab = all in-app tools
- [ ] Research tab = all external links
- [ ] No broken links or "page not found" errors
- [ ] Smooth navigation between modes
- [ ] AsyncStorage persistence working

### Accessibility Testing
- [ ] Screen reader navigation with complexity modes
- [ ] Simple Mode reduces cognitive load
- [ ] Clear labeling of in-app vs external resources
- [ ] Keyboard navigation works in all modes

---

## 📋 Implementation Order

**Week 1: Complexity Mode**
1. Day 1: Create feature catalog, update Campaigns tab
2. Day 2: Update Community tab, add feature checks to wellness screens
3. Day 3: Add feature checks to resources screens, test all modes

**Week 2: Resources/Research**
4. Day 4: Create new Research sections, split resources.json
5. Day 5: Update Resources tab UI, create Research component screens
6. Day 6: Testing, bug fixes, documentation updates

**Week 3: Polish & Launch**
7. Day 7: User testing, accessibility validation
8. Day 8: Final bug fixes, performance optimization
9. Day 9: Update documentation, create migration guide
10. Day 10: Production launch preparation

---

## 📊 Success Metrics

**Complexity Mode:**
- 100% of tabs implement `isFeatureVisible()`
- 100% of major features have tier assignments
- Simple Mode shows exactly 5 features
- Standard Mode shows exactly 20 features
- Bad Day Mode works on all screens

**Resources/Research:**
- 0 external links in Resources tab
- 100% of external links in Research tab
- Clear category organization
- Province filtering works
- No "page not found" confusion

**Overall:**
- User accessibility: 75% → 90%+
- User satisfaction with navigation
- Reduced support requests about complexity
- Clear feedback on Simple Mode usefulness

---

## 🚀 Quick Start: Begin Implementation

Run these commands to start:

```bash
# 1. Create feature catalog
touch constants/featureCatalog.ts

# 2. Create research sections
mkdir -p app/research/sections

# 3. Create external resources data
touch data/externalResources.json

# 4. Start with highest priority
code app/(tabs)/campaigns.tsx
```

---

**Next Steps:** Start with Priority 1, Step 1 - Feature Catalog creation.
