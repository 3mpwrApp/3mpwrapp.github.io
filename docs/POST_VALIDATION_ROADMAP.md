# Post-Validation Roadmap
**Created:** May 16, 2026  
**Status:** Manual validation in progress (61/592 complete as of May 16)  
**Purpose:** Complete task list for deploying v3.0 ML classification statistics after validation

---

## 🎯 TL;DR - What Happens Next

Once all 592 manual validation cases are reviewed:
1. **Calculate accuracy metrics** → determines if we proceed
2. **Update 70+ content files** with v3.0 statistics (if accuracy ≥70%)
3. **Create 6 tribunal landing pages** with validation results
4. **Deploy to production** (Jekyll build + Cloudflare)
5. **Set up automated monitoring** for ongoing classification

**Target:** Conservative, transparent deployment of 50,161 classified Ontario tribunal decisions

---

## 📊 Current State (May 16, 2026)

### Validation Progress
- **Manual Review:** 61/592 cases complete (10.3%)
- **Early Results:** Mostly accurate (✅), few errors (❌/⚠️)
- **Infrastructure:** All scripts and launchers deployed, backed up on GitHub
- **CSV Status:** validation-samples.csv has 531 cases remaining

### ML Classification Statistics (v3.0)
```
Total Cases: 50,161 (6 Ontario tribunals)
Classification Rate: 85.1% (42,686 classified, 7,475 unknown)

By Tribunal:
- ONWSIAT: 7,412 total, 6,823 classified (92.1%)
- ONSBT: 33,990 total, 28,783 classified (84.7%)
- ONWSIB: 2,088 total, 1,783 classified (85.4%)
- ONHRT: 4,478 total, 3,498 classified (78.1%)
- ONLRB: 1,905 total, 1,558 classified (81.8%)
- ONCA: 288 total, 241 classified (83.7%)

Confidence Bands:
- High (75-95%): 19,688 cases (46.1%)
- Medium (60-75%): 16,728 cases (39.2%)
- Low (50-60%): 6,270 cases (14.7%)

Classification Methods:
- pattern_match: 24,156 cases (2+ regex hits)
- similarity_match_same_db: 13,482 cases (Jaccard ≥50%)
- similarity_match_cross_db: 3,814 cases (Jaccard ≥42%)
- single_pattern: 1,234 cases (confidence 0.52)
```

---

## 📋 PHASE 7: Calculate Validation Metrics

### Task 7.1: Run Metrics Script
**Command:** `.\run-validation-metrics.ps1`

**What It Does:**
- Parses validation-samples.csv (all 592 rows must have actual_outcome + match filled)
- Calculates overall accuracy percentage
- Breaks down accuracy by:
  - Tribunal (ONWSIAT, ONSBT, ONWSIB, ONHRT, ONLRB, ONCA)
  - Confidence band (high, medium, low)
  - Classification method (pattern_match, similarity_match, etc.)
  - Outcome category (Allowed, Dismissed, Mixed, etc.)
- Generates confusion matrix (top misclassifications)
- Provides recommendations based on accuracy

**Outputs:**
1. `validation-results.json` - Machine-readable metrics
2. `docs/VALIDATION_REPORT_V3.0.md` - Human-readable report with tables
3. Console display with progress bars and color-coded results

**Time Estimate:** 2-3 minutes

---

## 🔀 PHASE 8: Decision Tree

### Scenario A: Accuracy ≥70% → PROCEED ✅

**Action:** Deploy v3.0 statistics with conservative messaging (Phases 9-15)

**Messaging Requirements:**
- Banner: "ML-classified using keyword patterns (not human-verified)"
- Disclaimer: "Classification confidence ranges 50-95%. Use as research guide, not verified outcomes."
- Validation transparency: Link to VALIDATION_REPORT_V3.0.md
- Methodology: Explain pattern matching, similarity scoring, confidence bands

**Timeline:** 3-5 days for full content deployment

---

### Scenario B: Accuracy 60-70% → ADJUST ⚠️

**Actions:**
1. Raise classification threshold from 0.50 to 0.60
2. Re-run classification script: `node scripts/classify-super-enhanced-v3.js`
3. Generate new statistics JSON (v3.1)
4. Add "Preliminary Classification" label to all content
5. Proceed with content updates using adjusted stats

**Messaging Changes:**
- Add "PRELIMINARY" badge to all statistics
- Increase disclaimer prominence
- Note: "Validated accuracy 60-70%, threshold raised to 60%"

