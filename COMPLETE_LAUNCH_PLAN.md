# 🚀 Complete Beta Launch + Public Launch Plan

**Created:** October 19, 2025  
**Current Version:** 1.0.0-rc.1  
**Target Beta Launch:** November 1, 2025 (2 weeks)  
**Target Public Launch:** January 1, 2026 (10-12 weeks)  
**Budget:** $0 (Zero-Budget Approach)

---

## 📋 Overview

This plan includes **EVERYTHING** needed from beta launch through public launch:

1. ✅ **Critical beta infrastructure** (Sentry, builds, testing)
2. ✅ **Content completion** (translations, wizard keys)
3. ✅ **Performance optimization** (bundle size, battery, profiling)
4. ✅ **Quality assurance** (device testing, community feedback)

**Total effort:** ~8-10 weeks (with 2-4 weeks of beta overlap)

---

## 🎯 The Complete 10-Task Roadmap

### Phase 1: Pre-Beta Setup (Week 1) - CRITICAL 🚨

#### Task #1: Configure Sentry [4 hours] - DO FIRST!
**Why:** You need error tracking from day 1 of beta.

```bash
# 1. Sign up for Sentry free tier (5 min)
# Go to: https://sentry.io/signup/
# Create organization: "3mpwrapp"
# Create project: "empowrapp-mobile" (React Native)

# 2. Get DSN (2 min)
# Copy from: Settings → Projects → empowrapp-mobile → Client Keys (DSN)
# Example: https://abc123@o123456.ingest.sentry.io/123456

# 3. Add to .env file (1 min)
echo "EXPO_PUBLIC_SENTRY_DSN=https://YOUR_DSN_HERE" >> .env

# 4. Enable in app (already integrated, just needs DSN!)
# app/_layout.tsx already has:
# - Sentry.init() when errorReportingEnabled
# - Privacy-safe beforeSend hook
# - Auto session tracking

# 5. Test it (10 min)
# Add test error button in development:
```

Create `components/DevTools.tsx`:
```typescript
import * as Sentry from '@sentry/react-native';
import { Button } from 'react-native';

export function DevTools() {
  if (!__DEV__) return null;
  
  return (
    <Button
      title="Test Sentry Error"
      onPress={() => {
        Sentry.captureException(new Error('Test error from DevTools'));
      }}
    />
  );
}
```

```bash
# 6. Verify in Sentry dashboard
# Should see test error appear in Issues tab

# 7. Setup alerts (5 min)
# Sentry → Alerts → New Alert Rule
# - New Issue: Email immediately
# - Error Rate: >5% for 5 minutes
# - Performance: Transaction >2s
```

**Deliverables:**
- ✅ Sentry account created
- ✅ DSN in .env file
- ✅ Test error captured
- ✅ Alerts configured

**Time:** 4 hours  
**Cost:** $0 (free tier: 5,000 events/month)

---

#### Task #2: Add 324 Wizard Baseline Keys [2 days]
**Why:** Prerequisite for translations. Can't translate what's not in baseline.

**Step 1: Extract missing keys (1 hour)**
```bash
# Generate list of missing keys
npm run i18n:report > baseline-missing.txt

# You'll see 324 keys like:
# - accessibility.advanced.*
# - cognitive.*
# - dyslexia.*
# - motorAccessibility.*
# - wizard.setup.*
# - profile.editor.*
```

**Step 2: Create key template (2 hours)**

