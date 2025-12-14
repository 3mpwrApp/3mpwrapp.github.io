# Disclaimer Coverage Audit

**Date:** December 13, 2025  
**Purpose:** Comprehensive audit of all app screens to ensure appropriate disclaimer coverage  
**Status:** 🟡 PARTIAL - Hub screens covered; USA Lite jurisdictions added (Dec 2025)

**December 2025 Update:** USA Lite expansion (13 US jurisdictions) added. All US legal information subject to same disclaimers as Canadian content—educational only, not legal advice, varies by state.

---

## ✅ **Screens WITH Disclaimers (4/326)**

### Hub Screens (Already Complete)
1. ✅ **Home** (`app/(tabs)/index.tsx`) - `<DisclaimerBanner type="general" compact />`
2. ✅ **Wellness Hub** (`app/(tabs)/wellness/index.tsx`) - `<DisclaimerBanner type="medical" compact />`
3. ✅ **Resources Hub** (`app/(tabs)/resources/index.tsx`) - `<DisclaimerBanner type="legal" compact />` + `<DisclaimerBanner type="ai" compact />`
4. ✅ **Advocacy Hub** (`app/(tabs)/advocacy/index.tsx`) - `<DisclaimerBanner type="legal" compact />`

---

## 🚨 **HIGH PRIORITY - Screens MISSING Disclaimers (322/326)**

### 🩺 **MEDICAL DISCLAIMER REQUIRED (36 screens)**

#### Wellness Tools - Symptom/Mood Tracking
1. ❌ `app/(tabs)/wellness.mood.tsx` - **Mood Tracker**
2. ❌ `app/(tabs)/wellness/symptom-tracker.tsx` - **Symptom Tracker**
3. ❌ `app/(tabs)/wellness/sleep-energy-tracker.tsx` - **Sleep & Energy Tracker**
4. ❌ `app/(tabs)/wellness/sleep-energy-tracker.impl.tsx` - **Sleep & Energy Tracker (impl)**
5. ❌ `app/(tabs)/wellness/pain-forecast.tsx` - **Pain Forecast**
6. ❌ `app/(tabs)/wellness/trigger-detector.tsx` - **Trigger Detector**
7. ❌ `app/(tabs)/wellness/dreams.tsx` - **Dream Journal**
8. ❌ `app/(tabs)/wellness/belief-meter.tsx` - **Belief Meter**
9. ❌ `app/(tabs)/wellness/reflections-calendar.tsx` - **Reflections Calendar**
10. ❌ `app/(tabs)/wellness/reflections-calendar.impl.tsx` - **Reflections Calendar (impl)**

#### Wellness Tools - Exercise/Movement
11. ❌ `app/(tabs)/wellness/exercise-hub.tsx` - **Exercise Hub**
12. ❌ `app/(tabs)/wellness/exercise-favorites.tsx` - **Exercise Favorites**
13. ❌ `app/(tabs)/wellness/micro-movement.tsx` - **Micro-Movement**
14. ❌ `app/(tabs)/wellness/pacing-partner.tsx` - **Pacing Partner**
15. ❌ `app/(tabs)/wellness/energy-coins.tsx` - **Energy Coins (Spoon Theory)**
16. ❌ `app/(tabs)/wellness/rehab-games.tsx` - **Rehab Games**

#### Wellness Tools - Nutrition/Health
17. ❌ `app/(tabs)/wellness/nutrition-guides.tsx` - **Nutrition Guides**
18. ❌ `app/(tabs)/resources/chronic-tracker.tsx` - **Chronic Condition Tracker**
19. ❌ `app/(tabs)/resources/doctor-visit-prep.tsx` - **Doctor Visit Prep**
20. ❌ `app/(tabs)/resources/body-mechanics-advisor.tsx` - **Body Mechanics Advisor**