**Timeline:** +2 days for re-classification, then 3-5 days for deployment

---

### Scenario C: Accuracy <60% → MAJOR REVISION ❌

**Actions:**
1. **STOP content updates immediately**
2. Analyze validation results for systematic errors:
   - Which patterns are failing?
   - Which tribunals are problematic?
   - Which outcome types are confused?
3. Revise classification methodology:
   - Raise threshold to 0.65+
   - Exclude or fix problematic patterns
   - Add human review for medium/low confidence
4. Re-classify all tribunals
5. Generate new validation samples (v3.1)
6. Repeat manual validation (smaller sample ~300 cases)

**Timeline:** 2-4 weeks for revision and re-validation

**DO NOT PROCEED** with content updates until accuracy ≥70%

---

## 📝 PHASE 9: Update Blog Posts (28 files)

**Condition:** Accuracy ≥70%

### Files to Update
```
_posts/2024-02-15-understanding-wsiat-decisions.md
_posts/2024-03-01-interpreting-tribunal-outcomes.md
_posts/2024-03-05-wsib-appeal-statistics.md
_posts/2024-03-10-pattern-recognition-tribunal-decisions.md
_posts/2024-03-15-employer-appeals-success-rates.md
_posts/2024-03-20-medical-evidence-appeal-success.md
_posts/2024-03-25-legal-representation-impact.md
_posts/2024-03-28-reconsideration-vs-appeal.md
_posts/2024-04-01-preliminary-objections-success.md
_posts/2024-04-05-jurisdiction-challenges.md
_posts/2024-04-10-procedural-fairness-tribunals.md
_posts/2024-04-15-delay-impacts-appeals.md
_posts/2024-04-20-chronic-pain-wsib-claims.md
_posts/2024-04-22-mental-health-workplace-injury.md
_posts/2024-04-25-psych-injury-claims-ontario.md
_posts/2024-04-28-permanent-impairment-ratings.md
_posts/2024-05-01-loss-earnings-calculations.md
_posts/2024-05-03-future-economic-loss-awards.md
_posts/2024-05-05-return-work-disputes.md
_posts/2024-05-08-suitable-occupation-analysis.md
_posts/2024-05-10-medical-expert-testimony.md
_posts/2024-05-12-independent-medical-exams.md
_posts/2024-05-14-functional-abilities-evaluations.md
_posts/2024-11-15-understanding-the-legal-system-for-workers.md
_posts/2024-11-20-steps-to-filing-a-wsib-claim.md
_posts/2024-11-25-navigating-tribunal-hearings-as-a-worker.md
_posts/2025-01-15-ai-legal-research-workers.md
_posts/2026-05-14-ontario-legal-intelligence-system-launch.md
```

### Update Template (Each File)

**Step 1:** Update frontmatter
```yaml
last_updated: 2026-05-16
```

**Step 2:** Add validation banner (after frontmatter)
```markdown
> **ML Classification Notice:** Statistics on this page are generated using machine learning 
> keyword pattern matching (not human-verified). Validated accuracy: [INSERT_ACCURACY]%. 
> [Read validation methodology →](/docs/VALIDATION_REPORT_V3.0.md)
```

**Step 3:** Update statistics with v3.0 data
- Replace old WSIAT/tribunal stats with new numbers from `ontario-classification-stats-v3.json`
- Include tribunal-specific breakdowns where relevant
- Add confidence band context: "X% classified with 75-95% confidence"

**Step 4:** Update methodology sections
```markdown
### About These Statistics

These outcomes are **ML-classified using 120+ keyword patterns** across 10 outcome categories. 
Classification confidence ranges from 50-95%. Manual validation of 592 random cases shows 
[INSERT_ACCURACY]% accuracy.

**Use as a research guide, not verified case outcomes.**
```

**Step 5:** Add footnotes
```markdown
---
*Statistics generated: April 2026 | Classification v3.0 | 50,161 Ontario tribunal decisions*  
*Confidence threshold: 50% | Methods: Pattern matching, similarity scoring*
```

**Time Estimate:** 4-6 hours (10-15 min per file)

---

## 📖 PHASE 10: Update Guides (12 files)

**Condition:** Accuracy ≥70%

