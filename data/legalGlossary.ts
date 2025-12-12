/**
 * Legal Glossary System
 * 
 * Provides plain-language definitions for legal, medical, and bureaucratic terms
 * commonly encountered by injured workers and people with disabilities navigating
 * complex systems like workers' compensation, disability insurance, and human rights.
 * 
 * Key features:
 * - Plain language definitions
 * - Acronym expansion
 * - Contextual examples
 * - Related terms
 * - Jurisdiction-specific variations
 */

export interface GlossaryTerm {
  /** The term or acronym */
  term: string;
  /** Full expansion if acronym */
  fullForm?: string;
  /** Plain language definition */
  definition: string;
  /** Even simpler "easy read" version */
  simpleDefinition: string;
  /** Example of how it's used */
  example?: string;
  /** Related terms */
  related?: string[];
  /** Category for filtering */
  category: 'legal' | 'medical' | 'financial' | 'administrative' | 'rights' | 'workplace';
  /** Jurisdiction-specific notes */
  jurisdictionNotes?: Record<string, string>;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  // ============================================
  // WORKERS' COMPENSATION TERMS
  // ============================================
  
  'FAF': {
    term: 'FAF',
    fullForm: 'Functional Abilities Form',
    definition: 'A form completed by your doctor that describes what work tasks you can and cannot do because of your injury or condition. Your employer uses this to determine suitable work duties.',
    simpleDefinition: 'A form where your doctor writes what work you can do with your injury.',
    example: 'Your doctor fills out a FAF saying you can\'t lift more than 10 pounds or stand for more than 30 minutes.',
    related: ['IME', 'Modified duties', 'RTW', 'Accommodation'],
    category: 'workplace',
    jurisdictionNotes: {
      'ON': 'Required by WSIB in Ontario for return-to-work planning.',
      'BC': 'WorkSafeBC uses similar forms called Physician\'s Report.',
    },
  },
  
  'IME': {
    term: 'IME',
    fullForm: 'Independent Medical Examination',
    definition: 'A medical exam done by a doctor chosen by the insurance company or employer—not your own doctor. The examiner writes a report about your condition. Despite the name "independent," this doctor is paid by the other side.',
    simpleDefinition: 'An exam by a doctor hired by the insurance company to check your injury.',
    example: 'The insurance company sent you to an IME, and the doctor said you could return to work, even though your own doctor disagrees.',
    related: ['FAF', 'Appeal', 'Second opinion'],
    category: 'medical',
  },
  
  'WSIB': {
    term: 'WSIB',
    fullForm: 'Workplace Safety and Insurance Board',
    definition: 'Ontario\'s workers\' compensation system. If you\'re injured at work, WSIB provides wage replacement, medical benefits, and return-to-work support. It\'s a no-fault system—you don\'t have to prove your employer was negligent.',
    simpleDefinition: 'Ontario\'s system that helps workers who get hurt at their job.',
    example: 'After your workplace injury, you filed a claim with WSIB to get help with lost wages and medical costs.',
    related: ['WCB', 'Workers\' compensation', 'RTW', 'LOE'],
    category: 'workplace',
    jurisdictionNotes: {
      'ON': 'WSIB is specific to Ontario.',
      'BC': 'British Columbia uses WorkSafeBC instead.',
      'AB': 'Alberta uses WCB (Workers\' Compensation Board).',
    },
  },
  
  'WCB': {
    term: 'WCB',
    fullForm: 'Workers\' Compensation Board',
    definition: 'The agency that handles workplace injury claims in most Canadian provinces (except Ontario, which uses WSIB). Provides similar benefits: wage replacement, medical coverage, and rehabilitation support.',
    simpleDefinition: 'The government agency that helps workers who get hurt on the job.',
    example: 'After falling at work, you called WCB to report your injury and start a claim.',
    related: ['WSIB', 'Workers\' compensation', 'Claim'],
    category: 'workplace',
  },
  
  'WSIAT': {
    term: 'WSIAT',
    fullForm: 'Workplace Safety and Insurance Appeals Tribunal',
    definition: 'The final level of appeal for WSIB decisions in Ontario. If you disagree with a WSIB decision and the internal review didn\'t help, WSIAT is an independent tribunal that makes the final decision.',
    simpleDefinition: 'The place you go to appeal if WSIB says no and you still disagree.',
    example: 'After losing your internal WSIB appeal, you filed an appeal with WSIAT for a final decision.',
    related: ['WSIB', 'Appeal', 'Internal review', 'ARO'],
    category: 'legal',
    jurisdictionNotes: {
      'ON': 'WSIAT is Ontario-specific. Decisions are final and binding.',
    },
  },
  
