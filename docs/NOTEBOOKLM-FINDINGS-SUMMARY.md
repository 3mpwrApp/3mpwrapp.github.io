# NotebookLM Analysis Summary: Ontario Tribunal Outcome Classification

**Analysis Date:** April 28, 2026  
**Scope:** 100+ decisions across WSIAT, ONSBT, ONWSIB, ONHRT (1986-2025)  
**Goal:** Identify patterns to reduce ~95% "Unknown" outcome rates

---

## 🎯 EXECUTIVE SUMMARY

NotebookLM analysis of Ontario tribunal decisions revealed the **root cause** of 95% Unknown outcome rates:

**The Problem:**
- Our keyword extraction searches for **legal tribunal language** ("appeal allowed", "granted")
- WSIB internal reviews use **administrative bureaucratic language** ("upon review, the Board finds...")
- **Result:** 95.7% of ONWSIB decisions classified as "Unknown" despite having clear outcomes

**The Solution:**
- Add 100+ tribunal-specific administrative phrases
- Distinguish between legal outcomes vs. procedural outcomes
- Apply confidence levels (High/Medium/Low) to matches
- Expected improvement: 95% → 30-70% Unknown rate depending on tribunal

---

## 📚 KEY FINDINGS

### **1. WSIAT Database Architecture**

**Numbering Convention:** `Root Number / Year Suffix [Status Suffix]`

Example: `1129/10R`
- **Root:** 1129 (unique case identifier)
- **Year:** 10 (filed in 2010)
- **Status:** R (Reconsideration)

**Status Suffixes:**
- **R** = Reconsideration
- **I** = Interim decision
- **L** = Leave to appeal
- **LR** = Leave to appeal + Reconsideration (e.g., 756/89LR)
- **E** = Extension of time (e.g., 2021/07E)

**Importance:** This numbering system allows tracking of procedural history and validation of outcomes across related decisions (original → interim → reconsideration).

---

### **2. Outcome Classification Patterns**

#### **Standard Tribunal Language (WSIAT, ONSBT, ONHRT):**

| Category | Phrases |
|----------|---------|
| **Worker Wins** | "appeal allowed", "granted entitlement", "directed the board to", "allowed the worker's appeal" |
| **Worker Loses** | "appeal dismissed", "denied entitlement", "leave denied", "deemed not to have" |
| **Mixed** | "appeal partially allowed", "granted entitlement to [X] but denied [Y]" |
| **Procedural** | "remitted", "sent back", "varied", "endorsed withdrawal", "adjourned pending" |

#### **Administrative Language (ONWSIB Internal Reviews):**

**This is the CRITICAL discovery!**

| Category | Phrases |
|----------|---------|
| **Worker Wins** | "reconsideration results in approval", "upon review, the board finds entitlement", "original decision is amended to allow", "board reverses its earlier determination", "benefits reinstated" |
| **Worker Loses** | "reconsideration results in denial", "reconsideration upholds original", "original decision is maintained", "board affirms its earlier determination", "decision stands" |

**Why This Matters:**
- WSIB internal reviews are NOT tribunal decisions
- They use internal administrative language
- Our legal keyword extraction completely missed these patterns
- **This is why 95.7% were Unknown!**

---

### **3. Non-Standard Phrasing Patterns**

NotebookLM identified several "hidden" outcome indicators:

#### **"Deemed" Language:**
- **Worker Loses:** "deemed not to have", "deemed ineligible", "deemed not entitled"
- **Worker Wins:** "deemed entitled", "deemed eligible", "deemed to have"
- **Context:** Passive voice legal determination (often in NEL/impairment findings)

#### **"Reversing" Language:**
- **Context-Dependent:** Must check who appealed
  - If employer appealing Board allowance → "reversing" = employer wins
  - If worker appealing Board denial → "reversing" = worker wins
- **Confidence:** Medium (requires contextual analysis)

#### **"Directed" Language:**
- **Worker Wins:** "directed the board to", "directed wsib to recalculate"
- **Significance:** Tribunal ordering Board to take action = worker victory
- **Confidence:** High

#### **"Endorsed" Language:**
- **Procedural:** "endorsed withdrawal", "withdrawal endorsed"
- **Modern WSIAT:** Newer decisions use "endorsed" instead of "dismissed as withdrawn"
- **Outcome:** Withdrawn (not win/loss)

---

### **4. Tribunal-Specific Insights**