### Files to Update
```
_guides/wsiat-appeals-process.md
_guides/wsib-claim-filing.md
_guides/understanding-nel-benefits.md
_guides/loss-earnings-claims.md
_guides/medical-evidence-guide.md
_guides/legal-representation-options.md
_guides/reconsideration-requests.md
_guides/judicial-review-process.md
_guides/timeline-expectations.md
_guides/hearing-preparation.md
_guides/evidence-submission.md
_guides/decision-interpretation.md
```

### Update Template (Each File)

Same as blog posts, but focus on:
- Tribunal-specific success rates in process explanations
- Context for statistical ranges (e.g., "Reconsiderations granted in 15-20% of cases")
- Confidence disclaimers near all statistics
- Links to relevant blog posts with deeper analysis

**Time Estimate:** 3-4 hours (15-20 min per file)

---

## 📚 PHASE 11: Update Knowledge Base (18 files)

**Condition:** Accuracy ≥70%

### Directories
- `_knowledge_base/*.md` (8 files)
- `knowledge-base/*.md` (10 files)

### Files to Update
```
_knowledge_base/wsiat-basics.md
_knowledge_base/wsib-basics.md
_knowledge_base/appeal-grounds.md
_knowledge_base/evidence-types.md
_knowledge_base/legal-terms.md
_knowledge_base/medical-terminology.md
_knowledge_base/outcome-types.md
_knowledge_base/tribunal-comparison.md

knowledge-base/index.md
knowledge-base/wsiat.md
knowledge-base/onsbt.md
knowledge-base/onwsib.md
knowledge-base/onhrt.md
knowledge-base/onlrb.md
knowledge-base/onca.md
knowledge-base/appeal-process.md
knowledge-base/evidence-guide.md
knowledge-base/glossary.md
```

### Update Focus
- Update factsheets with v3.0 tribunal-specific stats
- Add "Classification Methodology" section to each tribunal page
- Update glossary definitions where statistics are referenced
- Cross-link to validation report

**Time Estimate:** 3-4 hours (10-15 min per file)

---

## 📊 PHASE 12: Update Visualizations (7 files)

**Condition:** Accuracy ≥70%

### Files to Update
```
connecting-the-dots-wsiat-keyword-network.html
connecting-the-dots-canlii-keyword-visualization-network.html
cross-tribunal-success-rates.html
tribunal-decision-explorer.html
advocacy-tools/tribunal-outcome-analyzer.html
resources/decision-search.html
resources/statistics-dashboard.html
```

### Update Process

**Step 1:** Update data arrays from `ontario-classification-stats-v3.json`
```javascript
// Before
const wsiatAllowed = 1234;

// After
const wsiatAllowed = 2847; // v3.0: 2,847 allowed out of 6,823 classified
```

**Step 2:** Add validation metadata
```javascript
const validationAccuracy = [INSERT_ACCURACY]; // %
const validationDate = "2026-05-16";
const validationSampleSize = 592;
```

**Step 3:** Update chart titles/labels
```javascript
title: "WSIAT Outcomes (ML-Classified, [INSERT_ACCURACY]% Validated)"
subtitle: "Based on 6,823 classified decisions (2020-2026)"
```

**Step 4:** Add disclaimer text to each visualization
```html
<div class="disclaimer">
  <strong>ML Classification Notice:</strong> These statistics are generated using 
  keyword pattern matching. Manual validation accuracy: [INSERT_ACCURACY]%. 
  <a href="/docs/VALIDATION_REPORT_V3.0.md">Read methodology →</a>
</div>
```

**Step 5:** Update chart tooltips
```javascript
tooltip: {
  formatter: function() {
    return `<b>${this.point.name}</b><br/>` +
           `Count: ${this.y}<br/>` +
           `<em>ML-classified (validated [INSERT_ACCURACY]%)</em>`;
  }
}
```

**Time Estimate:** 2-3 hours (20-30 min per file)

---

## 📄 PHASE 13: Update Templates (1 file)

**Condition:** Accuracy ≥70%

### File to Update
```
_templates/onca-factum-template.md
```

### Update
- Add section on "Using Tribunal Statistics in Appeals"
- Reference v3.0 classification data as research context
- Include disclaimer about ML classification
- Link to tribunal-specific knowledge base pages

**Time Estimate:** 30 minutes

---

## 🏛️ PHASE 14: Create Tribunal Landing Pages (6 files)

**Condition:** Accuracy ≥70%

### Files to Create
```
tribunals/onwsiat.md
tribunals/onsbt.md
tribunals/onwsib.md
tribunals/onhrt.md
tribunals/onlrb.md
tribunals/onca.md
```

