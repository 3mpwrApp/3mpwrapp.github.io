# Workspace Organization Plan
**Created:** March 25, 2026
**Purpose:** Clean up both empowrapp-site and empowrapp-new repositories + establish ongoing file organization standards

---

## 🎯 Goals

1. **Move 200+ root-level markdown files** into logical folder structures
2. **Maintain accessibility** - all docs remain easy to find
3. **Future-proof** - clear guidelines for where new files go
4. **No breaks** - preserve all git history, links stay functional

---

## 📁 empowrapp-site Repository Organization

### New Folder Structure

```
empowrapp-site/
├── docs/
│   ├── accessibility/          # All WCAG, AAA, a11y audits & implementations
│   ├── agents/                 # Agent automation, deployment, orchestration
│   ├── blog-automation/        # Blog generation, curation system docs
│   ├── campaigns/              # Campaign system architecture & guides
│   ├── deployment/             # Deployment guides, checklists, summaries
│   ├── events/                 # Events system, calendar integration, TBDIWSG
│   ├── performance/            # Lighthouse, optimization, stress tests
│   ├── security/               # Security audits, implementation reports
│   ├── social-media/           # Social posting, credentials, viral hooks
│   ├── testing/                # Testing guides, results, CI/CD
│   ├── translation/            # i18n, localization guides
│   └── ux-ui/                  # UX improvements, design system, themes
│
├── scripts/                    # (already exists - automation scripts)
├── .github/workflows/          # (already exists - GitHub Actions)
├── api/                        # (already exists - JSON data APIs)
├── _posts/                     # (already exists - blog posts)
├── assets/                     # (already exists - images, CSS, JS)
│
├── README.md                   # Keep at root
├── index.md                    # Keep at root (homepage)
├── _config.yml                 # Keep at root (Jekyll config)
└── package.json                # Keep at root
```

### File Categorization (empowrapp-site)

#### docs/accessibility (60+ files)
- `AAA-*.md` - All AAA compliance docs
- `WCAG-*.md` - All WCAG docs
- `ACCESSIBILITY-*.md` - All accessibility implementation docs
- `*-a11y-*.md`, `*accessibility*.md` - Related files
- `pa11y-*.json`, `axe-*.json` - Test reports
- `COGNITIVE-LOAD-OPTIMIZATION.md`
- `COMPREHENSIVE-INCLUSIVITY-AUDIT.md`
- `TEXT-LEGIBILITY-*.md`
- `VESTIBULAR-*.md` (if exists in this repo)
- Audit HTML files: `accessibility-audit-*.html`

#### docs/agents/ (15+ files)
- `AGENT-*.md` - All agent-related docs
- `AGENTS-*.md`
- `AUTONOMOUS-AGENTS-*.md`
- `agent-docs.js`

#### docs/blog-automation/ (8+ files)
- `BLOG-*.md` - Blog automation docs
- `CURATION-*.md` - Content curation
- `CURATOR-*.md`

#### docs/campaigns/ (10+ files)
- `CAMPAIGN-*.md` - Campaign system docs
- `CAMPAIGNS-*.md`

#### docs/deployment/ (20+ files)
- `DEPLOY-*.md`, `DEPLOYMENT-*.md`
- `00-START-HERE-DEPLOYMENT.md`
- `EXECUTION-*.md`
- `BUILD-*.md` (deployment-related)
- `DELIVERY-*.md`
- `deploy.js`, `deploy.log`

#### docs/events/ (15+ files)
- `EVENTS-*.md` - Events system docs
- `CALENDAR-*.md`
- `TBDIWSG_*.md` - Thunder Bay events (NEW!)
- `BETA_TESTERS_March31_*.md` - Event-related beta emails

#### docs/performance/ (15+ files)
- `PERFORMANCE-*.md`
- `OPTIMIZATION-*.md`
- `lighthouse-*.json`, `lighthouse-*.html`
- `STRESS-TEST-*.md`, `STRESS-TEST*.ps1`
- `CLS-FIX-*.md`
- `FINAL-LIGHTHOUSE-*.md`

#### docs/security/ (8+ files)
- `SECURITY-*.md`
- `CAPTCHA-*.md`
- `HSTS-*.md`
- `TURNSTILE-*.md`

#### docs/social-media/ (15+ files)
- `SOCIAL-MEDIA-*.md`
- `SOCIAL_INTELLIGENCE_*.md`
- `SOCIAL_MEDIA_POSTING_*.md`
- `VIRAL-HOOKS-*.md`
- `HASHTAG-*.md`
- `analytics-hashtag.md`
- `test-*-api.js`, `test-social-*.js` → move to `scripts/testing/`
- `MANUAL-SOCIAL-TEST.md`