#### **WSIAT (Workplace Safety & Insurance Appeals Tribunal):**
- **Decisions:** 86,000+ since 1985
- **Language:** Legal/tribunal phrasing
- **Patterns:** Uses "granted/denied entitlement", "directed the board to"
- **Expected Improvement:** 94.3% Unknown → 50-60% Unknown

#### **ONSBT (Ontario Social Benefits Tribunal):**
- **Focus:** ODSP eligibility
- **Language:** "Eligible for ODSP", "meets disability criteria", "substantial impairment"
- **Unique:** Heavy use of consent orders (parties agree to outcome)
- **Expected Improvement:** 95.4% Unknown → 40-50% Unknown

#### **ONWSIB (WSIB Internal Reviews):**
- **Critical Discovery:** Uses administrative language, NOT tribunal language
- **Problem:** Only 463 public decisions vs. 98,992 WSIAT cases
- **Limitation:** 95.7% Unknown likely to remain ~70% due to limited public data
- **Pattern:** "Upon review, the board finds...", "original decision is maintained..."

#### **ONHRT (Ontario Human Rights Tribunal):**
- **Focus:** Discrimination claims
- **Language:** "Discrimination found", "prima facie case established", "remedy ordered"
- **Unique:** Not compensation-focused; damages are secondary to human rights findings
- **Expected Improvement:** N/A → 30-40% Unknown (new dataset)

---

### **5. Confidence Level Framework**

NotebookLM categorized outcome indicators by **explicitness:**

| Confidence | Definition | Examples | Strategy |
|------------|------------|----------|----------|
| **High** | Explicit outcome statement | "appeal allowed", "appeal dismissed", "discrimination found" | Auto-classify with confidence |
| **Medium** | Implied from reasoning/disposition | "benefits awarded", "deemed not to have", "reversing" (context-dependent) | Auto-classify but flag for validation |
| **Low** | Ambiguous or requires full context | "Board reconsiders", "upon review" (without outcome phrase) | Exclude from auto-classification; manual review required |

**Implementation Strategy:**
- Accept High + Medium confidence matches
- Export Low confidence for manual review
- Flag Medium confidence for spot-check validation

---

## 🔬 TECHNICAL IMPLEMENTATION

### **Data Extraction Strategy:**

1. **Phase 1: Enhanced Keyword Extraction (DONE)**
   - Add 100+ tribunal-specific phrases
   - Apply confidence scoring
   - Re-process existing JSON files

2. **Phase 2: NotebookLM Batch Processing**
   - Export remaining Unknown decisions (sample of 50)
   - Upload to NotebookLM for pattern discovery
   - Add newly discovered phrases to keyword list
   - Re-run extraction

3. **Phase 3: Bulk Data Acquisition**
   - **WSIAT:** Contact data@wsiat.ca for Open Data CSV initiative
   - **CanLII:** Use proximity operators (`/p`, `/s`) for full-text extraction
   - **Manual Review:** Spot-check High confidence matches

### **Quality Assurance Checkpoints:**

1. **Cross-Reference Validation:**
   - Use WSIAT numbering system to track procedural history
   - Validate Reconsideration (R suffix) outcomes match original decisions
   - Check for outcome consistency in related cases

2. **Sample Testing:**
   - Manually review 50 High confidence matches
   - Calculate false positive rate (target: <5%)
   - Adjust keyword list if FP rate exceeds threshold

3. **Tribunal Comparison:**
   - Compare outcome distributions across tribunals
   - Validate that worker win rates align with known statistics
   - Flag anomalies for manual review

---

## 📊 EXPECTED RESULTS

### **Before Re-extraction:**

| Tribunal | Total Decisions | Unknown | Unknown % |
|----------|----------------|---------|-----------|
| WSIAT | ~11,000 | ~10,373 | 94.3% |
| ONSBT | ~800 | ~763 | 95.4% |
| ONWSIB | 463 | 443 | 95.7% |
| ONHRT | ~200 | ~200 | 100% (new) |

### **After Re-extraction (Projected):**

| Tribunal | Total Decisions | Unknown | Unknown % | Improvement |
|----------|----------------|---------|-----------|-------------|
| WSIAT | ~11,000 | ~5,500-6,600 | 50-60% | ↓ 34-44% |
| ONSBT | ~800 | ~320-400 | 40-50% | ↓ 45-55% |
| ONWSIB | ~450 | ~315 | ~70% | ↓ 25% |
| ONHRT | ~200 | ~60-80 | 30-40% | ↓ 60-70% |

