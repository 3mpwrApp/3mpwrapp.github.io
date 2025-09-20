export type MasterIndexLink = { label: string; url?: string; note?: string };
export type MasterIndexSection = { id: string; title: string; description?: string; links: MasterIndexLink[]; subsections?: MasterIndexSection[] };

export interface MasterIndexRoot {
  canada: MasterIndexSection[];
  global: MasterIndexSection[];
  landmarks: MasterIndexSection[];
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
      title: 'Landmark “Beginning” Documents',
      links: [
        { label: 'UK Workmen’s Compensation Act 1897', url: 'https://api.parliament.uk/historic-hansard/acts/workmens-compensation-act-1897' },
        { label: 'Canada Meredith Report (1913–1914)', url: 'https://www.wsib.ca/en/history' },
        { label: 'ILO Employment Injury Benefits Convention No. 121 (1964)', url: 'https://www.ilo.org/' },
        { label: 'WHO ICIDH (1980) → ICF (2001)', url: 'https://www.who.int/classifications/icf/en/' },
        { label: 'Historical Overviews of Workers’ Compensation Evolution', url: 'https://papers.ssrn.com/' }
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
