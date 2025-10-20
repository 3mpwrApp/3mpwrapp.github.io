# 📋 TODO Execution Plan
**Created:** October 19, 2025  
**Status:** In Progress

---

## 🔴 CRITICAL - P0 (Do Immediately)

### 1. Fix White Text Readability Across App
**Status:** IN PROGRESS  
**Impact:** HIGH - User reported text barely readable

**Problem:**
- Multiple Text components missing explicit `color` property
- Defaulting to system colors which may be white on light backgrounds
- Found in: `app/profile.tsx` lines 122, 146, 172, 230

**Solution:**
```tsx
// ❌ BAD - No color specified
<Text style={{ fontWeight: "700", marginBottom: 8 }}>

// ✅ GOOD - Use palette.text
<Text style={{ fontWeight: "700", marginBottom: 8, color: palette.text }}>
```

**Files to Audit:**
1. `app/profile.tsx` - 4 instances found
2. All `app/(tabs)/**/*.tsx` files
3. All `components/**/*.tsx` files

**Script to Find Issues:**
```bash
# Find Text components without color property
grep -rn "<Text style={{" app/ components/ | grep -v "color:" > text-no-color.txt
```

**Acceptance Criteria:**
- All Text components have explicit color (palette.text or palette.textSecondary)
- Run WCAG audit: `npm run wcag:audit` passes
- Manual visual test on light mode shows all text is dark

---

## 🟠 HIGH PRIORITY - P1 (This Week)

### 2. Complete i18n Translations (EN→ES, EN→FR)
**Status:** NOT STARTED  
**Timeline:** 2-3 days  
**Deliverable:** 321 missing keys translated

**Steps:**
```bash
# 1. Install Google Translate API (FREE)
npm install @vitalets/google-translate-api

# 2. Run auto-translate script
node scripts/generate-baseline-and-translate.js

# 3. Generate CSV for review
npm run i18n:extract

# 4. Validate
npm run i18n:validate

# 5. Commit
git add locales/
git commit -m "i18n: auto-translate 321 missing keys (ES/FR)"
```

**Output:**
- `locales/es/common.json` - 214 new keys
- `locales/fr/common.json` - 214 new keys
- `i18n-translated.csv` - For community review

---

### 3. Add 324 Wizard Baseline Keys
**Status:** NOT STARTED  
**Timeline:** 1 day  
**Deliverable:** All wizard keys in `locales/en/common.json`

**Missing Key Categories:**
- `wizard.*` - Setup wizard flow
- `accessibility.*` - Advanced a11y settings
- `cognitive.*` - Cognitive accessibility
- `dyslexia.*` - Dyslexia-friendly features
- `motorAccessibility.*` - Motor impairment support
- `jurisdiction.*` - Legal jurisdiction helpers

**Steps:**
```bash
# 1. Get list of missing keys
npm run i18n:report > missing-wizard-keys.txt

# 2. Manually add English text for each key
# Edit: locales/en/common.json

# 3. Validate
npm run i18n:validate

# 4. Commit
git add locales/en/common.json
git commit -m "i18n: add 324 wizard baseline keys"
```

---

## 🟡 MEDIUM PRIORITY - P2 (Next Week)

### 4-9. Bundle Analysis & Optimization
**Status:** NOT STARTED  
**Timeline:** 3-5 days  
**Goal:** Reduce bundle from 2.97 MB to ≤2.5 MB

**Phase 1: Analysis (Day 1-2)**
```bash
# Run all analyzers
npx react-native-bundle-visualizer           # Visual treemap
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer                    # Interactive analysis
npx expo-bundle-analyzer                       # Expo-specific
npm install --save-dev source-map-explorer
npm run build && source-map-explorer 'dist/*.js'  # Source maps
node scripts/analyze-imports.js                # Custom analysis
npx jscpd                                      # Duplicate code

# Document findings
echo "Analysis complete" > BUNDLE_ANALYSIS.md
```

**Expected Findings:**
- Largest components (LetterWizardContent: 67KB, LegalAutomationContent: 55KB)
- Duplicate dependencies
- Unused imports
- Heavy libraries (moment.js, lodash, etc.)