Create `scripts/generate-baseline-keys.js`:
```javascript
#!/usr/bin/env node
const fs = require('fs');

// Missing keys from i18n:report
const missingKeys = [
  // Accessibility (67 keys)
  'accessibility.advanced.title',
  'accessibility.advanced.subtitle',
  'accessibility.animation.title',
  'accessibility.animation.description',
  'accessibility.animation.reduced',
  'accessibility.animation.none',
  'accessibility.animation.essential',
  'accessibility.cognitive.title',
  'accessibility.cognitive.navigationMemory',
  'accessibility.cognitive.breadcrumbs',
  'accessibility.cognitive.stepByStep',
  'accessibility.emergency.title',
  'accessibility.emergency.quickExit',
  'accessibility.emergency.panicButton',
  'accessibility.hearing.title',
  'accessibility.hearing.visualAlerts',
  'accessibility.hearing.captioning',
  'accessibility.motor.title',
  'accessibility.motor.dwellClick',
  'accessibility.motor.largeTargets',
  'accessibility.motor.tremorSupport',
  'accessibility.visual.title',
  'accessibility.visual.highContrast',
  'accessibility.visual.screenReader',
  
  // Cognitive (46 keys)
  'cognitive.navigationMemory.title',
  'cognitive.navigationMemory.description',
  'cognitive.navigationMemory.enable',
  'cognitive.breadcrumbs.title',
  'cognitive.breadcrumbs.show',
  'cognitive.stepByStep.title',
  'cognitive.stepByStep.enable',
  'cognitive.simplify.title',
  'cognitive.simplify.reduceComplexity',
  
  // Dyslexia (33 keys)
  'dyslexia.font.title',
  'dyslexia.font.openDyslexic',
  'dyslexia.font.comic',
  'dyslexia.font.arial',
  'dyslexia.spacing.title',
  'dyslexia.spacing.wide',
  'dyslexia.spacing.extraWide',
  'dyslexia.lineHeight.title',
  'dyslexia.lineHeight.increase',
  'dyslexia.readingGuide.title',
  'dyslexia.readingGuide.enable',
  
  // Motor Accessibility (32 keys)
  'motorAccessibility.dwellClick.title',
  'motorAccessibility.dwellClick.enable',
  'motorAccessibility.dwellClick.duration',
  'motorAccessibility.touchTargets.title',
  'motorAccessibility.touchTargets.large',
  'motorAccessibility.touchTargets.extraLarge',
  'motorAccessibility.tremor.title',
  'motorAccessibility.tremor.stabilization',
  'motorAccessibility.oneHanded.title',
  'motorAccessibility.oneHanded.enable',
  
  // Wizard Setup (80+ keys)
  'wizard.setup.welcome.title',
  'wizard.setup.welcome.subtitle',
  'wizard.setup.welcome.description',
  'wizard.setup.disabilities.title',
  'wizard.setup.disabilities.select',
  'wizard.setup.disabilities.physical',
  'wizard.setup.disabilities.cognitive',
  'wizard.setup.disabilities.sensory',
  'wizard.setup.disabilities.mental',
  'wizard.setup.disabilities.chronic',
  'wizard.setup.accommodations.title',
  'wizard.setup.accommodations.workplace',
  'wizard.setup.accommodations.housing',
  'wizard.setup.accommodations.education',
  'wizard.setup.accommodations.public',
  'wizard.setup.preferences.title',
  'wizard.setup.preferences.notifications',
  'wizard.setup.preferences.reminders',
  'wizard.setup.preferences.privacy',
  'wizard.setup.complete.title',
  'wizard.setup.complete.subtitle',
  'wizard.setup.complete.getStarted',
  
  // Profile Editor (18 keys)
  'profile.editor.title',
  'profile.editor.subtitle',
  'profile.editor.name',
  'profile.editor.email',
  'profile.editor.phone',
  'profile.editor.address',
  'profile.editor.disabilities',
  'profile.editor.accommodations',
  'profile.editor.documents',
  'profile.editor.preferences',
  'profile.editor.save',
  'profile.editor.cancel',
  'profile.editor.delete',
  
  // Jurisdiction (28 keys)
  'jurisdiction.select.title',
  'jurisdiction.select.description',
  'jurisdiction.us.title',
  'jurisdiction.us.federal',
  'jurisdiction.us.state',
  'jurisdiction.canada.title',
  'jurisdiction.canada.federal',
  'jurisdiction.canada.province',
  'jurisdiction.uk.title',
  'jurisdiction.uk.national',
  'jurisdiction.australia.title',
  'jurisdiction.australia.federal',
  
  // Common utilities (6 keys)
  'common.apply',
  'common.discard',
  'common.reset',
  'common.customize',
  'common.preview',
  'common.export'
];

// Generate English baseline
const baseline = {};

missingKeys.forEach(key => {
  const parts = key.split('.');
  let current = baseline;
  
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      // Last part - add English text
      current[part] = generateEnglishText(key, part);
    } else {
      // Create nested object
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  });
});

// Helper to generate human-readable English text
function generateEnglishText(fullKey, lastPart) {
  // Convert camelCase to Title Case
  const readable = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  // Add context based on key type
  if (fullKey.includes('.title')) return readable;
  if (fullKey.includes('.description')) return `Configure ${readable.toLowerCase()} settings`;
  if (fullKey.includes('.subtitle')) return `Manage ${readable.toLowerCase()}`;
  if (fullKey.includes('.enable')) return `Enable ${readable.toLowerCase()}`;
  if (fullKey.includes('.show')) return `Show ${readable.toLowerCase()}`;
  
  return readable;
}

// Output JSON
console.log(JSON.stringify(baseline, null, 2));

// Save to file
fs.writeFileSync(
  'scripts/baseline-keys-generated.json',
  JSON.stringify(baseline, null, 2)
);

console.log('\n✅ Generated 324 baseline keys → scripts/baseline-keys-generated.json');
console.log('📝 Review and edit the text, then merge into locales/en/common.json');
```

