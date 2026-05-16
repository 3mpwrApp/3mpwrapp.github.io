# Ontario Tribunal Classification - Validation & Content Update Plan
**Last Updated**: May 16, 2026  
**Status**: Phase 6 (Validation Sampling) - In Progress  
**Manual Review**: 592 samples awaiting completion

---

## 🎯 TL;DR
70+ files to update with v3.0 statistics + 6 tribunal landing pages + automated monitoring system + **validation sampling to measure actual accuracy**

**Current Priority**: Complete manual validation of 592 cases before proceeding with content updates

---

## 📊 v3.0 Classification Statistics by Tribunal

| Tribunal | Total Cases | Classified | Unknown | Unknown Rate |
|----------|-------------|------------|---------|--------------|
| ONWSIAT  | 11,430      | 9,536      | 1,894   | **16.6%**    |
| ONSBT    | 13,798      | 13,064     | 734     | **5.3%**     |
| ONWSIB   | 463         | 211        | 252     | **54.4%**    |
| ONHRT    | 9,269       | 8,013      | 1,256   | **13.6%**    |
| ONLRB    | 10,167      | 7,382      | 2,785   | **27.4%**    |
| ONCA     | 5,034       | 4,474      | 560     | **11.1%**    |
| **Total**| **50,161**  | **42,680** | **7,481**| **14.9%**   |

**Overall**: 85.1% classified (down from 83.2% unknown baseline)

---

## Phase 6: Validation Sampling - ⏳ IN PROGRESS

### 14. Generate Validation Samples - ✅ COMPLETE
- Script: `scripts/ml/generate-validation-samples.js` ✅
- Output: `validation-samples.csv` with 592 cases ✅
- Distribution: 100 per tribunal (except ONWSIB: 99, ONCA: 93)
- Stratified: 240 high confidence, 232 medium, 120 low

### 15. Manual Validation Workflow - ⏳ IN PROGRESS
- Task: Review 592 cases via CanLII URLs
- For each case:
  * Visit canlii_url
  * Read actual decision outcome
  * Fill `actual_outcome` column
  * Mark `match`: ✅ (correct), ❌ (incorrect), ⚠️ (ambiguous)
- Estimated time: 10-15 hours
- User workflow: Yellow highlight = incorrect, Green = ambiguous

### 16. Calculate Accuracy Metrics - 🔜 READY
- Script: `scripts/ml/calculate-validation-metrics.js` ✅
- Command: `.\run-validation-metrics.ps1`
- Outputs:
  * `validation-results.json` - Detailed metrics
  * `docs/VALIDATION_REPORT_V3.0.md` - Human-readable report
  * Console: Accuracy by tribunal/confidence/method
  * Recommendations for threshold adjustments

### 17. Update Classification Thresholds - 🔜 PENDING
- If low confidence <60% accurate → raise min threshold to 0.65
- If overall <70% accurate → add "Preliminary Classification" label
- Adjust confidence scoring formula based on calibration
- Document threshold changes in validation report

### 18. Create Validation Report - 🔜 PENDING
- File: `docs/VALIDATION_REPORT_V3.0.md`
- Include: Sample size, accuracy breakdown, misclassification patterns
- Publish as blog post if accuracy ≥70%

---

## Phase 1: Blog Posts (28 files) - 🔜 AWAITING VALIDATION

### Key Messaging (Conservative)
- Banner: "📊 Updated May 15, 2026: [X] [TRIBUNAL] decisions analyzed, [X]% **ML-classified using keyword patterns (not human-verified)**"
- Methodology: "Classification confidence ranges 50-95%. Use as research guide, not verified outcomes."
- Replace "accuracy" with "classification rate"
- Emphasize ML/keyword-based methodology

### WSIAT Posts (10 files)
1. `2024-11-20-wsiat-chronic-pain-trends.md` - Add last_updated, v3.0 stats (11,430 cases, 83.4% classified)
2. `2024-11-25-wsiat-mental-health-claims.md` - Same updates
3. `2024-12-01-wsiat-successful-appeals.md` - Same updates
4. (... 7 more WSIAT posts)

### ONSBT Posts (3 files)
11. `2024-11-22-onsbt-outcome-patterns.md` - 13,798 cases, 94.7% classified
12. `2024-12-05-onsbt-disability-decisions.md` - Same
13. `2026-05-14-ontario-legal-intelligence-system-launch.md` - Already updated with v3.0 milestone

### ONHRT Posts (3 files)
14-16. Update with 9,269 cases, 86.4% classified

### Cross-Tribunal Posts (3 files)
17-19. Update with all 6 tribunal stats

### ONCA Posts (2 files)
20-21. Update with 5,034 cases, 88.9% classified

### ONWSIB Posts (2 files)
22-23. Update with 463 cases, 45.6% classified (acknowledge limitations)

### Other Classification Posts (5 files)
24-28. General tribunal system posts referencing v3.0

---

## Phase 2: Guides (12 files) - 🔜 AWAITING VALIDATION

7. **WSIAT Guides (4 files)** - Update with 11,430 cases, 83.4% classified
   - `guides/wsiat-complete-guide.md` ✅ ALREADY UPDATED
   - `guides/wsiat-chronic-pain-guide.md` ✅ ALREADY UPDATED
   - `guides/wsiat-mental-health-guide.md`
   - `guides/wsiat-appeals-timeline.md`

8. **Multi-Tribunal Guides (8 files)**
   - `guides/tribunal-comparison.md` - All 6 tribunal stats
   - `guides/appeal-strategy.md` - Cross-tribunal success rates
   - (... 6 more guides)

---