### Page Template

```markdown
---
layout: page
title: "Ontario [Tribunal Full Name]"
permalink: /tribunals/[tribunal-code]/
description: "Comprehensive guide to [Tribunal] appeals, outcomes, and resources"
last_updated: 2026-05-16
---

# Ontario [Tribunal Full Name] ([TRIBUNAL CODE])

## Overview
[2-3 paragraph introduction to tribunal's jurisdiction, role, and importance]

## Decision Statistics (2020-2026)

### Classification Summary
- **Total Decisions:** [X,XXX]
- **Classified:** [X,XXX] ([XX.X]%)
- **Unknown Outcome:** [X,XXX] ([XX.X]%)

**Validation:** Manual review of 100 random cases shows [INSERT_ACCURACY]% classification accuracy.

### Outcome Breakdown
| Outcome | Count | Percentage |
|---------|-------|------------|
| Allowed | [XXX] | [XX]% |
| Dismissed | [XXX] | [XX]% |
| Partial Win | [XXX] | [XX]% |
| Reconsideration | [XXX] | [XX]% |
| Procedural | [XXX] | [XX]% |
| Withdrawn | [XXX] | [XX]% |
| Other | [XXX] | [XX]% |

### Confidence Distribution
- **High Confidence (75-95%):** [X,XXX] cases ([XX]%)
- **Medium Confidence (60-75%):** [X,XXX] cases ([XX]%)
- **Low Confidence (50-60%):** [X,XXX] cases ([XX]%)

> **ML Classification Notice:** These statistics are ML-generated using keyword patterns. 
> Classification confidence ranges 50-95%. [Read validation methodology →](/docs/VALIDATION_REPORT_V3.0.md)

## Classification Methodology

### Pattern Matching
- **120+ regex patterns** across 10 outcome categories
- **2+ pattern hits** = high confidence classification
- **Single pattern hit** = confidence 0.52 (low)

### Similarity Scoring
- **Same-database matching:** Jaccard similarity ≥50%
- **Cross-database matching:** Jaccard similarity ≥42%
- Compares keywords between cases with known outcomes

### Quality Control
- Threshold: 50% minimum confidence
- Validation: 592-case stratified random sample
- Accuracy: [INSERT_ACCURACY]% on manual review
- Conservative messaging throughout

## Related Resources

### Guides
- [How to Appeal to [Tribunal]](/guides/[tribunal]-appeals-process/)
- [Understanding [Tribunal] Decisions](/guides/decision-interpretation/)
- [Hearing Preparation Guide](/guides/hearing-preparation/)

### Blog Posts
- [Understanding [Tribunal] Decision Patterns](/blog/...)
- [Success Factors in [Tribunal] Appeals](/blog/...)
- [Representing Yourself at [Tribunal]](/blog/...)

### Tools
- [Decision Search](/resources/decision-search/)
- [Tribunal Outcome Analyzer](/advocacy-tools/tribunal-outcome-analyzer/)
- [Cross-Tribunal Comparison](/cross-tribunal-success-rates.html)

## External Links
- [[Tribunal] Official Website](https://...)
- [CanLII - [Tribunal] Decisions](https://www.canlii.org/en/on/[tribunal]/)
- [Tribunal Rules of Procedure](https://...)

---

*Statistics generated: April 2026 | Classification v3.0 | Validated May 2026*  
*[View full validation report →](/docs/VALIDATION_REPORT_V3.0.md)*
```

**Data Sources:**
- Pull tribunal-specific numbers from `ontario-classification-stats-v3.json`
- Use validation-results.json for tribunal-specific accuracy (if calculated per-tribunal)

**Time Estimate:** 3-4 hours (30-40 min per page)

---

## ✅ PHASE 15: Content Validation

**Condition:** All content updates complete

### Task 15.1: Link Checker
```bash
npm install -g broken-link-checker
blc https://3mpwrapp.ca -ro --filter-level 3
```

**Fix:** Any broken internal links to new tribunal pages or validation docs

### Task 15.2: Accessibility Scan
```bash
# Already have pre-commit hooks
git add -A
git commit -m "content: Update all files with v3.0 ML classification statistics"
# Will trigger accessibility checks automatically
```

### Task 15.3: Jekyll Build Test
```bash
bundle exec jekyll build
```

**Expected:** No errors, 13,500+ files in `_site/`