#### docs/testing/ (20+ files)
- `TESTING-*.md`
- `test-*.js` → move to `scripts/testing/`
- `*-test.js` (e.g., `accessibility-test.js`, `color-contrast-analysis.js`)
- `CI-*.md`
- `AAA-TESTING-*.md`
- `COMPREHENSIVE-*.md` (testing-related)
- Test results: `test-results/` folder already exists?

#### docs/translation/ (5+ files)
- `TRANSLATION-*.md`
- `FRENCH-*.md`

#### docs/ux-ui/ (15+ files)
- `UX-*.md`, `UI-*.md`
- `THEME-*.md`
- `COMPREHENSIVE-THEME-*.md`
- `VISUAL-REFRESH-*.md`
- `BRANDING-*.md`
- `QUICK-REFERENCE-STYLING.md`

#### Keep at Root (empowrapp-site)
- `README.md` - Main project readme
- `index.md` - Homepage
- `_config.yml` - Jekyll configuration
- `package.json`, `package-lock.json`
- `Gemfile`, `Gemfile.lock` - Ruby dependencies
- `.gitignore`, `.editorconfig`
- `robots.txt`, `manifest.json`, `sw.js`
- `404.html`, `404.md`
- `tailwind.config.js`, `playwright.config.js`
- All config files (`.pa11yci.json`, `.lighthouserc.json`, etc.)
- `HEARTBEAT.md` - Active monitoring doc
- `SOUL.md`, `USER.md`, `MEMORY.md`, `TOOLS.md` - Core identity docs
- `ACTIVATION.md`, `HOW_TO_ACTIVATE.md`

---

## 📁 empowrapp-new Repository Organization

### New Folder Structure

```
empowrapp-new/
├── docs/
│   ├── accessibility/          # WCAG audits, a11y implementation
│   ├── deployment/             # Build guides, EAS, web deployment
│   ├── features/               # Feature implementation summaries
│   ├── firebase/               # Firebase/Firestore setup & fixes
│   ├── oauth/                  # Google OAuth, API rotation guides
│   ├── performance/            # Bundle optimization, metrics
│   ├── security/               # Security fortress, breach protection
│   └── testing/                # Jest, E2E testing guides
│
├── app/                        # (already exists - Expo Router screens)
├── components/                 # (already exists)
├── scripts/                    # (already exists - automation)
├── firebase/                   # (already exists - firestore rules)
├── .github/workflows/          # (already exists)
│
├── README.md                   # Keep at root
├── package.json                # Keep at root
├── app.json, app.config.js     # Keep at root (Expo config)
└── eas.json                    # Keep at root (EAS configuration)
```

### File Categorization (empowrapp-new)

#### docs/accessibility (10+ files)
- `ACCESSIBILITY-*.md`
- `WCAG-*.md`
- `wcag-*.txt` - Audit logs
- `LOADING_STATES_*.md`
- `VESTIBULAR_*.md`
- `pressable-fixes.log`, `wcag-corrected.txt`

#### docs/deployment/ (20+ files)
- `DEPLOY-*.md`, `DEPLOYMENT-*.md`
- `*_DEPLOYMENT_*.md`
- `BUILD-*.md`
- `*_DISTRIBUTION_*.md`
- `BETA_*.md` - Beta deployment guides
- `WEB_DEPLOYMENT_*.md`
- `AUTO_WEB_DEPLOYMENT_*.md`
- `EAS_*.md`
- `ANDROID_APP_*.md`, `IOS_APP_*.md` - Store setup
- `build-*.txt`, `*.log` files

#### docs/features/ (20+ files)
- `ALL_8_FEATURES_*.md`
- Feature-specific implementation docs:
  - `AI_*.md` - AI integration
  - `DOCUMENT_FACTORY_*.md`
  - `EVIDENCE_LOCKER_*.md`
  - `JOINT_SUBMISSION_*.md`
  - `PEER_MENTOR_*.md`
  - `PERSONALIZATION_*.md`
  - `WIN_DETECTION_*.md`, `WIN_SHARING_*.md`
  - `WEEK_1_*.md`, `WEEK_2_*.md` - Sprint summaries
- `30_MINUTE_QUICK_WINS.md`
- `BYOC_*.md` - Bring Your Own Credentials

#### docs/firebase/ (8+ files)
- `FIREBASE_*.md`
- `FIRESTORE_*.md` (if any)
- `FIX_FIREBASE_*.md`
- `QUICK_REFERENCE_FIREBASE.txt`
- `list-firestore-data.mjs` → move to `scripts/firebase/`

