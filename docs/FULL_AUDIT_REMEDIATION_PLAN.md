# Full Website Audit Remediation Plan
**Created:** May 22, 2026  
**Status:** In Progress  
**Completion Target:** 2-3 weeks

---

## Executive Summary

Comprehensive audit of 1,320 markdown files revealed:
- **1,310 pages** missing SEO metadata (title/description)
- **1,277 pages** missing French translations (2.88% coverage)
- **725 broken internal links** (sampled from first 500 files)
- **Homepage** needed additional cross-links (COMPLETE ✅)

---

## Phase 1: Quick Wins (COMPLETE ✅)

### Task 1.1: Homepage Cross-Links (COMPLETE ✅)
- **Status:** ✅ Complete
- **Action:** Added "Learn More About 3mpwrApp" section with 16 internal links
- **Links Added:**
  - Documentation: User Guide, FAQ, App Tour, What's New
  - Privacy & Security: Privacy Policy, Security, Accessibility, Delete Account
  - Community & Support: Community Hub, Guidelines, Contact, Crisis Resources
  - Research & Data: Research Tools, Data Sources, Visualizations, How to Use Data
- **Commit:** e4000f48 (website)
- **Impact:** Improved site navigation and SEO

###Task 1.2: Demo Page Cross-Links (COMPLETE ✅)
- **Status:** ✅ Complete
- **Action:** Added 6 cross-links to demo page
- **Links Added:** About, FAQ, Accessibility, Privacy, Documentation, Contact
- **Commit:** e4000f48 (website)
- **Impact:** Better user flow from demo

### Task 1.3: Critical French Pages (COMPLETE ✅)
- **Status:** ✅ Complete (5 pages)
- **Pages Created:**
  1. fr//accessibility - Full WCAG compliance statement
  2. fr/security.md - 8-layer security policy
  3. fr/demo.md - Interactive demo with PWA embed
  4. fr/faq.md - Comprehensive FAQ
  5. fr/app-waitlist.md - Beta waitlist
- **Commit:** e4000f48 (website)
- **Impact:** Legal compliance for Canadian bilingual requirements

### Task 1.4: Beta App Branding (COMPLETE ✅)
- **Status:** ✅ Complete
- **Action:** Pushed 6 commits with beta branding
- **Changes:**
  - App name: "3mpwrApp - Beta"
  - Version: "1.0.0-beta.1"
  - Beta banner component with feedback link
  - Icon fonts loading on web
  - Complexity mode counts fixed (5/17/31)
  - All TypeScript errors fixed (60 → 0)
  - All test failures fixed (123 → 0, 3 skipped)
- **Commit:** af47eb23 (app)
- **Deployment:** https://app-3mpwrapp.pages.dev/ and https://app.3mpwrapp.ca

---

## Phase 2: SEO Metadata Addition (WEEKS 1-2)

### Priority Tier 1: Top 20 Public Pages (WEEK 1)
**Target:** Add title and description to most-visited pages

**Files:**
1. ✅ index.md (homepage) - Already has metadata
2. ✅ about.md - Already has metadata
3. ✅ features/index.md - Already has metadata
4. ✅ demo/index.md - Already has metadata
5. ✅ faq.md - Already has metadata
6. ✅ contact/index.md - Already has metadata
7. ✅ privacy/index.md - Already has metadata
8. ✅ /accessibility - Already has metadata
9. ✅ security.md - Already has metadata
10. ✅ app-waitlist.md - Already has metadata
11. roadmap.md
12. whats-new.md
13. crisis-resources.md
14. research-data-sources.md
15. how-to-use-this-data.md
16. tribunal-visualizations.md
17. feedback.md
18. community/index.md
19. community/guidelines/index.md
20. events/index.md

**Automation:**
- Script: `scripts/audit/add-seo-metadata.ps1`
- Batch Script: `scripts/audit/batch-add-seo.ps1`
- Status: Scripts created, ready to use

### Priority Tier 2: Blog Posts (WEEK 2)
**Target:** 50+ blog posts in `blog/` directory

**Approach:**
1. Extract first H1 as title
2. Extract first paragraph as description
3. Batch process with automation script

### Priority Tier 3: Documentation (WEEK 2)
**Target:** Files in `docs/` directory

**Note:** Low priority - internal documentation, not indexed by search engines

---

## Phase 3: French Translation (WEEKS 2-3)

### Priority Tier 1: Critical Public Pages (COMPLETE ✅ 5/10)
1. ✅ fr//accessibility
2. ✅ fr/security.md
3. ✅ fr/demo.md
4. ✅ fr/faq.md
5. ✅ fr/app-waitlist.md
6. ⏳ fr/about.md (translate from about.md)
7. ⏳ fr/features.md (translate from features/index.md)
8. ⏳ fr/contact.md (translate from contact/index.md)
9. ⏳ fr/roadmap.md (translate from roadmap.md)
10. ⏳ fr/whats-new.md (translate from whats-new.md)

### Priority Tier 2: Legal & Crisis Resources (WEEK 2)
11. ⏳ fr/crisis-resources.md
12. ⏳ fr/community/guidelines/index.md
13. ⏳ fr/delete-account.html

