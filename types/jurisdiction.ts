export interface AppealLevel {
  name: string;              // e.g. "Internal Review", "Appeal Tribunal"
  body: string;              // adjudicating body or board
  typicalDeadlineDays?: number; // filing deadline (days) if known
  notes?: string;            // nuance (extensions, exceptions)
}

export interface BenefitProgram {
  code: string;              // e.g. CPP-D, EI-SICK, ODSP
  name: string;
  administeringBody: string; // agency or ministry
  description: string;
  keyForms?: string[];       // form identifiers
  evidenceTips?: string[];   // evidence list suggestions
  appealPath?: string[];     // references to appeal levels or bodies
  links?: { label: string; url: string; }[];
}

export interface HumanRightsBody {
  name: string;
  complaintDeadlineMonths?: number; // filing deadline from incident
  url?: string;
  notes?: string;
}

export interface WorkplaceInjuryBoard {
  name: string;              // e.g. WSIB (Ontario)
  initialClaimForm?: string; // form code/name
  appealLevels?: AppealLevel[];
  links?: { label: string; url: string; }[];
  notes?: string;
}

export interface JurisdictionData {
  code: string;              // Province/Territory or FED
  name: string;
  workplaceInjury?: WorkplaceInjuryBoard;
  humanRights?: HumanRightsBody;
  benefitPrograms?: BenefitProgram[];
  accommodationGuidance?: string[];  // key accommodation principles
  evidenceFocus?: string[];          // prioritized evidence types
  limitationNotes?: string[];        // additional limitation/deadline notes
  updated?: string;                  // ISO date last content update
}

export interface JurisdictionIndex {
  federal: JurisdictionData;
  provinces: JurisdictionData[];
}
