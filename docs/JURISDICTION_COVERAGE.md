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

## Status Summary (Data Verification: Oct 2025)
| Code | Workplace Injury | Human Rights Deadline | Key Programs Included | Data Completeness | Notes |
|------|------------------|-----------------------|-----------------------|-------------------|-------|
| FED  | (Provincial)     | 12 mo (federal sector)| CPP-D, EI-SICK, ACA-COMP | ✅ Complete      | Federal programs + ACA workflow |
| ON   | WSIB (3 levels)  | 12 mo (OHRT)          | ODSP, WSIB-RTW        | ✅ Complete      | Full appeal structure documented |
| BC   | WorkSafeBC (2 levels) | 12 mo            | PWD                   | ✅ Complete      | Review Division → WCAT structure added |
| AB   | WCB Alberta (2 levels) | 12 mo           | AISH                  | ✅ Complete      | DRDRB → Appeals Commission added |
| SK   | WCB Saskatchewan (2 levels) | 12 mo      | SAID                  | ✅ Complete      | Review → Appeals Tribunal added |
| MB   | WCB Manitoba (2 levels) | 12 mo          | EIA-PWD               | ✅ Complete      | Review → Appeal Commission added |
| QC   | CNESST (2 levels) | 24 mo (CDPDJ)        | RQAP-MAT              | ✅ Complete      | Révision → TAT structure added (French) |
| NB   | WorkSafeNB (1 level) | 12 mo             | EIAPWD                | ✅ Complete      | Appeals Tribunal structure added |
| NS   | WCB Nova Scotia (2 levels) | 12 mo       | ESIA-PWD              | ✅ Complete      | Reconsideration → WCAT added |
| PE   | WCB PEI (2 levels) | 12 mo               | SAS-PWD               | ✅ Complete      | Internal Review → Appeal Tribunal added |
| NL   | WorkplaceNL (2 levels) | 12 mo           | ISP-PWD               | ✅ Complete      | Review → Appeals Tribunal added |
| YT   | Yukon WCHSB (2 levels) | 18 mo HR         | SAS-PWD               | ✅ Complete      | Review → Appeals Tribunal added |
| NT   | WSCC (2 levels)   | 24 mo HR              | IAP-PWD               | ✅ Complete      | Shared NT/NU system documented |
| NU   | WSCC (2 levels)   | 24 mo HR              | IAP-PWD               | ✅ Complete      | Shared NT/NU system documented |

**Status Update:**
- ✅ **All 14 jurisdictions now complete** with workplace injury appeal structures, human rights info, and benefit programs
- All jurisdictions have 1-3 tier appeal processes documented
- All have initial claim forms and typical deadlines
- All have at least one benefit program documented
- QC has longest human rights deadline (24 months) due to CDPDJ process
- NT and NU share WSCC system with identical appeal structure
- Forms, deadlines, and links added for all jurisdictions

## Data Completeness Summary

### ✅ All Jurisdictions Now Complete (Oct 2025)

All 14 Canadian jurisdictions now have comprehensive data including:

**Workplace Injury Coverage:**
- Initial claim forms documented for all WCBs/WSCC/CNESST
- Appeal structures: 1-3 tiers per jurisdiction
  - Single tier: NB (Appeals Tribunal only)
  - Two tiers: BC, AB, SK, MB, QC, NS, PE, NL, YT, NT, NU
  - Three tiers: ON (Internal Review → Appeals Services Division → WSIAT)
- Typical deadlines documented (ranging from 21-150 days depending on jurisdiction)
- Direct links to official WCB websites

**Human Rights Coverage:**
- All jurisdictions have human rights commission/tribunal info
- Complaint deadlines: 12 months (most provinces), 18 months (YT), 24 months (QC, NT, NU)
- Direct links to human rights bodies

**Benefit Programs:**
- All jurisdictions now have at least one disability benefit program documented
- Federal: CPP-D, EI-SICK, ACA-COMP (3 programs)
- Provincial/Territorial: ODSP, AISH, SAID, PWD, EIA-PWD, RQAP-MAT, EIAPWD, ESIA-PWD, SAS-PWD, ISP-PWD, IAP-PWD
- Key forms, evidence tips, and links included for all programs

### Future Enhancement Priorities

**High Priority:**
1. **Federal ACA (Accessible Canada Act) workflow**: Add detailed complaint and appeal process for federal sector accessibility violations
2. **Quebec bilingual content**: Add French translations for all QC jurisdiction fields (currently mixed EN/FR)
3. **Form attachments**: Link to downloadable PDF versions of all claim forms
4. **Evidence templates**: Create jurisdiction-specific evidence checklist templates

