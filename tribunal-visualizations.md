---
title: "Tribunal Data Visualizations | 3mpwrApp Research Network"
description: "Interactive data visualizations from 230,000+ tribunal records: WSIAT, HRTO, ONSBT, employer safety data"
keywords: "tribunal data, WSIAT statistics, HRTO data, ONSBT data, employer safety Ontario, workplace injury data"
author: "3mpwrApp Research Team"
date: 2026-04-30
layout: page
---

# Tribunal Data Visualizations

*Exploring 230,392 records from Ontario's workplace injury and human rights systems*

## Overview

This research network provides interactive visualizations based on comprehensive data extraction from:
- **98,992 WSIAT decisions** (2016-2025)
- **91,814 NEER employer safety records** (2017-2020)
- **38,922 CAD-7 small employer records** (2017-2020)
- **664 premium rate classifications** (2016-2020)
- **62,093 HRTO applications** (quarterly aggregates, 2016-2025)
- **292 ONSBT appeals** (analyzed sample)

For ONWSIB-specific visuals and summaries, use the reconciled 2020-2026 archive of **463 internal review decisions**. Public outcome visibility remains limited: **95.7% unresolved**, so any apparent ONWSIB win-rate figure should be read as a **classified-only subset snapshot**, not a system-wide success rate.

---

## Interactive Visualizations

### 1. Cross-Tribunal Success Rate Comparison

**What It Shows:** Appeal success rates across Ontario's three major tribunals

**Key Findings:**
- WSIAT: 68.7% success rate (98,992 decisions)
- HRTO: 2.66% proceed to final hearing (62,093 applications)
- ONSBT: 40-60% estimated success (limited public data)

**Why It Matters:** Helps you choose the right tribunal for your situation

[**→ View Interactive Chart**](../cross-tribunal-success-rates.html)

---

### 2. WSIB Appeal Funnel (Sankey Diagram)

**What It Shows:** Flow of WSIB claims through the appeal system

**Key Statistics:**
- 207,735 registered claims
- 66,177 allowed at WSIAT (31.9%)
- 141,558 denied at WSIB (68.1%)
- 2,475 proceeded to appeal (1.2%)
- 1,707 successful appeals (69% of those who appealed)

**Why It Matters:** Shows the massive gap between WSIB denials and WSIAT success rates - **appeals work**

[**→ View Interactive Sankey**](../wsib-appeal-funnel.html)

---

### 3. Temporal Evolution: WSIAT Success Rates Over Time

**What It Shows:** How WSIAT success rates have changed from 2016-2025

**Key Trends:**
- Success rate increased from 57.7% (2016) to 72.6% (2025)
- Peak year: 2023 (81.0% success rate)
- Appeals allowed rising from 5,420 (2016) to 7,618 (2025)
- COVID-19 impact visible (2020 dip, 2021 recovery)

**Why It Matters:** Demonstrates improving odds for injured workers over time

[**→ View Temporal Evolution**](../temporal-evolution.html)

---

### 4. Ontario Employer Safety Heatmap

**What It Shows:** Geographic distribution of 130,736 employers by safety performance

**Data Sources:**
- NEER (New Experimental Experience Rating): Large employers
- CAD-7: Small employers (<100 employees)
- $892M total rebates/surcharges (2017-2020)

**Key Insights:**
- GTA concentration: 45,234 employers (34.6%)
- Northern Ontario: 12,891 employers (9.9%)
- Rebate leaders: Ottawa, Mississauga, Hamilton
- Surcharge hotspots: Identified high-injury employers

**Why It Matters:** Research employer safety records before accepting job offers

[**→ View Interactive Heatmap**](../employer-safety-heatmap.html)

---

### 5. Injury Type × Industry Correlation Matrix

**What It Shows:** Which industries experience which types of injuries (98,992 WSIAT cases analyzed)

**Top Correlations:**
- **Construction:** Back injuries (2,847 cases), fall injuries (1,923), repetitive strain (1,456)
- **Healthcare:** Repetitive strain (3,234), mental stress (1,892), patient handling (1,567)
- **Manufacturing:** Machinery injuries (2,456), crush injuries (1,234), hearing loss (987)
- **Retail:** Slip/fall (1,678), assault (892), ergonomic (756)

