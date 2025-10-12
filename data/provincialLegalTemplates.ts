
export interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: 'accommodation' | 'appeal' | 'complaint' | 'employment' | 'housing' | 'healthcare' | 'education' | 'transportation' | 'government-services';
  complexity: 'basic' | 'intermediate' | 'advanced';
  timeToComplete: string;
  requiredInfo: string[];
  template: string;
  legalBasis: string[];
  relatedLaws: string[];
  deadlines?: {
    description: string;
    timeframe: string;
    consequences: string;
  }[];
  tips: string[];
  resources: {
    title: string;
    description: string;
    url?: string;
    phone?: string;
  }[];
}

// Comprehensive provincial legal templates
export const provincialLegalTemplates: LegalTemplate[] = [
  // British Columbia Templates
  {
    id: 'bc-employment-accommodation',
    title: 'Employment Accommodation Request',
    description: 'Request workplace accommodations under BC Human Rights Code',
    jurisdiction: 'BC',
    category: 'accommodation',
    complexity: 'basic',
    timeToComplete: '30-45 minutes',
    requiredInfo: [
      'Employee details',
      'Employer information',
      'Specific accommodation needs',
      'Medical documentation (if applicable)',
      'Preferred timeline'
    ],
    template: `[Date]

[Employer Name]
[Employer Address]

Dear [Employer Name/HR Manager],

Re: Request for Workplace Accommodation under BC Human Rights Code

I am writing to formally request workplace accommodation(s) under the British Columbia Human Rights Code, RSBC 1996, c. 210.

EMPLOYEE INFORMATION:
Name: [Your Name]
Position: [Your Position]
Department: [Your Department]
Employee ID: [Your Employee ID]

ACCOMMODATION REQUEST:
I am requesting the following accommodation(s):
[List specific accommodations needed]

REASON FOR ACCOMMODATION:
[Brief description of disability/condition requiring accommodation]

SUPPORTING DOCUMENTATION:
[List any medical documentation attached]

PROPOSED TIMELINE:
I would appreciate implementing these accommodations by [Date], and I am available to discuss this request at your convenience.

DUTY TO ACCOMMODATE:
Under section 13 of the BC Human Rights Code, employers have a duty to accommodate employees with disabilities to the point of undue hardship. I believe these accommodations are reasonable and would not cause undue hardship.

I look forward to working with you to implement these accommodations and continuing my productive work with [Company Name].

Thank you for your consideration.

Sincerely,
[Your Name]
[Your Contact Information]

Attachments:
- Medical documentation (if applicable)
- Accommodation suggestions`,
    legalBasis: [
      'BC Human Rights Code, RSBC 1996, c. 210, section 13',
      'Employment Standards Act, RSBC 1996, c. 113'
    ],
    relatedLaws: [
      'Workers Compensation Act',
      'Occupational Health and Safety Regulation'
    ],
    deadlines: [
      {
        description: 'Human Rights Complaint Filing',
        timeframe: 'Within 1 year of alleged discrimination',
        consequences: 'Cannot file complaint after deadline except in exceptional circumstances'
      }
    ],
    tips: [
      'Be specific about accommodation needs',
      'Provide medical documentation when appropriate',
      'Keep detailed records of all communications',
      'Follow up in writing after verbal discussions'
    ],
    resources: [
      {
        title: 'BC Human Rights Tribunal',
        description: 'File complaints and get information about rights',
        url: 'https://www.bchrt.bc.ca/',
        phone: '604-775-2000'
      },
      {
        title: 'Disability Alliance BC',
        description: 'Advocacy and support for people with disabilities',
        url: 'https://disabilityalliancebc.org/',
        phone: '604-875-0188'
      }
    ]
  },
  {
    id: 'bc-healthcare-complaint',
    title: 'Healthcare Discrimination Complaint',
    description: 'File complaint about discrimination in healthcare services',
    jurisdiction: 'BC',
    category: 'complaint',
    complexity: 'intermediate',
    timeToComplete: '60-90 minutes',
    requiredInfo: [
      'Healthcare provider details',
      'Date and location of incident',
      'Description of discrimination',
      'Witnesses (if any)',
      'Previous complaints or resolution attempts'
    ],
    template: `FORMAL COMPLAINT - HEALTHCARE DISCRIMINATION

TO: [Healthcare Provider/Institution]
FROM: [Your Name]
DATE: [Date]

COMPLAINT UNDER BC HUMAN RIGHTS CODE

I am filing this formal complaint regarding discrimination I experienced while accessing healthcare services, which I believe violates the BC Human Rights Code.

INCIDENT DETAILS:
Date: [Date of incident]
Location: [Healthcare facility]
Healthcare Provider(s): [Names of involved staff]

DESCRIPTION OF DISCRIMINATION:
[Detailed description of what happened, including specific discriminatory actions or statements]

PROTECTED CHARACTERISTIC:
The discrimination was based on my: [disability/mental health condition/other protected ground]

IMPACT:
This discrimination affected me by:
[Describe impact on health, dignity, access to services]

PREVIOUS RESOLUTION ATTEMPTS:
[Describe any attempts to resolve the issue directly]

WITNESSES:
[List any witnesses with contact information]

REMEDY SOUGHT:
I am seeking:
- Formal apology
- Policy changes to prevent future discrimination
- Staff training on disability rights
- [Other specific remedies]

SUPPORTING DOCUMENTATION:
[List attached documents]

This complaint is filed under sections 8 and 13 of the BC Human Rights Code, which prohibit discrimination in services and facilities.

I request a written response within 30 days outlining steps to address this complaint.

[Your Name]
[Your Contact Information]

cc: BC Human Rights Tribunal (if applicable)`,
    legalBasis: [
      'BC Human Rights Code, section 8 (services and facilities)',
      'BC Human Rights Code, section 13 (duty to accommodate)'
    ],
    relatedLaws: [
      'Health Professions Act',
      'Hospital Act',
      'Medicare Protection Act'
    ],
    tips: [
      'Document incidents immediately while details are fresh',
      'Request copies of medical records',
      'Consider filing with professional college if healthcare provider is regulated',
      'Seek support from patient advocate if available'
    ],
    resources: [
      {
        title: 'Patient Care Quality Office',
        description: 'Healthcare complaints for BC',
        url: 'https://www.gov.bc.ca/gov/content/health/accessing-health-care/patient-care-quality-office',
        phone: '1-877-977-7787'
      }
    ]
  },

  // Alberta Templates
  {
    id: 'ab-housing-complaint',
    title: 'Housing Discrimination Complaint',
    description: 'File complaint about discrimination in housing under Alberta Human Rights Act',
    jurisdiction: 'AB',
    category: 'complaint',
    complexity: 'intermediate',
    timeToComplete: '45-60 minutes',
    requiredInfo: [
      'Landlord/property manager details',
      'Property address',
      'Description of discrimination',
      'Communication records',
      'Witnesses'
    ],
    template: `HOUSING DISCRIMINATION COMPLAINT

Alberta Human Rights Commission
Complaint Form - Housing Discrimination

COMPLAINANT INFORMATION:
Name: [Your Name]
Address: [Your Address]
Phone: [Your Phone]
Email: [Your Email]

RESPONDENT INFORMATION:
Landlord/Property Manager: [Name]
Company: [Company Name]
Address: [Property/Company Address]
Phone: [Phone Number]

PROPERTY DETAILS:
Property Address: [Address of rental property]
Type of Housing: [Apartment/house/condo]
Date of Application/Incident: [Date]

GROUNDS OF DISCRIMINATION:
The discrimination was based on:
☐ Physical disability
☐ Mental disability  
☐ Other: [Specify]

DESCRIPTION OF DISCRIMINATION:
[Provide detailed description of discriminatory actions, including specific statements made, actions taken, and how it violated your rights]

ACCOMMODATION REQUESTS:
Did you request accommodation? ☐ Yes ☐ No
If yes, describe: [Details of accommodation requested]

Landlord's response: [How landlord responded to accommodation request]

IMPACT OF DISCRIMINATION:
[Describe how this discrimination affected you - financially, emotionally, physically]

REMEDY SOUGHT:
☐ Financial compensation: $[Amount]
☐ Policy changes
☐ Accommodation provided
☐ Training for staff
☐ Other: [Specify]

SUPPORTING EVIDENCE:
☐ Emails/text messages
☐ Witness statements
☐ Medical documentation
☐ Photos
☐ Other: [Specify]

I declare that the information provided is true and accurate to the best of my knowledge.

Signature: [Your Signature]
Date: [Date]

Note: This complaint must be filed within one year of the alleged discrimination.`,
    legalBasis: [
      'Alberta Human Rights Act, RSA 2000, c. A-25.5, section 4 (accommodation)',
      'Alberta Human Rights Act, section 7 (duty to accommodate)'
    ],
    relatedLaws: [
      'Residential Tenancies Act',
      'Mobile Home Sites Tenancies Act'
    ],
    deadlines: [
      {
        description: 'Human Rights Complaint Filing',
        timeframe: 'Within 1 year of discrimination',
        consequences: 'Cannot file complaint after one year deadline'
      }
    ],
    tips: [
      'Keep all communication with landlord in writing',
      'Take photos of property conditions',
      'Get witness statements',
      'Document all financial losses'
    ],
    resources: [
      {
        title: 'Alberta Human Rights Commission',
        description: 'File human rights complaints',
        url: 'https://www.albertahumanrights.ab.ca/',
        phone: '780-427-7661'
      },
      {
        title: 'Residential Tenancy Dispute Resolution Service',
        description: 'Resolve landlord-tenant disputes',
        url: 'https://www.alberta.ca/residential-tenancy-dispute-resolution-service.aspx',
        phone: '1-877-427-4088'
      }
    ]
  },

  // Ontario Templates
  {
    id: 'on-education-accommodation',
    title: 'Education Accommodation Request',
    description: 'Request accommodations in Ontario educational institutions',
    jurisdiction: 'ON',
    category: 'accommodation',
    complexity: 'basic',
    timeToComplete: '30-45 minutes',
    requiredInfo: [
      'Student information',
      'Institution details',
      'Specific accommodation needs',
      'Medical/psychological documentation',
      'Previous accommodations'
    ],
    template: `ACCOMMODATION REQUEST - ONTARIO EDUCATION

[Date]

[Institution Name]
Accessibility Services/Disability Services
[Institution Address]

Dear Accessibility Services Coordinator,

Re: Request for Academic Accommodations under Ontario Human Rights Code

STUDENT INFORMATION:
Name: [Student Name]
Student ID: [Student ID]
Program: [Program/Course of Study]
Year of Study: [Year]

REQUEST FOR ACCOMMODATION:
I am writing to request academic accommodations under the Ontario Human Rights Code, RSO 1990, c. H.19. I have a [disability/condition] that impacts my ability to [describe impact on learning].

SPECIFIC ACCOMMODATIONS REQUESTED:
☐ Extended time for exams ([specify time - e.g., time and a half])
☐ Alternative exam format
☐ Note-taking assistance
☐ Audio recording of lectures
☐ Accessible course materials
☐ Reduced course load
☐ Other: [Specify]

SUPPORTING DOCUMENTATION:
I am providing the following documentation to support my accommodation request:
- [Medical report/psychological assessment]
- [Previous accommodation plans]
- [Other relevant documentation]

DUTY TO ACCOMMODATE:
Under section 1 of the Ontario Human Rights Code and section 17 (education), educational institutions have a duty to accommodate students with disabilities to the point of undue hardship. The Supreme Court of Canada has established that this includes providing individualized accommodations that address the impact of a student's disability.

CONFIDENTIALITY:
I understand that information about my disability will be kept confidential and shared only with those who need to know to implement accommodations.

I am available to meet to discuss these accommodations and any additional information you may require. I can be reached at [phone] or [email].

Thank you for your consideration. I look forward to working with you to ensure equal access to education.

Sincerely,
[Student Name]
[Contact Information]

Enclosures:
- Medical/psychological documentation
- Previous accommodation letters (if applicable)`,
    legalBasis: [
      'Ontario Human Rights Code, RSO 1990, c. H.19, section 1 (equal treatment)',
      'Ontario Human Rights Code, section 17 (accommodation in education)',
      'Accessibility for Ontarians with Disabilities Act, 2005'
    ],
    relatedLaws: [
      'Education Act',
      'Post-secondary Education Choice and Excellence Act'
    ],
    tips: [
      'Apply for accommodations early in the semester',
      'Provide current medical documentation',
      'Meet with accessibility services regularly to review accommodations',
      'Know your rights under the Human Rights Code'
    ],
    resources: [
      {
        title: 'Human Rights Tribunal of Ontario',
        description: 'File human rights applications',
        url: 'https://www.tribunalsontario.ca/hrto/',
        phone: '416-326-1312'
      },
      {
        title: 'Accessibility Directorate of Ontario',
        description: 'Information about AODA compliance',
        url: 'https://www.ontario.ca/page/accessibility-directorate-ontario'
      }
    ]
  },

  // Quebec Templates
  {
    id: 'qc-services-complaint',
    title: 'Services Discrimination Complaint',
    description: 'File complaint about discrimination in services under Quebec Charter',
    jurisdiction: 'QC',
    category: 'complaint',
    complexity: 'intermediate',
    timeToComplete: '45-75 minutes',
    requiredInfo: [
      'Service provider details',
      'Description of discrimination',
      'Date and location',
      'Accommodation requests made',
      'Witnesses'
    ],
    template: `PLAINTE POUR DISCRIMINATION - SERVICES
COMPLAINT FOR DISCRIMINATION - SERVICES

Commission des droits de la personne et des droits de la jeunesse du Québec

RENSEIGNEMENTS SUR LE PLAIGNANT / COMPLAINANT INFORMATION:
Nom / Name: [Votre nom / Your name]
Adresse / Address: [Votre adresse / Your address]
Téléphone / Phone: [Votre téléphone / Your phone]
Courriel / Email: [Votre courriel / Your email]

ORGANISME/PERSONNE MISE EN CAUSE / RESPONDENT ORGANIZATION/PERSON:
Nom / Name: [Nom de l'organisation / Organization name]
Adresse / Address: [Adresse / Address]
Type de service / Type of service: [Santé, commerce, transport, etc. / Health, commerce, transport, etc.]

MOTIF DE DISCRIMINATION / GROUND OF DISCRIMINATION:
☐ Handicap / Disability
☐ Autre / Other: [Préciser / Specify]

DESCRIPTION DES FAITS / DESCRIPTION OF FACTS:
Date de l'incident / Date of incident: [Date]
Lieu / Location: [Lieu / Location]

[Description détaillée de la discrimination subie, incluant les paroles et gestes discriminatoires / Detailed description of discrimination experienced, including discriminatory words and actions]

DEMANDE D'ACCOMMODEMENT / ACCOMMODATION REQUEST:
Avez-vous demandé un accommodement? / Did you request accommodation? ☐ Oui/Yes ☐ Non/No

Si oui, décrire / If yes, describe:
[Description de l'accommodement demandé / Description of accommodation requested]

Réponse reçue / Response received:
[Réponse de l'organisation / Organization's response]

TÉMOINS / WITNESSES:
[Nom et coordonnées des témoins / Name and contact information of witnesses]

PRÉJUDICE SUBI / HARM SUFFERED:
[Description du préjudice moral, physique ou financier / Description of moral, physical or financial harm]

RÉPARATION DEMANDÉE / REMEDY SOUGHT:
☐ Excuses / Apology
☐ Dommages-intérêts / Damages: [Montant / Amount]
☐ Changements de politique / Policy changes
☐ Formation du personnel / Staff training
☐ Autre / Other: [Préciser / Specify]

Je déclare que les renseignements fournis sont véridiques.
I declare that the information provided is truthful.

Signature: [Signature]
Date: [Date]

Note: Cette plainte doit être déposée dans les deux ans de l'acte discriminatoire.
Note: This complaint must be filed within two years of the discriminatory act.`,
    legalBasis: [
      'Charte des droits et libertés de la personne, RLRQ c. C-12, article 10',
      'Charte québécoise, article 12 (services)',
      'Charte québécoise, article 13 (accommodement)'
    ],
    relatedLaws: [
      'Code civil du Québec',
      'Loi assurant l\'exercice des droits des personnes handicapées'
    ],
    deadlines: [
      {
        description: 'Dépôt de plainte / Filing complaint',
        timeframe: 'Dans les 2 ans / Within 2 years',
        consequences: 'Impossible de déposer après délai / Cannot file after deadline'
      }
    ],
    tips: [
      'Conservez tous les documents / Keep all documents',
      'Notez les détails immédiatement / Note details immediately',
      'Demandez l\'aide d\'un organisme / Seek help from advocacy organization',
      'La plainte peut être déposée en français ou en anglais / Complaint can be filed in French or English'
    ],
    resources: [
      {
        title: 'Commission des droits de la personne et des droits de la jeunesse',
        description: 'Déposer une plainte pour discrimination / File discrimination complaint',
        url: 'https://www.cdpdj.qc.ca/',
        phone: '514-873-5146'
      }
    ]
  },

  // Federal Templates
  {
    id: 'fed-government-services',
    title: 'Federal Government Services Complaint',
    description: 'Complaint about discrimination in federal government services',
    jurisdiction: 'Federal',
    category: 'complaint',
    complexity: 'intermediate',
    timeToComplete: '45-60 minutes',
    requiredInfo: [
      'Federal department/agency',
      'Service being accessed',
      'Description of discrimination',
      'Accommodation requests',
      'Previous complaint attempts'
    ],
    template: `COMPLAINT - FEDERAL GOVERNMENT SERVICES DISCRIMINATION

Canadian Human Rights Commission
Complaint Form

COMPLAINANT INFORMATION:
Name: [Your Name]
Address: [Your Address]
Phone: [Your Phone Number]
Email: [Your Email]

RESPONDENT INFORMATION:
Federal Department/Agency: [Name of Department]
Contact Person: [Name if known]
Address: [Department Address]
Phone: [Department Phone]

DISCRIMINATION DETAILS:
Date of Incident: [Date]
Location: [Where discrimination occurred]
Service Involved: [Type of federal service - EI, CPP, Immigration, etc.]

GROUND OF DISCRIMINATION:
☐ Disability (physical)
☐ Disability (mental)
☐ Other: [Specify if applicable]

DESCRIPTION OF DISCRIMINATION:
[Provide detailed description of what happened, including specific actions, statements, or refusals that you believe were discriminatory]

ACCOMMODATION REQUESTS:
Did you request accommodation? ☐ Yes ☐ No

If yes, describe the accommodation requested:
[Detail what accommodation you requested]

Response from federal department:
[Describe how the department responded to your accommodation request]

IMPACT OF DISCRIMINATION:
[Describe how this discrimination affected you - financially, emotionally, access to services]

PREVIOUS COMPLAINT ATTEMPTS:
Have you filed complaints with:
☐ Department's internal complaint process
☐ Ombudsman office
☐ Other: [Specify]

Results: [Describe outcomes of previous complaints]

REMEDY SOUGHT:
☐ Financial compensation
☐ Apology
☐ Policy changes
☐ Training for staff
☐ Accommodation provided
☐ Other: [Specify]

SUPPORTING EVIDENCE:
☐ Correspondence with department
☐ Medical documentation
☐ Witness statements
☐ Other: [Specify]

I understand that this complaint is filed under the Canadian Human Rights Act and that the Canadian Human Rights Commission will investigate this matter.

Signature: [Your Signature]
Date: [Date]

Filing Deadline: This complaint must be filed within one year of the last discriminatory act.`,
    legalBasis: [
      'Canadian Human Rights Act, RSC 1985, c. H-6, section 5 (services)',
      'Canadian Human Rights Act, section 15 (duty to accommodate)',
      'Employment Equity Act (for federal employment)'
    ],
    relatedLaws: [
      'Accessible Canada Act',
      'Employment Insurance Act',
      'Canada Pension Plan'
    ],
    deadlines: [
      {
        description: 'Human Rights Complaint Filing',
        timeframe: 'Within 1 year of last discriminatory act',
        consequences: 'Cannot file complaint after one year deadline'
      }
    ],
    tips: [
      'Try internal complaint process first',
      'Keep detailed records of all interactions',
      'Federal government has stronger duty to accommodate',
      'Consider contacting relevant ombudsman office'
    ],
    resources: [
      {
        title: 'Canadian Human Rights Commission',
        description: 'File federal human rights complaints',
        url: 'https://www.chrc-ccdp.gc.ca/',
        phone: '1-888-214-1090'
      },
      {
        title: 'Office of the Federal Ombudsman for Victims of Crime',
        description: 'Federal services complaints',
        url: 'https://www.victimsfirst.gc.ca/'
      }
    ]
  }
];

// Function to get templates by jurisdiction
export function getTemplatesByJurisdiction(jurisdiction: string): LegalTemplate[] {
  return provincialLegalTemplates.filter(template => 
    template.jurisdiction === jurisdiction || template.jurisdiction === 'Federal'
  );
}

// Function to get templates by category
export function getTemplatesByCategory(category: LegalTemplate['category']): LegalTemplate[] {
  return provincialLegalTemplates.filter(template => template.category === category);
}

// Function to get template by ID
export function getTemplateById(id: string): LegalTemplate | undefined {
  return provincialLegalTemplates.find(template => template.id === id);
}

// Function to search templates
export function searchTemplates(query: string): LegalTemplate[] {
  const searchTerm = query.toLowerCase();
  return provincialLegalTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.category.toLowerCase().includes(searchTerm) ||
    template.jurisdiction.toLowerCase().includes(searchTerm)
  );
}