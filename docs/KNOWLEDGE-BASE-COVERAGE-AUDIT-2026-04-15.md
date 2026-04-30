# Knowledge Base & Templates Coverage Audit
## Based on 98,992 WSIAT Decisions (1987-2026) + 35,928 Multi-Tribunal Analysis (2020-2026)

**Audit Date:** April 15, 2026  
**Last Updated:** April 29, 2026 (added full WSIAT dataset 1987-2026 + deep-dive analysis)  
**Data Sources:** 
- [WSIB System Analysis Complete 2020-2026](./WSIB-SYSTEM-ANALYSIS-COMPLETE-2020-2026.md)
- [WSIAT Complete Dataset](../data/tribunal-decisions/wsiat/wsiat-metadata.json) (98,992 decisions)
- [WSIAT Open Data Portal](https://www.wsiat.ca/en/home/opendata_decisions.html) - Official CSV export source
- [WSIAT Deep Dive Report](./WSIAT-DEEP-DIVE-REPORT-2026-04-29.html) - Advanced pattern analysis

## April 29, 2026 Major Update - WSIAT Complete Dataset + Deep-Dive Analysis

**NEW:** Full WSIAT dataset now available - **98,992 decisions from 1987-2026** (40 years of data)

**Coverage by Decade:**
- 1987-1999: 19,878 decisions
- 2000-2009: 31,980 decisions  
- 2010-2019: 28,576 decisions
- 2020-2026: 14,165 decisions
- Unknown year: 4,393 decisions

**Metadata Included:** Decision number, date, keywords, summary, vice-chair, employer/worker side members

**Deep-Dive Analysis Completed (9 Categories):**
1. **Keyword Co-occurrence:** Top issue pairs (NEL + Permanent Impairment: 11,516 cases)
2. **Temporal Evolution:** How issues changed over 40 years (FEL declining, LOE rising)
3. **Vice-Chair Specialization:** 40 specialists identified (>30% focus on specific issues)
4. **Body Part Patterns:** Back (13,407), Shoulder (5,295), Neck (3,535), Knee (3,162)
5. **Medical Specialists:** Surgeon (195 mentions), Family Doctor (119), Psychiatrist (44)
6. **Policy Citations:** Section 31/Right to Sue (42 citations), Section 43 (15), Section 147 (31)
7. **Decision Complexity:** Simple (19,656), Moderate (22,787), Complex (2,787)
8. **Outcome Indicators:** Allowed, Denied, Varied, Confirmed patterns detected
9. **Network Visualization:** 16 nodes, 50 links showing issue relationships

**Access:** 
- [Metadata JSON](../data/tribunal-decisions/wsiat/wsiat-metadata.json)
- [Decisions by Year](../data/tribunal-decisions/wsiat/decisions-by-year/) (41 JSON files)
- [Deep-Dive Analysis Files](../data/tribunal-decisions/wsiat/deep-analysis/) (8 JSON files)
- [Keyword Network Visualization](../connecting-the-dots-wsiat-keyword-network.html) (interactive)
- [Pattern Analysis Report](./WSIAT-PATTERN-ANALYSIS-2026-04-29.html)
- [Deep-Dive Report](./WSIAT-DEEP-DIVE-REPORT-2026-04-29.html)
- [WSIAT vs BC WCAT Comparison](../blog/2026-04-29-wsiat-vs-bc-wcat-transparency-divide.html)
- [Official Data Source](https://www.wsiat.ca/en/home/opendata_decisions.html) - WSIAT Open Data Portal

**Knowledge Base Updates:**
- ✅ **4 Comprehensive Guides Created:** NEL (20,680 cases), LOE (10,838 cases), Chronic Pain (6,876 cases), Back Injury (13,407 cases)
- ✅ **2 Multi-Issue Guides:** NEL + Chronic Pain (2,101 co-occurrences)
- ✅ **Guides Hub Page:** [/guides/](/guides/) with top 10 issues table
- ✅ **3 Templates Enhanced:** Shoulder (5,295 cases), Knee (3,162 cases), Mental Health/PTSD (471 cases)
- ✅ **Visualization Created:** [Interactive keyword network](../connecting-the-dots-wsiat-keyword-network.html)

This represents the **largest open-source WSIAT dataset** in Canadian history and enables longitudinal trend analysis across four decades of workers' compensation appeals.

## April 26, 2026 Addendum - Cross-Tribunal Evidence Status

Strict evidence table (confirmed/probable/unresolved):

- **WSIAT (Workers' Comp Appeals):** Tier A 74 (0.6%), Tier B 575 (5.0%), Tier C 10,781 (94.3%)
  - 65-73% worker success rate (official statistics)
  - Pre-existing condition cases: 1,522 (13.3% of dataset)
  - Chronic pain cases: 239
  
- **HRTO (Human Rights):** Tier A 4,618 (49.8%), Tier B 1 (0.0%), Tier C 4,650 (50.2%)
  - 73.5% abandonment rate
  - 70.1% of abandonments cite email delivery issues
  - Only 0.7% applicant victory rate among detected outcomes

- **ONSBT (ODSP/OW Appeals):** Tier A 494 (3.6%), Tier B 3,251 (23.6%), Tier C 10,053 (72.9%)
  - 67.4% grant rate in classified cases (2,524 granted vs 1,203 denied)
  - Person with disability determination: 10,477 cases (75.9% of dataset)
  - Pain-related cases: 3,542 (25.7%)
  - Overpayment allegations: 739 (5.4%)
  - Substantial impairment test: 6,813 cases (49.4%)

- **ONWSIB (WSIB Internal Reviews):** Tier A 1 (0.2%), Tier B 19 (4.4%), Tier C 411 (95.4%)
  - 89.5% probable grant rate (17 of 19 Tier B outcomes)
  - Work-related injury: 52 cases (12.1%)
  - Pre-existing condition: 29 cases (6.7%)
  - Knee/shoulder injuries most common (4.9% and 4.2%)
  - Very limited public data availability

**Total Dataset:** 35,928 tribunal decisions across four Ontario tribunals (2020-2026)

Proxy audit CI summary (Wilson 95%, sample-pack screening):

- ONWSIB Tier B error: 0.0% (0.0-16.8), Tier C missed-explicit: 0.0% (0.0-3.1)
- HRTO Tier B error: 0.0% (0.0-79.3), Tier C missed-explicit: 0.8% (0.1-4.6)
- ONWSIAT Tier B error: 0.0% (0.0-3.1), Tier C missed-explicit: 0.0% (0.0-3.1)
- ONSBT Tier B error: 0.0% (0.0-3.1), Tier C missed-explicit: 0.0% (0.0-3.1)

**Interpretation:** Keep Tier A and Tier B clearly separated in all knowledge base and template claims. Tier C volume remains the dominant data quality constraint across all tribunals except HRTO.

**New Knowledge Base Priorities:**

Based on ONSBT findings:
1. **ODSP Disability Definition Guide** (urgent - 75.9% of ONSBT cases)
2. **Substantial Impairment Test Explainer** (urgent - 49.4% of cases reference this standard)
3. **Pain Documentation for ODSP Appeals** (high - 25.7% of cases)
4. **Overpayment Defense Strategies** (medium - 5.4% of cases)
5. **Medical Verification Best Practices** (medium - 11.8% of cases)

Based on ONWSIB findings:
1. **WSIB Internal Review Strategy Guide** (medium - helps workers decide ONWSIB vs direct WSIAT)
2. **Pre-Existing Condition Early Defense** (medium - appears in 6.7% of ONWSIB, escalates to 13.3% at WSIAT)
3. **WSIB → ONWSIB → WSIAT Pathway Explainer** (high - workers need clarity on the full system)

---

## Executive Summary

**Current Status:** ⚠️ **PARTIAL COVERAGE** - Major gaps in highest-volume injury types

- ✅ **6 knowledge base articles exist** (covers ~30% of cases)
- ✅ **3 appeal templates exist** (generalpurpose, not injury-specific)  
- ❌ **MISSING: Shoulder injuries** (12.2% of ALL cases - #1 injury type!)
- ❌ **MISSING: Knee injuries** (7.4%, 20% pre-existing denial rate)
- ❌ **MISSING: 8+ other significant injury patterns**

---

## Injury Type Coverage Analysis

### ✅ COVERED (Knowledge Base Articles Exist)

| Injury Type | Cases | % | KB Article | Status |
|-------------|-------|---|------------|---------|
| **Back injuries** | 390 | 3.4% | ✅ `low-back-pain-claims.md` | Complete (based on 830 cases from older analysis) |
| **Chronic pain** | 172 | 1.5% | ✅ `chronic-pain-claims.md` | Complete (based on 186 cases) |
| **Pre-existing (general)** | 1,522 | 13.3% | ✅ `pre-existing-conditions.md` | Complete (based on 96 cases) |
| **Mental health/PTSD** | 611 | 5.3% | ✅ `psychotraumatic-disability.md` | Complete (based on 92 cases) |
| **Permanent impairment** | 818 | 7.2% | ✅ `permanent-impairment-rating.md` | Complete (based on 74 cases) |
| **Fibromyalgia** | ~88 | 0.8% | ✅ `fibromyalgia-claims.md` | Complete (based on 68 cases) |

**Total Covered: ~3,601 cases (31.5% of 11,430)**

---

### ❌ MISSING (NO Knowledge Base Articles)

| Injury Type | Cases | % | Priority | Why Missing? |
|-------------|-------|---|----------|--------------|
| **SHOULDER** | **1,391** | **12.2%** | **🔴 CRITICAL** | **Biggest injury type - epidemic-level occupational disease** |
| **KNEE** | **845** | **7.4%** | **🔴 CRITICAL** | **20% pre-existing denial rate - systematic bias documented** |
| **Neck** | 485 | 4.2% | 🟠 High | Whiplash, cervical strain common in delivery/transit workers |
| **Wrist** | 376 | 3.3% | 🟠 High | Carpal tunnel epidemic (office, assembly, meat processing) |
| **Ankle** | 272 | 2.4% | 🟡 Medium | Slips/falls, construction work |
| **Elbow** | 219 | 1.9% | 🟡 Medium | Tennis/golfer's elbow, repetitive gripping |
| **Hand** | 186 | 1.6% | 🟡 Medium | Crush injuries, machinery operation |
| **Concussion/TBI** | 183 | 1.6% | 🟠 High | Post-concussion syndrome systematically minimized |
| **Hip** | 124 | 1.1% | 🟢 Low | Bursitis, heavy lifting |
| **Hearing loss** | 38 | 0.3% | 🟢 Low | Occupational noise exposure |
| **Occupational disease (general)** | 15 | 0.1% | 🟠 High | Cancer, respiratory, systematic suppression |

**Total Missing: ~4,134 cases (36.2% of 11,430)**

---

## Appeal Template Coverage Analysis

### ✅ EXISTING TEMPLATES

| Template | Based On | Injury Coverage | Location |
|----------|----------|-----------------|----------|
| `pre-existing-appeal.md` | 96 cases | General pre-existing denials | `data/templates/` (app only) |
| `chronic-pain-appeal.md` | 186 cases | Chronic pain denials | `data/templates/` (app only) |
| `back-injury-appeal.md` | 830 cases | Back/lumbar injuries | `data/templates/` (app + website `_templates/`) |

**Problem:** Templates are NOT on website `data/` folder - only in app and website `_templates/` folder

---

### ❌ MISSING TEMPLATES

**Critical Gaps:**

1. **Shoulder injury appeal** (1,391 cases - 12.2%)
   - Should include: rotator cuff strategy, gradual onset argument, occupational disease angle
   
2. **Knee injury appeal** (845 cases - 7.4%, 20% denial rate)
   - Should include: *Kriz* threshold challenge, pre-existing osteoarthritis counter, functional baseline proof

3. **Mental health/PTSD appeal** (611 cases - 5.3%)
   - Should include: "psychotraumatic disability" terminology, discrete traumatic event documentation, separating anxiety from PTSD

4. **Occupational disease appeal** (cancer, respiratory, hearing loss)
   - Should include: presumptive coverage arguments, occupational medicine evidence, reverse onus strategy

5. **Reconsideration waiver letter** (389 cases - 3.4%)
   - Should explain why worker is skipping reconsideration (1.5 year delay) and going straight to tribunal

---

## File Organization Issues

### Inconsistent Locations:

**Knowledge Base:**
- Website: `data/knowledge-base/` (6 files, no index)
- Website: `_knowledge_base/` (duplicate? needs verification)
- App: `data/knowledge-base/` (7 files, includes index.md)

**Templates:**
- Website: `_templates/` (1 file found: back-injury)
- Website: `data/appeal-templates/` (mentioned in scripts, may be empty)
- App: `data/templates/` (3 files: pre-existing, chronic-pain, back-injury)

**Recommendation:** Consolidate to single locations:
- Website: `data/knowledge-base/` for KB, `data/templates/` for appeal letters
- App: Keep `data/knowledge-base/` and `data/templates/` synced with website

---

## Recommended Actions (Priority Order)

### 🔴 CRITICAL (Do First)

1. **Create shoulder injury knowledge base** (`shoulder-rotator-cuff-claims.md`)
   - 1,391 cases = 12.2% of ALL tribunal decisions
   - Include: rotator cuff tears, impingement, tendinitis patterns
   - Emphasize: Occupational disease angle, gradual onset strategy, deny "aging" excuse

2. **Create knee injury knowledge base** (`knee-injury-claims.md`)
   - 845 cases, 20% pre-existing denial rate
   - Include: meniscus tears, osteoarthritis battles, kneeling work
   - Emphasize: *Kriz* threshold, functional baseline, 20% systematic bias

3. **Create shoulder injury appeal template**
   - Most common denial: "gradual onset not an accident"
   - Counter: Occupational disease, cumulative trauma, repetitive strain

4. **Create knee injury appeal template**
   - Most common denial: "pre-existing osteoarthritis"
   - Counter: *Kriz* case, workplace significantly contributed, functional baseline

5. **Fix template deployment to website**
   - Copy all 3 templates from app `data/templates/` to website `data/templates/`
   - Ensure published by Jekyll (not in exclude list)

### 🟠 HIGH (Do Within Week)

6. **Create neck/whiplash knowledge base** (485 cases, 4.2%)
7. **Create wrist/carpal tunnel knowledge base** (376 cases, 3.3%)
8. **Create concussion/TBI knowledge base** (183 cases, 1.6%)
9. **Create mental health appeal template** (611 cases, 5.3%)
10. **Create occupational disease appeal template** (cancer, respiratory, hearing)

### 🟡 MEDIUM (Do Within 2 Weeks)

11. **Create ankle injury knowledge base** (272 cases)
12. **Create elbow injury knowledge base** (219 cases)
13. **Create hand injury knowledge base** (186 cases)
14. **Create reconsideration waiver template** (skip 1.5 year delay)
15. **Create modified duties rejection letter** (unsuitable work)

### 🟢 LOW (Do When Time Permits)

16. **Create hip injury knowledge base** (124 cases)
17. **Create hearing loss knowledge base** (38 cases)
18. **Create employer cost relief challenge letter** (97 co-occurrences with pre-existing)
19. **Update all existing KB articles with NEW 11,430-case statistics** (currently based on older 1,204-case dataset)

---

## Statistics Update Needed

**Problem:** Existing knowledge base articles cite OLD 2025-2026 data (1,204 cases)  
**Solution:** Update ALL articles with NEW 2020-2026 data (11,430 cases)

**Example Updates Needed:**

**Old (current):**
> "Low back pain appears in 194 cases, based on 1,204 tribunal decisions analyzed."

**New (should be):**
> "Low back pain appears in 390 cases (3.4%), based on 11,430 tribunal decisions (2020-2026). Recent detective-mode analysis reveals back injuries have 19% pre-existing denial rate—proving systematic bias."

**Files Needing Updates:**
- [ ] `low-back-pain-claims.md` - Update case counts, add 19% pre-existing rate
- [ ] `chronic-pain-claims.md` - Update to 172 cases, add mental health conflation pattern (107 cases)
- [ ] `pre-existing-conditions.md` - Update to 1,522 cases (13.3% - #2 denial tactic!)
- [ ] `psychotraumatic-disability.md` - Update to 611 cases, add 5x undercount vs. "stress"
- [ ] `permanent-impairment-rating.md` - Update to 818 cases (7.2%)
- [ ] `fibromyalgia-claims.md` - Update case counts

---

## Cross-Reference Integration

**NEW detective blog posts should link to knowledge base:**

**From blog posts:**
- "Learn more about shoulder injuries → [KB article]"
- "Fighting pre-existing denials? → [KB article + appeal template]"
- "Keyword decoder found 'psychotraumatic disability'? → [mental health KB]"

**From knowledge base:**
- "See full statistical analysis → [Detective blog post]"
- "Download appeal template → [shoulder-appeal.md]"
- "Interactive keyword search → [Network visualization]"

---

## Website vs. App Sync Status

| Resource Type | Website Status | App Status | Sync Status |
|---------------|---------------|------------|-------------|
| Knowledge Base (6 core files) | ✅ In `data/knowledge-base/` | ✅ In `data/knowledge-base/` | ✅ **SYNCED** (updated with statistical banners) |
| Knowledge Base Index | ❌ Missing | ✅ Exists | ⚠️ **PARTIAL** |
| Appeal Templates (3) | ⚠️ In `_templates/` only | ✅ In `data/templates/` | ❌ **NOT SYNCED** |
| NEW Statistical Findings | ✅ In blog posts | ❌ Not integrated | ⚠️ **NEEDS INTEGRATION** |

---

## Conclusion

**Coverage Score: 31.5% of injury types have knowledge base articles**

**Action Required:**
1. Create 2 critical KB articles (shoulder, knee) immediately
2. Create 2 critical appeal templates (shoulder, knee)
3. Update all 6 existing KB articles with new 11,430-case statistics
4. Sync templates to website `data/templates/` folder
5. Create 8 additional KB articles for high-volume injuries
6. Create 3 additional specialized appeal templates

**Estimated Work:**
- Shoulder + Knee KB articles: 4-6 hours
- Shoulder + Knee appeal templates: 2-3 hours
- Update existing 6 KB articles: 2-3 hours
- Remaining 8 KB articles: 12-16 hours
- Remaining templates: 4-6 hours
- **TOTAL: ~25-35 hours to achieve 90%+ coverage**

**Priority:** Start with shoulder and knee (address 20% of all tribunal cases)

---

**Next Steps:** See [task #4 in todo list](#) for implementation plan.