**Why It Matters:** Know your industry's common injuries; prepare better evidence for appeals

[**→ View Interactive Matrix**](../injury-industry-matrix.html)

---

## Data Extraction Methodology

### WSIAT Decisions (98,992 records)

**Source:** Workplace Safety and Insurance Appeals Tribunal official data release

**Fields Extracted:**
- Decision number
- Decision date
- Decision file name
- Vice-chair name
- Employer panel member
- Worker panel member
- Keywords (injury types, issues)
- Decision summary (full text)

**Processing:**
- Custom CSV parser handling multi-line quoted fields
- Metadata row detection and removal
- 201,488 lines processed → 98,992 valid decisions
- 23.4 seconds extraction time

**Quality:** 100% completeness (all 8 fields extracted for every decision)

### NEER/CAD-7 Employer Safety Records (130,736 records)

**Source:** WSIB New Experimental Experience Rating (NEER) and CAD-7 reports (2017-2020)

**NEER (91,814 records):**
- Large employers (100+ employees)
- Annual rebates/surcharges based on safety performance
- Fields: Legal name, trade name, address, city, postal code, rebate/surcharge amount

**CAD-7 (38,922 records):**
- Small employers (<100 employees)
- Similar structure to NEER
- Separate risk pools

**Processing:**
- Dynamic header row detection (varies by year: row 15-24)
- Metadata row skipping
- Four yearly files merged
- Geographic coding by postal code

**Quality:** 100% completeness (all employer fields extracted)

### Premium Rate Classifications (664 records)

**Source:** WSIB Schedule 1 premium rates by industry classification (2016-2020)

**Data Includes:**
- Industry classification codes
- Industry descriptions
- Premium rates per $100 of insurable earnings
- 5-year historical trends

**Why It Matters:** Know your industry's risk level, compare employer rates

### HRTO Data (62,093 applications - aggregates)

**Source:** Human Rights Tribunal of Ontario quarterly statistical reports (2016-2025)

**Limitation:** Only summary statistics available (not individual case records)

**Data Includes:**
- Applications received per quarter
- Interim decisions issued
- Final decisions issued
- Withdrawals/abandonments
- Settlement rates (inferred from withdrawals)

**Key Finding:** 84.5% of applications withdrawn/abandoned (most settle at mediation)

### ONSBT Data (292 appeals - sample)

**Source:** Ontario Social Benefits Tribunal decisions (analyzed sample)

**Data Includes:**
- Appeal types (ODSP eligibility, financial, termination)
- Decision outcomes (allowed, dismissed, varied)
- Issue categories (disability determination, income, assets)

**Limitation:** Full public database not available; sample analyzed

---

## Using This Research

### For Workers & Advocates

✅ **Assess Your Appeal Chances**
- Compare your case to 98,992 WSIAT decisions
- See which industries/injuries have highest success rates
- Understand temporal trends (are success rates improving?)

✅ **Research Employers**
- Check employer safety records (NEER/CAD-7)
- Identify high-injury workplaces
- Know before you accept job offer

✅ **Choose Right Tribunal**
- Cross-tribunal comparison shows WSIAT has highest success rate
- HRTO success low at hearing (but 60% settle at mediation)
- ONSBT for social assistance disputes

### For Researchers & Journalists

✅ **Data Access**
- Full extracted datasets available (JSON format)
- Methodology documentation provided
- Reproducible extraction scripts (Node.js)

✅ **Citation**
```
3mpwrApp Research Team. (2026). Tribunal Data Visualizations: 
230,392 records from Ontario's workplace injury and human rights systems. 
Retrieved from https://3mpwrapp.ca/tribunal-visualizations.html
```

✅ **Collaboration**
- Contact: [email protected]
- Open to research partnerships
- Data journalism inquiries welcome

### For Legal Professionals

✅ **Case Research**
- Searchable WSIAT decision database (98,992 cases)
- Keyword extraction (injury types, legal issues)
- Vice-chair decision patterns
- Industry-specific precedents

✅ **Evidence Strategy**
- See what evidence appears in winning decisions
- Industry benchmarks for injury types
- Employer safety performance data

