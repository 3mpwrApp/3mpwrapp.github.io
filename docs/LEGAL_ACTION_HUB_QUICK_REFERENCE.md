# Legal Action Hub - Quick Reference Card
**One-page guide for developers**  
**Keep this handy during implementation**

---

## 🎯 THE MISSION IN ONE SENTENCE
Consolidate 12 legal screens (scattered across advocacy/ and resources/) into 1 unified hub with 5 tabs, keeping old URLs functional via redirects.

---

## 📍 SCREEN CONSOLIDATION MAP

```
BEFORE (12 screens, confusing)        AFTER (1 hub, 5 tabs, simple)
═══════════════════════════════════   ═══════════════════════════════════

advocacy/accountability-hub.tsx     ┐
advocacy/accountability-cases.tsx   ├─→ legal-action-hub.tsx
advocacy/accountability-case.tsx    ┘   ├─ TRACK tab (Accountability)
                                        ├─ COACH tab
advocacy/accountability-coach.tsx   ┐  ├─ LEGAL tab
advocacy/accountability-network.tsx ├─→ ├─ AUTOMATION tab (beta)
                                    ┘   └─ POLICY tab

advocacy/lawyer-finder.tsx          ┐
advocacy/collective-legal.tsx       ├─→ legal-action-hub.tsx
advocacy/legal-dna.tsx              ┘   (with ?tab= param)

advocacy/legal-automation.tsx       ┐
resources/justice-as-a-service.tsx  ├─→

advocacy/policy-simple.tsx          ──→
```

---

## 🔄 REDIRECT FORMULA

```tsx
// Each old screen becomes this:

export default function RedirectWrapper() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/(tabs)/advocacy/legal-action-hub?tab=TABNAME');
  }, []);
  
  return null; // instant redirect
}

// Replace TABNAME with:
// - accountability  (cases)
// - coach           (scripts)
// - legal           (lawyers)
// - automation      (workflows)
// - policy          (advocacy)
```

---

## 📊 URLS AT A GLANCE

```
OLD PATH                           NEW PATH
════════════════════════════════   ═══════════════════════════════════
/accountability-hub                legal-action-hub?tab=accountability
/accountability-cases              legal-action-hub?tab=accountability
/accountability-case?id=123        legal-action-hub?tab=accountability&case=123
/accountability-coach              legal-action-hub?tab=coach
/accountability-network            legal-action-hub?tab=coach
/lawyer-finder                     legal-action-hub?tab=legal
/collective-legal                  legal-action-hub?tab=legal
/legal-dna                         legal-action-hub?tab=legal
/legal-automation                  legal-action-hub?tab=automation
/justice-as-a-service              legal-action-hub?tab=automation
/policy-simple                     legal-action-hub?tab=policy
```

---

## 🎨 TAB STRUCTURE

| Tab | Complexity | Users | Features |
|-----|-----------|-------|----------|
| **ACCOUNTABILITY** | Simple | New → Start here | Active cases, quick actions |
| **COACH** | Simple | Need guidance | Scripts, ally support |
| **LEGAL HELP** | Standard | Intermediate | Find lawyers, analysis |
| **AUTOMATION** | Power User | Advanced | Workflows (beta) |
| **POLICY** | Power User | Advocates | Law education, campaigns |

---

## 📋 4-WEEK PLAN

```
WEEK 1: Create 10 redirect files
├─ accountability-hub.tsx
├─ accountability-cases.tsx
├─ accountability-case.tsx
├─ accountability-coach.tsx
├─ accountability-network.tsx
├─ lawyer-finder.tsx
├─ collective-legal.tsx
├─ legal-dna.tsx
├─ legal-automation.tsx
└─ justice-as-a-service.tsx

WEEK 2: Extract components & enhance
├─ Extract AccountabilityTab.tsx
├─ Extract CoachTab.tsx
├─ Extract LegalTab.tsx
├─ Extract AutomationTab.tsx
├─ Extract PolicyTab.tsx
├─ Create CaseCard.tsx
├─ Create LawyerCard.tsx
└─ Add parameter support

WEEK 3: Test & refine
├─ Unit tests
├─ Integration tests
├─ Accessibility audit
└─ Performance optimization

WEEK 4: Beta launch
├─ Deploy to beta users
├─ Monitor analytics
├─ Gather feedback
└─ Iterate
```

---

## 💾 FILES TO CREATE

```
Redirect Wrappers (10 files)
├─ accountability-hub.tsx
├─ accountability-cases.tsx
├─ accountability-case.tsx
├─ accountability-coach.tsx
├─ accountability-network.tsx
├─ lawyer-finder.tsx
├─ collective-legal.tsx
├─ legal-dna.tsx
├─ legal-automation.tsx
└─ justice-as-a-service.tsx

Components (2 files)
├─ legal-action-hub/components/CaseCard.tsx
└─ legal-action-hub/components/LawyerCard.tsx

Hooks (2 files)
├─ legal-action-hub/hooks/useLegalCases.ts
└─ legal-action-hub/hooks/useLawyerSearch.ts

Tab Files (5 files) - extract from main
├─ legal-action-hub/tabs/AccountabilityTab.tsx
├─ legal-action-hub/tabs/CoachTab.tsx
├─ legal-action-hub/tabs/LegalHelpTab.tsx
├─ legal-action-hub/tabs/AutomationTab.tsx
└─ legal-action-hub/tabs/PolicyTab.tsx
```