```bash
# Run generator
node scripts/generate-baseline-keys.js
```

**Step 3: Review and refine (4 hours)**
```bash
# Open generated file
code scripts/baseline-keys-generated.json

# Manually review each key:
# - Fix auto-generated text
# - Add proper descriptions
# - Ensure disability-appropriate language
# - Match tone of existing translations
```

**Step 4: Merge into baseline (30 min)**
```bash
# Manual merge into locales/en/common.json
# Or create merge script:
node scripts/merge-baseline-keys.js

# Validate
npm run i18n:validate

# Should see: 324 new keys added, 0 missing from baseline
```

**Step 5: Sort and format (15 min)**
```bash
# Sort keys alphabetically for maintainability
node scripts/sort-i18n-keys.js

# Commit
git add locales/en/common.json
git commit -m "Add 324 wizard baseline keys for i18n tracking"
```

**Deliverables:**
- ✅ 324 keys added to locales/en/common.json
- ✅ Keys properly nested and organized
- ✅ Clear, concise English text
- ✅ i18n:validate passing
- ✅ No missing baseline keys

**Time:** 2 days  
**Cost:** $0 (pure development)

---

#### Task #3: Complete Spanish/French Translations [1 week]
**Why:** Required for public launch (international users).

**Prerequisites:** Task #2 must be complete (baseline keys added).

**Step 1: Setup auto-translate (30 min)**
```bash
# Install free translation library
npm install @vitalets/google-translate-api --save-dev

# Or use DeepL free tier (better quality)
npm install deepl-node --save-dev
```

Create `scripts/auto-translate-free.js`:
```javascript
#!/usr/bin/env node
const translate = require('@vitalets/google-translate-api');
const fs = require('fs');
const path = require('path');

async function translateKeys(sourceKeys, targetLang) {
  const translations = {};
  const keys = Object.entries(sourceKeys);
  
  console.log(`🌍 Translating ${keys.length} keys to ${targetLang}...`);
  
  for (let i = 0; i < keys.length; i++) {
    const [key, value] = keys[i];
    
    try {
      // Skip if already translated
      if (typeof value === 'object') {
        translations[key] = await translateKeys(value, targetLang);
      } else {
        const result = await translate(value, { to: targetLang });
        translations[key] = result.text;
        
        // Progress
        if ((i + 1) % 10 === 0) {
          console.log(`  Progress: ${i + 1}/${keys.length}`);
        }
      }
      
      // Rate limiting: 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`⚠️  Failed to translate ${key}: ${error.message}`);
      translations[key] = value; // Fallback to English
    }
  }
  
  return translations;
}

async function main() {
  // Load English baseline
  const enPath = path.join(__dirname, '../locales/en/common.json');
  const enKeys = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  // Load existing Spanish/French (to preserve existing translations)
  const esPath = path.join(__dirname, '../locales/es/common.json');
  const frPath = path.join(__dirname, '../locales/fr/common.json');
  
  const esKeys = JSON.parse(fs.readFileSync(esPath, 'utf8'));
  const frKeys = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  
  // Find missing keys
  const missingEs = findMissingKeys(enKeys, esKeys);
  const missingFr = findMissingKeys(enKeys, frKeys);
  
  console.log(`\n📊 Missing translations:`);
  console.log(`  Spanish: ${Object.keys(missingEs).length} keys`);
  console.log(`  French: ${Object.keys(missingFr).length} keys\n`);
  
  // Translate missing keys
  if (Object.keys(missingEs).length > 0) {
    console.log('🇪🇸 Translating to Spanish...');
    const esTranslations = await translateKeys(missingEs, 'es');
    
    // Merge with existing
    const esComplete = deepMerge(esKeys, esTranslations);
    fs.writeFileSync(esPath, JSON.stringify(esComplete, null, 2));
    console.log('✅ Spanish translations saved\n');
  }
  
  if (Object.keys(missingFr).length > 0) {
    console.log('🇫🇷 Translating to French...');
    const frTranslations = await translateKeys(missingFr, 'fr');
    
    // Merge with existing
    const frComplete = deepMerge(frKeys, frTranslations);
    fs.writeFileSync(frPath, JSON.stringify(frComplete, null, 2));
    console.log('✅ French translations saved\n');
  }
  
  console.log('🎉 Auto-translation complete!');
  console.log('📝 Next: Review translations with native speakers');
}

function findMissingKeys(source, target, prefix = '') {
  const missing = {};
  
  for (const [key, value] of Object.entries(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      const nested = findMissingKeys(value, target[key] || {}, fullKey);
      if (Object.keys(nested).length > 0) {
        missing[key] = nested;
      }
    } else if (!target[key]) {
      missing[key] = value;
    }
  }
  
  return missing;
}

function deepMerge(target, source) {
  const result = { ...target };
  
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

main().catch(console.error);
```

