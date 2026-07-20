# Tribunal Data Export for App

Generated: 2026-04-26T22:36:49.378Z
Authors: Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot

## Files

- **tribunal-comparison.json** - Summary of all 4 tribunals with Tier A/B/C breakdown
- **onsbt-analysis.json** - ONSBT 13,798 decisions + ODSP poverty context
- **onwsib-analysis.json** - ONWSIB 463 decisions + 3-stage system explanation
- **issue-slices.json** - Cross-tribunal issue analysis (chronic pain, pre-existing, entitlement)

## Usage in App

Copy these files to:
```
empowrapp-new/data/tribunal-decisions/
```

Import in screens:
```typescript
import tribunalComparison from '../../../data/tribunal-decisions/tribunal-comparison.json';
import onsbtAnalysis from '../../../data/tribunal-decisions/onsbt-analysis.json';
import onwsibAnalysis from '../../../data/tribunal-decisions/onwsib-analysis.json';
```

## TypeScript Types

See: `empowrapp-new/types/tribunalData.ts` for interface definitions.

## Data Source

All data derived from CanLII tribunal decisions (2020-2026):
- WSIAT: 98,992 decisions
- HRTO: 9,269 decisions  
- ONSBT: 13,798 decisions
- ONWSIB: 463 decisions

Total: 35,960 tribunal decisions analyzed.