---

## ✅ TESTING CHECKLIST

### Per Redirect
- [ ] Old URL redirects to hub
- [ ] Correct tab selected
- [ ] Deep links work
- [ ] Analytics event fires

### Hub-Level
- [ ] All 5 tabs load
- [ ] Tab switching works
- [ ] Search works
- [ ] Data loads correctly
- [ ] Empty states display

### Integration
- [ ] Links to Evidence Command Center
- [ ] Links to Case Tracker Pro
- [ ] Links to Letter Factory
- [ ] Back button works

---

## 🔌 DATA SOURCES

```
ACCOUNTABILITY TAB
└─ accountabilityTracker service
   ├─ listCases()
   └─ getCase(id)

COACH TAB
├─ accountabilityCoach service
└─ accountabilityNetwork service

LEGAL TAB
├─ advocates (data/lawyers)
├─ lawyerDirectory
└─ legalDNA service

AUTOMATION TAB
├─ legalAutomation service
└─ justiceAsAService service

POLICY TAB
├─ policySimple service
└─ LetterWizardContent
```

---

## 📈 SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Hub load time | < 2 seconds |
| Redirect time | < 500ms |
| Tab switch time | < 500ms |
| Accessibility score | ≥ 95/100 |
| Test coverage | ≥ 80% |
| Old URL redirect rate | 100% |

---

## 🎯 PARAMETER REFERENCE

```tsx
// Use these params in router.push():

router.push({
  pathname: '/(tabs)/advocacy/legal-action-hub',
  params: {
    tab: 'accountability',    // accountability|coach|legal|automation|policy
    case: 'case-123',          // optional: select specific case
    search: 'query',           // optional: pre-fill search
    filter: 'lawyers'          // optional: scope results
  }
} as any);

// OR use plain URL:
router.push('/(tabs)/advocacy/legal-action-hub?tab=legal&search=disability');
```

---

## 🚨 COMMON MISTAKES TO AVOID

```
❌ DON'T: Hardcode old paths in navigation
✅ DO: Use router.push with params

❌ DON'T: Forget to update analytics tracking
✅ DO: Track redirect events

❌ DON'T: Break deep-link support
✅ DO: Test shared URLs still work

❌ DON'T: Create circular redirects
✅ DO: Always redirect hub → specific tab

❌ DON'T: Forget accessibility
✅ DO: Test with screen readers

❌ DON'T: Assume all params are safe
✅ DO: Validate tab names server-side
```

---

## 🔗 KEY LINKS

**Documentation**
- Blueprint: `LEGAL_ACTION_HUB_IMPLEMENTATION_BLUEPRINT.md`
- Scaffolding: `LEGAL_ACTION_HUB_CODE_SCAFFOLDING.md`
- Redirects: `LEGAL_ACTION_HUB_REDIRECT_MAPPING.md`
- Summary: `LEGAL_ACTION_HUB_PHASE_1_EXECUTIVE_SUMMARY.md`

**Existing Code**
- Hub: `app/(tabs)/advocacy/legal-action-hub.tsx` (923 lines)
- PowerTool: `components/PowerTool.tsx` (539 lines)
- Evidence CC: `app/(tabs)/advocacy/evidence-command-center.tsx` (762 lines)

**References**
- Case Tracker Pro: `app/(tabs)/resources/case-tracker-pro.tsx` (849 lines)
- Letter Wizard: `components/LetterWizardContent.tsx` (1000+ lines)

---

## 🤝 GETTING HELP

**For Architecture Questions**
→ See: LEGAL_ACTION_HUB_IMPLEMENTATION_BLUEPRINT.md (Architecture section)

**For Code Templates**
→ See: LEGAL_ACTION_HUB_CODE_SCAFFOLDING.md (Copy-paste templates)

**For URL Mappings**
→ See: LEGAL_ACTION_HUB_REDIRECT_MAPPING.md (Complete redirect map)

**For Timeline Questions**
→ See: LEGAL_ACTION_HUB_PHASE_1_EXECUTIVE_SUMMARY.md (Timeline section)

---

## 💬 QUICK FACTS

- **Total Screens**: 12 → consolidate to 1
- **Screen Reduction**: 84% (Phase 1)
- **Effort**: 24-36 developer hours
- **Timeline**: 4 weeks
- **Risk Level**: LOW (redirects, no breaking changes)
- **Rollback**: EASY (< 1 hour)
- **Users Impacted**: ALL legal tool users (45% of base)
- **ROI**: HIGH (foundation for 8+ more consolidations)

---

## 🚀 START HERE

1. **Read**: This quick reference (5 min)
2. **Review**: Executive Summary (15 min)
3. **Study**: Code Scaffolding templates (20 min)
4. **Plan**: Week 1 with your team (30 min)
5. **Build**: Start creating redirects (4-6 hours)
6. **Test**: Verify all URLs work (2-3 hours)

**Total onboarding time: 1-2 hours**

---

**Last Updated**: January 3, 2026  
**Status**: ✅ READY TO IMPLEMENT  
**Print & Post**: On your team's wall 📌