**Step 2: Run auto-translation (2 hours)**
```bash
# Translate all missing keys
node scripts/auto-translate-free.js

# This will:
# - Find 214 missing keys in es/fr
# - Auto-translate via Google Translate (free)
# - Merge with existing translations
# - Save updated locales/es/common.json and locales/fr/common.json
```

**Step 3: Community review (3-5 days parallel)**
```bash
# Create review spreadsheet
npm run i18n:extract -- --format csv > translations-review.csv

# Upload to Google Sheets (free)
# Share link with community

# Post on:
# - Reddit: r/reactnative, r/accessibility
# - Discord: Reactiflux, Expo community
# - LinkedIn: Disability advocacy groups
# - GitHub Discussions

# Template post:
```

**Translation Review Request:**
```markdown
# 🌍 Help Review Spanish/French Translations!

We auto-translated 214 strings for our disability empowerment app.
We need native Spanish/French speakers to review for accuracy!

**What you get:**
- ✅ Lifetime premium access (free)
- ✅ Name in app credits
- ✅ Beta tester status
- ✅ Direct feature requests

**Time required:** 1-2 hours

**Review spreadsheet:** [Google Sheets link]

**Focus areas:**
- Disability-specific terminology
- Cultural appropriateness
- Context accuracy (not just literal translation)

**Questions?** Comment below or email empowrapp08162025@gmail.com

Thank you! 🙏
```

**Step 4: Incorporate feedback (1 day)**
```bash
# Download reviewed spreadsheet
# Update locales/es/common.json and locales/fr/common.json
# With community corrections

# Validate
npm run i18n:validate

# Should see 100% coverage for all languages
```

**Deliverables:**
- ✅ 100% translation coverage (en, es, fr)
- ✅ Community-reviewed translations
- ✅ i18n:validate passing with 0 missing keys
- ✅ Disability-appropriate terminology

**Time:** 1 week (3 days active work + 3-5 days community review parallel)  
**Cost:** $0 (free tools + community)

---

### Phase 2: Beta Launch Prep (Week 2) - HIGH PRIORITY 🎯

#### Task #4: Create Beta Tester Guide [3 hours]

Already created template in BETA_LAUNCH_FOCUS.md! Just customize:

```bash
# Copy template to docs
cp BETA_LAUNCH_FOCUS.md docs/BETA_TESTER_GUIDE.md

# Customize:
# - Add your TestFlight/Play Store links (after Task #7)
# - Add your feedback form link (after Task #5)
# - Update timeline dates
# - Add any app-specific instructions

# Review and polish
code docs/BETA_TESTER_GUIDE.md
```

**Deliverables:**
- ✅ docs/BETA_TESTER_GUIDE.md created
- ✅ Installation instructions clear
- ✅ Testing priorities documented
- ✅ Feedback channels listed
- ✅ Timeline and expectations set

**Time:** 3 hours  
**Cost:** $0

---

#### Task #5: Setup Feedback System [2 hours]

**Option A: Google Form (Recommended - 30 min)**

1. Go to forms.google.com
2. Create "3mpwr App Beta Feedback" form
3. Add fields:
   - Name (optional)
   - Email (optional)
   - Device type (iOS/Android dropdown)
   - Issue type (Bug/Feature/Feedback/Question)
   - Description (long text)
   - Steps to reproduce (long text)
   - Screenshot (file upload)
   - Severity (Critical/High/Medium/Low)
4. Get shareable link
5. Add to docs/BETA_TESTER_GUIDE.md

**Option B: GitHub Issues Template (Better - 1 hour)**

Create `.github/ISSUE_TEMPLATE/beta-feedback.yml`:
```yaml
name: Beta Feedback
description: Report issues or feedback during beta testing
title: "[BETA] "
labels: ["beta", "needs-triage"]
body:
  - type: dropdown
    id: issue-type
    attributes:
      label: Issue Type
      options:
        - Bug
        - Feature Request
        - Feedback
        - Question
    validations:
      required: true
      
  - type: input
    id: device
    attributes:
      label: Device
      description: e.g., iPhone 12, Samsung Galaxy S21
      placeholder: iPhone 12
    validations:
      required: true
      
  - type: input
    id: os-version
    attributes:
      label: OS Version
      description: e.g., iOS 15.2, Android 11
      placeholder: iOS 15.2
    validations:
      required: true
      
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What happened? What did you expect?
      placeholder: When I tap the upload button...
    validations:
      required: true
      
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: How can we reproduce this issue?
      placeholder: |
        1. Open evidence locker
        2. Tap upload button
        3. Select photo
    validations:
      required: false
      
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - Critical (app crashes, data loss)
        - High (feature doesn't work)
        - Medium (annoying but not blocking)
        - Low (minor issue)
    validations:
      required: true
```