## Phase 3: Knowledge Base (18 files) - 🔜 AWAITING VALIDATION

9. **Injury-Specific Articles (10 files)** in `_knowledge_base/`
   - Update with relevant tribunal stats (e.g., chronic pain → WSIAT data)

10. **Tribunal Process Articles (8 files)** in `knowledge-base/`
    - Update with tribunal-specific v3.0 rates
    - **NOTE**: Must update BOTH directories (_knowledge_base/ and knowledge-base/)

---

## Phase 4: Visualizations (7 files) - 🔜 AWAITING VALIDATION

11. **Timeline Visualizations (5 files)**
    - `wsiat-outcome-timeline-2020-2026.html`
    - `onsbt-outcome-timeline-2020-2026.html`
    - `onhrt-outcome-timeline-2020-2026.html`
    - `ontario-tribunals-outcome-clarity-comparison.html`
    - `temporal-evolution.html`
    - Update D3.js data arrays from `ontario-classification-stats-v3.json`
    - Label as "ML Classification" not "Outcome"

12. **Network Visualizations (2 files)**
    - `connecting-the-dots-wsiat-keyword-network.html`
    - `tribunal-overlap-network.html`
    - Add methodology disclaimers

---

## Phase 5: Templates (1 file) - 🔜 AWAITING VALIDATION

13. **ONCA Factum Template**
    - File: `templates/onca-factum-template.md`
    - Update with 5,034 cases, 88.9% classified

---

## Phase 7: Content Validation & Deployment - 🔜 AFTER VALIDATION

19. **Content Review** - Verify all disclaimers present
20. **Git Commit** - Commit all 70+ file updates
21. **Jekyll Build** - `bundle exec jekyll build`
22. **Cloudflare Deploy** - `npx wrangler pages deploy _site`

---

## Phase 8: Tribunal Landing Pages (6 new pages) - 🔜 FUTURE

23. Create template for tribunal overview pages
24. Generate data file with v3.0 stats + validation accuracy
25. Create 6 pages (onwsiat.md, onsbt.md, etc.) with:
    - Tribunal overview
    - v3.0 classification statistics
    - Validation accuracy (if ≥70%)
    - Related blog posts
    - Embedded visualizations
    - Conservative methodology disclaimers
26. Create tribunals/index.md
27. Update navigation menu

---

## Phase 9: Automated Monitoring System - 🔜 FUTURE

28. Create `scripts/ml/monitor-classification-improvements.js`
29. Create auto-blog generator with conservative language
30. Set up GitHub Actions workflow (weekly runs)
31. Create monitoring dashboard
32. Configure alerts for >1% improvement

---

## 📋 Decisions & Requirements

### Conservative Language Requirements
- **Data Banner**: "ML-classified using keyword patterns (not human-verified)"
- **Methodology Disclaimer**: "Classification confidence ranges 50-95%. Use as research guide, not verified outcomes."
- Replace "accuracy" → "classification rate"
- Replace "verified" → "classified"
- Emphasize keyword-only analysis (no full text)

### Validation Transparency
- Publish validation results when available
- Adjust messaging if accuracy <70%
- Include confidence ranges in all content
- Reference validation methodology

### Tribunal-Specific Notes
- **ONWSIB**: Acknowledge 54.4% unknown rate due to internal decisions
- **ONLRB**: Note 27.4% unknown reflects labour relations complexity
- **ONSBT**: Highlight 5.3% unknown as breakthrough success

### Technical Requirements
- Update BOTH `_knowledge_base/` and `knowledge-base/` directories
- Programmatically update visualization data from JSON
- Maintain existing D3.js code structure
- All async content operations need loading states

---

## 🎯 Next Steps After Manual Validation

### If Accuracy ≥70%
1. ✅ Proceed with Phase 1-5 content updates
2. ✅ Deploy with confidence
3. ✅ Publish validation report prominently
4. ✅ Reference validation in tribunal landing pages

### If Accuracy 60-70%
1. ⚠️ Raise minimum threshold from 0.50 → 0.60
2. ⚠️ Add "Preliminary Classification" disclaimer
3. ⚠️ Re-run `classify-super-enhanced-v3.js`
4. ⚠️ Update content with stronger disclaimers

### If Accuracy <60%
1. 🚨 Major revision needed
2. 🚨 Raise threshold to 0.65 or exclude low-confidence
3. 🚨 Review classification methodology
4. 🚨 Delay content updates until improved

---

## 📊 Validation Status Tracker

**Generated**: ✅ 592 samples  
**Reviewed**: ⏳ In progress  
**Accuracy Calculated**: ⏳ Pending manual review completion  
**Thresholds Adjusted**: ⏳ Pending metrics  
**Report Published**: ⏳ Pending metrics  

---

## 🔗 Key Files

**Validation**:
- `validation-samples.csv` - Manual review spreadsheet (592 rows)
- `validation-samples.json` - Full metadata backup
- `VALIDATION_GUIDE.md` - Step-by-step instructions
- `run-validation-sampling.ps1` - Sample generator launcher
- `run-validation-metrics.ps1` - Metrics calculator launcher

**Scripts**:
- `scripts/ml/generate-validation-samples.js` - Stratified sampling
- `scripts/ml/calculate-validation-metrics.js` - Accuracy calculation
- `scripts/ml/classify-super-enhanced-v3.js` - Main classification (if re-run needed)

**Data**:
- `ontario-classification-stats-v3.json` - Source of truth for all statistics

**Documentation**:
- `/memories/session/plan.md` - Master plan (this document)
- `VALIDATION_IMPLEMENTATION_COMPLETE.md` - Validation system overview

---

**Ready to proceed once manual validation complete!** 🚀
