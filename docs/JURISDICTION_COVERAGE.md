# Jurisdiction Coverage (Canada)

Scope: All disabilities, injuries, illnesses, workplace accommodations, and related protections across Canada. Coverage includes Canada‑wide frameworks and every province/territory.

Foundations and legal anchors

- UNCRPD: United Nations Convention on the Rights of Persons with Disabilities (ratified by Canada). Guides accessibility, non‑discrimination, and accommodation principles.
- Canadian Charter of Rights and Freedoms (Constitution Act, 1982): Equality rights (s.15) inform non‑discrimination baselines.
- Accessible Canada Act (federal) and provincial accessibility/human rights statutes (e.g., AODA in Ontario, AMA in Manitoba, etc.).
- Human rights codes/acts per jurisdiction: complaint timelines and remedies.
- Workers’ compensation boards per jurisdiction: workplace injury/illness benefits, return‑to‑work duties, appeals.

## Data Model
See `types/jurisdiction.ts` for:
- Workplace injury boards (claim forms, appeal levels)
- Human rights bodies (deadlines)
- Benefit programs (income supports, RTW services)
- Accommodation guidance (principles)
- Evidence focus (prioritized document types)
- Limitation notes (deadlines / escalation windows)
 - Coverage scope: disabilities, injuries, chronic illnesses, episodic conditions, and workplace accommodations
 - Sources: citations and last‑updated timestamps per field

## Status Summary (Data Verification: Jan 2025)
| Code | Workplace Injury | Human Rights Deadline | Key Programs Included | Data Completeness | Next Steps |
|------|------------------|-----------------------|-----------------------|-------------------|------------|
| FED  | (Provincial)     | 12 mo (federal sector)| CPP-D, EI-SICK, ACA-COMP | ✅ Complete      | Add Accessible Canada Act workflow details |
| ON   | WSIB (3 levels)  | 12 mo (OHRT)          | ODSP, WSIB-RTW        | ✅ Complete      | Add detailed form numbers & objection templates |
| BC   | WorkSafeBC       | 12 mo                 | PWD                   | ⚠️ Partial       | Add Review Division → WCAT appeal structure + forms |
| AB   | WCB Alberta      | 12 mo                 | AISH                  | ⚠️ Partial       | Add DRE/impairment + appeals process + forms |
| SK   | WCB Saskatchewan | 12 mo                 | SAID                  | ⚠️ Partial       | Add appeal path structure + forms |
| MB   | WCB Manitoba     | 12 mo                 | —                     | ⚠️ Partial       | Add appeal path + forms; research disability income programs |
| QC   | CNESST           | TBD (≈12 mo)          | —                     | ⚠️ Partial       | Add Administrative Review → TAT process + forms; confirm HR deadline; research benefit programs |
| NB   | WorkSafeNB       | 12 mo                 | —                     | ⚠️ Partial       | Add appeal levels + forms; research benefit programs |
| NS   | WCB Nova Scotia  | 12 mo                 | —                     | ⚠️ Partial       | Add appeal path + forms; research benefit programs |
| PE   | WCB PEI          | 12 mo                 | —                     | ⚠️ Partial       | Add appeal levels + forms; research benefit programs |
| NL   | WorkplaceNL      | 12 mo                 | —                     | ⚠️ Partial       | Add review & appeal tribunal structure + forms; research benefit programs |
| YT   | Yukon WCHSB      | 18 mo HR              | —                     | ⚠️ Partial       | Add workplace appeal tiers + forms; research benefit programs |
| NT   | WSCC (NT/NU)     | 24 mo HR              | —                     | ⚠️ Partial       | Add appeals path + forms; research benefit programs |
| NU   | WSCC (NT/NU)     | 24 mo HR              | —                     | ⚠️ Partial       | Verify shared NT/NU board details; research benefit programs |

**Legend:**
- ✅ Complete: Has workplace injury appeal structure, human rights info, and benefit programs documented
- ⚠️ Partial: Has human rights deadline and basic structure, but missing appeal paths, forms, or benefit programs

## Next Data Fill Priorities

### High Priority (Core Provinces - 80% of population)
1. **Ontario (ON)**: Add specific form numbers for WSIB objections and appeal templates
2. **Quebec (QC)**: 
   - Confirm human rights filing deadline with CDPDJ
   - Add CNESST appeal structure (Administrative Review → TAT)
   - Research provincial disability benefit programs