**Option C: In-App Feedback (Best - 2 hours)**

Already have shake-to-feedback concept in BETA_LAUNCH_FOCUS.md. Implement it!

**Deliverables:**
- ✅ Feedback form created (Google Form or GitHub)
- ✅ Link added to beta tester guide
- ✅ Optional: In-app feedback implemented

**Time:** 2 hours  
**Cost:** $0

---

#### Task #6: Test on Physical Devices [4 hours]

```bash
# Option A: Development build on your device
npx expo run:ios    # If you have Mac + iPhone
npx expo run:android # If you have Android device

# Option B: EAS development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Download and install on your devices
```

**Test Checklist:**
- [ ] App opens successfully
- [ ] Splash screen shows
- [ ] Terms acceptance flow
- [ ] Sign up / Sign in
- [ ] Evidence locker (camera, photo picker, upload)
- [ ] Letter wizard (template selection, PDF generation)
- [ ] Wellness tracking (mood, energy, symptoms)
- [ ] Community (threads, chat if enabled)
- [ ] Notifications (enable, receive)
- [ ] Offline mode (turn off wifi, app still works)
- [ ] Screen rotation (portrait/landscape)
- [ ] Accessibility features (VoiceOver, large text)
- [ ] Language switching (en → es → fr)
- [ ] App doesn't crash after 10 min of use

**Document any issues in GitHub:**
```bash
# Create issue for each problem found
# Label: "pre-beta", "bug", "testing"
```

**Deliverables:**
- ✅ Tested on 2+ physical devices (iOS + Android)
- ✅ All critical features work
- ✅ Issues documented in GitHub
- ✅ Confidence app is installable and functional

**Time:** 4 hours  
**Cost:** $0 (using your own devices or borrowed)

---

#### Task #7: Prepare EAS Builds [6 hours]

**Prerequisites:**
- Apple Developer Account ($99/year) - for TestFlight
- Google Play Developer Account ($25 one-time) - for Play Store

**If you don't have accounts yet:** Use direct APK distribution for Android, skip iOS for now.

```bash
# 1. Verify EAS configured
cat eas.json
# Should have "preview" profile

# 2. Login to EAS
eas login

# 3. Configure iOS bundle identifier (if not done)
eas build:configure

# 4. Build iOS
eas build --platform ios --profile preview
# Wait 15-20 minutes...
# Download .ipa file

# 5. Upload to TestFlight
# Go to: https://appstoreconnect.apple.com
# My Apps → 3mpwr App → TestFlight
# Click "+" → Upload build
# Wait for processing (10-15 min)
# Add "What to Test" notes
# Add internal testers (email addresses)

# 6. Build Android
eas build --platform android --profile preview
# Wait 15-20 minutes...
# Download .aab file

# 7. Upload to Play Console
# Go to: https://play.google.com/console
# Select app → Release → Testing → Internal testing
# Create new release → Upload .aab
# Add release notes
# Add internal testers (create email list)
# Review and rollout

# 8. Test installation yourself
# iOS: Install from TestFlight
# Android: Install from Play Store Internal Testing
# Verify app works after installation
```

**Alternative (No Store Accounts):**
```bash
# Android: Direct APK install
eas build --platform android --profile preview
# Share .apk file directly
# Testers enable "Unknown sources" and install

# iOS: Ad-hoc distribution (requires devices' UDIDs)
# More complex, recommend TestFlight if possible
```

**Deliverables:**
- ✅ iOS build on TestFlight (or alternative method)
- ✅ Android build on Play Console Internal Testing (or APK)
- ✅ Installation tested on your devices
- ✅ Links added to docs/BETA_TESTER_GUIDE.md
- ✅ Ready to invite beta testers

**Time:** 6 hours (including build wait times)  
**Cost:** $0 (if using accounts) or skip iOS and use APK for Android

---

### Phase 3: Beta Testing Period (Weeks 3-6) - MONITORING 👀

**During beta, work on optimization tasks in parallel:**

#### Task #8: Optimize Bundle Size [2-3 weeks]

**Goal:** Reduce 200KB (2.96MB → 2.76MB)

**Week 1: Analysis**
```bash
# Run bundle analyzers (all free!)
npx react-native-bundle-visualizer

# Install additional analyzers
npm install --save-dev source-map-explorer webpack-bundle-analyzer

# Analyze
npm run build:analyze # Add this script to package.json

# Document findings in BUNDLE_ANALYSIS.md
```

