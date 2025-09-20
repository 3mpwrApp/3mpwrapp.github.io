export type MasterIndexLink = { label: string; url?: string; note?: string };
export type MasterIndexSection = { id: string; title: string; description?: string; links: MasterIndexLink[]; subsections?: MasterIndexSection[] };

export interface MasterIndexRoot {
  canada: MasterIndexSection[];
  global: MasterIndexSection[];
  landmarks: MasterIndexSection[];
  themes: MasterIndexSection[];
  search: MasterIndexSection[];
  howTo: MasterIndexSection[];
}

export const masterIndex: MasterIndexRoot = {
  canada: [
    {
      id: 'can-national-portals',
      title: 'National Data & Portals',
      links: [
        { label: 'Statistics Canada – Disability & Accessibility (CSD hub)', url: 'https://www150.statcan.gc.ca/n1/en/subjects/Disabilities' },
        { label: 'CSD 2022 Methodology / Definitions (PDF)', url: 'https://www150.statcan.gc.ca/n1/pub/89-654-x/89-654-x2023001-eng.htm' },
        { label: 'StatCan Accessibility Progress Report', url: 'https://www.statcan.gc.ca/en/about/accessibility' },
        { label: 'AWCBC – National Workers’ Comp Statistics (NWISP)', url: 'https://awcbc.org/en/statistics/' },
        { label: 'AWCBC Key Statistical Measures', url: 'https://awcbc.org/en/statistical-reports/' }
      ]
    },
    {
      id: 'can-research-hubs',
      title: 'Research Hubs & Programs',
      links: [
        { label: 'Institute for Work & Health (IWH)', url: 'https://www.iwh.on.ca/' },
        { label: 'IWH – Life After Work Injury Study', url: 'https://www.iwh.on.ca/projects/life-after-work-injury-study' },
        { label: 'CRWDP – Centre for Research on Work Disability Policy', url: 'https://www.crwdp.ca/' },
        { label: 'PHAC – Article on WSIB Experiences (Thunder Bay)', url: 'https://health-infobase.canada.ca/' },
        { label: 'Canadian Injured Workers Alliance (CIWA)', url: 'https://www.ciwa.ca/' },
        { label: 'Injured Workers Online', url: 'https://injuredworkersonline.org/' }
      ]
    },
    {
      id: 'can-community-advocacy',
      title: 'Community Advocacy & Legal Support (Ontario Focus)',
      description: 'Grassroots and clinic-based hubs combining advocacy, research, legal support, and education.',
      links: [
        { label: 'Injured Workers Community Legal Clinic (IWC)', url: 'https://injuredworkersonline.org/' },
        { label: 'FightWCB – Global Injured Worker Stories & Resources', url: 'https://fightwcb.org/' },
        { label: 'ONIWG – Ontario Network of Injured Workers Groups', url: 'https://injuredworkersonline.org/oniwg/' },
        { label: 'Important Papers / Reports (FightWCB)', url: 'https://fightwcb.org/important-papers-reports/' },
        { label: 'Paul Taylor – My Story (FightWCB)', url: 'https://fightwcb.org/my-story/' }
      ]
    },
    {
      id: 'can-selected-studies',
      title: 'Selected Canadian Studies (Examples)',
      description: 'Illustrative research themes for deeper exploration.',
      links: [
        { label: 'OLAWIS Cohort Studies', url: 'https://www.iwh.on.ca/projects/life-after-work-injury-study' },
        { label: 'COVID-era Follow-ups (Work Disability)', url: 'https://www.iwh.on.ca/research' },
        { label: 'Cannabis Use Among Injured Workers (BMJ Open)', url: 'https://bmjopen.bmj.com/' }
      ]
    }
  ],
  global: [
    {
      id: 'un-who',
      title: 'UN & WHO (Foundational)',
      links: [
        { label: 'WHO Global Report on Health Equity for Persons with Disabilities (2022)', url: 'https://www.who.int/publications/i/item/9789240063600' },
        { label: 'WHO & UNICEF Global Report on Assistive Technology (GReAT, 2022)', url: 'https://www.who.int/publications/i/item/9789240049451' },
        { label: 'UN CRPD (Convention) + Optional Protocol (2006)', url: 'https://www.un.org/disabilities/documents/convention/convoptprot-e.pdf' }
      ]
    },
    {
      id: 'ilo-oecd',
      title: 'ILO / OECD (Systems & Coverage)',
      links: [
        { label: 'ILO World Social Protection Report 2024–26', url: 'https://www.ilo.org/global/publications/books' },
        { label: 'OECD Disability, Work and Inclusion (2012–2022 synthesis)', url: 'https://www.oecd.org/employment/disability-work-and-inclusion-047c4f69-en.htm' }
      ]
    },
    {
      id: 'europe',
      title: 'Europe',
      links: [
        { label: 'Eurofound – Disability & Labour-Market Integration (2021)', url: 'https://www.eurofound.europa.eu/' },
        { label: 'EU-OSHA Musculoskeletal Disorders Hub', url: 'https://osha.europa.eu/en/themes/musculoskeletal-disorders' },
        { label: 'Eurostat Disability Statistics', url: 'https://ec.europa.eu/eurostat/web/disability' }
      ]
    },
    {
      id: 'uk',
      title: 'United Kingdom',
      links: [
        { label: 'HSE – Annual Health & Safety Statistics', url: 'https://www.hse.gov.uk/statistics/' },
        { label: 'DWP – Employment of Disabled People', url: 'https://www.gov.uk/government/collections/employment-of-disabled-people-statistics' }
      ]
    },
    {
      id: 'anz',
      title: 'Australia & New Zealand',
      links: [
        { label: 'Safe Work Australia – National RTW Survey / Key WHS Stats', url: 'https://www.safeworkaustralia.gov.au/' }
      ]
    },
    {
      id: 'usa',
      title: 'United States',
      links: [
        { label: 'BLS – SOII & Case/Demographic Data', url: 'https://www.bls.gov/iif/' },
        { label: 'NIOSH Workers’ Compensation Program', url: 'https://www.cdc.gov/niosh/programs/wrp/' },
        { label: 'WCRI Research Library', url: 'https://www.wcrinet.org/' },
        { label: 'NCCI Research & Insights', url: 'https://www.ncci.com/' }
      ]
    },
    {
      id: 'evidence-synthesis',
      title: 'Evidence Synthesis',
      links: [
        { label: 'Cochrane Work – SRs on RTW & Disability', url: 'https://work.cochrane.org/' },
        { label: 'Cochrane Thematic Group (Work, Health & Social Security)', url: 'https://work.cochrane.org/' }
      ]
    }
  ],
  landmarks: [
    {
      id: 'landmark-docs',
      title: 'Historical Bedrock & Frameworks',
      links: [
        { label: 'UK Workmen’s Compensation Act 1897', url: 'https://api.parliament.uk/historic-hansard/acts/workmens-compensation-act-1897' },
        { label: 'Canada Meredith Report (1913–1914)', url: 'https://www.wsib.ca/en/history' },
        { label: 'ILO Employment Injury Benefits Convention No. 121 (1964)', url: 'https://www.ilo.org/' },
        { label: 'WHO ICIDH (1980) → ICF (2001)', url: 'https://www.who.int/classifications/icf/en/' },
        { label: 'Historical Overviews of Workers’ Compensation Evolution', url: 'https://papers.ssrn.com/' }
      ]
    }
  ],
  themes: [
    {
      id: 'theme-prevalence-inequality',
      title: 'Prevalence, Employment Gaps & Inequality',
      description: 'Comparative prevalence, employment rate differentials, and inequality snapshots.',
      links: [
        { label: 'Statistics Canada – CSD Analytical Releases', url: 'https://www150.statcan.gc.ca/n1/pub/89-654-x/index-eng.htm' },
        { label: 'OECD – Disability, Work and Inclusion (Indicators)', url: 'https://www.oecd.org/employment/disability-work-and-inclusion-047c4f69-en.htm' },
        { label: 'Eurostat Disability Indicators', url: 'https://ec.europa.eu/eurostat/web/disability' }
      ]
    },
    {
      id: 'theme-incidence-trends',
      title: 'Workers’ Compensation Incidence & Trends',
      links: [
        { label: 'AWCBC NWISP Lost-Time Claims/Fatalities', url: 'https://awcbc.org/en/statistics/' },
        { label: 'BLS – SOII / CFOI (US)', url: 'https://www.bls.gov/iif/' },
        { label: 'Safe Work Australia – Key WHS Stats', url: 'https://www.safeworkaustralia.gov.au/statistics-and-research/statistics' }
      ]
    },
    {
      id: 'theme-rtw-determinants',
      title: 'Return-to-Work (RTW) Outcomes & Determinants',
      links: [
        { label: 'IWH – OLAWIS Outcomes', url: 'https://www.iwh.on.ca/projects/life-after-work-injury-study' },
        { label: 'Safe Work Australia – National RTW Survey', url: 'https://www.safeworkaustralia.gov.au/' },
        { label: 'Cochrane Work RTW Coordination Reviews', url: 'https://work.cochrane.org/' }
      ]
    },
    {
      id: 'theme-mental-health',
      title: 'Mental Health / Psychological Injury RTW',
      links: [
        { label: 'OECD – Mental Health & Work (Policy Context)', url: 'https://www.oecd.org/health/mental-health-and-work.htm' },
        { label: 'HSE – Work-related Stress, Anxiety or Depression', url: 'https://www.hse.gov.uk/statistics/causdis/stress.htm' },
        { label: 'Safe Work Australia – Mental Health & Psychological Injury', url: 'https://www.safeworkaustralia.gov.au/' }
      ]
    },
    {
      id: 'theme-msd-ergonomics',
      title: 'Musculoskeletal Disorders (MSDs) & Ergonomics',
      links: [
        { label: 'EU-OSHA – Musculoskeletal Disorders Hub', url: 'https://osha.europa.eu/en/themes/musculoskeletal-disorders' },
        { label: 'HSE – Work-related Musculoskeletal Disorders', url: 'https://www.hse.gov.uk/statistics/causdis/msd.htm' }
      ]
    },
    {
      id: 'theme-occupational-disease',
      title: 'Occupational Disease & Exposures',
      links: [
        { label: 'HSE – Occupational Lung Disease (e.g., Asbestos, Silica)', url: 'https://www.hse.gov.uk/statistics/causdis/lung-disease.htm' },
        { label: 'EU Sources – Occupational Diseases Overview', url: 'https://osha.europa.eu/' }
      ]
    },
    {
      id: 'theme-vulnerable-workers',
      title: 'Vulnerable & Precarious Workers',
      links: [
        { label: 'IWH – Precarious Employment & Injury Risk', url: 'https://www.iwh.on.ca/' },
        { label: 'CRWDP – Inclusive Policy Resources', url: 'https://www.crwdp.ca/' },
        { label: 'Eurofound – Young & Older Workers (Disability Context)', url: 'https://www.eurofound.europa.eu/' }
      ]
    },
    {
      id: 'theme-claim-suppression',
      title: 'Claim Suppression / Access to Compensation',
      links: [
        { label: 'Canadian Academic & Network Publications (Gateway)', url: 'https://injuredworkersonline.org/' },
        { label: 'IWH – Reporting & Claim Behaviour Studies', url: 'https://www.iwh.on.ca/' },
        { label: 'Claims Suppression Research Project (2025 – IWC/McMaster/ONIWG)', url: 'https://injuredworkersonline.org/' },
        { label: 'FightWCB – Worker Story Archive (Under-reporting Signals)', url: 'https://fightwcb.org/' }
      ]
    },
    {
      id: 'theme-poverty-income-loss',
      title: 'Poverty & Income Loss Post-Injury',
      links: [
        { label: 'Phantom Jobs, Empty Pockets (2019)', url: 'https://injuredworkersonline.org/' },
        { label: 'Poverty Survey (Thunder Bay & District IWSG / ONIWG)', url: 'https://injuredworkersonline.org/' },
        { label: 'What Injured Workers Need – Community Response (2024)', url: 'https://injuredworkersonline.org/' }
      ]
    },
    {
      id: 'theme-system-design',
      title: 'System Design & Benefits Adequacy',
      links: [
        { label: 'ILO World Social Protection Report – Scheme Adequacy', url: 'https://www.ilo.org/global/publications/books' },
        { label: 'WCRI – Interstate Comparisons & Reforms', url: 'https://www.wcrinet.org/' },
        { label: 'NCCI – Benefit System Analyses', url: 'https://www.ncci.com/' }
      ]
    },
    {
      id: 'theme-assistive-tech',
      title: 'Assistive Technology & Accommodations',
      links: [
        { label: 'WHO/UNICEF GReAT Report (2022)', url: 'https://www.who.int/publications/i/item/9789240049451' },
        { label: 'Accessible Canada Act (2019)', url: 'https://laws-lois.justice.gc.ca/eng/acts/A-0.6/' },
        { label: 'Duty to Accommodate (CHRC Guidance)', url: 'https://www.chrc-ccdp.gc.ca/en' }
      ]
    },
    {
      id: 'theme-accessibility-law',
      title: 'Accessibility & Anti-Discrimination Law (Canada)',
      links: [
        { label: 'Accessible Canada Act (2019)', url: 'https://laws-lois.justice.gc.ca/eng/acts/A-0.6/' },
        { label: 'Canadian Human Rights Act – Disability Guidance', url: 'https://www.chrc-ccdp.gc.ca/en' }
      ]
    },
    {
      id: 'theme-methods-measurement',
      title: 'Data Methods & Measurement Frameworks',
      links: [
        { label: 'WHO ICF Framework (2001)', url: 'https://www.who.int/classifications/icf/en/' },
        { label: 'BLS SOII Methodology', url: 'https://www.bls.gov/opub/hom/soii/' }
      ]
    },
    {
      id: 'theme-costs-burden',
      title: 'Costs & Burden',
      links: [
        { label: 'HSE – Economic Costs of Workplace Injury', url: 'https://www.hse.gov.uk/statistics/cost.htm' },
        { label: 'Safe Work Australia – Cost of Injury / Disease', url: 'https://www.safeworkaustralia.gov.au/' }
      ]
    },
    {
      id: 'theme-sector-risk',
      title: 'Sector-Specific Risk Profiles',
      links: [
        { label: 'BLS – Industry Injury & Illness Data', url: 'https://www.bls.gov/iif/' },
        { label: 'HSE – Sector Overviews (Construction, Health Care)', url: 'https://www.hse.gov.uk/statistics/industry/index.htm' },
        { label: 'Safe Work Australia – Industry Statistics', url: 'https://www.safeworkaustralia.gov.au/statistics-and-research/statistics' }
      ]
    },
    {
      id: 'theme-environment-weather',
      title: 'Heat, Weather & Environmental Factors',
      links: [
        { label: 'NCCI – Weather / Climate Analyses', url: 'https://www.ncci.com/' }
      ]
    },
    {
      id: 'theme-drugs-opioids',
      title: 'Drugs, Opioids & Medical Utilization',
      links: [
        { label: 'WCRI – Opioid & Pharma Studies', url: 'https://www.wcrinet.org/' },
        { label: 'NCCI – Medical Data Insights', url: 'https://www.ncci.com/' }
      ]
    },
    {
      id: 'theme-policy-evaluation',
      title: 'Policy Evaluation & Reforms',
      links: [
        { label: 'WCRI – State Reforms & CompScope', url: 'https://www.wcrinet.org/' },
        { label: 'OECD – Comparative Policy Analyses', url: 'https://www.oecd.org/' },
        { label: 'Meredith Principles / Reform Platforms (Ontario)', url: 'https://injuredworkersonline.org/' },
        { label: 'Workers’ Compensation Act (Proposed 2025) – Advocacy Draft', url: 'https://injuredworkersonline.org/' }
      ]
    },
    {
      id: 'theme-evidence-syntheses',
      title: 'Evidence Syntheses',
      links: [
        { label: 'Cochrane Work – Systematic Reviews', url: 'https://work.cochrane.org/' },
        { label: 'IWH – Evidence Summaries', url: 'https://www.iwh.on.ca/evidence-summaries' }
      ]
    }
  ],
  search: [
    {
      id: 'search-everything',
      title: 'Where to Search “Everything”',
      description: 'Primary multidisciplinary channels for comprehensive literature scans.',
      links: [
        { label: 'PubMed – Use MeSH (Workers’ Compensation, Return to Work)', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        { label: 'Cochrane Library – RTW Coordination, Mental Health, Cancer', url: 'https://www.cochranelibrary.com/' },
        { label: 'Agency Site Archives (WHO, ILO, OECD, Eurofound, EU-OSHA, HSE, BLS, Safe Work Australia, IWH, AWCBC, CRWDP)', url: 'https://www.google.com/' }
      ]
    }
  ],
  howTo: [
    {
      id: 'drilldowns',
      title: 'How to Use This Map (Fast Drill-Downs)',
      links: [
        { label: 'Pick Theme (e.g., Claim Suppression, RTW Mental Health)', note: 'Select conceptual focus first' },
        { label: 'Search PubMed/Cochrane + Regional Hub', note: 'Pair peer-reviewed + institutional sources' },
        { label: 'Time Filter (e.g., 2010–present)', note: 'Capture modern policy context' },
        { label: 'Trace Back via Landmarks', note: 'Add historical lineage (1897, 1914, ILO conventions)' },
        { label: 'Validate with Official Stats', note: 'AWCBC, BLS, HSE, Eurostat for denominators' }
      ]
    }
  ]
};
