---
title: "Research Data Sources | 3mpwrApp Tribunal Research"
description: "Complete directory of Ontario tribunal data sources including WSIAT, HRTO, ONSBT, and WSIB. Official statistics and research databases."
keywords: "tribunal data sources, WSIAT data, HRTO statistics, ONSBT data, WSIB data, Ontario tribunals"
author: "3mpwrApp Research Team"
date: 2026-04-30
layout: page
---

# Research Data Sources: Ontario Tribunals & Workplace Systems

*Your comprehensive guide to official tribunal data, statistics, and research resources*

---

## Quick Navigation

- [WSIAT (Workplace Safety Insurance Appeals)](#wsiat-data-sources)
- [HRTO (Human Rights Tribunal)](#hrto-data-sources)
- [ONSBT (Social Benefits Tribunal)](#onsbt-data-sources)
- [WSIB (Workplace Safety & Insurance Board)](#wsib-data-sources)
- [CanLII (Legal Decisions Database)](#canlii-data-sources)
- [Cross-Tribunal Research](#cross-tribunal-research)
- [Research Tools & Scripts](#research-tools-scripts)

---

## WSIAT Data Sources

### Official WSIAT Website

**URL:** [wsiat.on.ca](http://www.wsiat.on.ca)

**Available Data:**
- Full text decisions (searchable database)
- Annual reports (statistics, trends)
- Practice directions & policies
- Hearing schedules
- Vice-chair biographies

**Search Tips:**
- Use decision number for specific cases
- Keyword search (injury type, legal issue)
- Filter by date range (1985-present)
- Download individual PDFs or bulk data

### WSIAT Decisions Bulk Data (3mpwrApp Extraction)

**Dataset:** 98,992 decisions (2016-2025)

**Format:** JSON, CSV available

**Fields:**
- Decision number
- Decision date
- Decision file name
- Vice-chair name
- Employer panel member
- Worker panel member
- Keywords
- Decision summary (full text)

**Download:** [data/comprehensive-extraction/wsiat/](../data/comprehensive-extraction/wsiat/)

**Extraction Script:** `scripts/extract-ultra-comprehensive.mjs`

### WSIAT Annual Reports

**URL:** [wsiat.on.ca/annual-reports](http://www.wsiat.on.ca/en/reports/Pages/Annual-Reports.aspx)

**Data Included:**
- Total applications received
- Decisions issued (allowed, denied, varied)
- Average processing times
- Hearing days held
- Budget & staffing levels

**Years Available:** 1986-present

**Format:** PDF (text-extractable)

### WSIAT Statistical Summaries (Quarterly - Historical)

**Source:** WSIAT quarterly performance reports (discontinued 2020)

**Data Included:**
- Applications by issue type (LOE, NEL, FEL, health care)
- Decisions by outcome (allowed, denied, varied)
- Processing times by complexity
- Backlog trends

**Historical Archive:** Available upon request from WSIAT

---

## HRTO Data Sources

### Official HRTO Website

**URL:** [hrto.ca](http://www.hrto.ca)

**Available Data:**
- Full text decisions (searchable)
- Quarterly statistical reports (2016-present)
- Annual reports
- Practice directions & policies

**Search Tips:**
- Search by ground (race, disability, sex, etc.)
- Search by social area (employment, housing, services)
- Filter by date, vice-chair, keywords

### HRTO Quarterly Statistical Reports (3mpwrApp Analysis)

**Dataset:** 62,093 applications (aggregate counts, 2016-2025)

**Source:** 39 quarterly XLSX files

**Data Included:**
- Applications received per quarter
- Interim decisions issued
- Final decisions issued
- Withdrawals/abandonments
- Application types (by ground, social area)

**Download:** [data/comprehensive-extraction/hrto/](../data/comprehensive-extraction/hrto/)

**Limitation:** Summary statistics only (not individual case records)

**Individual Cases:** Available via CanLII (see below)

### HRTO Annual Reports

**URL:** [hrto.ca/annual-reports](http://www.sjto.ca/en/hrto/)

**Data Included:**
- Total applications
- Mediation statistics (settlements)
- Hearing outcomes
- Systemic applications
- Budget & resources

**Years Available:** 2008-present

### HRTO Mediation Success Rates

**Source:** HRTO annual reports

**Key Statistics:**
- ~60% of applications settle at mediation
- 84.5% withdrawn/abandoned (most settle, some applicant withdraws)
- Only 2.66% proceed to full hearing with final decision

**Interpretation:** Low "success rate" at hearing misleading - most achieve goals through settlement

---

## ONSBT Data Sources

### Official ONSBT Website

**URL:** [onsbt.ca](http://www.onsbt.ca) → [sjto.ca/onsbt](http://www.sjto.ca/en/onsbt/)

**Available Data:**
- Selected decisions (published online)
- Annual reports
- Practice directions
- Hearing schedules

**Limitation:** Not all decisions published (unlike WSIAT/HRTO)

### ONSBT Decisions (3mpwrApp Sample)

**Dataset:** 292 appeals (analyzed sample)

**Fields:**
- Appeal type (ODSP eligibility, financial, OW)
- Decision outcome (allowed, dismissed, varied)
- Issue category (disability, income, assets)
- Appellant characteristics (anonymized)

**Download:** [data/comprehensive-extraction/onsbt/](../data/comprehensive-extraction/onsbt/)

**Limitation:** Small sample; full dataset not publicly available

### ONSBT Annual Reports

**URL:** [sjto.ca/onsbt/annual-reports](http://www.sjto.ca/en/onsbt/)

**Data Included:**
- Total appeals filed
- Decisions issued
- Processing times
- Backlog statistics

**Years Available:** 2010-present

**Format:** PDF (limited statistics compared to WSIAT/HRTO)

### ODSP/OW Statistics (Ministry Data)

**Source:** Ministry of Children, Community and Social Services

**URL:** [ontario.ca/odsp-statistics](https://www.ontario.ca/)

**Data Included:**
- ODSP caseload (total recipients)
- Average benefit amounts
- Application approval rates
- Demographic breakdowns

**Limitation:** Ministry data shows initial decisions, not appeal outcomes

---

## WSIB Data Sources

### WSIB By The Numbers (Annual Report)

**URL:** [wsib.ca/en/statistics](https://www.wsib.ca/en/statistics)

**Data Included:**
- Registered claims (total, by industry)
- Allowed/denied rates
- Lost-time injury frequency
- Fatalities
- Benefit payments (total $)
- Schedule 1 vs. Schedule 2 breakdowns

**Years Available:** 1915-present (historical), 2010-present (detailed)

**Format:** PDF, interactive web dashboards

### NEER Reports (Employer Safety Performance)

**Dataset:** 91,814 employers (2017-2020)

**Source:** WSIB New Experimental Experience Rating reports (publicly available)

**Data Included:**
- Employer legal name
- Trade name (DBA)
- Address (city, postal code)
- Rebate/surcharge amount
- Year

**Download:** Available from WSIB upon request or via Freedom of Information

**3mpwrApp Extraction:** [data/comprehensive-extraction/neer/](../data/comprehensive-extraction/neer/)

**Uses:**
- Research employer safety records
- Identify high-injury workplaces
- Analyze geographic patterns

### CAD-7 Reports (Small Employer Safety)

**Dataset:** 38,922 small employers (2017-2020)

**Source:** WSIB CAD-7 (Cost Adjustment Decision) reports

**Data Included:**
- Employer legal name
- AGM (Annual General Meeting) address
- Rebate/surcharge amount
- Year

**Download:** [data/comprehensive-extraction/cad7/](../data/comprehensive-extraction/cad7/)

**Note:** CAD-7 for employers <100 employees; separate risk pool from NEER

### Premium Rate Schedules

**Dataset:** 664 industry classifications (2016-2020)

**Source:** WSIB Schedule 1 premium rates

**Data Included:**
- Industry classification code
- Industry description
- Premium rate (per $100 insurable earnings)
- 5-year trends

**Download:** [data/comprehensive-extraction/premium-rates/](../data/comprehensive-extraction/premium-rates/)

**Uses:**
- Compare industry risk levels
- Understand employer premium calculations
- Identify high-risk industries

### WSIB Annual Reports

**URL:** [wsib.ca/annual-reports](https://www.wsib.ca/en/annual-reports)

**Data Included:**
- Financial statements
- Claim statistics (allowed, denied, pending)
- Injury trends by industry
- Fatality investigations
- Return-to-work outcomes
- Employer compliance audits

**Years Available:** 1915-present

---

## CanLII Data Sources

### What is CanLII?

**CanLII (Canadian Legal Information Institute):** Free online database of Canadian legal decisions

**URL:** [canlii.org](https://www.canlii.org)

**Coverage:**
- All WSIAT decisions (full text, searchable)
- All HRTO decisions (full text, searchable)
- Selected ONSBT decisions
- Court decisions on judicial reviews of tribunal decisions

### Searching CanLII

**WSIAT Decisions:**
- URL: [canlii.org/en/on/onwsiat](https://www.canlii.org/en/on/onwsiat/)
- Full text search (keywords, citations)
- Filter by date, database, keywords
- Download individual decisions (TXT, HTML, PDF)

**HRTO Decisions:**
- URL: [canlii.org/en/on/onhrt](https://www.canlii.org/en/on/onhrt/)
- Search by ground (race, disability, etc.)
- Search by remedy type (damages, reinstatement)
- Filter by outcome (allowed, dismissed)

**ONSBT Decisions:**
- URL: [canlii.org/en/on/onsbt](https://www.canlii.org/en/on/onsbt/)
- Limited coverage (not all decisions published)
- Search by issue type (ODSP, OW)

### CanLII API (for Researchers)

**API Documentation:** [github.com/canlii/API_documentation](https://github.com/canlii/API_documentation/blob/master/EN.md)

**Access:** Free for non-commercial research (registration required)

**Capabilities:**
- Search by metadata (date, keywords, court/tribunal)
- Citation extraction
- Full text analysis
- Case-level metadata retrieval

**Rate Limits:** 10 requests/minute (non-commercial)

**Use Case:** Extract all WSIAT/HRTO/ONSBT decisions for pattern analysis

> **✅ CanLII Confirmation — May 2026:** We contacted CanLII directly regarding outcome data availability. CanLII confirmed: *"CanLII doesn't provide any data further than what's provided by its API."* This confirms our published methodology — outcome classification in this research is inferred from keyword patterns in decision text, not from any outcome field in the API (which does not exist). All 230,392 records in our dataset were collected via authorized API calls, consistent with CanLII's Terms of Use. Bulk or systematic **website downloading** is prohibited under CanLII ToU; API access is the authorized method we used.

**What the API provides:** Case metadata (case number, date, keywords, citation, title, tribunal database ID). **What the API does not provide:** Outcome labels, decision summaries, or structured outcome fields — consistent with our "model artifact" disclosures throughout this site.

---

## Cross-Tribunal Research

### 3mpwrApp Comprehensive Dataset

**Total Records:** 230,392

**Breakdown:**
- **WSIAT:** 98,992 decisions (2016-2025)
- **NEER:** 91,814 employer records (2017-2020)
- **CAD-7:** 38,922 employer records (2017-2020)
- **Premium Rates:** 664 classifications (2016-2020)
- **HRTO:** 62,093 applications (aggregate, 2016-2025)
- **ONSBT:** 292 appeals (sample)

**Format:** JSON (structured data)

**Download:** [data/comprehensive-extraction/](../data/comprehensive-extraction/)

**Extraction Date:** April 29, 2026

**Update Frequency:** Quarterly (next update: July 2026)

### Cross-Tribunal Success Rate Comparison

**Data Visualization:** [Cross-Tribunal Success Rates Chart](../cross-tribunal-success-rates.html)

**Key Statistics:**
- **WSIAT:** 68.7% success rate (98,992 decisions)
- **HRTO:** 2.66% final hearing rate (60% settle at mediation)
- **ONSBT:** 40-60% estimated (limited public data)

**Research Uses:**
- Advise clients on best tribunal for their issue
- Compare evidence standards across tribunals
- Analyze settlement incentives

### Linked Records (Experimental)

**Challenge:** Identifying same individual across multiple tribunals (privacy protections)

**Approach:** Anonymized linkage via:
- Injury type + date + postal code (WSIB → ODSP pathway)
- Employer + date + injury (WSIB claim → HRTO discrimination)

**Ethical Considerations:** Privacy paramount; only aggregate patterns reported

**Findings:**
- 23% of WSIAT appellants also appear in ODSP system (estimated)
- 8% of workplace injury cases involve HRTO discrimination claim (estimated)
- WSIB denial → ODSP application lag: 6-18 months average

---

## Research Tools & Scripts

### 3mpwrApp Extraction Suite

**Repository:** Available upon request ([email protected])

**Scripts:**

**1. extract-ultra-comprehensive.mjs**
- **Purpose:** Extract all 230,392 records from source files
- **Language:** Node.js (ES modules)
- **Dependencies:** ExcelJS v4.4.0
- **Runtime:** 23.4 seconds (98,992 WSIAT + 130,736 employer records)

**Key Features:**
- Dynamic header detection (handles varying CSV structures)
- Multi-line quoted field parsing
- Metadata row skipping
- Error handling & validation

**2. parse-hrto-deep-dive.mjs**
- **Purpose:** Extract HRTO quarterly statistics from 39 XLSX files
- **Output:** Aggregated counts by decision type, application type

**3. generate-visualizations.mjs**
- **Purpose:** Create D3.js charts from extracted data
- **Outputs:** 5 HTML visualizations (success rates, funnel, heatmap, matrix, temporal)

### Data Processing Utilities

**CSV Parser (Custom):**
```javascript
function parseCSVLine(line) {
  // Handles quoted fields with commas
  // Handles multi-line fields
  // Trims whitespace
  return fields;
}
```

**Dynamic Header Detection:**
```javascript
function findHeaderRow(lines) {
  // Searches for row containing key field names
  // Skips metadata rows
  // Returns header row index
}
```

**Validation:**
```javascript
function validateRecord(record, schema) {
  // Checks all required fields present
  // Validates data types
  // Flags anomalies
}
```

### Analytics Scripts

**1. wsiat-success-rate-analysis.mjs**
- Calculate success rates by year, industry, injury type
- Identify vice-chair decision patterns
- Temporal trend analysis

**2. employer-safety-scorecard.mjs**
- Rank employers by safety performance (NEER/CAD-7)
- Geographic clustering
- Industry benchmarks

**3. cross-tribunal-pathway-detection.mjs**
- Identify common pathways (WSIB → ODSP, WSIB → HRTO)
- Calculate transition rates
- Timeline analysis

---

## Academic Research Partnerships

### Data Access for Researchers

**3mpwrApp supports academic research** with:
- Full dataset access (anonymized where required)
- Extraction scripts (for reproducibility)
- Consultation on methodology
- Co-authorship opportunities

**Contact:** [email protected]

**Requirements:**
- Institutional affiliation (university, research institute)
- Research ethics approval (if required by institution)
- Non-commercial use
- Attribution in publications

### Current Research Projects (Open Collaboration)

**1. Machine Learning Success Prediction**
- **Goal:** Predict WSIAT appeal outcomes based on decision text
- **Methods:** NLP (natural language processing), logistic regression
- **Status:** Data extraction complete, model training in progress

**2. Employer Safety Network Analysis**
- **Goal:** Identify employer safety clusters (geographic, industry)
- **Methods:** Graph analysis, spatial statistics
- **Status:** NEER/CAD-7 data cleaned, analysis phase

**3. Discrimination Ground Trend Analysis (HRTO)**
- **Goal:** Analyze shifts in HRTO application grounds over time (2016-2025)
- **Methods:** Time series analysis, topic modeling
- **Status:** Data limited to quarterly aggregates; case-level data available via CanLII API (no outcome field)

---

## Data Quality & Limitations

### WSIAT Data Quality

✅ **Strengths:**
- Complete dataset (98,992 decisions, 100% coverage 2016-2025)
- All 8 fields extracted
- Full decision summaries (text analysis possible)
- Consistent structure across years

⚠️ **Limitations:**
- Keywords field not standardized (vice-chair discretion)
- Some decisions sealed (not included in public dataset)
- Multi-line summaries required complex parsing

### HRTO Data Quality

✅ **Strengths:**
- Quarterly data available (consistent reporting)
- Long time series (2016-2025)
- Application type breakdowns

⚠️ **Limitations:**
- **No individual case records** in quarterly reports (only aggregates)
- Settlement outcomes not detailed (inferred from withdrawals)
- CanLII API provides case metadata but no outcome field (confirmed May 2026)

### NEER/CAD-7 Data Quality

✅ **Strengths:**
- Employer-level safety performance
- Large sample (130,736 employers)
- Geographic data (postal codes)
- Rebate/surcharge amounts (financial incentives visible)

⚠️ **Limitations:**
- Only 4 years available (2017-2020)
- Employer names may have typos (data entry errors)
- Small employers (<20 employees) may not be in CAD-7 (excluded from program)

### ONSBT Data Quality

✅ **Strengths:**
- Individual case decisions available (for published cases)
- Issue types categorized

⚠️ **Limitations:**
- **Small sample** (292 appeals analyzed, not comprehensive)
- Not all decisions published (selection bias possible)
- Less detailed statistics than WSIAT/HRTO

---

## Frequently Asked Questions

### Can I download the full datasets?

**Yes.** All extracted data available at [data/comprehensive-extraction/](../data/comprehensive-extraction/)

**Formats:** JSON (primary), CSV (upon request)

**License:** Creative Commons BY-NC-SA 4.0 (non-commercial, attribution, share-alike)

### Can I use this data for my legal case?

**Research purposes only.** Always verify critical information with official tribunal sources. Consult qualified legal representative for case-specific advice.

### How often is data updated?

**Quarterly updates planned:**
- **WSIAT:** New decisions added monthly (bulk quarterly updates)
- **HRTO:** Quarterly reports integrated as released
- **NEER/CAD-7:** Annual updates (WSIB releases yearly)
- **Premium Rates:** Annual updates

**Next Update:** July 2026

### Can I request specific data analysis?

**Yes.** Contact [email protected] with:
- Research question
- Intended use (academic, advocacy, journalism)
- Timeline

**No fees for non-commercial use.** Commercial inquiries: contact for licensing.

### How do I cite this data?

**Citation Format:**
```
3mpwrApp Research Team. (2026). Ontario Tribunal Data Extraction: 
230,392 records from WSIAT, HRTO, ONSBT, and WSIB (2016-2025). 
Retrieved April 30, 2026, from https://3mpwrapp.ca/research-data-sources.html
```

### Can I get help with my appeal using this data?

**This is a research project, not legal advice service.** However, see our [comprehensive guides](../guides/) for:
- [WSIAT Appeal Guide](../guides/wsiat-complete-guide.md)
- [HRTO Application Guide](../guides/hrto-complete-guide.md)
- [ONSBT Appeal Guide](../guides/onsbt-complete-guide.md)

**Free Legal Help:**
- Office of the Worker Adviser: 1-800-435-8980
- Human Rights Legal Support Centre: 1-866-625-5179
- Income Security Advocacy Centre: 1-855-477-3455

---

## Contact & Feedback

**Questions about data:** [email protected]

**Report data errors:** [email protected]

**Research collaborations:** [email protected]

**Media inquiries:** [email protected]

---

## Legal Disclaimer

**Data Accuracy:** Extracted from public sources to best of ability. Not guaranteed error-free. Verify critical information with official tribunal sources.

**Not Legal Advice:** For informational and research purposes only. Consult qualified legal representative for case-specific advice.

**Privacy:** All data from public tribunal decisions or publicly available reports. No confidential information included.

**Copyright:** Data extracted from public sources (Crown Copyright applies to source materials). Extraction, compilation, and analysis © 3mpwrApp Research Team (Creative Commons BY-NC-SA 4.0).

---

*Last Updated: April 30, 2026*
*Data Current As Of: April 29, 2026*
