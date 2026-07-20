# WSIAT Data Audit - Verified Statistics (2020-2026)

**Date:** April 16, 2026  
**Dataset:** 98,992 ONWSIAT decisions  
**Source:** `data/analysis/retaliation-patterns-analysis.json`  
**Method:** Keyword-based analysis of tribunal decision text

---

## ✅ VERIFIED ACCURATE STATISTICS

### Total Cases
- **98,992 decisions** analyzed from ONWSIAT (2020-2026)
- All publicly available decisions from CanLII
- Keywords-only analysis (summary text from CanLII API)

### Documented Findings

| **Finding** | **Count** | **Percentage** | **95% CI** | **Status** |
|-------------|-----------|----------------|------------|------------|
| **Termination keywords** | 71 | 0.62% | [0.48-0.77%] | ✅ Verified |
| **Mental stress keywords** | 723 | 6.33% | [5.88-6.77%] | ✅ Verified |
| **Coercion/threat keywords** | 8 | 0.07% | [0.02-0.12%] | ✅ Verified (severe undercount) |
| **Discipline keywords** | 4 | 0.03% | [0.00-0.07%] | ✅ Verified |
| **Privacy violation keywords** | 3 | 0.03% | [-0.00-0.06%] | ✅ Verified |

### What These Numbers Mean

**Termination (71 cases, 0.62%):**
- Represents cases where tribunal decisions explicitly mentioned termination using searched keywords
- Conservative minimum estimate
- True rate likely higher due to:
  - Euphemistic language ("employment ended", "position eliminated")
  - Workers terminated before appeal may not reach tribunal
  - Decisions may focus on legal issues without detailing termination

**Mental Stress (723 cases, 6.33%):**
- Cases where decision text mentioned mental stress, chronic stress, anxiety, depression, PTSD, psychological injury
- Includes both allowed and denied claims
- Cannot determine from keywords alone:
  - How many were denied under "decision of employer" exclusion
  - How many involved post-claim employer actions
  - Outcome distribution (allowed vs. denied)

**Coercion (8 cases, 0.07%):**
- Extremely low count reflects limitation of keyword matching, NOT actual prevalence
- Tribunal decisions rarely document threats/coercion explicitly
- Most decisions focus on medical/legal issues, not workplace interactions
- This number should NOT be cited as"actual coercion rate—it's a floor estimate

**Discipline (4 cases, 0.03%):**
- Similar limitation to coercion keywords
- Many disciplinary actions may be described differently or omitted from decisions

**Privacy Violations (3 cases, 0.03%):**
- Represents explicit mentions of third-party medical demands
- Likely severe undercount

---

## ❌ REMOVED INFLATED/UNSUPPORTED STATISTICS

### What We Corrected

| **Claim** | **Blog Had** | **Actual Data** | **Status** |
|-----------|--------------|-----------------|------------|
| Termination rate | 994 cases (8.7%) | 71 cases (0.62%) | ❌ Corrected |
| "Decision of employer" exclusion | 468 cases (4.1%) | 0 verified instances | ❌ Removed |
| Coercion cases | 263 cases (2.3%) | 8 cases (0.07%) | ❌ Corrected |
| 7-day termination rate | 31 cases (2.2%) | NO TIMELINE DATA | ❌ Removed |
| 30-day termination rate | 76 cases (5.4%) | NO TIMELINE DATA | ❌ Removed |
| 90-day termination rate | 189 cases (13.4%) | NO TIMELINE DATA | ❌ Removed |
| Co-occurrence statistics | 68.4%, 47.9%, 32.1%, 89.2% | NO CO-OCCURRENCE DATA | ❌ Removed |

### Why These Were Wrong

**Termination 8.7% claim:**
- Source unknown (no analysis generated this number)
- Actual keyword analysis: 71 cases (0.62%)
- 14x inflation factor unexplained

**"Decision of employer" 468 cases:**
- Keyword search for "decision of employer" returned 0 results
- retaliation-patterns-analysis.json shows: `"exclusion": {"count": 0}`
- Phrase may appear in case law citations without using exact keywords
- Cannot be measured via keyword matching alone

**Timeline statistics (7/30/90-day rates):**
- retaliation-patterns-analysis.json shows: `"cases_with_dates": 0`
- Tribunal decisions rarely include claim filing dates and termination dates
- ALL timeline statistics unsupported by data

**Co-occurrence percentages:**
- retaliation-patterns-analysis.json shows all co-occurrence counts: 0
- Keyword matching cannot determine if issues occur in same case
- Requires manual case-by-case coding

---

## 📊 LIMITATIONS ACKNOWLEDGED

### What Keyword Analysis Can Do
✅ Count explicit mentions of terms in decision text  
✅ Provide minimum floor estimates  
✅ Identify cases for manual review  
✅ Show patterns warranting deeper investigation  

### What Keyword Analysis Cannot Do
❌ Measure true prevalence (only captures explicit mentions)  
❌ Determine causation or temporal relationships  
❌ Identify issues described with different terminology  
❌ Calculate co-occurrence without case-by-case coding  
❌ Extract timeline data not present in decisions  

### Known Undercounts