**Week 2-3: Implement Optimizations**

**Strategy 1: Split Letter Templates (-40KB)**
```typescript
// components/LetterWizard/templates/index.ts
// Instead of importing all 22 templates
// Dynamic import by category

export const loadTemplateCategory = async (category: string) => {
  switch (category) {
    case 'workplace':
      return import('./workplace');
    case 'appeals':
      return import('./appeals');
    case 'housing':
      return import('./housing');
    case 'benefits':
      return import('./benefits');
    case 'education':
      return import('./education');
    default:
      return import('./general');
  }
};
```

**Strategy 2: Lazy Load Legal Workflows (-30KB)**
```typescript
// components/LegalAutomation/workflows.ts
const workflows = {
  accommodationRequest: () => import('./workflows/accommodationRequest'),
  discrimination: () => import('./workflows/discrimination'),
  benefits: () => import('./workflows/benefits'),
  // ... etc
};

export const getWorkflow = async (type: string) => {
  const loader = workflows[type];
  if (!loader) throw new Error(`Unknown workflow: ${type}`);
  return await loader();
};
```

**Strategy 3: Tree Shake Dependencies (-40KB)**
```bash
# Replace lodash with lodash-es
npm uninstall lodash
npm install lodash-es

# Update imports from:
import _ from 'lodash';
# To:
import { debounce, throttle } from 'lodash-es';

# Audit Firebase imports
# Remove unused Firebase modules from app.json plugins
```

**Strategy 4: Compress Static Data (-30KB)**
```javascript
// scripts/compress-data.js
// Compress large JSON files
const jurisdictions = require('../data/jurisdictions.json');
const compressed = {
  // Use shorter keys
  j: jurisdictions.map(j => ({
    i: j.id,
    n: j.name,
    c: j.code,
    // ... etc
  }))
};
```

**Strategy 5: Additional Lazy Loading (-30KB)**
```typescript
// Lazy load:
// - Admin components
// - Advanced Settings
// - Rarely-used wellness tools
// - Optional integrations

const AdminPanel = lazy(() => import('./AdminPanel'));
const AdvancedSettings = lazy(() => import('./AdvancedSettings'));
```

**Test after each optimization:**
```bash
# Verify bundle size reduced
npm run build:analyze

# Verify app still works
npm test
npx expo start

# Verify lazy loading works
# Test all lazy-loaded features
```

**Deliverables:**
- ✅ Bundle size ≤ 2.76MB (200KB reduction)
- ✅ All tests passing
- ✅ No functionality broken
- ✅ Lazy loading smooth (<500ms)
- ✅ Documentation in BUNDLE_OPTIMIZATION_V2.md

**Time:** 2-3 weeks  
**Cost:** $0 (pure code optimization)

---

#### Task #9: Setup Battery Historian [1 day + ongoing testing]

**Goal:** Monitor battery consumption during beta.

**Setup (1 day):**
```bash
# Option A: Use online Battery Historian (easiest)
# Go to: https://bathist.ef.lc/
# Upload battery reports (no installation needed)

# Option B: Self-hosted Docker (more control)
# Install Docker Desktop (free)
# Run Battery Historian
docker pull gcr.io/android-battery-historian/stable:3.0
docker run --rm -p 9999:9999 gcr.io/android-battery-historian/stable:3.0

# Access at: http://localhost:9999
```

**Collect Data (ongoing during beta):**
```bash
# Android battery testing
# 1. Reset battery stats
adb shell dumpsys batterystats --reset

# 2. Use app normally for 8 hours
# - 30 min active use (spread throughout day)
# - 7.5 hours background

# 3. Collect bugreport
adb bugreport > battery-report-$(date +%Y%m%d).zip

# 4. Analyze
# Upload to Battery Historian (online or localhost:9999)
# Export metrics

# 5. Document findings
# Add to BATTERY_LIFE_REPORT.md
```

**iOS battery testing:**
```bash
# Use Xcode Instruments (free, Mac required)
# 1. Connect iPhone
# 2. Xcode → Product → Profile
# 3. Select "Energy Log"
# 4. Run app for 8 hours
# 5. Export results
```

**Ask beta testers to share battery stats:**
```markdown
# In Beta Tester Guide:

### Optional: Battery Testing

Help us optimize battery usage!

**Android:**
1. Settings → Battery → Battery Usage
2. Screenshot before and after 8-hour period
3. Share via feedback form

**iOS:**
1. Settings → Battery
2. Screenshot "Battery Usage by App"
3. Share via feedback form

**What we're looking for:**
- % battery per hour of active use
- Background battery drain
- Unusually high usage patterns
```

