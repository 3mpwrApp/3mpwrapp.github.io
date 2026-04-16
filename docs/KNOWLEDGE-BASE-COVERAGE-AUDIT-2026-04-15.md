# Knowledge Base & Templates Coverage Audit
## Based on 11,430 ONWSIAT Tribunal Decisions (2020-2026)

**Audit Date:** April 15, 2026  
**Data Source:** [WSIB System Analysis Complete 2020-2026](./WSIB-SYSTEM-ANALYSIS-COMPLETE-2020-2026.md)

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
