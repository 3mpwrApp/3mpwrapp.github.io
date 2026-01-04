# Legal Action Hub - Redirect Mapping Strategy
**Complete mapping of old screens to new hub paths**  
**Status**: Ready for implementation

---

## 🎯 REDIRECT OVERVIEW

**Goal**: Consolidate 10 old legal screens into 1 unified hub while maintaining deep-link compatibility.

**Strategy**: Thin redirect wrapper files that instantly route to hub with appropriate tab + parameters.

**Timeline**: Week 1 (Jan 6-12, 2026)

---

## 📍 COMPLETE REDIRECT MAP

### **ACCOUNTABILITY SCREENS → Hub Track Tab**

| Old Path | New Path | Redirect Target | Purpose |
|----------|----------|-----------------|---------|
| `/advocacy/accountability-hub` | `/advocacy/legal-action-hub?tab=accountability` | Summary of all cases | Case overview (deprecated) |
| `/advocacy/accountability-cases` | `/advocacy/legal-action-hub?tab=accountability` | Full case list | Case management (deprecated) |
| `/advocacy/accountability-case` | `/advocacy/legal-action-hub?tab=accountability&case={id}` | Single case detail | Case editor (deprecated) |

**Handler in hub**: Load active cases, show in list. Clicking case passes `case={id}` param.

---

### **COACH SCREENS → Hub Coach Tab**

| Old Path | New Path | Redirect Target | Purpose |
|----------|----------|-----------------|---------|
| `/advocacy/accountability-coach` | `/advocacy/legal-action-hub?tab=coach` | Coach scripts & guidance | Replace coach standalone |
| `/advocacy/accountability-network` | `/advocacy/legal-action-hub?tab=coach` | Ally support network | Replace network standalone |

**Handler in hub**: Show scripts, ally network cards, link to Evidence Command Center.

---

### **LEGAL HELP SCREENS → Hub Legal Tab**

| Old Path | New Path | Redirect Target | Purpose |
|----------|----------|-----------------|---------|
| `/advocacy/lawyer-finder` | `/advocacy/legal-action-hub?tab=legal&filter=lawyers` | Find legal professionals | Find lawyers (deprecated) |
| `/advocacy/collective-legal` | `/advocacy/legal-action-hub?tab=legal&filter=collective` | Class action participation | Join collective action (deprecated) |
| `/advocacy/legal-dna` | `/advocacy/legal-action-hub?tab=legal&filter=analysis` | Case strength analysis | AI case analysis (deprecated) |

**Handler in hub**: 
- Lawyer search with jurisdiction filtering
- Collective action list
- Legal DNA analysis section

---

### **AUTOMATION SCREENS → Hub Automation Tab**

| Old Path | New Path | Redirect Target | Purpose |
|----------|----------|-----------------|---------|
| `/advocacy/legal-automation` | `/advocacy/legal-action-hub?tab=automation` | Workflow automation | Legal workflows (deprecated) |
| `/resources/justice-as-a-service` | `/advocacy/legal-action-hub?tab=automation` | AI legal intelligence | Justice services (deprecated) |

**Handler in hub**: 
- Automation tools (deadlines, templates, FOIA)
- Justice as a Service features

---

### **POLICY SCREENS → Hub Policy Tab**

| Old Path | New Path | Redirect Target | Purpose |
|----------|----------|-----------------|---------|
| `/advocacy/policy-simple` | `/advocacy/legal-action-hub?tab=policy` | Policy education & advocacy | Policy learning (deprecated) |

**Handler in hub**: 
- Policy areas (disability, healthcare, employment, housing)
- Take action (MP, petitions, campaigns)

---

## 🔗 PARAMETER SCHEMA

### **URL Parameters Supported**

```
/(tabs)/advocacy/legal-action-hub
  ├─ ?tab=accountability           (default, show cases)
  ├─ ?tab=coach                    (show scripts)
  ├─ ?tab=legal                    (show lawyers)
  ├─ ?tab=automation               (show workflows)
  ├─ ?tab=policy                   (show advocacy)
  │
  ├─ &case=case-123                (highlight specific case)
  ├─ &search=disability%20rights    (internal search)
  ├─ &filter=lawyers               (scope legal tab to lawyers only)
  ├─ &filter=collective            (scope legal tab to collective action)
  └─ &filter=analysis              (scope legal tab to legal DNA)
```