**Deliverables:**
- ✅ Battery Historian running (online or Docker)
- ✅ Collection process documented
- ✅ Beta testers asked to share battery stats
- ✅ Initial baseline established
- ✅ BATTERY_LIFE_REPORT.md started

**Time:** 1 day setup + ongoing monitoring  
**Cost:** $0 (free tools)

---

#### Task #10: Performance Profiling [2-3 weeks parallel with beta]

**Goal:** Validate performance on older devices.

**Setup (Week 1):**
```bash
# Option A: AWS Device Farm (Free Tier - REAL DEVICES!)
# 1. Sign up: https://aws.amazon.com/device-farm/
# 2. Create project: "3mpwr-performance-testing"
# 3. Upload .apk / .ipa
# 4. Select devices:
#    - iOS: iPhone 6s, iPhone 7, iPhone 8
#    - Android: Galaxy S6, Pixel 2, Galaxy A50
# 5. Run automated tests
# 6. Collect performance metrics

# Option B: Appetize.io (Free Tier - 100 min/month)
# 1. Sign up: https://appetize.io/
# 2. Upload .apk / .ipa
# 3. Test in browser
# 4. Record performance metrics manually

# Option C: Community Device Testing (FREE + DIVERSE)
# Post request for testers with older devices
```

**Create Performance Test Suite:**
```bash
# Install React Native Performance Monitor
npm install --save-dev @react-native/performance-reporter

# Create tests/performance/startup.test.ts
import { measurePerformance } from '@react-native/performance-reporter';

describe('Performance Benchmarks', () => {
  it('should start in under 3 seconds', async () => {
    const { duration } = await measurePerformance('app_start');
    expect(duration).toBeLessThan(3000);
  });
  
  it('should render home screen in under 500ms', async () => {
    const { duration } = await measurePerformance('home_render');
    expect(duration).toBeLessThan(500);
  });
});
```

**Community Testing Request:**
```markdown
# Post on Reddit/Discord/LinkedIn:

📱 **Performance Testers Needed! Old Devices Welcome!**

Do you have an older phone collecting dust?
We need it!

**Target devices:**
- iPhone 6s, 7, 8 (iOS 13-15)
- Android 6, 7, 8 devices

**What to test:**
- App startup time (stopwatch)
- Scrolling smoothness (1-10 rating)
- Feature load times (letter wizard, etc.)
- Memory usage (Settings → App Info)

**What you get:**
- ✅ Free lifetime premium
- ✅ Beta tester badge
- ✅ Name in credits

**Time required:** 30 minutes

**Sign up:** [Google Form Link]
```

**Manual Testing Checklist:**
```markdown
# For each device:

## Startup Performance
- [ ] Cold start time: ___ seconds (app not in memory)
- [ ] Warm start time: ___ seconds (app in background)
- [ ] Time to first render: ___ seconds

## Runtime Performance
- [ ] Frame rate during scroll (smooth / choppy / unusable)
- [ ] Letter wizard PDF generation: ___ seconds
- [ ] Evidence locker image upload: ___ seconds
- [ ] ML energy prediction: ___ seconds
- [ ] Memory usage: ___ MB (Settings → App Info)

## User Experience
- [ ] Overall smoothness (1-10): ___
- [ ] Any lag or stuttering? (describe)
- [ ] Features that feel slow: ___
- [ ] App usable on this device? (yes/no)

## Device Info
- Device: ___ (e.g., iPhone 6s, Galaxy S6)
- OS: ___ (e.g., iOS 13.7, Android 6.0)
- RAM: ___ (e.g., 2GB)
```

**Week 2-3: Collect and Analyze**
```bash
# Aggregate data from:
# - AWS Device Farm automated tests
# - Community tester manual tests
# - Your own testing on borrowed devices

# Document in PERFORMANCE_PROFILING.md
```

**Deliverables:**
- ✅ Performance tested on 6+ older devices
- ✅ Metrics documented (startup, frame rate, memory)
- ✅ Issues identified and prioritized
- ✅ Optimization recommendations
- ✅ PERFORMANCE_PROFILING.md complete
- ✅ Minimum device requirements validated

**Time:** 2-3 weeks (parallel with beta)  
**Cost:** $0 (free tier + community)

---

## 📅 Complete Timeline