#### Wellness Tools - Mental Health/Therapy
21. ❌ `app/(tabs)/wellness/dbt.tsx` - **DBT Skills**
22. ❌ `app/(tabs)/wellness/cbt-coach.tsx` - **CBT Coach**
23. ❌ `app/(tabs)/wellness/cbt-mini-games.tsx` - **CBT Mini Games**
24. ❌ `app/(tabs)/wellness/distress-tolerance.tsx` - **Distress Tolerance**
25. ❌ `app/(tabs)/wellness/opposite-action.tsx` - **Opposite Action**
26. ❌ `app/(tabs)/wellness/radical-acceptance.tsx` - **Radical Acceptance**
27. ❌ `app/(tabs)/wellness/acceptance-function.tsx` - **Acceptance Function**
28. ❌ `app/(tabs)/wellness/grief-support.tsx` - **Grief Support**
29. ❌ `app/(tabs)/wellness/harm-reduction.tsx` - **Harm Reduction**
30. ❌ `app/(tabs)/wellness/resilience.tsx` - **Resilience Building**
31. ❌ `app/(tabs)/wellness/sleep-reframe.tsx` - **Sleep Reframe**

#### Wellness Tools - Relaxation/Mindfulness
32. ❌ `app/(tabs)/wellness/adaptive-meditation.tsx` - **Adaptive Meditation**
33. ❌ `app/(tabs)/wellness/ambience.tsx` - **Ambience Sounds**
34. ❌ `app/(tabs)/wellness/self-care-library.tsx` - **Self-Care Library**

#### Wellness Tools - Productivity/Balance
35. ❌ `app/(tabs)/wellness/daily-planner.tsx` - **Daily Planner**
36. ❌ `app/(tabs)/wellness/work-balance-ai.tsx` - **Work-Life Balance AI**

**Disclaimer Needed:**
```tsx
import DisclaimerBanner from '../../../components/DisclaimerBanner';

// Add near top of screen content (after header/title):
<DisclaimerBanner type="medical" compact />
```

---

### ⚖️ **LEGAL DISCLAIMER REQUIRED (22 screens)**

#### Evidence & Documentation
1. ❌ `app/(tabs)/resources/evidence-locker.tsx` - **Evidence Locker**
2. ❌ `app/(tabs)/resources/evidence-locker.impl.tsx` - **Evidence Locker (impl)**
3. ❌ `app/(tabs)/resources/evidence-checklist.tsx` - **Evidence Checklist**
4. ❌ `app/(tabs)/resources/case-timeline.tsx` - **Case Timeline**

#### Letter Templates & Forms
5. ❌ `app/(tabs)/advocacy/letter-wizard.tsx` - **Letter Wizard (22 templates)**
6. ❌ `app/(tabs)/advocacy/accommodation-request.tsx` - **Accommodation Request**
7. ❌ `app/(tabs)/advocacy/appeal-letter.tsx` - **Appeal Letter**
8. ❌ `app/(tabs)/advocacy/complaint-form.tsx` - **Complaint Form**

#### Legal Workflows & Processes
9. ❌ `app/(tabs)/advocacy/legal-workflow.tsx` - **Legal Workflow Automation**
10. ❌ `app/(tabs)/advocacy/appeal-coach.tsx` - **Appeal Coach**
11. ❌ `app/(tabs)/resources/appeal-coach.tsx` - **Appeal Coach (duplicate?)**
12. ❌ `app/(tabs)/advocacy/claims-navigator.tsx` - **Claims Navigator**
13. ❌ `app/(tabs)/resources/claims-navigator.tsx` - **Claims Navigator (duplicate?)**
14. ❌ `app/(tabs)/resources/denial-decoder.tsx` - **Denial Decoder**
15. ❌ `app/(tabs)/resources/deadlines.tsx` - **Deadlines Tracker**
16. ❌ `app/(tabs)/resources/deadlines.impl.tsx` - **Deadlines Tracker (impl)**
17. ❌ `app/(tabs)/resources/deadlines-list.tsx` - **Deadlines List**