**Medium Priority:**
5. **Appeal success rates**: Research and document typical success rates at each appeal level
6. **Legal representation**: Add info on free legal clinics and representation options per jurisdiction
7. **Processing times**: Document typical decision timelines for each WCB/commission
8. **Special programs**: Add veterans' benefits, Indigenous-specific programs where applicable

**Lower Priority:**
9. **Legislative references**: Add specific statute citations (Workers' Compensation Acts, Human Rights Codes)
10. **Historical changes**: Version tracking for legislative updates
11. **Multi-jurisdiction cases**: Guidance for workers with claims in multiple provinces
12. **Intersectionality**: Enhanced guidance for multiple protected grounds (disability + race, gender, etc.)

### Data Quality Achieved

Each jurisdiction now includes:
- ✅ Human rights body name, URL, complaint deadline
- ✅ Workplace injury board name and website
- ✅ Initial claim form(s) with form numbers
- ✅ Complete appeal level structure (1-3 tiers)
- ✅ Typical deadlines for each appeal tier
- ✅ Accommodation guidance principles
- ✅ Evidence focus areas
- ✅ At least one provincial/territorial disability benefit program
- ✅ Key forms and evidence tips for benefit programs
- ✅ Limitation notes with all critical deadlines

## Integration Plan
- Rights Checker: display jurisdiction-specific “Evidence Focus” + “Key Deadlines” panel
- Resources Filters: new filters by `jurisdiction` and `benefitProgram` codes
- Advocacy Coach: suggest evidence items based on `evidenceFocus` for selected jurisdiction
- Admin Metrics: province usage counts (derive from user profile province) – future

### Current Integration Status (Oct 2025)
- ✅ **All 14 jurisdictions data complete**: FED + 10 provinces + 3 territories with full appeal structures, forms, deadlines, and benefit programs
- ✅ React store: `store/jurisdiction.tsx` provides selected jurisdiction with AsyncStorage persistence
- ✅ UI component: `JurisdictionPanel` integrated into Advocacy hub (`app/(tabs)/advocacy/index.tsx` and `app/(tabs)/advocacy/self-advocacy-coach.tsx`)
- ✅ Displays: Evidence focus, accommodation guidance, limitation notes per jurisdiction
- ✅ User interaction: "Change" button cycles through all jurisdictions
- ✅ Resource model extended (`types/models.ts`) with `jurisdictions?: string[]` for future multi-code tagging
- ✅ Validation tests (`__tests__/jurisdictions.*.test.ts`) ensure structural integrity and data schema compliance
- ✅ All jurisdictions have complete workplace injury appeal paths (1-3 tiers each)
- ✅ All jurisdictions have human rights commission data with confirmed deadlines
- ✅ All jurisdictions have at least one disability benefit program documented
- ✅ All WCB/WSCC/CNESST systems have initial claim forms and typical deadlines

**Implementation Roadmap:**
- 🔄 **In Progress**: Integrate into Rights Checker flow with jurisdiction-specific deadline warnings
- 📋 **Planned**: Resource filtering logic by jurisdiction code (enable users to filter resources by province/territory)
- 📋 **Planned**: Analytics tracking of jurisdiction selection and usage patterns (which provinces most used)
- 📋 **Planned**: Smart suggestions in Advocacy Coach based on jurisdiction-specific evidence requirements
- 📋 **Planned**: Deadline calculator showing days remaining for appeals based on decision dates
- 📋 **Planned**: Form helper tool suggesting which forms needed based on situation
- 📋 **Future**: Multi-language support (French for QC, Inuktitut for NU, etc.)
- 📋 **Future**: Push notifications for approaching deadline milestones

## Open Questions
- Should we version jurisdiction data (e.g., for legislative changes)?
- Strategy for citing official sources inside UI (tooltips vs external links)?

## Summary for User Guide
- Canada‑wide: We align with UNCRPD and the Charter’s equality rights. Federal ACA sets accessibility duties for federal sector bodies.
- Provincial: Every province/territory has a human rights act/code and a workers’ compensation board with its own forms, deadlines, and appeal routes.
- In the app: Choose your province in Settings to see relevant tools, deadlines, and templates. Rights Checker and Resources reflect your selection.

PRs welcome—expand entries, add sources, refine guidance.
