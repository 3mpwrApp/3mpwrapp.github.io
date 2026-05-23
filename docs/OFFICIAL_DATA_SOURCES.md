# Official Data Sources - Breakthrough Discovery

## Summary
Discovered official government/tribunal data sources that bypass CanLII DataDome entirely!

**Impact:** Can access 95,298+ WSIAT decisions (vs 11,430 on CanLII) + structured datasets for all tribunals

---

## 1. WSIAT - Official Decision Search 🎯

**URL:** https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp

**Status:** ✅ PUBLIC SEARCH FORM

**Coverage:**
- **95,298 decisions available** (8.3x more than CanLII!)
- Searchable by: date range, decision number, keywords, panel, references
- Includes noteworthy decisions and summarized decisions
- Decision metadata: number, date, keywords, summary, style of cause, neutral citation

**Scraper:** `scripts/scrape-wsiat-official-search.js`

**Advantages:**
- No bot detection (government website)
- Structured search form
- Direct access to all decisions (not just keyword-matched)
- Can filter by outcome indicators

**Next Steps:**
1. Test search form scraping (2020-2026)
2. Extract decision numbers and metadata
3. Fetch full decision text by decision number
4. Run outcome detection on full text

---

## 2. WSIB - Open Data Catalogue

**URL:** https://www.wsib.ca/en/open-data-catalogue

**Status:** ⚠️ MIXED (Some datasets restricted)

**Available Datasets:**

### A. WSIAT Database
- **URL:** https://www.wsib.ca/en/open-data/wsiat-database
- **Status:** 🚫 RESTRICTED (Legal/contractual limitations)
- **Content:** Decision numbers, decision-maker, outcomes
- **Rationale:** "Information contained within the database is confidential pertaining to workers appeals with WSIAT"

### B. Individual Claim-Level Data
- **URL:** https://www.wsib.ca/en/open-data/wsib-individual-claim-level-data
- **Status:** 🚫 RESTRICTED (Privacy exemption)
- **Content:** Personal identifiers, claim details
- **Update:** Monthly

### C. Summarized Claim Data
- **URL:** https://www.wsib.ca/en/open-data/summarized-claim-related-data
- **Status:** Check if publicly available
- **Content:** Aggregated claim statistics

### D. Freedom of Information Request Summary
- **URL:** https://www.wsib.ca/en/open-data/freedom-information-request-summary
- **Status:** Check if publicly available
- **Content:** FOI request statistics

### E. CAD-7 Rebate/Surcharge List
- **URL:** https://www.wsib.ca/en/open-data/cad-7-rebate-surcharge-annual-issue-list
- **Status:** Check if publicly available
- **Content:** Employer rebate/surcharge data

**Alternate Portal:** https://www.wsibopendata.ca/ (mentioned but not detailed)

---

## 3. Tribunals Ontario - Open Data

**URL:** https://tribunalsontario.ca/en/aboutopen-data/

**Status:** ✅ QUARTERLY REPORTS AVAILABLE (CSV/Excel)

**Available Datasets:**

### A. HRTO - Activity Report: Decisions Issued
- **Format:** Quarterly Excel/CSV
- **Content:** Number of decisions issued by quarter
- **Coverage:** 2016-present

### B. HRTO - Intake Reports
- **Formats:** Multiple reports available
- **Topics:**
  - Applications Received – Applicant representation
  - Applications Received – Caseload
  - Applications Received – Grounds (discrimination grounds)
  - Applications Received – Region
  - Applications Received – Social Area
- **Coverage:** 2016-present

### C. HRTO - Key Performance Indicators
- **URL:** https://tribunalsontario.ca/en/aboutkey-performance-indicators/hrto-key-performance-indicators/
- **Archive:** https://tribunalsontario.ca/en/aboutkey-performance-indicators/hrto-key-performance-indicators/hrto-key-performance-indicators-archive/
- **Content:** Operational metrics, timeliness, outcomes