**Phase 2: Optimization (Day 3-5)**
```typescript
// 1. Code Splitting - Lazy load heavy components
const LetterWizard = lazy(() => import('./components/LetterWizardContent'));
const LegalAutomation = lazy(() => import('./components/LegalAutomationContent'));

// 2. Dynamic Imports - Load routes on demand
const WellnessTab = () => import('./app/(tabs)/wellness');

// 3. Tree Shaking - Remove unused exports
// Check each file for unused exports

// 4. Remove Unused Dependencies
npm prune
npm uninstall <unused-packages>

// 5. Compress Static Data
// Minify JSON files in data/
node scripts/compress-json-data.js

// 6. Lazy Load Images
<Image source={{ uri: imageUrl }} loadingIndicatorSource={placeholder} />
```

**Acceptance Criteria:**
- Bundle size ≤2.5 MB (down from 2.97 MB = 470 KB savings)
- All tests still pass
- No broken imports
- Performance tests show no regression

---

### 10. Add Loading States to Community/Events
**Status:** NOT STARTED  
**Timeline:** 1 day  
**Files:** 
- `app/(tabs)/community/index.impl.tsx`
- `app/(tabs)/events/index.impl.tsx`

**Implementation:**
```typescript
// Add loading spinner
const [loading, setLoading] = useState(true);

return (
  <View>
    {loading ? (
      <ActivityIndicator size="large" color={palette.primary} />
    ) : (
      <FlatList
        data={items}
        renderItem={renderItem}
        // Add pagination
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
      />
    )}
  </View>
);

// Add memoization
const MemoizedItem = React.memo(ItemComponent);
```

---

## 🔵 LOW PRIORITY - P3 (Future)

### 11. Battery Testing with Battery Historian
**Status:** NOT STARTED  
**Timeline:** 2 days (8 hours passive testing)  

**Steps:**
```bash
# Android only
adb shell dumpsys batterystats --reset
# Use app for 8 hours
adb bugreport > battery-report.zip
# Upload to https://bathist.ef.lc/
```

---

### 12. Create Beta Tester Onboarding Guide
**Status:** NOT STARTED  
**Timeline:** Half day  
**File:** `docs/BETA_TESTER_GUIDE.md`

**Contents:**
- How to install (TestFlight/Play Store)
- What to test (feature checklist)
- How to report bugs (GitHub Issues template)
- Expected behavior vs bugs
- Testing timeline
- Feedback channels

---

### 13-14. User Setup Tasks
**Status:** Pending User Action  
- Appetize.io account (free tier)
- AWS Device Farm setup (free tier)

---

## 📊 Progress Tracking

| Priority | Task | Status | ETA |
|----------|------|--------|-----|
| P0 | Fix white text readability | 🟡 In Progress | Today |
| P1 | i18n translations (ES/FR) | ⏳ Not Started | 2-3 days |
| P1 | Add 324 wizard keys | ⏳ Not Started | 1 day |
| P2 | Bundle analysis | ⏳ Not Started | 2 days |
| P2 | Bundle optimization | ⏳ Not Started | 3 days |
| P2 | Loading states | ⏳ Not Started | 1 day |
| P3 | Battery testing | ⏳ Not Started | 2 days |
| P3 | Beta tester guide | ⏳ Not Started | 0.5 days |
| P3 | User setup | ⏳ Pending User | TBD |

**Total Estimated Time:** 10-12 days

---

## 🎯 Success Metrics

**Text Readability:**
- ✅ All Text components have explicit color
- ✅ WCAG AAA compliance (7:1 contrast)
- ✅ No user reports of unreadable text

**i18n Completeness:**
- ✅ 0 missing keys in ES/FR
- ✅ npm run i18n:validate passes
- ✅ 100% translation coverage

**Bundle Size:**
- ✅ Bundle ≤2.5 MB (currently 2.97 MB)
- ✅ All tests passing
- ✅ No performance regression

**User Experience:**
- ✅ Loading spinners on all async operations
- ✅ Smooth scrolling (already ✅)
- ✅ No layout shifts

---

**Next Action:** Start with P0 - Fix white text readability across app.
