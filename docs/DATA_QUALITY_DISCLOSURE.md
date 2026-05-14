# Data Quality & Methodology Disclosure
**3mpwrApp Ontario Legal Intelligence System**

**Last Updated:** May 13, 2026  
**Production Audit Date:** May 13, 2026

---

## Overview

This document provides complete transparency about data quality, limitations, and methodology for all tribunal decision data and knowledge base content served through 3mpwrApp.

---

## Data Sources

### Primary Source: CanLII API
- **Database:** Canadian Legal Information Institute (CanLII)
- **Access Method:** Authorized API calls (metadata only)
- **Collection Period:** 2020-2026
- **Total Records:** 38,000+ tribunal decisions across 6 Ontario tribunals

### Alternative Sources
- **WSIAT:** Official tribunal website (wsiat.on.ca) for supplementary data
- **HRTO:** Quarterly statistical reports (hrto.ca)
- **WSIB:** Annual reports ("By The Numbers"), NEER/CAD-7 employer data
- **OLRB:** Official tribunal website (olrb.gov.on.ca)

---

## Data Quality by Tribunal

| Tribunal | Records | Data Integrity Score | Status | Known Limitations |
|----------|---------|---------------------|--------|-------------------|
| **WSIAT** | 11,430 | 95/100 (after May 13 fix) | ✅ READY | Outcomes: 77% unclear from keyword analysis |
| **ONSBT** | 13,798 | 95/100 | ✅ READY | Outcomes: 34.3% unclear |
| **HRTO** | 7 years | 75/100 | ⚠️ PARTIAL | Outcomes: 95%+ unclear (aggregate stats only) |
| **ONCA** | 7 years | 72/100 | ⚠️ PARTIAL | Outcomes: 95%+ unclear |
| **OLRB** | 2020-2024 | 65/100 | ⚠️ INCOMPLETE | Missing 2025-2026 data |
| **ONWSIB** | 2024-2026 only | 45/100 | ⚠️ INCOMPLETE | Missing 2020-2023 (43% historical gap) |

**Updated:** May 13, 2026 after emergency data quality audit

---

## Outcome Classification Methodology

### ⚠️ CRITICAL LIMITATION: Keyword-Based Classification

**Method:** Pattern matching on CanLII API keyword fields  
**Accuracy:** Variable by tribunal (see below)  
**Human Review:** Minimal (sample validation only)

### WSIAT Outcome Accuracy

**From 11,430 analyzed cases (2020-2026):**
- **Clear Outcomes:** 393 cases (3.4%)
  - Allowed: 285 (2.5%)
  - Partial: 65 (0.6%)
  - Denied: 43 (0.4%)
  - Win Rate (Clear Cases): 89.1%
- **Procedural/Other:** 2,151 cases (18.8%)
- **Unclear:** 8,806 cases (77.0%)

**⚠️ What "Unclear" Means:**
- Outcome language is ambiguous in tribunal text
- Keywords don't match extraction patterns
- Procedural vs substantive decision unclear
- NOT an indication case was lost/won

**Success Rate Calculation:**
- Knowledge base claims: Based on 393 clear cases only (89.1% win rate)
- Does NOT represent all 11,430 cases
- Actual WSIAT system-wide success rate unknown from this data

### ONSBT Outcome Accuracy

**From 13,798 analyzed cases (2020-2026):**
- **Clear Outcomes:** 8,071 cases (56.4%)
  - Allowed: 7,983 (55.8%)
  - Denied: 88 (0.6%)
  - Win Rate (Clear Cases): 98.9%
- **Unclear:** 4,906 cases (34.3%)

### ONWSIB Outcome Accuracy

**From 463 analyzed cases (2024-2026 only):**
- **Clear Outcomes:** 20 cases (4.3%)
- **Unresolved:** 443 cases (95.7%)

**Critical Gap:** 2020-2023 data completely absent (43% historical coverage missing)

---

## Knowledge Base Accuracy

### Case Counts

**All guides updated May 13, 2026** with corrected case counts:

