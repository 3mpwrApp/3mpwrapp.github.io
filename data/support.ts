export type SupportOrg = {
  id: string;
  name: string;
  province: string; // code, e.g., ON, QC, CA (Canada-wide)
  phone?: string;
  url?: string;
  accessible?: boolean;
  description?: string;
  services?: string[];
};

export const supportOrgs: SupportOrg[] = [
  // CANADA-WIDE ORGANIZATIONS
  {
    id: "s-ca-1",
    name: "Service Canada - CPP Disability",
    province: "CA",
    phone: "1-800-277-9914",
    url: "https://www.canada.ca/en/services/benefits/disability.html",
    accessible: true,
    description: "CPP Disability, EI Sickness Benefits, Old Age Security",
    services: ["CPP-D", "EI Sickness", "Benefits Information"]
  },
  {
    id: "s-ca-2",
    name: "Social Security Tribunal of Canada (SST)",
    province: "CA",
    phone: "1-877-227-8577",
    url: "https://sst-tss.gc.ca/",
    accessible: true,
    description: "Appeals for CPP-D and OAS/GIS denials",
    services: ["CPP-D Appeals", "OAS Appeals", "Tribunal Hearings"]
  },
  {
    id: "s-ca-3",
    name: "Council of Canadians with Disabilities (CCD)",
    province: "CA",
    phone: "204-947-0303",
    url: "http://www.ccdonline.ca/",
    accessible: true,
    description: "National human rights organization of people with disabilities",
    services: ["Advocacy", "Policy Research", "Rights Education"]
  },
  {
    id: "s-ca-4",
    name: "Canadian Association for Community Living (CACL)",
    province: "CA",
    phone: "416-661-9611",
    url: "https://www.cacl.ca/",
    accessible: true,
    description: "Inclusion and human rights for people with intellectual disabilities",
    services: ["Community Living", "Inclusion Support", "Family Resources"]
  },
  {
    id: "s-ca-5",
    name: "DisAbled Women's Network (DAWN)",
    province: "CA",
    url: "https://dawncanada.net/",
    accessible: true,
    description: "Feminist organization controlled by women with disabilities",
    services: ["Women's Rights", "Peer Support", "Anti-Violence"]
  },
  {
    id: "s-ca-6",
    name: "Canadian Centre for Occupational Health and Safety (CCOHS)",
    province: "CA",
    phone: "1-800-668-4284",
    url: "https://www.ccohs.ca/",
    accessible: true,
    description: "Workplace health and safety information",
    services: ["Safety Information", "Workplace Rights", "Prevention"]
  },
  {
    id: "s-ca-7",
    name: "Canadian Human Rights Commission",
    province: "CA",
    phone: "1-888-214-1090",
    url: "https://www.chrc-ccdp.gc.ca/",
    accessible: true,
    description: "Federal human rights complaints and education",
    services: ["Discrimination Complaints", "Rights Information", "Mediation"]
  },
  {
    id: "s-ca-8",
    name: "Workers Action Centre",
    province: "CA",
    phone: "416-531-0778",
    url: "https://www.workersactioncentre.org/",
    accessible: true,
    description: "Workers' rights advocacy and education",
    services: ["Employment Standards", "Workplace Rights", "Advocacy"]
  },

  // ONTARIO ORGANIZATIONS
  {
    id: "s-on-1",
    name: "Ontario Disability Support Program (ODSP)",
    province: "ON",
    phone: "1-800-531-5550",
    url: "https://www.ontario.ca/page/ontario-disability-support-program-odsp",
    accessible: true,
    description: "Income and employment support for people with disabilities",
    services: ["ODSP Benefits", "Employment Support", "Application Help"]
  },
  {
    id: "s-on-2",
    name: "Social Benefits Tribunal (SBT)",
    province: "ON",
    phone: "1-866-840-2456",
    url: "https://tribunalsontario.ca/sbt/",
    accessible: true,
    description: "Appeals for ODSP and Ontario Works decisions",
    services: ["ODSP Appeals", "Tribunal Hearings"]
  },
  {
    id: "s-on-3",
    name: "Income Security Advocacy Centre (ISAC)",
    province: "ON",
    phone: "416-597-5855",
    url: "https://incomesecurity.org/",
    accessible: true,
    description: "Legal clinic for social assistance appeals",
    services: ["Legal Advice", "Appeal Support", "Know Your Rights"]
  },
  {
    id: "s-on-4",
    name: "Workplace Safety and Insurance Board (WSIB)",
    province: "ON",
    phone: "1-800-387-0750",
    url: "https://www.wsib.ca/",
    accessible: true,
    description: "Workers' compensation for workplace injuries/illnesses",
    services: ["WSIB Claims", "Benefits", "Return to Work"]
  },
  {
    id: "s-on-5",
    name: "Workplace Safety and Insurance Appeals Tribunal (WSIAT)",
    province: "ON",
    phone: "416-314-0202",
    url: "https://www.wsiat.on.ca/",
    accessible: true,
    description: "Independent appeals tribunal for WSIB decisions",
    services: ["WSIB Appeals", "Hearings", "Legal Representation"]
  },
  {
    id: "s-on-6",
    name: "Office of the Worker Adviser (OWA)",
    province: "ON",
    phone: "1-800-435-8980",
    url: "https://www.ontario.ca/page/office-worker-adviser",
    accessible: true,
    description: "Free advice and representation for injured workers",
    services: ["Free Legal Help", "WSIB Appeals", "Representation"]
  },
  {
    id: "s-on-7",
    name: "Human Rights Tribunal of Ontario (HRTO)",
    province: "ON",
    phone: "416-326-1312",
    url: "http://www.sjto.gov.on.ca/hrto/",
    accessible: true,
    description: "Discrimination complaints under Ontario Human Rights Code",
    services: ["Discrimination Claims", "Mediation", "Hearings"]
  },
  {
    id: "s-on-8",
    name: "Human Rights Legal Support Centre",
    province: "ON",
    phone: "1-866-625-5179",
    url: "http://www.hrlsc.on.ca/",
    accessible: true,
    description: "Free legal services for HRTO applications",
    services: ["Legal Advice", "Application Help", "Representation"]
  },
  {
    id: "s-on-9",
    name: "ARCH Disability Law Centre",
    province: "ON",
    phone: "1-866-482-2724",
    url: "https://www.archdisabilitylaw.ca/",
    accessible: true,
    description: "Legal aid clinic specializing in disability law",
    services: ["Legal Advice", "Rights Education", "Test Cases"]
  },
  {
    id: "s-on-10",
    name: "Disability Rights Advocacy Service (DRAS)",
    province: "ON",
    phone: "416-666-5135",
    url: "http://drasontario.com/",
    accessible: true,
    description: "Legal clinic for people with disabilities in Toronto",
    services: ["Legal Support", "Advocacy", "Community Education"]
  },
  {
    id: "s-on-11",
    name: "Community Living Ontario",
    province: "ON",
    phone: "1-800-278-8025",
    url: "https://communitylivingontario.ca/",
    accessible: true,
    description: "Support for people with intellectual disabilities",
    services: ["Community Support", "Family Resources", "Advocacy"]
  },

  // BRITISH COLUMBIA ORGANIZATIONS
  {
    id: "s-bc-1",
    name: "BC Persons with Disabilities (PWD) Benefits",
    province: "BC",
    phone: "1-866-866-0800",
    url: "https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/bc-employment-and-assistance-rate-tables/persons-with-disabilities-designation",
    accessible: true,
    description: "Income assistance for people with disabilities",
    services: ["PWD Benefits", "Application Support", "Assistance"]
  },
  {
    id: "s-bc-2",
    name: "Disability Alliance BC (DABC)",
    province: "BC",
    phone: "604-875-0188",
    url: "https://disabilityalliancebc.org/",
    accessible: true,
    description: "Advocacy and information for people with disabilities",
    services: ["Benefits Navigation", "Advocacy", "Community Support"]
  },
  {
    id: "s-bc-3",
    name: "WorkSafeBC",
    province: "BC",
    phone: "1-888-967-5377",
    url: "https://www.worksafebc.com/",
    accessible: true,
    description: "Workers' compensation for workplace injuries",
    services: ["Claims", "Benefits", "Return to Work"]
  },
  {
    id: "s-bc-4",
    name: "Workers' Advisers Office (BC)",
    province: "BC",
    phone: "1-800-663-4261",
    url: "https://www.labour.gov.bc.ca/wab/",
    accessible: true,
    description: "Free advice for injured workers",
    services: ["Free Legal Help", "Appeal Support", "Representation"]
  },
  {
    id: "s-bc-5",
    name: "BC Human Rights Tribunal",
    province: "BC",
    phone: "604-775-2000",
    url: "http://www.bchrt.bc.ca/",
    accessible: true,
    description: "Discrimination complaints in BC",
    services: ["Discrimination Claims", "Mediation", "Hearings"]
  },

  // ALBERTA ORGANIZATIONS
  {
    id: "s-ab-1",
    name: "Assured Income for the Severely Handicapped (AISH)",
    province: "AB",
    phone: "1-780-644-9992",
    url: "https://www.alberta.ca/aish",
    accessible: true,
    description: "Financial and health benefits for Albertans with disabilities",
    services: ["AISH Benefits", "Health Coverage", "Application Support"]
  },
  {
    id: "s-ab-2",
    name: "Workers' Compensation Board - Alberta",
    province: "AB",
    phone: "1-866-922-9221",
    url: "https://www.wcb.ab.ca/",
    accessible: true,
    description: "Workplace injury compensation",
    services: ["Claims", "Benefits", "Return to Work"]
  },
  {
    id: "s-ab-3",
    name: "Alberta Human Rights Commission",
    province: "AB",
    phone: "780-427-7661",
    url: "https://www.albertahumanrights.ab.ca/",
    accessible: true,
    description: "Human rights complaints in Alberta",
    services: ["Discrimination Claims", "Education", "Mediation"]
  },

  // QUEBEC ORGANIZATIONS
  {
    id: "s-qc-1",
    name: "Retraite Québec - QPP Disability",
    province: "QC",
    phone: "1-800-463-5185",
    url: "https://www.retraitequebec.gouv.qc.ca/en",
    accessible: true,
    description: "Quebec Pension Plan disability benefits",
    services: ["QPP Disability", "Benefits", "Appeals"]
  },
  {
    id: "s-qc-2",
    name: "Office des personnes handicapées du Québec",
    province: "QC",
    phone: "1-800-567-1465",
    url: "https://www.ophq.gouv.qc.ca/accueil.html",
    accessible: true,
    description: "Services and support for people with disabilities",
    services: ["Support Programs", "Rights Information", "Advocacy"]
  },
  {
    id: "s-qc-3",
    name: "CNESST (Workers' Comp Quebec)",
    province: "QC",
    phone: "1-844-838-0808",
    url: "https://www.cnesst.gouv.qc.ca/",
    accessible: true,
    description: "Workers' compensation and workplace standards",
    services: ["Claims", "Workplace Safety", "Benefits"]
  },

  // OTHER PROVINCES
  {
    id: "s-mb-1",
    name: "Manitoba Employment and Income Assistance (EIA)",
    province: "MB",
    phone: "204-945-0183",
    url: "https://www.gov.mb.ca/fs/index.html",
    accessible: true,
    description: "Social assistance including disability benefits",
    services: ["Benefits", "Disability Support"]
  },
  {
    id: "s-sk-1",
    name: "Saskatchewan Assured Income for Disability (SAID)",
    province: "SK",
    phone: "1-888-275-7257",
    url: "https://www.saskatchewan.ca/residents/family-and-social-support/assured-income-for-disability-said",
    accessible: true,
    description: "Income support for people with disabilities",
    services: ["SAID Benefits", "Application Support"]
  },
  {
    id: "s-ns-1",
    name: "Nova Scotia Income Assistance",
    province: "NS",
    phone: "1-877-424-1177",
    url: "https://novascotia.ca/coms/department/documents/Income_Assistance.pdf",
    accessible: true,
    description: "Support for persons with disabilities",
    services: ["Benefits", "Disability Support"]
  },
  {
    id: "s-nb-1",
    name: "New Brunswick Disability Support Program",
    province: "NB",
    phone: "1-866-444-8838",
    url: "https://www2.gnb.ca/content/gnb/en/departments/social_development.html",
    accessible: true,
    description: "Financial assistance for people with disabilities",
    services: ["Benefits", "Support Services"]
  },
];