  'ARO': {
    term: 'ARO',
    fullForm: 'Appeals Resolution Officer',
    definition: 'A WSIB staff member who reviews your case when you disagree with a decision. This is the first level of appeal before going to WSIAT.',
    simpleDefinition: 'A person at WSIB who looks at your case again if you think they made a mistake.',
    related: ['WSIB', 'WSIAT', 'Appeal'],
    category: 'administrative',
  },
  
  'LOE': {
    term: 'LOE',
    fullForm: 'Loss of Earnings',
    definition: 'Benefits paid by workers\' compensation when you can\'t earn as much money as before your injury. Calculated based on the difference between what you earned before and what you can earn now.',
    simpleDefinition: 'Money you get because your injury means you can\'t make as much as before.',
    example: 'Before your injury you earned $4,000/month. Now you can only do light duty work earning $2,500/month. LOE covers part of that $1,500 difference.',
    related: ['WSIB', 'WCB', 'Wage replacement'],
    category: 'financial',
  },
  
  'RTW': {
    term: 'RTW',
    fullForm: 'Return to Work',
    definition: 'The process of going back to work after an injury or illness. This might mean returning to your old job, modified duties, or a completely different job. Your employer has a legal duty to help.',
    simpleDefinition: 'Going back to work after being hurt or sick.',
    example: 'Your RTW plan includes starting with 4-hour shifts and gradually increasing to full-time.',
    related: ['FAF', 'Modified duties', 'Accommodation', 'Gradual return'],
    category: 'workplace',
  },
  
  'Modified duties': {
    term: 'Modified duties',
    fullForm: undefined,
    definition: 'Changed work tasks that match your current abilities while you recover. Your employer should offer you different tasks or reduced hours if you can\'t do your regular job.',
    simpleDefinition: 'Easier work tasks that you can do while you heal.',
    example: 'Instead of lifting boxes, your modified duties include desk work and answering phones.',
    related: ['RTW', 'FAF', 'Accommodation', 'Light duty'],
    category: 'workplace',
  },
  
  // ============================================
  // DISABILITY BENEFITS TERMS
  // ============================================
  
  'CPP-D': {
    term: 'CPP-D',
    fullForm: 'Canada Pension Plan Disability',
    definition: 'A federal benefit for people who can\'t work because of a severe and prolonged disability. You must have contributed to CPP through work and be unable to do any substantially gainful work.',
    simpleDefinition: 'Government money for people whose disability is so serious they can\'t work.',
    example: 'After your chronic condition made it impossible to work any job, you applied for CPP-D.',
    related: ['LTD', 'ODSP', 'AISH', 'Disability benefits'],
    category: 'financial',
  },
  
  'LTD': {
    term: 'LTD',
    fullForm: 'Long-Term Disability',
    definition: 'Insurance that replaces part of your income if you can\'t work for an extended time due to illness or injury. Usually provided through your employer. Definition of "disability" changes over time—first it\'s "own occupation," then "any occupation."',
    simpleDefinition: 'Insurance that pays you when you can\'t work for a long time because of illness or injury.',
    example: 'Your LTD policy pays 60% of your salary while you\'re unable to work due to your back injury.',
    related: ['STD', 'CPP-D', 'Own occupation', 'Any occupation'],
    category: 'financial',
  },
  
  'STD': {
    term: 'STD',
    fullForm: 'Short-Term Disability',
    definition: 'Insurance that covers you for a limited time (usually 15-26 weeks) when you first become too sick or injured to work. After STD runs out, you may transition to LTD.',
    simpleDefinition: 'Temporary help paying bills when you first get too sick to work.',
    related: ['LTD', 'EI sickness', 'Disability benefits'],
    category: 'financial',
  },
  
  'Own occupation': {
    term: 'Own occupation',
    fullForm: undefined,
    definition: 'For the first two years of most LTD policies, you\'re considered disabled if you can\'t do YOUR specific job. This is a more generous definition than "any occupation."',
    simpleDefinition: 'Disability insurance pays if you can\'t do your own job.',
    example: 'As a nurse with a back injury, you qualify under "own occupation" because you can\'t do nursing, even if you could do desk work.',
    related: ['Any occupation', 'LTD', 'Definition change'],
    category: 'legal',
  },
  