**Total Improvement:** ~6,000-8,000 decisions will move from "Unknown" to classified

---

## 🎓 KEY LEARNINGS

### **1. Match Language to Document Type**
- **Tribunal decisions** use legal language ("appeal allowed")
- **Internal reviews** use administrative language ("upon review, the board finds")
- **Lesson:** Keyword extraction must match document formality level

### **2. Passive Voice Hides Outcomes**
- "Deemed not to have" instead of "denied"
- "Considered to be" instead of "found"
- **Lesson:** Add passive voice variants to keyword lists

### **3. Procedural Outcomes ≠ Win/Loss**
- "Remitted" = sent back (not decided)
- "Varied" = modified (not replaced)
- "Withdrawn" = abandoned (not dismissed)
- **Lesson:** Separate procedural outcomes from substantive outcomes

### **4. Context Matters for Some Phrases**
- "Reversing" depends on who appealed
- "Benefits awarded" could be partial
- **Lesson:** Use confidence levels + manual validation for context-dependent phrases

### **5. Database Architecture Enables Validation**
- WSIAT numbering tracks case lifecycle
- Cross-reference R (Reconsideration) with original decision
- **Lesson:** Use metadata to validate outcome consistency

---

## 📚 SOURCES & REFERENCES

### **NotebookLM Uploads (April 28, 2026):**
1. "Database Architecture & Implementation Plan: Ontario WSIAT/WSIB Case Repository"
2. "Database Report Highlights: Chronological Span 1986-2025"
3. "Navigating Employer Liability: Policy Interpretation & SIEF Cost-Relief"
4. "Chronological Database of WSIAT Decisions Cited in Source Context"
5. "WSIAT Outcome Analysis Report (1986-2025)" - 50+ specific case outcomes

### **Key Documents:**
- WSIAT Annual Reports (2000-2025)
- Drummond Report (2011) - Administrative context
- WSIAT Open Data CSV initiative (data@wsiat.ca)
- CanLII Boolean Search Guide (proximity operators)

### **Implementation Files:**
- `scripts/enhanced-outcome-keywords.js` - 100+ tribunal-specific phrases
- `scripts/re-extract-outcomes-with-notebooklm-patterns.js` - Re-extraction engine
- `scripts/export-unknown-for-notebooklm.js` - Batch 2 export tool
- `docs/NOTEBOOKLM-OUTCOME-EXTRACTION-GUIDE.md` - User guide

---

## 🚀 NEXT STEPS

### **Immediate (Week 1):**
1. ✅ Run re-extraction on ONWSIB 2023 (test case)
2. ✅ Review report for improvement metrics
3. ✅ Validate 50 High confidence matches
4. ✅ Process all tribunals if test successful

### **Short-term (Week 2-3):**
1. Export remaining Unknown decisions (sample of 50 per tribunal)
2. Upload to NotebookLM for Batch 2 pattern discovery
3. Add newly discovered phrases to keyword list
4. Re-run extraction and measure improvement

### **Long-term (Month 1-3):**
1. Contact data@wsiat.ca for Open Data CSV (machine-readable outcomes)
2. Implement CanLII full-text extraction (proximity operators)
3. Build validation pipeline (cross-reference Reconsiderations)
4. Achieve target: <30% Unknown rate for WSIAT/ONSBT/ONHRT

---

## 💡 SUCCESS CRITERIA

✅ **Phase 1 Complete When:**
- ONWSIB Unknown rate drops from 95.7% to ~70%
- WSIAT Unknown rate drops from 94.3% to 50-60%
- ONSBT Unknown rate drops from 95.4% to 40-50%
- False positive rate < 5% (validated via sampling)

✅ **Phase 2 Complete When:**
- NotebookLM Batch 2 identifies 20+ new phrases
- Re-extraction reduces Unknown rate by additional 5-10%
- Confidence distribution: >60% High confidence matches

✅ **Phase 3 Complete When:**
- Bulk data CSV integrated from WSIAT
- CanLII full-text extraction operational
- Final Unknown rate < 30% for WSIAT/ONSBT/ONHRT

---

**🎉 BOTTOM LINE:** NotebookLM revealed that 95% "Unknown" rates were caused by searching for legal language in administrative documents. By adding tribunal-specific administrative phrases, we can improve classification rates by 25-70% across all tribunals.