### **Example Deep Links**

```
# Show accountability tab with specific case
myapp://legal-action-hub?tab=accountability&case=case-xyz

# Show legal help with lawyer search pre-filled
myapp://legal-action-hub?tab=legal&search=disability%20rights

# Show automation tab directly
myapp://legal-action-hub?tab=automation

# Deep link from Evidence Command Center
myapp://legal-action-hub?tab=coach&action=attach-evidence
```

---

## 📋 IMPLEMENTATION SEQUENCE

### **Step 1: Create Redirect Files (10 total)**

Create thin wrapper for each old screen:

```
1. app/(tabs)/advocacy/accountability-hub.tsx
   → Redirects to legal-action-hub?tab=accountability

2. app/(tabs)/advocacy/accountability-cases.tsx
   → Redirects to legal-action-hub?tab=accountability

3. app/(tabs)/advocacy/accountability-case.tsx
   → Redirects to legal-action-hub?tab=accountability

4. app/(tabs)/advocacy/accountability-coach.tsx
   → Redirects to legal-action-hub?tab=coach

5. app/(tabs)/advocacy/accountability-network.tsx
   → Redirects to legal-action-hub?tab=coach

6. app/(tabs)/advocacy/lawyer-finder.tsx
   → Redirects to legal-action-hub?tab=legal

7. app/(tabs)/advocacy/collective-legal.tsx
   → Redirects to legal-action-hub?tab=legal

8. app/(tabs)/advocacy/legal-dna.tsx
   → Redirects to legal-action-hub?tab=legal

9. app/(tabs)/advocacy/legal-automation.tsx
   → Redirects to legal-action-hub?tab=automation

10. app/(tabs)/resources/justice-as-a-service.tsx
    → Redirects to legal-action-hub?tab=automation
```

### **Step 2: Update Navigation**

Find all hardcoded links to old screens and update:

```typescript
// OLD
router.push('/advocacy/accountability-hub' as any);

// NEW
router.push({
  pathname: '/(tabs)/advocacy/legal-action-hub',
  params: { tab: 'accountability' }
} as any);
```

**Search for these patterns**:
```
- accountability-hub
- accountability-cases
- accountability-coach
- lawyer-finder
- legal-dna
- legal-automation
- policy-simple
```

### **Step 3: Update Advocacy Tab Navigation**

The main advocacy tab menu needs to link to hub instead of old screens:

```typescript
// In app/(tabs)/advocacy/_layout.tsx or index.tsx
const advocacyItems = [
  // OLD:
  // { id: 'accountability', name: 'Accountability Hub', route: '/advocacy/accountability-hub' },
  
  // NEW:
  { 
    id: 'legal-action-hub', 
    name: 'Legal Action Hub', 
    route: '/advocacy/legal-action-hub',
    description: 'All legal tools in one place'
  },
];
```

### **Step 4: Add Analytics Tracking**

Track when users use old redirect paths:

```typescript
// In each redirect wrapper
useEffect(() => {
  trackEvent('redirect.old_screen', {
    oldPath: '/advocacy/accountability-hub',
    newPath: '/advocacy/legal-action-hub',
    tab: 'accountability',
    timestamp: new Date().toISOString(),
  });
}, []);
```

---

## ✅ TESTING CHECKLIST

### **Per Redirect Screen**

- [ ] Old path redirects to hub (no lag)
- [ ] Correct tab is selected after redirect
- [ ] Deep links work (share the URL, get same screen)
- [ ] Back button works correctly
- [ ] Browser history shows both old and new paths
- [ ] Analytics event fires on redirect

### **Hub-Level**

- [ ] All 5 tabs render without errors
- [ ] Switching tabs updates URL
- [ ] Search works within each tab
- [ ] Case selection loads in accountability tab
- [ ] Loading states show during data fetch
- [ ] Empty states show when no data

### **Links Between Screens**

- [ ] Evidence Command Center links to coach tab
- [ ] Case Tracker Pro links to accountability tab
- [ ] Letter Factory links to automation tab
- [ ] Policy screens link to policy tab

---

## 🔄 ROLLBACK PLAN

If needed, can roll back instantly:

### **Option 1: Restore Old Files**
Keep git history - old files are just thin wrappers, easy to revert.