#### Legal Resources
18. ❌ `app/(tabs)/advocacy/lawyer-finder.tsx` - **Lawyer Finder**
19. ❌ `app/(tabs)/advocacy/jurisdiction-resources.tsx` - **Jurisdiction Resources**
20. ❌ `app/(tabs)/advocacy/rights-checklist.tsx` - **Rights Checklist**
21. ❌ `app/(tabs)/advocacy/policy-explainer.tsx` - **Policy Explainer**
22. ❌ `app/(tabs)/advocacy/gov-navigator.tsx` - **Government Navigator**

**Disclaimer Needed:**
```tsx
import DisclaimerBanner from '../../../components/DisclaimerBanner';

// Add near top of screen content (after header/title):
<DisclaimerBanner type="legal" compact />
```

---

### 🤖 **AI DISCLAIMER REQUIRED (15 screens)**

#### AI-Powered Legal Tools
1. ❌ `app/(tabs)/advocacy/ai-case-interpreter.tsx` - **AI Case Interpreter**
2. ❌ `app/(tabs)/advocacy/ai-translator.tsx` - **AI Translator**
3. ❌ `app/(tabs)/advocacy/ai-doc-generator.tsx` - **AI Document Generator**
4. ❌ `app/(tabs)/advocacy/ai-letter-assistant.tsx` - **AI Letter Assistant**

#### AI-Powered Wellness Tools
5. ❌ `app/(tabs)/wellness/ai-companion.tsx` - **AI Wellness Companion**
6. ❌ `app/(tabs)/wellness/work-balance-ai.tsx` - **Work-Life Balance AI** (also needs medical)

#### AI-Powered Resources
7. ❌ `app/(tabs)/resources/ai-policy-explainer.tsx` - **AI Policy Explainer**
8. ❌ `app/(tabs)/resources/ai-benefits-analyzer.tsx` - **AI Benefits Analyzer**

#### AI Assistant & Chat
9. ❌ `app/(tabs)/assistant/index.tsx` - **AI Assistant ("Ask 3mpwr")**
10. ❌ `app/(tabs)/assistant/chat.tsx` - **AI Chat Interface**
11. ❌ `app/(tabs)/assistant/quick-prompts.tsx` - **Quick Prompts**
12. ❌ `app/(tabs)/assistant/tools.tsx` - **AI Tools**

#### AI-Powered Community Features
13. ❌ `app/(tabs)/community/ai-moderator.tsx` - **AI Content Moderator**
14. ❌ `app/(tabs)/community/ai-matcher.tsx` - **AI Peer Matching (94% accuracy)**
15. ❌ `app/(tabs)/community/dbt-matcher.tsx` - **DBT Accountability Matcher**

**Disclaimer Needed:**
```tsx
import DisclaimerBanner from '../../../components/DisclaimerBanner';

// Add near top of screen content (after header/title):
<DisclaimerBanner type="ai" compact />
```

---

### 💰 **FINANCIAL DISCLAIMER REQUIRED (8 screens)**

1. ❌ `app/(tabs)/resources/benefits-tracker.tsx` - **Benefits Tracker**
2. ❌ `app/(tabs)/resources/benefits-calculator.tsx` - **Benefits Calculator**
3. ❌ `app/(tabs)/resources/financial-safety-net.tsx` - **Financial Safety Net**
4. ❌ `app/(tabs)/resources/budget-planner.tsx` - **Budget Planner**
5. ❌ `app/(tabs)/resources/cost-estimator.tsx` - **Cost Estimator**
6. ❌ `app/(tabs)/resources/tax-deductions.tsx` - **Tax Deductions Guide**
7. ❌ `app/(tabs)/advocacy/disability-benefits.tsx` - **Disability Benefits Application**
8. ❌ `app/(tabs)/advocacy/ssdi-guide.tsx` - **SSDI Guide**

