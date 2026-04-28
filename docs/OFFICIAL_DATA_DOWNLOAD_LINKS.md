# Official Data Sources Download Report
**Date:** April 27, 2026  
**Status:** Ready for Download

---

## 📥 ONSBT Social Assistance Data

### Direct Download Links

#### 1. ODSP Monthly Caseload (April 2019 - June 2025)
**Format:** CSV (6.6 KB)  
**Resource ID:** `d1fdd536-d79e-4c13-818d-b9492fbf05e9`  
**Direct Link:** https://data.ontario.ca/dataset/social-assistance-caseloads/resource/d1fdd536-d79e-4c13-818d-b9492fbf05e9/download/odsp-monthly-data-en.csv

#### 2. OW Monthly Caseload (April 2019 - June 2025)
**Format:** CSV (6.6 KB)  
**Resource ID:** `1fbf18cd-f473-43cd-9502-49afd0864bc4`  
**Direct Link:** https://data.ontario.ca/dataset/social-assistance-caseloads/resource/1fbf18cd-f473-43cd-9502-49afd0864bc4/download/ow-monthly-data-en.csv

#### 3. Historical Caseload Data (January 1969 - December 2025)
**Format:** XLSX (67.2 KB)  
**Resource ID:** `ebafe1da-3e3b-468d-99c3-d77a7277ae2f`  
**Direct Link:** https://data.ontario.ca/dataset/social-assistance-caseloads/resource/ebafe1da-3e3b-468d-99c3-d77a7277ae2f/download/social-assistance-caseloads-historical-data-en.xlsx  
**🔥 GOLDMINE:** 57 years of data!

#### 4. Case Characteristics by CMA (March 2003 - December 2025)
**Format:** XLSX (549.8 KB)  
**Resource ID:** `44586634-0738-4483-89b9-9cfdd9dc79d0`  
**Direct Link:** https://data.ontario.ca/dataset/ontario-social-assistance-case-characteristics-by-census-metropolitan-area/resource/44586634-0738-4483-89b9-9cfdd9dc79d0/download/characteristics-by-census-metropolitan-area-en.xlsx  
**Fields:** Family type, size, age, gender, duration on assistance, geographic breakdown

---

## 📊 HRTO Open Data

### Available Reports (Tribunals Ontario Open Data Portal)

The HRTO section shows multiple report types available quarterly from Q1 2016-17 to Q3 2025-26:

1. **Activity Report: Decisions Issued** (PRIMARY!)
   - 39 quarterly reports total
   - Coverage: April 2016 - December 2025

2. **Intake Report: Applications Received - Grounds**
   - Discrimination grounds breakdown

3. **Intake Report: Applications Received - Region**
   - Geographic distribution

4. **Intake Report: Applications Received - Social Area**
   - Employment, Housing, Services breakdown

5. **Intake Report: Applications Received - Applicant Representation**
   - Represented vs self-represented

6. **Intake Report: Applications Received - Caseload**
   - Overall volume metrics

**Portal:** https://tribunalsontario.ca/en/about/open-data/  
**Note:** Must click on HRTO tab, then each report title to access quarterly downloads

---

## 📈 AWCBC Statistics (2024)

### Ontario Key Measures

| Measure | Value |
|---------|-------|
| **Lost Time Claims** | 71,781 |
| **Lost Time Injury Frequency** | 1.15 per 100 workers |
| **Fatalities** | 320 |
| **Workforce Coverage** | 76.35% |
| **% off compensation at 90 days** | **84.82%** (key pipeline metric!) |
| **Assessable Payroll** | $289.0 billion |
| **Average Assessment Rate** | $1.30 per $100 payroll |
| **Current Year Benefit Costs** | $0.65 per $100 payroll |
| **Administration Costs** | $0.31 per $100 payroll |
| **Percentage Funded** | 118.95% |
| **Market Rate of Return** | 10.90% |

**Source:** https://awcbc.org/data-and-statistics/key-statistical-measures/ksm-year-at-a-glance  
**Export Options:** Excel, PDF

---

## 🚀 Quick Start Commands

### Download ONSBT Data
```bash
node scripts/download-official-data-sources.js
```

### Manual Download (HRTO Reports)
1. Visit https://tribunalsontario.ca/en/about/open-data/
2. Click "HRTO – Activity report: Decisions Issued"
3. Download all quarterly reports (Q1 2016-17 to Q3 2025-26)

### Export AWCBC Data
1. Visit https://awcbc.org/data-and-statistics/key-statistical-measures/ksm-year-at-a-glance
2. Select year: 2024
3. Click "Export to Excel" button

---

## 📊 Expected Data Volume

| Source | Files | Total Size | Time to Download |
|--------|-------|------------|------------------|
| ONSBT Caseload | 4 files | ~600 KB | <2 minutes |
| HRTO Reports | 39+ files | ~10-20 MB | 10-15 minutes (manual) |
| AWCBC Stats | 1 file | ~100 KB | <1 minute |
| **TOTAL** | **44+ files** | **~20 MB** | **15 minutes** |

---

## 💡 Analysis Priorities

### Immediate (Today)
1. Download ONSBT caseload data → Calculate appeal rates by CMA
2. Export AWCBC 2024 stats → Build claim-to-dispute pipeline infographic

### This Week
1. Download all 39 HRTO quarterly reports → Validate 9,269 decisions
2. Process CMA characteristics → Build geographic heatmap

### Next Week
1. Analyze historical trends (1969-2025 social assistance data)
2. Cross-reference with tribunal decision volumes
3. Identify COVID-19 impact periods

---

## ✅ Next Steps

**Run this command:**
```bash
cd d:\\1-EmpowrApp\\empowrapp-site\\3mpwrapp.github.io-main\\3mpwrapp.github.io-main
node scripts/download-official-data-sources.js
```

**Then manually download:**
- HRTO reports from Tribunals Ontario portal
- AWCBC Excel export (2024 data)

**Expected output:**
```
📥 Downloading Official Data Sources...

📥 Downloading: ODSP Monthly Caseload (April 2019 - June 2025)
✅ Downloaded: onsbt-odsp-monthly-caseload-2019-2025.csv
📥 Downloading: OW Monthly Caseload (April 2019 - June 2025)
✅ Downloaded: onsbt-ow-monthly-caseload-2019-2025.csv
📥 Downloading: Historical Caseload Data (1969-2025) - 57 YEARS!
✅ Downloaded: onsbt-historical-caseload-1969-2025.xlsx
📥 Downloading: Case Characteristics by CMA (2003-2025)
✅ Downloaded: onsbt-case-characteristics-by-cma-2003-2025.xlsx

✅ All downloads complete!
```