**Time Estimate:** 30 minutes

---

## 🚀 PHASE 16: Production Deployment

### Task 16.1: Git Commit
```bash
git add -A
git commit -m "content: Deploy v3.0 ML classification statistics across 70+ files

- Updated 28 blog posts with validated statistics
- Updated 12 guides with tribunal-specific data
- Updated 18 knowledge base articles
- Updated 7 visualizations with v3.0 data arrays
- Updated 1 template with statistical research guidance
- Created 6 tribunal landing pages with validation results
- Added conservative messaging and disclaimers throughout
- Linked to VALIDATION_REPORT_V3.0.md for transparency

Validation results:
- Sample size: 592 cases (stratified across 6 tribunals)
- Accuracy: [INSERT_ACCURACY]%
- Validation date: May 16, 2026
- Classification v3.0: 50,161 Ontario decisions (85.1% classified)

Files changed: 70+
Lines changed: ~15,000-20,000
Classification threshold: 50% minimum confidence"
```

### Task 16.2: Push to GitHub
```bash
git push origin main
```

### Task 16.3: Jekyll Build
```bash
bundle exec jekyll build
```

**Expected Duration:** ~19 minutes (1158 seconds from previous builds)

### Task 16.4: Cloudflare Deploy
```bash
npx wrangler pages deploy _site --project-name=3mpwrapp --branch=main --commit-dirty=true
```

**Expected Duration:** 5-10 minutes (uploading 13,500+ files)

### Task 16.5: Verify Production
```bash
# Check key pages
curl -I https://3mpwrapp.ca/
curl -I https://3mpwrapp.ca/tribunals/onwsiat/
curl -I https://3mpwrapp.ca/docs/VALIDATION_REPORT_V3.0.md
curl -I https://3mpwrapp.ca/cross-tribunal-success-rates.html

# Visual inspection
open https://3mpwrapp.ca/
```

**Verification Checklist:**
- [ ] Homepage loads
- [ ] Tribunal landing pages exist (6 pages)
- [ ] Validation report is accessible
- [ ] Visualizations display correctly
- [ ] ML classification banners appear on updated posts
- [ ] Links to validation report work
- [ ] No 404 errors on major pages

**Time Estimate:** 30-45 minutes total

---

## 📢 PHASE 17: Public Communication

### Task 17.1: Bluesky Announcement

**Draft Post:**
```
🎯 ML Classification Validation Complete

We manually reviewed 592 random tribunal decisions to validate our keyword-based 
classification system. Results: [INSERT_ACCURACY]% accuracy.

Now deploying v3.0 statistics across 70+ pages:
• 50,161 Ontario tribunal decisions (2020-2026)
• 6 tribunals: WSIAT, ONSBT, WSIB, HRT, LRB, ONCA
• 85.1% classification rate
• Conservative messaging throughout

Transparency matters. Full methodology & validation report:
https://3mpwrapp.ca/docs/VALIDATION_REPORT_V3.0.md

This is a RESEARCH TOOL, not verified case outcomes. Worker advocacy requires 
understanding patterns across thousands of decisions.

#WorkersRights #LegalTech #Transparency #ML
```

**Post:** After production deployment verified

### Task 17.2: Documentation Update

**Update README.md** (if project has one):
- Add link to validation report
- Update statistics section with v3.0 numbers
- Note validation completion date

**Update CHANGELOG.md** (if exists):
```markdown
## [3.0.0] - 2026-05-16
### Added
- ML classification validation (592 cases, [INSERT_ACCURACY]% accuracy)
- 6 tribunal landing pages with validated statistics
- Conservative messaging framework across all content
- Validation methodology documentation

### Changed
- Updated 28 blog posts with v3.0 statistics
- Updated 12 guides with validated tribunal data
- Updated 18 knowledge base articles
- Updated 7 visualizations with v3.0 data
- Raised transparency standards with validation links

### Statistics
- 50,161 total Ontario decisions classified
- 85.1% classification rate (42,686 classified)
- Confidence threshold: 50% minimum
- Manual validation: 592 stratified random sample
```

**Time Estimate:** 30 minutes

---

## 🔄 PHASE 18: Automated Monitoring Setup

**Condition:** Production deployment successful

### Task 18.1: Weekly Classification Script

**Create:** `scripts/weekly-classification-update.sh`