#### docs/oauth/ (15+ files)
- `GOOGLE_OAUTH_*.md`
- `OAUTH_*.md`
- `GDRIVE_*.md` - Google Drive OAuth fixes
- `API_KEY_ROTATION*.md`
- `FIX_GOOGLE_*.md`
- `FIX_REDIRECT_*.md`
- `README_GOOGLE_OAUTH_FIX.md`

#### docs/performance/ (10+ files)
- `PERFORMANCE_*.md`
- `BUNDLE_*.md`
- `SESSION_SUMMARY_BUNDLE_*.md`
- `audit-results.json`

#### docs/security/ (10+ files)
- `SECURITY_*.md`
- `INSTANT_*.md` - Breach protection
- `DEPLOY_SECURITY_*.md`
- `GITLEAKS_*.md` (if exists)

#### docs/testing/ (5+ files)
- `jest-*.txt`
- `expo-doctor-*.txt`
- Testing guide markdown files

#### Keep at Root (empowrapp-new)
- `README.md` - Main project readme
- `START_HERE.txt`
- `package.json`, `package-lock.json`
- `app.json`, `app.config.js` - Expo configuration
- `eas.json` - EAS build configuration
- `firebase.json`, `.firebaserc` - Firebase config
- `tsconfig.json`, `jest.config.js`, `babel.config.js`, `metro.config.js`
- `.eslintrc.js`, `eslint.config.js`
- `.gitignore`, `.editorconfig`, `.npmrc`, `.nvmrc`
- `wrangler.toml` - Cloudflare Workers config
- All credentials files: `credentials.json`, `GoogleService-Info.plist`, `*.jks`
- `HEARTBEAT.md`, `SOUL.md`, `USER.md`, `MEMORY.md`, `TOOLS.md`, `LEARNINGS.md`

---

## 🔮 Future File Organization Guidelines

### **RULE: Before creating ANY new document, follow this checklist:**

#### 1. **Determine the Category**
Ask yourself: "What is this document primarily about?"

| Category | Goes in... |
|----------|-----------|
| Accessibility (WCAG, AAA, a11y) | `docs/accessibility` |
| Agent automation, AI agents | `docs/agents/` (site) or `docs/features/` (app) |
| Deployment, builds, distribution | `docs/deployment/` |
| Events, calendar, TBDIWSG | `docs/events/` (site only) |
| Features, implementations | `docs/features/` (app) |
| Firebase, Firestore setup | `docs/firebase/` (app) |
| OAuth, Google Drive API | `docs/oauth/` (app) |
| Performance, optimization, bundle | `docs/performance/` |
| Security, audits, breach protection | `docs/security/` |
| Social media, posting, viral hooks | `docs/social-media/` (site only) |
| Testing, CI/CD, test results | `docs/testing/` |
| Translation, localization | `docs/translation/` (site only) |
| UX/UI, themes, design system | `docs/ux-ui/` (site only) |
| Automation scripts | `scripts/[category]/` |
| Blog posts | `_posts/` (site only) |

#### 2. **Naming Convention**
```
[CATEGORY]-[SPECIFIC-TOPIC]-[TYPE].md

Examples:
✅ docs/accessibilityWCAG-AAA-AUDIT-FEB2026.md
✅ docs/deployment/BETA-DISTRIBUTION-GUIDE.md
✅ docs/events/TBDIWSG-APRIL-2026-SUMMARY.md
✅ docs/oauth/GOOGLE-DRIVE-FIX-MARCH-2026.md

❌ WCAG_AAA_AUDIT.md (at root)
❌ beta_guide.md (unclear category)
```

#### 3. **File Type Guidelines**

| File Type | Location | Examples |
|-----------|----------|----------|
| **Markdown docs** | `docs/[category]/` | Guides, summaries, reports |
| **Scripts (JS/MJS)** | `scripts/[category]/` | Automation, testing, deployment |
| **Config files** | Root of repo | `*.json`, `*.config.js`, `.rc` files |
| **Test files** | `__tests__/` or `e2e/` | Unit tests, E2E tests |
| **Test reports** | `docs/testing/reports/` | JSON, HTML, TXT results |
| **Data files** | `data/` (app) or `public/` (site) | JSON data, mock data |
| **Assets** | `assets/` | Images, fonts, media |

#### 4. **Cross-Referencing**
When a document references another, use **relative paths**:

```markdown
✅ See [OAuth Setup Guide](../oauth/GOOGLE-OAUTH-QUICKSTART.md)
✅ Related: [Performance Guide](./PERFORMANCE-OPTIMIZATION-COMPLETE.md)

❌ See GOOGLE-OAUTH-QUICKSTART.md (no path)
❌ See d:\1-EmpowrApp\... (absolute path breaks)
```

#### 5. **Auto-Organization Checklist**

**Before committing any new file:**

