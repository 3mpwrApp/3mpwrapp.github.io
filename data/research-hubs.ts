export type ResearchHub = {
  id: string;
  region: 'canada' | 'world';
  name: string;
  description: string;
  links: { label: string; url: string }[];
  tags?: string[];
};

export const researchHubs: ResearchHub[] = [
  {
    id: 'statcan-csd',
    region: 'canada',
    name: 'Statistics Canada – Canadian Survey on Disability (CSD)',
    description: 'National disability prevalence, functional limitation & socioeconomic indicators (2023–2025 releases).',
    links: [
      { label: 'CSD Data Portal', url: 'https://www150.statcan.gc.ca/n1/en/subjects/Disabilities' },
      { label: '2023 Analytical Articles', url: 'https://www150.statcan.gc.ca/n1/daily-quotidien/theme-disabilities-eng.htm' },
      { label: 'Latest Release Calendar', url: 'https://www.statcan.gc.ca/en/release' }
    ],
    tags: ['survey','prevalence','canada']
  },
  {
    id: 'esdc-accessibility',
    region: 'canada',
    name: 'ESDC – Accessibility & Disability Reports',
    description: 'Federal reports incl. Accessibility progress, Canada Disability Benefit, performance & legislative frameworks.',
    links: [
      { label: 'Accessibility Strategy', url: 'https://www.canada.ca/en/employment-social-development/programs/accessibility.html' },
      { label: 'Canada Disability Benefit Updates', url: 'https://www.canada.ca/en/employment-social-development/programs/disability-benefits.html' },
      { label: 'Departmental Results Reports', url: 'https://www.canada.ca/en/employment-social-development/corporate/reports/departmental-results.html' }
    ],
    tags: ['policy','benefits','federal']
  },
  {
    id: 'iwh',
    region: 'canada',
    name: 'Institute for Work & Health (IWH)',
    description: 'Peer-reviewed and applied research on return-to-work, prevention, compensation, occupational health.',
    links: [
      { label: 'IWH Research', url: 'https://www.iwh.on.ca/research' },
      { label: 'Scientific Reports', url: 'https://www.iwh.on.ca/scientific-reports' },
      { label: 'Life After Work Injury Study', url: 'https://www.iwh.on.ca/projects/life-after-work-injury-study' }
    ],
    tags: ['rtw','occupational-health','compensation']
  },
  {
    id: 'injured-worker-networks',
    region: 'canada',
    name: 'Injured Worker Networks & Resources',
    description: 'Grassroots & alliance resources: legal clinics, advocacy, knowledge translation.',
    links: [
      { label: 'CIWA (Canadian Injured Workers Alliance)', url: 'https://www.ciwa.ca/' },
      { label: 'Injured Workers Online', url: 'https://injuredworkersonline.org/' },
      { label: 'Ontario Legal Clinics (WSIB focus)', url: 'https://www.legalaid.on.ca/legal-clinics/' }
    ],
    tags: ['advocacy','networks','support']
  },
  {
    id: 'provincial-snapshot-example',
    region: 'canada',
    name: 'Provincial Snapshot – Example (Alberta CSD 2022)',
    description: 'Provincial level disability stats model – adaptation template for other provinces.',
    links: [
      { label: 'Alberta Disability Stats (model)', url: 'https://www.alberta.ca/disability' }
    ],
    tags: ['province','template']
  },
  {
    id: 'who-equity-2022',
    region: 'world',
    name: 'WHO – Global Report on Health Equity for Persons with Disabilities (2022)',
    description: 'Global situation analysis + 40 recommended government actions to close equity gaps.',
    links: [
      { label: 'Full Report (PDF)', url: 'https://www.who.int/publications/i/item/9789240063600' }
    ],
    tags: ['equity','global','who']
  },
  {
    id: 'great-2022',
    region: 'world',
    name: 'WHO & UNICEF – Global Report on Assistive Technology (GReAT, 2022)',
    description: 'Demand estimates, access gaps, policy levers, ROI evidence for assistive tech.',
    links: [
      { label: 'GReAT Report', url: 'https://www.who.int/publications/i/item/9789240049451' }
    ],
    tags: ['assistive-technology','policy','global']
  },
  {
    id: 'ilo-wspr-2024',
    region: 'world',
    name: 'ILO – World Social Protection Report 2024–26',
    description: 'Coverage gaps, employment injury protection, social insurance comparisons.',
    links: [
      { label: 'World Social Protection Report', url: 'https://www.ilo.org/global/publications/books/WCMS_852317' }
    ],
    tags: ['social-protection','ilo','comparative']
  },
  {
    id: 'oecd-disability-work-2022',
    region: 'world',
    name: 'OECD – Disability, Work and Inclusion (2022)',
    description: 'Cross-country labour market outcomes & policy benchmarking (incl. Canada).',
    links: [
      { label: 'OECD Publication', url: 'https://www.oecd.org/employment/disability-work-and-inclusion-047c4f69-en.htm' }
    ],
    tags: ['oecd','benchmark','labour']
  },
  {
    id: 'eurofound-2021',
    region: 'world',
    name: 'Eurofound – Disability & Labour-Market Integration (2021)',
    description: 'EU policy trends for entry, retention, and return-to-work supports.',
    links: [
      { label: 'Eurofound Report', url: 'https://www.eurofound.europa.eu/' }
    ],
    tags: ['europe','rtw','policy']
  },
  {
    id: 'eu-osha-msd',
    region: 'world',
    name: 'EU-OSHA – Work-related Musculoskeletal Disorders Hub',
    description: 'Research synthesis and prevention resources (MSDs; transferable methods).',
    links: [
      { label: 'MSD Hub', url: 'https://osha.europa.eu/en/themes/musculoskeletal-disorders' }
    ],
    tags: ['msd','prevention','osha']
  },
  {
    id: 'niosh-comp-center',
    region: 'world',
    name: 'NIOSH (USA) – Workers’ Compensation & Disability / RTW Research',
    description: 'Methodology, cohort studies, benchmarking indicators for RTW & disability outcomes.',
    links: [
      { label: 'NIOSH Workers’ Comp Program', url: 'https://www.cdc.gov/niosh/programs/wrp/' }
    ],
    tags: ['niosh','rtw','methodology']
  }
];