```bash
#!/bin/bash
# Weekly update: Fetch new decisions and classify

cd /path/to/3mpwrapp.github.io-main

# Fetch new decisions from CanLII (2020-2026 range)
node scripts/collect-canlii-enhanced-parallel.js

# Run v3.0 classification on new cases
node scripts/classify-super-enhanced-v3.js

# Generate updated statistics JSON
node scripts/generate-classification-stats.js

# Commit changes
git add data/tribunal-decisions/*.json ontario-classification-stats-v3.json
git commit -m "chore: weekly classification update $(date +%Y-%m-%d)"
git push origin main

# Rebuild and deploy
bundle exec jekyll build
npx wrangler pages deploy _site --project-name=3mpwrapp --branch=main

echo "Weekly update complete: $(date)"
```

**Schedule:** GitHub Actions or local cron job
```yaml
# .github/workflows/weekly-update.yml
name: Weekly Classification Update
on:
  schedule:
    - cron: '0 2 * * 0' # Every Sunday at 2am
  workflow_dispatch: # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
      - run: npm install
      - run: bundle install
      - run: chmod +x scripts/weekly-classification-update.sh
      - run: ./scripts/weekly-classification-update.sh
```

### Task 18.2: Monthly Re-validation

**Create:** `scripts/monthly-revalidation.js`

```javascript
// Generate new 100-case validation sample monthly
// Compare accuracy trends over time
// Alert if accuracy drops below 65%

const fs = require('fs');

// Similar to generate-validation-samples.js but smaller sample
const SAMPLE_SIZE_PER_TRIBUNAL = 15; // 90 total
const VALIDATION_DIR = `validation-monthly/${new Date().toISOString().slice(0, 7)}/`;

// Generate samples, output to validation-monthly/2026-05/samples.csv
// Track accuracy trends in validation-history.json
```

**Purpose:** Catch classification drift as new decision language evolves

### Task 18.3: Alert System

**Create:** `scripts/monitor-classification-health.js`

```javascript
// Check for:
// - Large drops in classification rate (>5% month-over-month)
// - Accuracy drops (if doing monthly re-validation)
// - High volume of new "Unknown" outcomes
// - Pattern failures (patterns matching nothing)

// Alert via email or Slack if issues detected
```

**Time Estimate:** 4-6 hours for initial setup

---

## 📊 SUCCESS METRICS

### Deployment Success Criteria
- [ ] All 70+ files updated with v3.0 statistics
- [ ] 6 tribunal landing pages published
- [ ] Validation report accessible at /docs/VALIDATION_REPORT_V3.0.md
- [ ] No broken links (internal or to validation docs)
- [ ] ML classification banners visible on all relevant pages
- [ ] Production site deployed to https://3mpwrapp.ca
- [ ] All accessibility checks passing
- [ ] Jekyll build completes without errors

### Quality Metrics
- [ ] Validation accuracy ≥70%
- [ ] Conservative messaging on 100% of statistical claims
- [ ] Validation methodology linked from all pages with statistics
- [ ] Confidence disclaimers on all tribunal-specific stats
- [ ] Transparent about ML limitations throughout

### User Experience Metrics (Monitor post-launch)
- Bounce rate on tribunal landing pages
- Time on page for statistics-heavy articles
- Click-through rate to validation report
- User feedback via contact form
- Search queries leading to statistical content

---

## 🚨 CONTINGENCY PLANS

### If Validation Accuracy <70%

**Do NOT proceed with content deployment.**

Instead:
1. Commit validation results: `git add validation-samples.csv validation-results.json docs/VALIDATION_REPORT_V3.0.md`
2. Create issue documenting problems
3. Analyze failure patterns in validation data
4. Revise classification methodology (raise threshold, fix patterns)
5. Re-classify all cases (v3.1)
6. Generate NEW validation samples
7. Repeat manual validation process

**Timeline:** +2-4 weeks

### If Jekyll Build Fails

**Common issues:**
- Malformed YAML frontmatter in updated posts
- Liquid template syntax errors in new tribunal pages
- Missing dependencies or Ruby gems

**Fix:**
```bash
bundle exec jekyll build --trace
# Shows exact error location
```

### If Cloudflare Deploy Fails

**Common issues:**
- Wrangler authentication expired
- Project name mismatch
- _site directory too large (>25MB limit per file)

**Fix:**
```bash
# Re-authenticate
npx wrangler login

# Check project name
npx wrangler pages project list

# Deploy with verbose logging
npx wrangler pages deploy _site --project-name=3mpwrapp --branch=main --commit-dirty=true --verbose
```