3. **British Columbia (BC)**: Add WorkSafeBC Review Division → WCAT appeal structure + key forms
4. **Alberta (AB)**: Add WCB DRE/impairment process and Appeals Commission path + key forms

### Medium Priority (Western Provinces)
5. **Saskatchewan (SK)**: Add WCB appeal path structure and claim forms
6. **Manitoba (MB)**: 
   - Add WCB appeal path and forms
   - Research Employment and Income Assistance disability programs

### Lower Priority (Atlantic & Territories)
7. **Atlantic Provinces (NB, NS, PE, NL)**: 
   - Add appeal level structures for all 4 WCB systems
   - Add key claim and appeal forms
   - Research provincial disability income programs
8. **Territories (YT, NT, NU)**: 
   - Add WSCC (NT/NU shared board) appeal structure and forms
   - Add Yukon WCHSB appeal tiers and forms
   - Research territorial disability support programs

### Cross-Cutting Data Needs
- **All jurisdictions**: Populate initial claim forms, functional abilities forms, employer accident reports
- **All jurisdictions**: Add typical deadlines (objection: 30-90 days, reconsideration: 6-12 months)
- **All jurisdictions**: Add evidence tips for benefit programs where documented
- **Quebec & Federal**: Add bilingual (EN/FR) field variants for future i18n

### Data Quality Standards
Each jurisdiction should have:
- ✅ Human rights body name, URL, complaint deadline
- ✅ Workplace injury board name
- ⚠️ **Missing**: Initial claim form(s) with numbers/links
- ⚠️ **Missing**: Appeal level structure (1-3 tiers typical)
- ⚠️ **Missing**: Typical deadlines for each appeal level
- ✅ Accommodation guidance principles
- ✅ Evidence focus areas
- ⚠️ **Partially Missing**: Provincial disability benefit programs (only 5/14 jurisdictions have data)

## Integration Plan
- Rights Checker: display jurisdiction-specific “Evidence Focus” + “Key Deadlines” panel
- Resources Filters: new filters by `jurisdiction` and `benefitProgram` codes
- Advocacy Coach: suggest evidence items based on `evidenceFocus` for selected jurisdiction
- Admin Metrics: province usage counts (derive from user profile province) – future

### Current Integration Status (Jan 2025)
- ✅ Jurisdiction data schema & JSON assets populated for all 14 jurisdictions (FED + 10 provinces + 3 territories)
- ✅ React store: `store/jurisdiction.tsx` provides selected jurisdiction with AsyncStorage persistence
- ✅ UI component: `JurisdictionPanel` integrated into Advocacy hub (`app/(tabs)/advocacy/index.tsx` and `app/(tabs)/advocacy/self-advocacy-coach.tsx`)
- ✅ Displays: Evidence focus, accommodation guidance, limitation notes per jurisdiction
- ✅ User interaction: "Change" button cycles through all jurisdictions
- ✅ Resource model extended (`types/models.ts`) with `jurisdictions?: string[]` for future multi-code tagging
- ✅ Validation tests (`__tests__/jurisdictions.*.test.ts`) ensure structural integrity and data schema compliance
- ✅ All jurisdictions have human rights commission data with deadlines
- ⚠️ **Partial**: Only FED and ON have complete workplace injury appeal paths
- ⚠️ **Partial**: Only 5/14 jurisdictions have benefit programs documented

**Pending Implementation:**
- Integrate into Rights Checker flow with jurisdiction-specific deadline warnings
- Resource filtering logic by jurisdiction code
- Analytics: Track jurisdiction selection and usage patterns
- Populate remaining appeal paths, deadlines, and forms for 12 jurisdictions
- Add benefit program research for 9 jurisdictions missing income support data

## Open Questions
- Should we version jurisdiction data (e.g., for legislative changes)?
- Strategy for citing official sources inside UI (tooltips vs external links)?

## Summary for User Guide
- Canada‑wide: We align with UNCRPD and the Charter’s equality rights. Federal ACA sets accessibility duties for federal sector bodies.
- Provincial: Every province/territory has a human rights act/code and a workers’ compensation board with its own forms, deadlines, and appeal routes.
- In the app: Choose your province in Settings to see relevant tools, deadlines, and templates. Rights Checker and Resources reflect your selection.

PRs welcome—expand entries, add sources, refine guidance.