**Disclaimer Needed:**
```tsx
import DisclaimerBanner from '../../../components/DisclaimerBanner';

// Add near top of screen content (after header/title):
<DisclaimerBanner type="financial" compact />
```

---

### 🆘 **CRISIS DISCLAIMER REQUIRED (5 screens)**

1. ❌ `app/(tabs)/wellness/crisis-resources.tsx` - **Crisis Resources**
2. ❌ `app/(tabs)/wellness/panic-button.tsx` - **Panic Button**
3. ❌ `app/(tabs)/wellness/safe-landing.tsx` - **Safe Landing Page**
4. ❌ `app/(tabs)/community/crisis-support.tsx` - **Crisis Support Chat**
5. ❌ `app/(tabs)/resources/emergency-wallet-card.tsx` - **Emergency Wallet Card**

**Disclaimer Needed:**
```tsx
import DisclaimerBanner from '../../../components/DisclaimerBanner';

// Add near top of screen content (after header/title):
<DisclaimerBanner type="crisis" compact />
```

---

### 📊 **GENERAL DISCLAIMER SUFFICIENT (Informational Screens)**

#### Settings & Account
- `app/(tabs)/settings/index.tsx` - **Settings**
- `app/(tabs)/settings/profile-editor.tsx` - **Profile Editor**
- `app/(tabs)/settings/neurodivergent.tsx` - **Neurodivergent Settings**
- `app/(tabs)/settings/motor-accessibility.tsx` - **Motor Accessibility**
- `app/(tabs)/settings/dyslexia.tsx` - **Dyslexia Settings**
- `app/(tabs)/settings/indigenous-language.tsx` - **Indigenous Language**
- `app/(tabs)/settings.sections/*.tsx` - **Settings Sections**

#### Community (Non-AI Features)
- `app/(tabs)/community/index.tsx` - **Community Hub** (already has general via home)
- `app/(tabs)/community/enhanced-hub.tsx` - **Enhanced Hub**
- `app/(tabs)/community/mutual-chat.tsx` - **Mutual Chat**
- `app/(tabs)/community/mutual-aid.tsx` - **Mutual Aid**
- `app/(tabs)/community/testers-chat.tsx` - **Testers Chat**
- `app/(tabs)/community/media-studio.tsx` - **Media Studio**
- `app/(tabs)/community/my-posts.tsx` - **My Posts**
- `app/(tabs)/community/peer-support.tsx` - **Peer Support** (needs medical if therapy-related)
- `app/(tabs)/community/safety.tsx` - **Safety Guidelines**

#### Other Informational Screens
- `app/(tabs)/faqs.tsx` - **FAQs**
- `app/(tabs)/inbox.tsx` - **Inbox**
- `app/(tabs)/saved.tsx` - **Saved Items**
- `app/(tabs)/voice-help.tsx` - **Voice Help**
- `app/(tabs)/admin/*.tsx` - **Admin Screens** (not user-facing)
- `app/(tabs)/archive/*.tsx` - **Archive** (not user-facing)

**Note:** These screens inherit general disclaimer from hub screens or don't provide actionable advice requiring specific disclaimers.

---

## 📋 **IMPLEMENTATION CHECKLIST**

### Phase 1: HIGH PRIORITY (Before Launch)
- [ ] Add medical disclaimers to all 36 wellness feature screens
- [ ] Add legal disclaimers to all 22 advocacy/legal feature screens
- [ ] Add AI disclaimers to all 15 AI-powered feature screens
- [ ] Add financial disclaimers to all 8 benefits/financial feature screens
- [ ] Add crisis disclaimers to all 5 crisis-related feature screens

**Total: 86 screens need disclaimers added**

### Phase 2: VERIFICATION
- [ ] Test each screen to verify disclaimer displays correctly
- [ ] Verify disclaimer text is visible (not obscured by other UI)
- [ ] Check disclaimer placement (after header/title, before main content)
- [ ] Verify disclaimer styling matches app theme (light/dark mode)
- [ ] Test on different screen sizes (phones, tablets)