### If Accessibility Checks Fail

**Pre-commit hook will block commit.**

**Common issues:**
- Images without alt text
- Links without descriptive text ("click here")
- Missing heading hierarchy
- Color contrast issues

**Fix:**
- Review failed file from pre-commit output
- Fix accessibility issues
- Re-stage and commit

---

## 📁 FILE REFERENCE

### Key Files Created During Validation
- `scripts/ml/generate-validation-samples.js` - Sample generation (262 lines)
- `scripts/ml/calculate-validation-metrics.js` - Metrics calculation (450+ lines)
- `run-validation-sampling.ps1` - PowerShell launcher
- `run-validation-metrics.ps1` - PowerShell launcher
- `deploy-validation-system.ps1` - Automated deployment script
- `docs/VALIDATION_GUIDE.md` - Step-by-step manual
- `docs/VALIDATION_IMPLEMENTATION_COMPLETE.md` - Infrastructure overview
- `docs/VALIDATION_PLAN_BACKUP.md` - Original comprehensive plan
- `docs/POST_VALIDATION_ROADMAP.md` - **THIS FILE**
- `validation-samples.json` - 592 case metadata backup
- `validation-samples.csv` - Manual review worksheet
- `validation-results.json` - Metrics output (created after metrics run)
- `docs/VALIDATION_REPORT_V3.0.md` - Human-readable report (created after metrics run)

### Key Data Files
- `ontario-classification-stats-v3.json` - Source of truth for all statistics
- `data/tribunal-decisions/onwsiat-*.json` - WSIAT case data (7 files)
- `data/tribunal-decisions/onsbt-*.json` - ONSBT case data (7 files)
- `data/tribunal-decisions/onwsib-*.json` - WSIB case data (5 files)
- `data/tribunal-decisions/onhrt-*.json` - HRT case data (7 files)
- `data/tribunal-decisions/onlrb-*.json` - LRB case data (7 files)
- `data/tribunal-decisions/onca-*.json` - ONCA case data (7 files)

### Files to Update (70+)
- 28 blog posts in `_posts/`
- 12 guides in `_guides/`
- 18 knowledge base articles in `_knowledge_base/` and `knowledge-base/`
- 7 visualizations (HTML files with D3.js)
- 1 template in `_templates/`
- 6 NEW tribunal landing pages in `tribunals/` (to create)

---

## ⏱️ TIME ESTIMATES

### Fast Track (If Accuracy ≥80%)
- Phase 7 (Metrics): 3 minutes
- Phase 9 (Blog posts): 4 hours
- Phase 10 (Guides): 3 hours
- Phase 11 (Knowledge base): 3 hours
- Phase 12 (Visualizations): 2 hours
- Phase 13 (Templates): 30 minutes
- Phase 14 (Tribunal pages): 3 hours
- Phase 15 (Validation): 30 minutes
- Phase 16 (Deployment): 45 minutes
- Phase 17 (Communication): 30 minutes
- **Total: ~17 hours** (2-3 work days)

### Standard Track (If Accuracy 70-80%)
- Add more conservative messaging: +2 hours
- Extra validation checks: +1 hour
- **Total: ~20 hours** (3 work days)

### Adjustment Track (If Accuracy 60-70%)
- Re-classification: +4 hours
- Adjusted messaging: +3 hours
- Re-validation: +2 hours
- **Total: ~29 hours** (4-5 work days)

### Revision Track (If Accuracy <60%)
- Methodology revision: 3-5 days
- Re-classification: 1 day
- New validation: 2-3 days
- **Total: 2-4 weeks**

---

## 🎯 NEXT IMMEDIATE STEPS

### 1. Complete Manual Validation
**Current:** 61/592 complete (10.3%)  
**Remaining:** 531 cases  
**Estimated Time:** 26-44 hours (3-5 min per case)

**Your Task:**
- Continue clicking CanLII URLs
- Fill `actual_outcome` column with real decision outcome
- Mark `match` column: ✅ (correct), ❌ (incorrect), ⚠️ (ambiguous)
- Save frequently (Ctrl+S)
- Commit progress periodically for backup

### 2. Run Metrics Calculation
**When:** All 592 cases have `actual_outcome` and `match` filled

**Command:**
```powershell
.\run-validation-metrics.ps1
```

