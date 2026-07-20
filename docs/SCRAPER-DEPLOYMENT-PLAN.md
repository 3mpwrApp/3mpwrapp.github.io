# 🚀 Enhanced Tribunal Scraper Deployment Plan

## ✨ What's New in Enhanced Scrapers

### Features Added:
- ✅ **Outcome parsing from keywords** (no full text needed)
  - Examples: Dismissed, Allowed, Settled, No Jurisdiction
- ✅ **Legislation extraction from keywords**
  - Examples: "Human Rights Code, s. 34(1)", "WSIA, s. 15"
- ✅ **Enhanced disability ground detection**
- ✅ **Data quality metrics per case**

### Performance:
- ⚡ Same speed (15s delay per case)
- 💾 10-20% larger files (still metadata only)
- ⏱️ ~10-12 hours per 1,000 cases

---

## 📁 Scrapers Created

### 1️⃣ scrape-hrto-comprehensive-2020-2026.js
- **Database**: `onhrt` (Human Rights Tribunal of Ontario)
- **Status**: ✅ ENHANCED, ready for 2025-2026
- **Current**: 6,039 cases (2020-2024) complete

### 2️⃣ scrape-onsbt-comprehensive-2020-2026.js
- **Database**: `onsbt` (Social Benefits Tribunal - ODSP appeals)
- **Status**: ✅ NEW, ready to run
- **Value**: ODSP denial patterns, medical evidence standards
- **Expected**: 500-2,000 cases per year

### 3️⃣ scrape-onwsib-comprehensive-2020-2026.js
- **Database**: `onwsib` (WSIB First-Level Decisions)
- **Status**: ✅ NEW, ready to run
- **Value**: Compare to WSIAT appeals (13.31% pre-existing rate)
- **Question**: Is pre-existing rate HIGHER at first level?
- **Expected**: 1,000-5,000 cases per year

---

## 🗓️ Recommended Collection Sequence

### **PHASE 1: Finish Ontario Human Rights** (THIS WEEK)
```bash
# Continue HRTO 2025-2026 collection
# Status: Running now
# ETA: 1-2 days
```

### **PHASE 2: Ontario ODSP Benefits** (WEEKS 2-3)
```bash
cd scripts
node scrape-onsbt-comprehensive-2020-2026.js
```
- **What**: ODSP (disability benefits) denial appeals
- **Why**: Critical for poverty/disability research
- **Time**: 1-2 weeks (500-2,000 cases/year)
- **Value**: Medical evidence standards, benefit denial patterns

### **PHASE 3: Ontario Workers' Comp First-Level** (WEEKS 4-6)
```bash
cd scripts
node scrape-onwsib-comprehensive-2020-2026.js
```
- **What**: WSIB original claim decisions (before appeals)
- **Why**: Compare to WSIAT (13.31% pre-existing in appeals)
- **Time**: 2-3 weeks (1,000-5,000 cases/year)
- **Critical Question**: Is pre-existing rate higher at source?

### **PHASE 4: Test Ontario Labour Board** (WEEK 7)
```bash
# Quick test (2 hours)
# Try database code: onlrb
# If available → collect 2020-2026 (1-2 weeks)
```
- **Value**: Termination after claim patterns
- **Status**: Availability uncertain, needs testing

### **PHASE 5: BC Cross-Provincial** (WEEKS 8-9)
```bash
# BC Workers' Comp
# Clone onwsib script, change database to: bcwcat
# ETA: 3-4 days

# BC Human Rights
# Clone onsbt script, change database to: bchrt
# ETA: 2 days
```
- **Why**: Prove patterns are Canada-wide, not just Ontario
- **Comparison**: BC vs ON pre-existing rates, ODSP vs BC disability

---

## 📊 Enhanced Data Structure Example

```json
{
  "case_id": "2024hrto1111",
  "title": "Babadi v. Amazon Canada Fulfilment Services",
  "citation": "2024 HRTO 1111 (CanLII)",
  "decision_date": "2024-08-07",
  "docket_number": "2023-53832-I",
  "url": "https://canlii.ca/t/k6800",
  
  "keywords_api": [
    "Limitation periods — Human Rights Code, s. 34(1) — One year time limit..."
  ],
  
  "legislation_cited": [
    "Human Rights Code, s. 34(1)",
    "Human Rights Code, s. 11"
  ],
  "legislation_count": 2,
  
  "outcome": "Dismissed - No Violation",
  "has_disability_ground": false,
  
  "data_quality": {
    "has_full_text": false,
    "has_keywords": true,
    "has_outcome": true,
    "has_legislation": true
  },
  
  "tribunal": "Human Rights Tribunal of Ontario",
  "database": "onhrt",
  "scraped_at": "2026-04-18T..."
}
```

---

## ⏱️ Timeline Summary

| Phase | Tribunal | Weeks | Cases | Priority |
|-------|----------|-------|-------|----------|
| 1 | HRTO (finish 2025-2026) | 1 | ~2,000 | CURRENT |
| 2 | ONSBT (ODSP) | 2-3 | 3,500-14,000 | HIGH |
| 3 | ONWSIB (first-level) | 3 | 7,000-35,000 | CRITICAL |
| 4 | OLRB (if available) | 1-2 | TBD | MEDIUM |
| 5 | BC WCAT + HRT | 1 | ~15,000 | HIGH |

**Total Time**: ~9 weeks for complete Ontario + BC collection

---

## 💡 Tips for Collection

1. **Run overnight/weekends** for continuous collection
2. **Monitor progress files** (`.progress-*.json`) to track completion
3. **Check disk space** before starting large collections
4. **Save progress frequently** (auto-saves every 10 cases)
5. **Back up completed years** before moving to next phase

---

## 🎯 Strategic Value

### What This Gives You:

**Ontario Depth:**
- ✅ WSIAT (appeals): 98,992 cases - 13.31% pre-existing
- ✅ HRTO (discrimination): 6,039 cases - rich keywords
- 🆕 ONSBT (ODSP): Disability benefits denial patterns
- 🆕 ONWSIB (first-level): Pre-existing at source vs appeals
- 🆕 OLRB (maybe): Employment termination patterns

**Cross-Provincial Comparison:**
- BC WCAT vs ON WSIAT: Is 13.31% pre-existing Canada-wide?
- BC HRT vs ON HRTO: Discrimination patterns across provinces

**Research Questions Enabled:**
1. Is pre-existing condition denial rate higher at WSIB first-level than WSIAT appeals?
2. What are common reasons for ODSP denial?
3. Do workers get fired after filing claims (OLRB termination data)?
4. Are patterns systemic across Canada or Ontario-specific?

---

## 📝 Next Steps

1. ✅ **Let HRTO 2025-2026 complete** (running now)
2. ⏳ **Start ONSBT collection** (command ready)
3. ⏳ **Start ONWSIB collection** (after ONSBT or parallel)
4. ⏳ **Test OLRB availability** (2 hours)
5. ⏳ **Clone scrapers for BC** (bcwcat, bchrt)

**Ready to start ONSBT when you are!**