| Condition | Cases Analyzed | Prevalence | Data Source |
|-----------|---------------|------------|-------------|
| Pre-Existing Conditions | 1,522 | 13.3% | WSIAT keyword: "pre-existing" |
| PTSD/Mental Health | 611 | 5.3% | WSIAT keywords: "PTSD", "anxiety", "depression", "mental health" |
| Low Back Pain | 390 | 3.4% | WSIAT keywords: "low back", "lumbar" |
| Chronic Pain | 349 | 3.0% | WSIAT keyword: "chronic pain" |

**Previous Error (Corrected May 13):**
- ❌ Low back pain was incorrectly claimed as "62% of appeals" → **False by 1,821%**
- ✅ Corrected to 3.4% (390 of 11,430 cases)

### Citation Traceability

**Current Status:** ~20% of knowledge base statements have explicit source citations  
**Target:** ≥90% citation rate  
**Improvement Plan:** Add case number citations in Phase 2 enhancement

---

## Known Data Gaps

### OLRB (Ontario Labour Relations Board)
- **Missing:** 2025-2026 decisions
- **Reason:** Data collection incomplete
- **Status:** Scraping resumption planned

### ONWSIB (WSIB Internal Reviews)
- **Missing:** 2020-2023 decisions (43% of historical period)
- **Reason:** Data extraction failure or limited public availability
- **Status:** Backfill investigation in progress

### Outcome Extraction
- **HRTO:** 95%+ outcomes unknown
- **ONCA:** 95%+ outcomes unknown  
- **OLRB:** 90%+ outcomes unknown
- **Reason:** Requires full-text analysis (CanLII API provides metadata only)
- **Status:** Phase 2 enhancement (full-text extraction from official tribunal websites)

---

## Disability Rights Context

### Current Status
**Knowledge base guides focus primarily on injured workers navigating WSIB appeals.**

### Planned Enhancement (Phase 2)
Add explicit disability rights framework to all guides:
- Canadian Charter of Rights and Freedoms (Section 7, Section 15)
- Ontario Human Rights Code (OHRC) protections
- Accessibility for Ontarians with Disabilities Act (AODA)
- Duty to accommodate in employment context
- Systemic discrimination patterns

**Rationale:** Content should serve injured workers AND broader disability community (per 3mpwr mission).

---

## Update History

| Date | Change | Impact |
|------|--------|--------|
| **May 13, 2026** | Emergency audit + critical fixes | Fixed WSIAT URLs/dates, corrected false prevalence claims, added disclaimers |
| April 26, 2026 | Tier classification system | Generated A/B/C confidence tiers for outcome predictions |
| April 10, 2026 | Initial knowledge base | Published 12 injury-specific guides based on WSIAT analysis |

---

## For App Store Reviewers

### Production Readiness (May 13, 2026)

**Data Quality:**
- ✅ 95% of WSIAT records have valid URLs and dates (post-fix)
- ✅ ONSBT dataset production-ready (95/100 integrity score)
- ✅ All false statistical claims removed
- ⚠️ Some tribunals have incomplete outcome data (documented above)

**Known Limitations:**
- Outcome classification based on keyword patterns (77% WSIAT unclear)
- OLRB missing recent data (2025-2026)
- ONWSIB missing historical data (2020-2023)
- Knowledge base citations need expansion (20% → 90% target)

**Ongoing Quality Assurance:**
- Daily validation of new data ingestion
- Monthly audits of knowledge base accuracy
- User feedback loop for error reporting
- Quarterly data refresh from tribunal sources

### Disclaimer Shown to Users

All knowledge base guides include:
> ⚠️ **Data Quality Note:** This analysis is based on keyword pattern matching of tribunal decision text. Not all outcomes could be definitively classified. Success rates calculated from clearly classified cases only and may not represent all appeals.

---

## Contact for Data Issues

**Report Data Errors:**  
Within app: Settings → Report Issue → Data Quality  
Email: [Pending app submission]  
GitHub: [Repository pending public release]

**Last Audit:** May 13, 2026  
**Next Scheduled Audit:** June 13, 2026  
**Audit Frequency:** Monthly during first 6 months post-launch