### D. SBT - Appeals Received
- **Format:** Quarterly reports
- **Content:** Number of appeals received
- **Coverage:** 2016-present

**Scraper Needed:** CSV downloader + parser for quarterly reports

---

## 4. Ontario Open Data - Social Assistance

**URLs:**
- https://data.ontario.ca/en/dataset/social-assistance-caseloads
- https://data.ontario.ca/en/dataset/ontario-social-assistance-case-characteristics-by-census-metropolitan-area

**Status:** ✅ PUBLIC DATASETS

**Content:**
- Social assistance caseload statistics
- Case characteristics by region (census metropolitan area)
- Demographic breakdowns

**Relevance:** Contextual data for ONSBT cases (SBT = Social Benefits Tribunal)

**Format:** CSV/Excel downloads from Ontario Data Catalogue

---

## Comparison: Official vs CanLII

| Source | WSIAT | HRTO | ONSBT | ONWSIB |
|--------|-------|------|-------|--------|
| **CanLII** | 11,430 | 9,269 | 13,798 | 431 |
| **Official** | 95,298 🎯 | Quarterly stats | Quarterly stats | Claim data (restricted) |
| **Improvement** | **+733%** | Statistical reports | Statistical reports | N/A |

**Total:** 34,928 (CanLII) → **95,298+** (Official sources)

---

## Implementation Strategy

### Phase 1: WSIAT Official Search (Immediate) ⭐
1. ✅ Created: `scrape-wsiat-official-search.js`
2. Test search form with single year (2020)
3. If successful, scrape 2020-2026 (7 years)
4. Extract decision numbers + metadata
5. Fetch full decision text
6. Run outcome detection

**Expected:** 95,298 decisions with structured metadata

### Phase 2: Tribunals Ontario Data (Week 2)
1. Download HRTO quarterly reports (2016-2026)
2. Parse Excel/CSV files
3. Extract: applications received, decisions issued, outcomes
4. Download SBT quarterly reports
5. Aggregate statistics by year

**Expected:** 10 years of quarterly statistics for HRTO + SBT

### Phase 3: Ontario Open Data (Week 3)
1. Download social assistance caseload datasets
2. Link to ONSBT decisions by region/time period
3. Create contextual analysis

### Phase 4: WSIB Open Data Investigation (Week 4)
1. Check https://www.wsibopendata.ca/ for publicly available datasets
2. Test access to summarized claim data
3. Document what's available vs restricted

---

## Why This Is Better Than CanLII

1. **No DataDome Protection** - Government sites don't use enterprise bot detection
2. **More Complete Data** - 95,298 WSIAT decisions vs 11,430 on CanLII
3. **Structured Metadata** - Search forms provide clean data extraction
4. **Official Source** - First-party data directly from tribunals
5. **Statistical Context** - Quarterly reports provide trends and patterns
6. **Legal/Ethical** - Public government data, designed for access

---

## Immediate Action Plan

**Run Now:**
```bash
node scripts/scrape-wsiat-official-search.js
```

**Expected Output:**
- `wsiat-official-2020.json` through `wsiat-official-2026.json`
- `wsiat-official-2020-2026.json` (consolidated)
- Decision numbers, dates, keywords, outcomes

**Time Estimate:** ~30-45 minutes (7 years × 3-second delays)

**After Success:**
1. Analyze data quality
2. Fetch full decision text if needed
3. Run outcome detection
4. Update blog content with new statistics
5. Deploy updated visualizations

---

## Notes

- WSIAT official search form is ASP.NET-based (may require form tokens)
- Tribunals Ontario reports are direct downloads (no scraping needed)
- WSIB open data portal may have more datasets not listed on main page
- Consider contacting WSIB Data Governance (data_governance@wsib.on.ca) for access to restricted datasets for research purposes

---

**Created:** April 27, 2026  
**Status:** Ready to test WSIAT scraper  
**Priority:** HIGH - This solves the DataDome problem entirely