### Phase 3: DOCUMENTATION
- [ ] Update CHANGELOG.md with disclaimer coverage
- [ ] Update README.md with disclaimer coverage
- [ ] Document disclaimer types in component documentation
- [ ] Add disclaimer coverage to release checklist

---

## 🎯 **SUCCESS CRITERIA**

### Definition of "Complete Coverage":
✅ **Every screen that provides actionable advice, tools, or information has an appropriate disclaimer**
✅ **Disclaimers are visible, readable, and placed prominently**
✅ **Multiple disclaimer types can appear on same screen (e.g., AI + Legal)**
✅ **All disclaimers match app's i18n keys for multi-language support**

### Testing Validation:
- Manual testing: Navigate to each screen and verify disclaimer is visible
- Automated testing: Add tests for DisclaimerBanner presence on key screens
- Accessibility testing: Verify disclaimers are screen reader accessible
- Visual regression: Ensure disclaimers don't break layouts

---

## 🚀 **QUICK START GUIDE**

### How to Add a Disclaimer to a Screen:

1. **Import the DisclaimerBanner component:**
   ```tsx
   import DisclaimerBanner from '../../../components/DisclaimerBanner';
   ```

2. **Add the disclaimer near the top of your screen content:**
   ```tsx
   export default function MyFeatureScreen() {
     return (
       <SafeAreaView style={styles.container}>
         <Text style={styles.title}>My Feature</Text>
         
         {/* Add disclaimer here - after title, before main content */}
         <DisclaimerBanner type="medical" compact />
         
         {/* Main content */}
         <ScrollView>...</ScrollView>
       </SafeAreaView>
     );
   }
   ```

3. **Choose the appropriate disclaimer type:**
   - `type="medical"` - For health, wellness, symptoms, mood, exercise, nutrition
   - `type="legal"` - For legal advice, forms, letters, appeals, rights, evidence
   - `type="financial"` - For benefits, budgeting, financial planning, taxes
   - `type="ai"` - For AI-generated content, assistants, interpreters, translators
   - `type="crisis"` - For crisis resources, panic buttons, emergency features
   - `type="general"` - For general information (fallback)

4. **Multiple disclaimers on same screen:**
   ```tsx
   <DisclaimerBanner type="ai" compact />
   <DisclaimerBanner type="legal" compact />
   ```

5. **Test the disclaimer:**
   - Run `npx expo start`
   - Navigate to your screen
   - Verify disclaimer is visible and styled correctly
   - Test in both light and dark modes

---

## 📊 **CURRENT STATUS**

**Disclaimer Coverage:** 4/326 screens (1.2%)  
**Screens Needing Disclaimers:** 86/326 screens (26.4%)  
**Priority:** 🔴 **CRITICAL** - Must complete before public launch

**Estimated Time:**
- **Phase 1 (Adding disclaimers):** 4-6 hours (86 screens × 3-4 minutes each)
- **Phase 2 (Testing):** 2-3 hours
- **Phase 3 (Documentation):** 1 hour
- **Total:** ~8-10 hours of work

**Risk Assessment:**
- **Launch without disclaimers:** HIGH LEGAL RISK - potential liability for medical/legal harm
- **Incomplete coverage:** MEDIUM RISK - some features protected, others exposed
- **Complete coverage:** LOW RISK - maximum legal protection

---

## 🔄 **NEXT STEPS**

1. **Prioritize by feature type:** Start with medical (36 screens), then legal (22 screens), then AI (15 screens)
2. **Batch similar screens:** Add disclaimers to all wellness screens in one session, then all advocacy screens, etc.
3. **Test as you go:** Test each screen after adding disclaimer to catch issues early
4. **Update this audit:** Mark screens ✅ as disclaimers are added

---

**Last Updated:** October 24, 2025  
**Next Review:** Before production release  
**Owner:** Development Team  
**Priority:** 🔴 CRITICAL