### **Option 2: Conditional Redirect**
Add a feature flag to toggle redirects on/off:

```typescript
const USE_LEGAL_ACTION_HUB = true; // Set to false to disable redirects

if (!USE_LEGAL_ACTION_HUB) {
  // Show old component directly
  return <AccountabilityHub />;
}

// Show redirect
router.replace('/advocacy/legal-action-hub?tab=accountability');
```

### **Option 3: Gradual Rollout**
Redirect only for logged-in beta testers initially:

```typescript
const { user } = useAuth();
const { betaTester } = user || {};

useEffect(() => {
  if (betaTester) {
    router.replace('/advocacy/legal-action-hub?tab=accountability');
  } else {
    // Show old screen to non-beta users
  }
}, []);
```

---

## 📊 EXPECTED IMPACT

### **User Experience**

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| Screens to navigate | 14 separate screens | 1 hub with 5 tabs | 93% reduction in top-level screens |
| Time to switch tools | 2-3 taps + load | 1 tap to switch tab | 67% faster |
| Legal feature discoverability | Scattered across tabs | Unified location | Better visibility |
| Onboarding time | Learn 10+ screens | Learn 1 hub structure | Simpler learning curve |

### **Performance**

| Metric | Baseline | Target |
|--------|----------|--------|
| Hub load time | N/A | < 2 seconds |
| Tab switch time | N/A | < 500ms |
| Memory usage | N/A | < 50MB (all 5 tabs) |
| Bundle size impact | N/A | < 100KB new code |

### **Engagement**

| Metric | Baseline | Target |
|--------|----------|--------|
| % users accessing legal tools | 45% | 55%+ |
| Avg time in legal features | 5 min | 10+ min |
| Cross-tab exploration | Low | 60%+ try multiple tabs |
| Return rate | 30% | 45%+ |

---

## 🎯 SUCCESS METRICS

### **Technical**
- ✅ 100% of old links redirect correctly
- ✅ Zero 404 errors from old paths
- ✅ Hub loads within 2 seconds
- ✅ All 5 tabs fully functional

### **User Experience**
- ✅ 90%+ user retention (no confusion)
- ✅ Increased cross-tab exploration
- ✅ Positive feedback in surveys
- ✅ No support tickets about missing screens

### **Product**
- ✅ Reduced cognitive load for new users
- ✅ Improved feature discoverability
- ✅ Foundation for Phase 2 consolidations
- ✅ On track for 100 → 40 screen reduction goal

---

## 🚀 DEPLOYMENT TIMELINE

| Phase | Dates | Tasks | Status |
|-------|-------|-------|--------|
| **Week 1** | Jan 6-12 | Create 10 redirects, test | 📋 Planning |
| **Week 2** | Jan 13-19 | Extract tabs, add features | ▶️ Not started |
| **Week 3** | Jan 20-26 | Testing, analytics, docs | ▶️ Not started |
| **Week 4** | Jan 27-31 | Beta launch, gather feedback | ▶️ Not started |

---

## 📚 RELATED DOCUMENTS

1. [Implementation Blueprint](./LEGAL_ACTION_HUB_IMPLEMENTATION_BLUEPRINT.md) - Overall architecture
2. [Code Scaffolding Guide](./LEGAL_ACTION_HUB_CODE_SCAFFOLDING.md) - Code templates & patterns
3. [Consolidation Status](./CONSOLIDATION_STATUS.md) - Track progress
4. [Screen Reduction Roadmap](./MONOREPO_NAVIGATION.md) - Full roadmap

---

## 🤝 QUESTIONS & DECISIONS

### **Q: What happens to old URLs in user bookmarks?**
**A**: They redirect automatically. No need to update bookmarks.

### **Q: Can users still share old links?**
**A**: Yes, redirects are seamless. Shared links work fine.

### **Q: What if someone has a deep link to a specific case?**
**A**: Pass `case={id}` param: `/legal-action-hub?tab=accountability&case=123`

### **Q: Do we need to deprecate old screens?**
**A**: They become thin wrappers. Keep them for backward compatibility, but don't maintain them.

### **Q: Can we measure if redirects are working?**
**A**: Yes, analytics track `redirect.old_screen` events. Monitor this metric.

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Status**: ✅ Ready for implementation  
**Owner**: Legal Action Hub Team  
**Next Review**: January 13, 2026