  'Any occupation': {
    term: 'Any occupation',
    fullForm: undefined,
    definition: 'After about two years of LTD, the definition often changes: you\'re only disabled if you can\'t do ANY job you\'re qualified for by education, training, or experience. This is when many claims get denied.',
    simpleDefinition: 'After 2 years, insurance only pays if you can\'t do ANY job at all.',
    example: 'Your LTD was cut off at the 2-year mark because the insurer said you could work as a cashier, even though you were a construction worker.',
    related: ['Own occupation', 'LTD', 'Definition change', 'Denial'],
    category: 'legal',
  },
  
  'ODSP': {
    term: 'ODSP',
    fullForm: 'Ontario Disability Support Program',
    definition: 'Ontario\'s provincial disability income support for people with disabilities who are in financial need. Includes monthly income support and health benefits. You must prove you have a substantial disability.',
    simpleDefinition: 'Ontario\'s monthly money help for people with disabilities who need it.',
    related: ['CPP-D', 'AISH', 'Disability benefits'],
    category: 'financial',
    jurisdictionNotes: {
      'ON': 'ODSP is Ontario-specific.',
      'BC': 'BC uses PWD (Persons with Disabilities) designation.',
      'AB': 'Alberta uses AISH (Assured Income for the Severely Handicapped).',
    },
  },
  
  'AISH': {
    term: 'AISH',
    fullForm: 'Assured Income for the Severely Handicapped',
    definition: 'Alberta\'s financial support program for adults with permanent disabilities that substantially limit their ability to earn a living. Provides monthly income and health benefits.',
    simpleDefinition: 'Alberta\'s monthly money help for people with serious disabilities.',
    related: ['ODSP', 'CPP-D', 'Disability benefits'],
    category: 'financial',
    jurisdictionNotes: {
      'AB': 'AISH is Alberta-specific.',
    },
  },
  
  'ADL': {
    term: 'ADL',
    fullForm: 'Activities of Daily Living',
    definition: 'Basic self-care activities like bathing, dressing, eating, toileting, and moving around. Insurance and benefits often assess how your disability affects your ADLs to determine eligibility.',
    simpleDefinition: 'Everyday tasks like getting dressed, eating, and bathing.',
    example: 'Your disability claim was approved because you need help with ADLs like bathing and cooking.',
    related: ['Functional abilities', 'FAF', 'Assessment'],
    category: 'medical',
  },
  
  // ============================================
  // HUMAN RIGHTS & ACCOMMODATION TERMS
  // ============================================
  
  'OHRC': {
    term: 'OHRC',
    fullForm: 'Ontario Human Rights Commission',
    definition: 'The agency that promotes and enforces the Ontario Human Rights Code. They provide education about discrimination and can intervene in important cases. Complaints go to the Human Rights Tribunal.',
    simpleDefinition: 'Ontario\'s agency that fights discrimination and protects your rights.',
    related: ['HRTO', 'Human Rights Code', 'Discrimination', 'Accommodation'],
    category: 'rights',
    jurisdictionNotes: {
      'ON': 'OHRC is Ontario-specific.',
      'Federal': 'For federal matters, use the Canadian Human Rights Commission (CHRC).',
    },
  },
  
  'HRTO': {
    term: 'HRTO',
    fullForm: 'Human Rights Tribunal of Ontario',
    definition: 'The legal body where you file complaints if you\'ve been discriminated against in Ontario. They hold hearings and can order remedies like compensation or policy changes.',
    simpleDefinition: 'Where you go in Ontario to report discrimination and get help.',
    related: ['OHRC', 'Human Rights Code', 'Discrimination', 'Application'],
    category: 'rights',
  },
  
  'Duty to accommodate': {
    term: 'Duty to accommodate',
    fullForm: undefined,
    definition: 'Your employer\'s legal obligation to make changes to your job or workplace so you can work despite your disability. They must accommodate you unless it causes them "undue hardship." This is a human right, not a favor.',
    simpleDefinition: 'Your employer must change things so you can work with your disability.',
    example: 'Under the duty to accommodate, your employer provided an ergonomic chair and flexible breaks for your chronic pain.',
    related: ['Undue hardship', 'Accommodation', 'Modified duties', 'OHRC'],
    category: 'rights',
  },
  
  'Undue hardship': {
    term: 'Undue hardship',
    fullForm: undefined,
    definition: 'The only reason an employer can refuse to accommodate you. They must prove the accommodation would cause significant difficulty or expense—not just inconvenience. This is a high bar to meet.',
    simpleDefinition: 'The employer\'s excuse for not helping you—but they have to prove it\'s really, really hard.',
    example: 'Your employer claimed undue hardship but couldn\'t prove that buying a $500 special chair would hurt the business.',
    related: ['Duty to accommodate', 'Accommodation', 'Discrimination'],
    category: 'rights',
  },
  