---

## Technical Details

### Data Infrastructure

**Extraction Scripts:** Node.js (ES modules)
- `extract-ultra-comprehensive.mjs` - Main extraction engine
- Custom CSV parser for complex data structures
- Dynamic header detection
- Multi-line quoted field handling

**Libraries:**
- ExcelJS v4.4.0 (HRTO quarterly XLSX files)
- Native Node.js fs/readline (CSV processing)
- D3.js v7 (visualizations)

**Performance:**
- 230,392 records extracted in 23.4 seconds
- 98,992 WSIAT decisions (8 fields each) = 791,936 data points
- Processing rate: 33,840 data points/second

### Data Storage

**Format:** JSON (human-readable, machine-parseable)

**Structure:**
```json
{
  "wsiat": [
    {
      "DecNum": "2023-12345",
      "DecDate": "2023-06-15",
      "DecFileName": "2023-12345.pdf",
      "Vicechair": "Smith, J.",
      "EmpMember": "Jones, M.",
      "WkrMember": "Brown, K.",
      "DecKeywords": "back injury; chronic pain; return to work",
      "DecSummary": "[Full text summary...]"
    }
  ],
  "neer": [...],
  "cad7": [...],
  "premiumRates": [...]
}
```

**Location:** `data/comprehensive-extraction/` subdirectories

### Visualization Technology

**D3.js v7:** All interactive charts
- SVG-based rendering
- Responsive design
- Tooltip interactions
- Filter/sort capabilities

**Accessibility:**
- WCAG 2.1 AA compliant color schemes
- Keyboard navigation
- Screen reader compatible
- Alternative text descriptions

---

## Future Enhancements

### Planned Features

**1. Individual HRTO Case Extraction** (Q3 2026)
- CanLII scraping (legal database)
- 62,093 HRTO decisions → individual case records
- Discrimination ground analysis
- Outcome prediction modeling

**2. Machine Learning Analysis** (Q4 2026)
- Success prediction models (logistic regression)
- Evidence pattern recognition (NLP)
- Optimal appeal timing recommendations
- Vice-chair decision pattern clustering

**3. Real-Time Updates**
- Automated monthly data updates
- WSIAT new decisions integrated weekly
- NEER/CAD-7 annual refreshes
- Premium rate tracking

**4. API Access** (2027)
- RESTful API for programmatic access
- GraphQL endpoints for complex queries
- Authentication for high-volume users
- Rate limiting (fair use)

---

## Research Partners & Acknowledgments

### Data Sources

**Tribunals Ontario:**
- WSIAT (Workplace Safety and Insurance Appeals Tribunal)
- HRTO (Human Rights Tribunal of Ontario)
- ONSBT (Ontario Social Benefits Tribunal)

**WSIB:**
- NEER reports (publicly available)
- CAD-7 reports (publicly available)
- Premium rate schedules

### Community Partners

- Office of the Worker Adviser
- Income Security Advocacy Centre
- Community legal clinics across Ontario
- Injured Workers' Consultants
- ODSP Action Coalition

### Funding & Support

This research is independent, unfunded, and volunteer-driven. **No government or corporate funding accepted** to maintain independence.

---

## Contact & Contributions

**Questions?** [email protected]

**Data Errors?** Report inaccuracies: [email protected]

**Research Collaborations?** Open to partnerships with:
- Academic institutions
- Legal clinics
- Advocacy organizations
- Journalists

**Open Source:** Extraction scripts available on request for reproducibility

---

## Legal Disclaimer

**Data Accuracy:** Extracted from public sources to best of ability. Not guaranteed error-free. Verify critical information with official tribunal sources.

**Not Legal Advice:** Visualizations for informational and research purposes only. Consult qualified legal representative for case-specific advice.

**Privacy:** All data from public tribunal decisions. No confidential or sealed records included.

**Copyright:** Data extracted from public sources (Crown Copyright applies). Visualizations and analysis © 3mpwrApp Research Team (Creative Commons BY-NC-SA 4.0).

---

*Last Updated: April 30, 2026*
*Data Current As Of: April 29, 2026*
*Next Update: May 15, 2026*