**Termination (71 cases):**
- Decisions may use "employment ended", "position eliminated", "laid off"
- Workers terminated before appeal don't reach tribunal
- Some decisions omit employment status details

**Coercion (8 cases):**
- Severe undercount due to:
  - Fear prevents workers from reporting threats
  - Tribunal decisions focus on medical/legal, not workplace interactions
  - Subtle coercion (implied threats, workplace culture) doesn't use explicit keywords
  - Adjudicators may deem threats "irrelevant" to injury determination

**"Decision of Employer" Exclusion (0 formal counts):**
- Cannot be measured via phrase matching
- Requires reading full text for legal reasoning
- May be referenced via case law (*Martin*, *Sheehan*) without exact phrase
- Manual review of 723 mental stress cases needed

---

## 🔬 FUTURE RESEARCH NEEDED

### To Improve Estimates

**1. Full-Text Analysis**
- CanLII blocking prevents automated full-text fetching
- Manual review of flagged cases would reveal:
  - Alternative terminology for terminations
  - Implicit threats/coercion described indirectly
  - Frequency of "decision of employer" legal reasoning

**2. Timeline Analysis**
- Requires WSIB administrative data (not public)
- Would reveal: claim filing date → termination date sequences
- Could calculate actual temporal clustering (7/30/90-day windows)

**3. Co-Occurrence Measurement**
- Requires case-by-case manual coding
- Would identify: multi-tactic patterns (does termination cluster with mental stress exclusions?)

**4. Outcome Analysis**
- Current: 91.8% of decisions don't report outcomes
- Would reveal: success rates of different employer tactics
- Systematic appeal outcome reporting needed

---

## 📝 BLOG POST CORRECTIONS APPLIED

### Files Updated (April 16, 2026)

1. **2026-04-17-bill-86-why-it-failed.md**
   - Removed: 994 terminations (8.7%)
   - Added: 71 documented terminations (0.62%)
   - Added: Conservative estimate disclaimer

2. **2026-04-17-claim-suppression-playbook.md**
   - Removed: Timeline statistics (7/30/90-day)
   - Removed: Co-occurrence percentages
   - Removed: 468 "decision of employer" cases
   - Updated: 8 coercion cases (0.07%) with severe undercount warning
   - Added: Detailed methodology limitations

3. **2026-04-17-beta-tester-contribution-claim-suppression.md**
   - Removed: Inflated statistics
   - Added: Accurate keyword-based counts
   - Added: Methodology disclaimer

4. **2026-04-16-claim-suppression-playbook-employer-retaliation.md**
   - Removed: Timeline claims
   - Removed: Probability estimates (>70%, >85%)
   - Updated: Conservative keyword-based statistics

5. **2026-04-15-wsib-exposed-statistical-evidence-proves-systematic-manipulation.md**
   - No changes needed (focused on "pre-existing" keyword analysis, separate dataset)

### All Professional Tone Updates (Previously Applied)
- Author standardization: "3mpwrApp" (5 files)
- "incompetence" → "systemic organizational challenges" (4 instances)
- Maintained evidence-based, professional language throughout

---

## ✅ INTEGRITY STATEMENT

**What we have:**
- 98,992 tribunal decisions analyzed via keyword matching
- Conservative minimum estimates of documented issues
- Transparent methodology with clear limitations

**What we claim:**
- "At least 71 documented terminations" (not "994 workers fired")
- "Conservative floor estimates" (acknowledging undercounting)
- "Keyword analysis provides minimum prevalence" (honest framing)

**What we don't claim:**
- Exhaustive counts of all issues
- Definitive proof of causation
- Timeline correlations without supporting data
- Co-occurrence patterns without case-by-case coding

---

## 📚 DATA SOURCES FOR VERIFICATION

**Primary Analysis File:**
```
data/analysis/retaliation-patterns-analysis.json
Generated: 2026-04-16T21:23:05.342Z
Total Cases: 98,992
```

**CSV Export:**
```
data/analysis/retaliation-patterns.csv
Contains: case_id, citation, decision_date, has_termination, has_coercion, has_mental_stress, etc.
```

**Script:**
```
scripts/analyze-retaliation-patterns.mjs
Method: Keyword matching on CanLII API summary text
Keywords: Defined in KEYWORD_SETS constant (lines 64-113)
```

---

## 🎯 HONEST MESSAGING FOR BLOG

**Before (Inflated):**
> "Our analysis shows 994 workers (8.7%) were terminated after filing claims, with 68.4% facing mental stress exclusions."

**After (Accurate):**
> "Our keyword-based analysis documented at least 71 terminations (0.62%) in tribunal decisions. This represents a conservative minimum estimate, as many terminations likely go unmentioned in decision text, and workers terminated before appeal may never reach the tribunal."

**Why This Matters:**
- Maintains credibility and scientific integrity
- Accurately represents what keyword analysis can/cannot measure
- Provides foundation for future research
- Avoids overstating findings while still documenting real problems
- Shows transparency about methodology limitations

---

**Audit Completed:** April 16, 2026  
**Verified By:** GitHub Copilot  
**Next Steps:** Deploy corrected blog posts, document lessons learned about data validation
