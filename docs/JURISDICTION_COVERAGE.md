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

## Status Summary (Initial Skeleton)
| Code | Workplace Injury | Human Rights Deadline | Key Programs Included | Notes |
|------|------------------|-----------------------|-----------------------|-------|
| FED  | (Provincial)     | 12 mo (federal sector)| CPP-D, EI-SICK, ACA   | Add Accessible Canada Act workflow details |
| ON   | WSIB + WSIAT     | 12 mo                 | ODSP, WSIB-RTW        | Add detailed WSIB objection timelines |
| BC   | WorkSafeBC       | 12 mo                 | PWD                   | Add Review Division + WCAT levels |
| AB   | WCB Alberta      | 12 mo                 | AISH                  | Add DRDRB/Appeals Commission path |
| SK   | WCB Saskatchewan | 12 mo                 | SAID                  | Confirm appeal deadlines |
| MB   | WCB Manitoba     | 12 mo                 | —                     | Add disability income (EIA disability) |
| QC   | CNESST           | TBD (≈12 mo)          | —                     | Confirm CNESST & human rights deadlines |
| NB   | WorkSafeNB       | 12 mo                 | —                     | Add appeals sequence |
| NS   | WCB Nova Scotia  | 12 mo                 | —                     | Add Review / WCAT path |
| PE   | WCB PEI          | 12 mo                 | —                     | Add appeal commission details |
| NL   | WorkplaceNL      | 12 mo                 | —                     | Add review & appeal tribunal data |
| YT   | Yukon WCHSB      | 18 mo HR              | —                     | Confirm workplace appeal tiers |
| NT   | WSCC (NT/NU)     | 24 mo HR              | —                     | Add appeals path |
| NU   | WSCC (NT/NU)     | 24 mo HR              | —                     | Add appeals path |

## Next Data Fill Priorities
1. Add missing appeal level structures (BC, AB, QC, etc.)
2. Populate detailed deadlines (objection, reconsideration, tribunal filing windows)
3. Add key forms (worker, employer, functional abilities) per board
4. Benefit program evidence tips for each provincial disability income program
5. Human rights limitation confirmation (source citations) – add `sources` field extension
6. Add bilingual (EN/FR) field variants for QC and federal entries (future i18n design)
7. Accessibility/Accommodation frameworks per province (link to statute and guidance pages)
8. Add mapping for episodic disabilities and chronic illness accommodation examples

## Integration Plan
- Rights Checker: display jurisdiction-specific “Evidence Focus” + “Key Deadlines” panel
- Resources Filters: new filters by `jurisdiction` and `benefitProgram` codes
- Advocacy Coach: suggest evidence items based on `evidenceFocus` for selected jurisdiction
- Admin Metrics: province usage counts (derive from user profile province) – future

### Current Integration Status (Oct 2025)
- Jurisdiction data schema & JSON assets populated (federal + all provinces/territories stubs)
- React store: `store/jurisdiction.tsx` provides selected jurisdiction with persistence
- UI: `JurisdictionPanel` integrated into Advocacy hub displaying evidence focus & accommodation principles
- Resource model extended (`types/models.ts`) with `jurisdictions?: string[]` for future multi-code tagging
- Validation test (`__tests__/jurisdictions.data.test.ts`) ensures structural integrity for core jurisdictions
- Pending: integrate into rights checker flow, resource filtering logic, attach metrics, populate remaining deadline/appeal data

## Open Questions
- Should we version jurisdiction data (e.g., for legislative changes)?
- Strategy for citing official sources inside UI (tooltips vs external links)?

## Summary for User Guide
- Canada‑wide: We align with UNCRPD and the Charter’s equality rights. Federal ACA sets accessibility duties for federal sector bodies.
- Provincial: Every province/territory has a human rights act/code and a workers’ compensation board with its own forms, deadlines, and appeal routes.
- In the app: Choose your province in Settings to see relevant tools, deadlines, and templates. Rights Checker and Resources reflect your selection.

PRs welcome—expand entries, add sources, refine guidance.