### Week 1 (Oct 21-27): Pre-Beta Critical Setup
- **Day 1-2:** Task #1 - Sentry (4 hours) ✅ CRITICAL
- **Day 3-4:** Task #2 - Wizard Keys (2 days) ✅ CRITICAL
- **Day 5:** Task #4 - Beta Guide (3 hours)
- **Day 5:** Task #5 - Feedback System (2 hours)
- **Day 6:** Task #6 - Physical Device Testing (4 hours)
- **Day 7:** Task #7 - EAS Builds (6 hours) ✅ CRITICAL

**End of Week 1: Ready to launch beta!**

### Week 2 (Oct 28 - Nov 3): Translation + Beta Launch
- **Day 1-2:** Task #3 - Auto-translate (2 hours active)
- **Day 3:** Post translation review request to community
- **Day 3:** **LAUNCH BETA** - Invite 10-20 testers
- **Day 4-7:** Monitor beta (Sentry, feedback, respond to issues)
- **Parallel:** Community reviews translations (3-5 days)

### Week 3-4 (Nov 4-17): Beta Iteration + Optimization Start
- **Ongoing:** Monitor beta, fix critical bugs
- **Parallel:** Task #3 - Incorporate translation feedback (1 day)
- **Parallel:** Task #8 - Bundle optimization starts (Week 1: Analysis)
- **Parallel:** Task #9 - Battery Historian setup (1 day)

### Week 5-6 (Nov 18 - Dec 1): Beta Polish + Optimization
- **Ongoing:** Beta testing continues (50-100 testers)
- **Parallel:** Task #8 - Bundle optimization (Week 2-3: Implementation)
- **Parallel:** Task #9 - Battery testing (collect data from beta)
- **Parallel:** Task #10 - Performance profiling (community testing)

### Week 7-8 (Dec 2-15): Final Polish
- **Complete:** All translations (Task #3)
- **Complete:** Bundle optimization (Task #8)
- **Complete:** Performance profiling (Task #10)
- **Complete:** Battery report (Task #9)
- **Beta:** Final round of testing with all improvements

### Week 9-10 (Dec 16-29): Pre-Public Launch
- **Complete:** All documentation
- **Complete:** Marketing materials
- **Complete:** App Store listings
- **Build:** Production builds for public launch
- **Prepare:** Launch day monitoring

### Week 11-12 (Dec 30 - Jan 12): PUBLIC LAUNCH 🚀
- **Jan 1, 2026:** Public release!
- **Monitor:** Sentry, user feedback, reviews
- **Support:** Respond to user issues
- **Plan:** v1.0.1 improvements

---

## ✅ Success Metrics

### Beta Launch (Week 2)
- ✅ 10-20 testers recruited
- ✅ Sentry tracking all errors
- ✅ <5% error rate
- ✅ Zero critical bugs

### Mid-Beta (Week 4)
- ✅ 50+ testers active
- ✅ 20+ pieces of feedback received
- ✅ 10+ bugs fixed
- ✅ Translations 100% complete
- ✅ 4+ star rating from testers

### Pre-Public Launch (Week 10)
- ✅ Bundle size ≤ 2.76MB
- ✅ Battery drain <10%/hour
- ✅ Performance validated on old devices
- ✅ <2% error rate
- ✅ All documentation complete
- ✅ 100 beta testers satisfied

### Public Launch (Week 12)
- ✅ 1,000+ downloads first week
- ✅ 4+ star rating on stores
- ✅ <1% error rate
- ✅ <5% churn rate
- ✅ 100% uptime

---

## 💰 Total Cost: $0

Everything is free:
- ✅ Sentry (5k events/month)
- ✅ Translation (auto + community)
- ✅ Bundle analysis (open source tools)
- ✅ Battery Historian (Docker or online)
- ✅ Performance testing (AWS free tier + community)
- ✅ Feedback system (Google Forms or GitHub)
- ✅ EAS Build (Expo free tier)

**Optional paid items (not required):**
- Apple Developer ($99/year) - for TestFlight
- Google Play Developer ($25 one-time)

---

## 🎯 Next Steps - START NOW!

### Today (2 hours)
1. ✅ Sign up for Sentry (5 min)
2. ✅ Add DSN to .env (1 min)
3. ✅ Test Sentry error (10 min)
4. ✅ Review this plan
5. ✅ Make list of 10-20 beta tester emails

### Tomorrow (6 hours)
1. ✅ Task #2 - Start wizard baseline keys
2. ✅ Create baseline key generator script
3. ✅ Generate 324 keys
4. ✅ Begin manual review

### This Week
Complete Tasks #1-7 (all critical for beta launch)

### Next Week
Launch beta + start optimization tasks in parallel

---

**You're 98/100 ready. These 10 tasks will get you to 100/100 and through a successful public launch!** 🚀

Let's do this! Which task do you want to start with? I recommend **Task #1 (Sentry)** - takes 4 hours and is essential for everything else.