```bash
# Step 1: Identify category
What is this file about? → [category]

# Step 2: Check if folder exists
ls docs/[category]/

# Step 3: If folder doesn't exist, create it
mkdir docs/[category]/

# Step 4: Move file to correct location
mv [FILE].md docs/[category]/

# Step 5: Update any links in other files
grep -r "[FILE].md" .

# Step 6: Commit with clear message
git add docs/[category]/[FILE].md
git commit -m "docs([category]): Add [FILE]"
```

#### 6. **When to Keep Files at Root**

**ONLY these file types stay at root:**
- ✅ `README.md` - Primary project documentation
- ✅ Config files (`*.json`, `*.config.js`, `.rc`, `*.toml`)
- ✅ Dependency files (`package.json`, `Gemfile`)
- ✅ Environment templates (`.env.example`)
- ✅ Git config (`.gitignore`, `.gitattributes`)
- ✅ Core identity docs (`SOUL.md`, `USER.md`, `MEMORY.md`, `HEARTBEAT.md`)
- ✅ Quick start guides (`START_HERE.txt`)

**Everything else goes in folders!**

---

## 📋 Migration Execution Plan

### Phase 1: empowrapp-site (Website)
1. Create all `docs/[category]/` folders
2. Move files batch by batch (10-20 at a time)
3. Verify no broken builds after each batch
4. Commit incrementally

### Phase 2: empowrapp-new (App)
1. Create all `docs/[category]/` folders
2. Move files batch by batch
3. Run `npm run lint` after each batch
4. Commit incrementally

### Phase 3: Update References
1. Search for absolute paths in markdown files
2. Convert to relative paths
3. Test all internal links

### Phase 4: Final Verification
1. Jekyll build (empowrapp-site)
2. Expo build (empowrapp-new)
3. Link checker
4. Git push both repos

---

## 🎓 Training Guide for Future File Creation

### Quick Decision Tree

```
New file created
    ↓
Is it a config file? → YES → Keep at root
    ↓ NO
Is it a script? → YES → scripts/[category]/
    ↓ NO
Is it markdown documentation? → YES → docs/[category]/
    ↓
Determine category from the table above
    ↓
Create file in correct folder
    ↓
Commit with clear message: "docs([category]): Add [topic]"
```

### Examples of Good File Placement

```bash
# Accessibility audit report
✅ docs/accessibilityWCAG-AAA-AUDIT-APR2026.md

# Deployment checklist
✅ docs/deployment/PRODUCTION-DEPLOY-CHECKLIST.md

# Social media posting script
✅ scripts/social-media/post-instagram-story.js

# Thunder Bay event announcement
✅ docs/events/TBDIWSG-MAY-2026-SPEAKER.md

# OAuth troubleshooting guide
✅ docs/oauth/GOOGLE-DRIVE-TIMEOUT-FIX.md

# Performance optimization summary
✅ docs/performance/BUNDLE-SIZE-REDUCTION-APR2026.md

# Feature implementation
✅ docs/features/COMMUNITY-CHAT-IMPLEMENTATION.md
```

---

## 🚫 Common Mistakes to Avoid

```diff
- Creating files at root without checking category
- Using underscores instead of hyphens in filenames
- Absolute paths in markdown links
- Duplicate files in multiple locations
- Unclear filenames (COMPLETE.md, FINAL.md, SUMMARY.md without context)
- Leaving old backup files (.bak, .old) in repo

+ Always use docs/[category]/ for documentation
+ Use hyphens for readability
+ Use relative paths for links
+ Single source of truth per topic
+ Descriptive filenames with dates
+ Clean up temporary files before committing
```

---

## ✅ Success Metrics

After this organization:
- ✅ **Zero** markdown files at root level (except README.md, SOUL.md, etc.)
- ✅ **All** docs categorized in `docs/[category]/`
- ✅ **All** scripts in `scripts/[category]/`
- ✅ **Clear** guidelines for future file creation
- ✅ **No broken** internal links
- ✅ **Easy to find** any document in <30 seconds

---

## 📞 Quick Reference Card

**Where does this go?**

| Document Type | Location |
|--------------|----------|
| WCAG audit | docs/accessibility |
| Deploy guide | docs/deployment/ |
| OAuth fix | docs/oauth/ (app) |
| Event details | docs/events/ (site) |
| Social post script | scripts/social-media/ |
| Performance report | docs/performance/ |
| Security audit | docs/security/ |
| Test results | docs/testing/reports/ |
| Feature implementation | docs/features/ (app) |
| Agent automation | docs/agents/ (site) |
| UX improvements | docs/ux-ui/ (site) |

**When in doubt:** Ask "What category is this?" → Check table above → Create in docs/[category]/

---

**Last Updated:** March 25, 2026
**Status:** Ready for execution
**Next Action:** Run migration scripts