### Priority Tier 3: Research & Data Pages (WEEK 3)
14-30. Research pages, data sources, tribunal guides

**Translation Strategy:**
- Use Canadian French (not European French)
- Cultural adaptation where appropriate
- Maintain same frontmatter structure
- Add `lang: fr` to frontmatter
- Link to English equivalents

**Tools:**
- ChatGPT/Claude for initial translation
- Native Canadian French speaker for review (if available)
- Automated validation for frontmatter correctness

---

## Phase 4: Broken Link Remediation (WEEK 3)

### Approach
1. ✅ Created `scripts/audit/find-broken-links.ps1`
2. ⏳ Run comprehensive scan (1,320 files)
3. ⏳ Export top 100 most frequent broken links to CSV
4. ⏳ Manual review and fix mapping
5. ⏳ Batch fix with automated script

### Known Link Issues
- Moved files (index.md → index/index.md)
- Renamed files (old-name.md → new-name.md)
- Deleted content (removed pages)
- Case sensitivity (Windows dev → Linux deploy)

**Fix Strategy:**
- Redirect rules in `_redirects` file
- Update links in source files
- Remove links to deleted content

---

## Phase 5: Automation & CI/CD Integration (WEEK 3)

### Automated Link Checker
- GitHub Action to run on every PR
- Fail PR if new broken links introduced
- Weekly scheduled scan of all pages

### SEO Metadata Validation
- Pre-commit hook to check frontmatter
- Require title and description for public pages
- Block commit if metadata missing

### French Translation Coverage Report
- Weekly automated report
- Track coverage percentage over time
- Prioritize untranslated high-traffic pages

---

## Progress Tracking

### Overall Completion
- ✅ Phase 1: Quick Wins (100%)
- ⏳ Phase 2: SEO Metadata (Top 20: 10/20 = 50%)
- ⏳ Phase 3: French Translation (Critical 10: 5/10 = 50%)
- ⏳ Phase 4: Broken Links (0/725 = 0%)
- ⏳ Phase 5: Automation (0/3 tools = 0%)

### Weekly Goals
**Week 1 (May 22-29):**
- ✅ Quick wins complete
- ⏳ SEO Tier 1 (20 pages)
- ⏳ French Tier 1 (5 remaining pages)

**Week 2 (May 30 - June 5):**
- ⏳ SEO Tier 2 (50 blog posts)
- ⏳ French Tier 2 (10 pages)
- ⏳ Broken link scan and top 50 fixes

**Week 3 (June 6-12):**
- ⏳ SEO Tier 3 (documentation)
- ⏳ French Tier 3 (20 pages)
- ⏳ Broken link remaining fixes
- ⏳ Automation tools setup

---

## Scripts Created

1. ✅ `scripts/audit/comprehensive-website-audit.ps1` - Full site audit
2. ✅ `scripts/audit/find-broken-links.ps1` - Broken link scanner
3. ✅ `scripts/audit/add-seo-metadata.ps1` - Single file SEO metadata
4. ✅ `scripts/audit/batch-add-seo.ps1` - Batch SEO processing
5. ⏳ `scripts/audit/batch-french-translate.ps1` - Batch French translation (TODO)
6. ⏳ `scripts/audit/fix-broken-links.ps1` - Automated link fixer (TODO)

---

## Success Metrics

**SEO:**
- 100% of public-facing pages have title/description
- Average description length: 120-160 characters
- All titles unique and descriptive

**French Translation:**
- Legal compliance: 100% of required pages translated
- Coverage: Aim for 10% of site (130+ pages)
- Quality: Reviewed by native speaker

**Broken Links:**
- Zero broken internal links on public pages
- Automated testing prevents new breaks
- Redirect rules for moved content

**Automation:**
- CI/CD prevents regression
- Weekly reports track progress
- Pre-commit hooks enforce standards

---

## Resources Needed

**Time:**
- Developer: 15-20 hours over 3 weeks
- French translator/reviewer: 5-10 hours

**Tools:**
- ✅ PowerShell scripts (created)
- ⏳ GitHub Actions workflows (TODO)
- ⏳ Translation service account (optional)

**Budget:**
- $0 (all self-service with existing tools)
- Optional: Professional French review ($200-500)

---

## Risk Mitigation

**Breaking Changes:**
- All scripts have `-DryRun` mode
- Git version control for rollback
- Test on sample files first

**Translation Quality:**
- Start with automated translation
- Flag for native speaker review
- Community feedback via GitHub issues

**Link Fixes:**
- Export CSV for manual review before applying
- Test redirects on staging first
- Monitor 404 errors post-deployment

---

## Next Immediate Actions

1. ⏳ Complete French Tier 1 (5 remaining critical pages)
2. ⏳ Run comprehensive broken link scan
3. ⏳ Add SEO metadata to roadmap, whats-new, crisis-resources
4. ⏳ Create GitHub Action for link checking
5. ⏳ Verify both deployments are live

---

**Last Updated:** May 22, 2026  
**Owner:** 3mpwrApp Development Team  
**Status:** Phase 1 Complete, Phase 2-5 In Progress