  'Accommodation': {
    term: 'Accommodation',
    fullForm: undefined,
    definition: 'Changes made to help you work or access services despite your disability. Examples: modified hours, special equipment, remote work, physical changes to the workspace, job restructuring.',
    simpleDefinition: 'Changes your employer makes so you can do your job with your disability.',
    example: 'Your accommodations include a standing desk, screen reader software, and permission to work from home twice a week.',
    related: ['Duty to accommodate', 'Undue hardship', 'Modified duties', 'FAF'],
    category: 'rights',
  },
  
  // ============================================
  // APPEAL & LEGAL PROCESS TERMS
  // ============================================
  
  'Reconsideration': {
    term: 'Reconsideration',
    fullForm: undefined,
    definition: 'Asking the same decision-maker to look at your case again, usually with new information or pointing out errors. This is typically the first step before a formal appeal.',
    simpleDefinition: 'Asking them to look at your case again because you think they made a mistake.',
    example: 'You requested a reconsideration of your CPP-D denial, including a new letter from your specialist.',
    related: ['Appeal', 'Internal review', 'Decision'],
    category: 'legal',
  },
  
  'Internal review': {
    term: 'Internal review',
    fullForm: undefined,
    definition: 'A review of a decision done within the same organization that made it. For example, a different WSIB officer reviewing another officer\'s decision. Usually required before you can go to an external tribunal.',
    simpleDefinition: 'When the same organization checks their own decision.',
    example: 'Before appealing to WSIAT, you must complete an internal review with WSIB.',
    related: ['Reconsideration', 'Appeal', 'ARO'],
    category: 'legal',
  },
  
  'Appeal': {
    term: 'Appeal',
    fullForm: undefined,
    definition: 'A formal request for a higher authority to review and change a decision you disagree with. Appeals have strict deadlines—missing them can mean losing your right to challenge the decision.',
    simpleDefinition: 'Officially asking someone higher up to change a decision you think is wrong.',
    example: 'You have 30 days to appeal your LTD denial. If you miss this deadline, you may lose your right to appeal.',
    related: ['Reconsideration', 'Tribunal', 'Deadline', 'Internal review'],
    category: 'legal',
  },
  
  'Tribunal': {
    term: 'Tribunal',
    fullForm: undefined,
    definition: 'A specialized legal body that hears specific types of disputes. Less formal than court but still makes legally binding decisions. Examples: WSIAT for workers\' comp, HRTO for discrimination, LAT for insurance disputes.',
    simpleDefinition: 'A special kind of court for certain types of disagreements.',
    example: 'Your workers\' compensation appeal will be heard by the WSIAT tribunal.',
    related: ['Appeal', 'WSIAT', 'HRTO', 'Hearing'],
    category: 'legal',
  },
  
  'Limitation period': {
    term: 'Limitation period',
    fullForm: undefined,
    definition: 'The deadline for taking legal action or filing an appeal. After this time passes, you usually can\'t pursue your claim. Periods vary: WSIB appeals (6 months), HRTO applications (1 year), lawsuits (often 2 years).',
    simpleDefinition: 'The deadline to file your complaint or appeal. Miss it and you might lose your rights.',
    example: 'The limitation period for your human rights complaint is one year from the discrimination.',
    related: ['Appeal', 'Deadline', 'Filing'],
    category: 'legal',
  },
  
  // ============================================
  // MEDICAL & ASSESSMENT TERMS
  // ============================================
  
  'Longitudinal medical records': {
    term: 'Longitudinal medical records',
    fullForm: undefined,
    definition: 'Your medical history over time—not just recent records. Decision-makers want to see how your condition developed, how treatments worked, and how it affects you over months or years.',
    simpleDefinition: 'Your full medical history showing how your condition changed over time.',
    example: 'The tribunal asked for longitudinal medical records going back three years to understand your chronic condition.',
    related: ['Medical records', 'Clinical notes', 'Treatment history'],
    category: 'medical',
  },
  
  'Prognosis': {
    term: 'Prognosis',
    fullForm: undefined,
    definition: 'Your doctor\'s prediction about how your condition will progress—whether you\'ll get better, stay the same, or get worse. Important for long-term disability claims.',
    simpleDefinition: 'What your doctor thinks will happen with your health in the future.',
    example: 'Your doctor\'s prognosis says your back condition is permanent with expected gradual decline.',
    related: ['Diagnosis', 'Treatment plan', 'Permanent impairment'],
    category: 'medical',
  },
  
