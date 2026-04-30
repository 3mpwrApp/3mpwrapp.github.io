# WSIAT Decision Archive

This directory contains structured data from the Workplace Safety and Insurance Appeals Tribunal (WSIAT) decision archive.

## Directory Structure

```
wsiat/
├── README.md                 # This file
├── wsiat-metadata.json       # Master index of all processed decisions
├── annual-reports/           # WSIAT Annual Reports (PDF)
├── decisions-by-year/        # Structured JSON data organized by year
│   ├── wsiat-86.json
│   ├── wsiat-89.json
│   ├── ...
│   └── wsiat-25.json
└── raw-html/                 # Original HTML files from WSIAT website
    ├── WSIAT - Decision Summary Search8.html
    ├── WSIAT - Decision Summary Search36.html
    └── ...
```

## Data Schema

Each decision JSON file contains an array of decision objects with the following structure:

```json
{
  "decisionNumber": "1209/25",
  "rootNumber": "1209",
  "year": "25",
  "suffix": null,
  "date": "2025-04-29",
  "keywords": ["LOE", "Initial Entitlement"],
  "summary": "Determination of Loss of Earnings benefits for worker...",
  "url": "https://www.wsiat.ca/en/decisions/...",
  "rawText": "Full extracted text..."
}
```

## Decision Number Format

WSIAT uses a Root/Year/Suffix system:

- **Root**: Unique case identifier (e.g., 1209)
- **Year**: Two-digit year suffix (e.g., /25 = 2025)
- **Suffix**: Procedural status indicator
  - `R` = Reconsideration
  - `I` = Interim Decision
  - `L` = Leave to Appeal
  - `E` = Extension of Time
  - `A` = Right to Sue Application

Examples:
- `1209/25` - Regular decision from 2025
- `756/89L` - Leave to Appeal from 1989
- `390/08R` - Reconsideration from 2008

## Processing Workflow

1. **Download**: Save WSIAT decision search pages as HTML to `C:\Users\bookw\Downloads`
2. **Parse**: Run `npm run parse:wsiat` to extract structured data
3. **Catalog**: Decisions automatically organized by year
4. **Index**: Metadata file updated with statistics

## Scripts

- `parse-wsiat-decisions.mjs` - Main parser for HTML files
- Run: `node scripts/parse-wsiat-decisions.mjs`

## Data Sources

- **WSIAT Database**: https://www.wsiat.ca/en/home/opendata_decisions.html
- **CanLII Mirror**: https://www.canlii.org/en/on/onwsiat/
- **Annual Reports**: https://www.wsiat.ca/en/home/annual_reports.html

## Archive Statistics

- **Total Decisions**: 86,000+ (as of 2025)
- **Years Covered**: 1986–Present
- **Metadata Fields**: Keywords, Summaries, Sections of the Act, Board Policies
- **Update Frequency**: Quarterly Open Data CSV exports

## Research Notes

### WSIAT vs BC WCAT Transparency Comparison

| Metric | WSIAT (Ontario) | BC WCAT (British Columbia) |
|--------|-----------------|----------------------------|
| **Total Decisions** | 86,000+ | 7,386 (2020-2026) |
| **Outcome Metadata** | ✅ Yes (Keywords, Summaries) | ❌ No (100% unknown) |
| **Full Text Access** | ✅ CanLII + WSIAT DB | ⚠️ Limited (CanLII only) |
| **Search Functionality** | ✅ Advanced (Boolean, Proximity) | ⚠️ Basic keyword only |
| **Open Data Exports** | ✅ Quarterly CSV | ❌ None |
| **Professional Participants** | ✅ Identified (Chart 10) | ❌ Not tracked |

### Key Legal Issues Tracked

- Loss of Earnings (LOE)
- Non-Economic Loss (NEL)
- Future Economic Loss (FEL)
- Second Injury Enhancement Fund (SIEF)
- Chronic Pain Disability (CPD)
- Hand-Arm Vibration Syndrome (HAVS)
- Traumatic Mental Stress (Section 13)
- Right to Sue (Section 31)
- Significant Deterioration (Section 44)
- Occupational Disease

## Contact

For data access requests or bulk exports:
- Email: data@wsiat.ca
- Website: https://www.wsiat.ca