**Review:**
- Console output with accuracy percentages
- `docs/VALIDATION_REPORT_V3.0.md` for detailed analysis
- `validation-results.json` for machine-readable metrics

### 3. Decision Point
**Based on accuracy result:**
- ≥70% → Proceed to Phase 9 (content updates)
- 60-70% → Adjust threshold, re-classify, then Phase 9
- <60% → STOP, revise methodology, re-validate

### 4. Content Updates
**Follow this roadmap phases 9-17** sequentially

**Tip:** Use find-and-replace for repetitive updates:
- `last_updated: 2026-05-16`
- `[INSERT_ACCURACY]%` → replace with actual percentage
- ML classification banners (copy-paste template)

### 5. Deploy and Monitor
**Final steps:**
- Commit all changes
- Jekyll build
- Cloudflare deploy
- Verify production
- Announce publicly
- Set up automated monitoring

---

## 📞 SUPPORT & TROUBLESHOOTING

### If You Get Stuck
1. **Check validation guide:** `docs/VALIDATION_GUIDE.md`
2. **Check original plan:** `docs/VALIDATION_PLAN_BACKUP.md`
3. **Review implementation notes:** `docs/VALIDATION_IMPLEMENTATION_COMPLETE.md`
4. **Check this roadmap:** `docs/POST_VALIDATION_ROADMAP.md`

### If Scripts Fail
- **Node.js errors:** Check Node v22.22.2 is installed (`node --version`)
- **File not found:** Ensure you're in project root (`d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main`)
- **Permission errors:** Run PowerShell as Administrator
- **JSON parse errors:** Check tribunal data files aren't corrupted

### If Content Updates Cause Issues
- **Broken links:** Use `blc https://3mpwrapp.ca` to find them
- **YAML errors:** Validate frontmatter at https://yaml-online-parser.appspot.com/
- **Liquid errors:** Check Jekyll build output (`bundle exec jekyll build --trace`)

### If Deployment Fails
- **Git push rejected:** Pull first (`git pull --rebase`)
- **Jekyll build fails:** Check error trace, fix broken files
- **Cloudflare times out:** Site may be too large, check file sizes in `_site/`

---

## ✅ FINAL CHECKLIST

**Before Starting Content Updates:**
- [ ] All 592 validation cases reviewed
- [ ] Metrics script executed successfully
- [ ] Accuracy ≥70% confirmed
- [ ] Validation report generated and reviewed
- [ ] Decision made to proceed with deployment

**During Content Updates:**
- [ ] Created backup branch: `git checkout -b content-update-v3.0`
- [ ] Updated all 28 blog posts
- [ ] Updated all 12 guides
- [ ] Updated all 18 knowledge base articles
- [ ] Updated all 7 visualizations
- [ ] Updated 1 template
- [ ] Created 6 tribunal landing pages
- [ ] Added ML classification banners throughout
- [ ] Linked to validation report from all statistical claims
- [ ] Tested Jekyll build locally

**Before Production Deployment:**
- [ ] All changes committed with detailed commit message
- [ ] Pushed to GitHub successfully
- [ ] No broken links (ran link checker)
- [ ] Accessibility checks passing
- [ ] Jekyll build completes without errors
- [ ] Reviewed key pages in local build (`bundle exec jekyll serve`)

**After Production Deployment:**
- [ ] Cloudflare deploy successful
- [ ] Verified homepage loads
- [ ] Verified tribunal landing pages exist
- [ ] Verified validation report accessible
- [ ] Verified visualizations work
- [ ] Verified ML banners visible
- [ ] Posted Bluesky announcement
- [ ] Updated project documentation
- [ ] Set up automated monitoring (optional, can be later)

---

## 🎉 SUCCESS!

Once you reach this point:
- ✅ 50,161 Ontario tribunal decisions classified and validated
- ✅ Transparent, conservative deployment of ML statistics
- ✅ 70+ pages updated with credible, validated data
- ✅ Public validation report showing methodology
- ✅ Worker advocacy tool with unprecedented scale
- ✅ Foundation for ongoing automated updates

**You've built something genuinely useful for Ontario workers navigating tribunals.**

---

*Roadmap created: May 16, 2026*  
*Manual validation progress: 61/592 (10.3%)*  
*Target completion: Based on validation results*  
*For questions: Review docs/VALIDATION_GUIDE.md or docs/VALIDATION_IMPLEMENTATION_COMPLETE.md*