  'Diagnosis': {
    term: 'Diagnosis',
    fullForm: undefined,
    definition: 'The medical identification of your condition or disease. You need a formal diagnosis from a qualified healthcare provider for most disability claims.',
    simpleDefinition: 'The official name of what\'s wrong with you, decided by your doctor.',
    example: 'Your diagnosis of fibromyalgia supports your disability claim.',
    related: ['Prognosis', 'Assessment', 'Medical opinion'],
    category: 'medical',
  },
  
  'FCE': {
    term: 'FCE',
    fullForm: 'Functional Capacity Evaluation',
    definition: 'A detailed test, usually done by a physiotherapist or occupational therapist, that measures what physical tasks you can actually do—lifting, standing, sitting, etc. Often used to determine work abilities.',
    simpleDefinition: 'A test to see what physical things you can and can\'t do.',
    example: 'The FCE showed you can only lift 5 pounds and can\'t sit for more than 20 minutes.',
    related: ['FAF', 'Assessment', 'Physical abilities', 'Work capacity'],
    category: 'medical',
  },
  
  // ============================================
  // ADDITIONAL COMMON TERMS
  // ============================================
  
  'Adjudicator': {
    term: 'Adjudicator',
    fullForm: undefined,
    definition: 'The person who makes decisions on your claim or appeal. They review the evidence and decide if you qualify for benefits.',
    simpleDefinition: 'The person who decides yes or no on your claim.',
    related: ['Decision-maker', 'Tribunal', 'Case manager'],
    category: 'administrative',
  },
  
  'Claimant': {
    term: 'Claimant',
    fullForm: undefined,
    definition: 'You—the person making a claim for benefits or compensation.',
    simpleDefinition: 'The person asking for help or money (that\'s you!).',
    related: ['Applicant', 'Plaintiff'],
    category: 'legal',
  },
  
  'Denial letter': {
    term: 'Denial letter',
    fullForm: undefined,
    definition: 'The written notice saying your claim was rejected. Important: it should explain WHY and tell you how to appeal. Keep this letter—you\'ll need it.',
    simpleDefinition: 'A letter saying they said no to your claim.',
    example: 'Your denial letter says you don\'t meet the "any occupation" test and gives you 30 days to appeal.',
    related: ['Appeal', 'Reconsideration', 'Decision'],
    category: 'administrative',
  },
  
  'Entitlement': {
    term: 'Entitlement',
    fullForm: undefined,
    definition: 'What you have a legal right to receive. Once your claim is approved, you\'re entitled to specific benefits.',
    simpleDefinition: 'What you have a right to get.',
    example: 'Your entitlement includes wage replacement at 85% of your pre-injury earnings.',
    related: ['Benefits', 'Eligibility', 'Claim'],
    category: 'legal',
  },
};

/**
 * Get a term definition by key
 */
export function getTerm(key: string): GlossaryTerm | undefined {
  return GLOSSARY[key] || GLOSSARY[key.toUpperCase()] || 
    Object.values(GLOSSARY).find(t => 
      t.term.toLowerCase() === key.toLowerCase() ||
      t.fullForm?.toLowerCase() === key.toLowerCase()
    );
}

/**
 * Search glossary by keyword
 */
export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.toLowerCase();
  return Object.values(GLOSSARY).filter(term =>
    term.term.toLowerCase().includes(q) ||
    term.fullForm?.toLowerCase().includes(q) ||
    term.definition.toLowerCase().includes(q) ||
    term.simpleDefinition.toLowerCase().includes(q)
  );
}

/**
 * Get all terms in a category
 */
export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return Object.values(GLOSSARY).filter(term => term.category === category);
}

/**
 * Get related terms
 */
export function getRelatedTerms(termKey: string): GlossaryTerm[] {
  const term = getTerm(termKey);
  if (!term?.related) return [];
  
  return term.related
    .map(r => getTerm(r))
    .filter((t): t is GlossaryTerm => t !== undefined);
}

/**
 * Expand acronym if it exists
 */
export function expandAcronym(acronym: string): string | undefined {
  const term = getTerm(acronym);
  return term?.fullForm;
}

/**
 * Get all acronyms
 */
export function getAllAcronyms(): GlossaryTerm[] {
  return Object.values(GLOSSARY).filter(term => term.fullForm !== undefined);
}
