/**
 * Unified Research Library Data
 * Consolidates all research content (studies, reports, articles) into a single source
 */

export type ResearchType = 'study' | 'report' | 'article';

export type ResearchTopic = 
  | 'Disabilities' 
  | 'Poverty' 
  | 'Addictions' 
  | 'Abuse' 
  | 'Homelessness'
  | 'Disability-born'
  | 'Indigenous'
  | 'Visual Disability'
  | 'Deaf/Hard of Hearing'
  | 'Mobility/Physical'
  | 'Cognitive/Intellectual'
  | 'Autism'
  | 'Brain Injury'
  | 'Invisible Disability'
  | 'Episodic Disability'
  | 'Psychosocial/Mental Health'
  | 'Chronic Pain'
  | 'Workplace Rights'
  | 'Advocacy'
  | 'Legal/Rights'
  | 'Employment'
  | 'Healthcare'
  | 'Housing'
  | 'Benefits/Support';

export type ResearchRegion = 'Federal' | 'Ontario' | 'BC' | 'Quebec' | 'Alberta' | 'Other Provincial' | 'Territorial' | 'International';

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  type: ResearchType;
  topics: ResearchTopic[];
  regions: ResearchRegion[];
  link: string;
  source?: string;
  year?: string;
  readTime?: string; // for articles
}

export const researchLibrary: ResearchItem[] = [
  // === DISABILITIES - FEDERAL ===
  {
    id: 'can-disability-survey-2022',
    title: 'Canadian Survey on Disability (CSD) 2022',
    description: 'Statistics Canada\'s national study on disability prevalence, severity, and barriers faced by Canadians aged 15+. Shows 27% of Canadians (8 million) have one or more disabilities.',
    type: 'study',
    topics: ['Disabilities'],
    regions: ['Federal'],
    link: 'https://www.statcan.gc.ca/en/survey/household/3251',
    source: 'Statistics Canada',
    year: '2022'
  },
  {
    id: 'disability-canada-2024-report',
    title: 'Canadian Survey on Disability 2024 Report',
    description: 'Statistics Canada\'s comprehensive report on disability prevalence, barriers, and supports across Canada.',
    type: 'report',
    topics: ['Disabilities'],
    regions: ['Federal'],
    link: 'https://www.statcan.gc.ca/disability-survey',
    source: 'Statistics Canada',
    year: '2024'
  },
  {
    id: 'know-your-rights',
    title: 'Know Your Rights as a Disabled Worker',
    description: 'Comprehensive guide to workplace rights, accommodations, and legal protections under Canadian human rights law.',
    type: 'article',
    topics: ['Disabilities', 'Workplace Rights', 'Legal/Rights'],
    regions: ['Federal'],
    link: 'https://www.chrc-ccdp.gc.ca/en/resources/duty-accommodate',
    readTime: '8 min read'
  },
  {
    id: 'disability-employment-gaps',
    title: 'Labour Force Survey: Disability Employment Gap',
    description: 'Federal analysis showing employment rate for persons with disabilities is 59% vs 80% for those without disabilities. Highlights systemic workplace barriers.',
    type: 'study',
    topics: ['Disabilities', 'Employment'],
    regions: ['Federal'],
    link: 'https://www150.statcan.gc.ca/n1/pub/75-006-x/2021001/article/00001-eng.htm',
    source: 'Statistics Canada',
    year: '2021'
  },
  {
    id: 'accessibility-progress-2024',
    title: 'Accessible Canada Act Progress Report',
    description: 'Federal government report on progress implementing the Accessible Canada Act and removing barriers.',
    type: 'report',
    topics: ['Disabilities', 'Legal/Rights'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/accessible-canada.html',
    source: 'ESDC Canada',
    year: '2024'
  },
  {
    id: 'uncrpd-explained',
    title: 'The UN CRPD and Your Rights',
    description: 'Understanding the UN Convention on the Rights of Persons with Disabilities and how it applies in Canada.',
    type: 'article',
    topics: ['Disabilities', 'Legal/Rights'],
    regions: ['Federal', 'International'],
    link: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-persons-disabilities',
    readTime: '11 min read'
  },
  {
    id: 'accommodations-work',
    title: 'Effective Workplace Accommodations',
    description: 'Real-world examples of workplace accommodations, how to request them, and your employer\'s duties.',
    type: 'article',
    topics: ['Disabilities', 'Workplace Rights', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/services/disability/accommodations.html',
    readTime: '10 min read'
  },
  {
    id: 'disability-tax-credit-guide',
    title: 'Disability Tax Credit: Complete Guide',
    description: 'How to qualify, apply, and maximize the Disability Tax Credit and retroactive claims.',
    type: 'article',
    topics: ['Disabilities', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit.html',
    readTime: '12 min read'
  },

  // === DISABILITIES - PROVINCIAL ===
  {
    id: 'ont-disability-outcomes',
    title: 'Ontario Disability Employment Strategy Outcomes',
    description: 'Provincial study measuring effectiveness of employment supports for persons with disabilities in Ontario.',
    type: 'study',
    topics: ['Disabilities', 'Employment'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/accessibility-ontarians-disability-act',
    source: 'Ontario Government',
    year: '2023'
  },
  {
    id: 'aoda-annual-2024',
    title: 'AODA Annual Report 2024',
    description: 'Ontario\'s Accessibility for Ontarians with Disabilities Act compliance report. Tracks provincial accessibility standards implementation.',
    type: 'report',
    topics: ['Disabilities', 'Legal/Rights'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/accessibility-laws',
    source: 'Ontario Government',
    year: '2024'
  },
  {
    id: 'bc-accessibility-plan',
    title: 'BC Accessibility Strategy 2024',
    description: 'Provincial plan to make BC the most progressive province for accessibility by 2030.',
    type: 'report',
    topics: ['Disabilities'],
    regions: ['BC'],
    link: 'https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/accessibility',
    source: 'BC Government',
    year: '2024'
  },

  // === POVERTY ===
  {
    id: 'poverty-disability-intersections',
    title: 'Disability and Poverty: Persistent Barriers in Canada',
    description: 'Research showing persons with disabilities are twice as likely to live in poverty. 1 in 5 (21.2%) Canadians with disabilities live below poverty line.',
    type: 'study',
    topics: ['Poverty', 'Disabilities'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/arc/reference2.html',
    source: 'ESDC Canada',
    year: '2023'
  },
  {
    id: 'poverty-disability-2024',
    title: 'Disability and Poverty in Canada',
    description: 'Community report examining the intersection of disability and poverty, with policy recommendations. Shows 21% poverty rate vs 10% national average.',
    type: 'report',
    topics: ['Poverty', 'Disabilities'],
    regions: ['Federal'],
    link: 'https://cwp-csp.ca/poverty-and-human-rights/poverty-in-canada',
    source: 'Canada Without Poverty',
    year: '2024'
  },
  {
    id: 'poverty-disability-cycle',
    title: 'Breaking the Disability-Poverty Cycle',
    description: 'Analysis of systemic factors trapping persons with disabilities in poverty and pathways to change.',
    type: 'article',
    topics: ['Poverty', 'Disabilities', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://cwp-csp.ca/poverty-and-human-rights',
    readTime: '9 min read'
  },
  {
    id: 'poverty-reduction-federal-2024',
    title: 'Canada Poverty Reduction Strategy Annual Report',
    description: 'Federal report tracking poverty reduction targets, including specific measures for persons with disabilities.',
    type: 'report',
    topics: ['Poverty'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/poverty-reduction.html',
    source: 'ESDC Canada',
    year: '2024'
  },
  {
    id: 'navigating-odsp',
    title: 'Navigating ODSP: Survivor\'s Guide',
    description: 'Practical guide to Ontario Disability Support Program eligibility, application process, and appeals.',
    type: 'article',
    topics: ['Poverty', 'Benefits/Support'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/ontario-disability-support-program-income-support',
    readTime: '15 min read'
  },
  {
    id: 'ont-odsp-rates-report',
    title: 'Ontario ODSP Adequacy Report',
    description: 'Independent analysis showing ODSP rates are 45% below poverty line, calling for immediate rate increases.',
    type: 'report',
    topics: ['Poverty', 'Benefits/Support'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/ontario-disability-support-program-income-support',
    source: 'Income Security Advocacy',
    year: '2024'
  },
  {
    id: 'bc-poverty-disability-rates',
    title: 'BC Poverty Reduction Strategy: Disability Focus',
    description: 'Provincial data showing 41.5% of BC residents on disability assistance live in poverty despite provincial supports.',
    type: 'study',
    topics: ['Poverty', 'Benefits/Support'],
    regions: ['BC'],
    link: 'https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/poverty-reduction-strategy',
    source: 'BC Government',
    year: '2023'
  },
  {
    id: 'cpp-disability-benefits',
    title: 'CPP Disability Benefits: What You Need to Know',
    description: 'Eligibility criteria, application tips, and common denial reasons for Canada Pension Plan Disability.',
    type: 'article',
    topics: ['Poverty', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html',
    readTime: '13 min read'
  },
  {
    id: 'food-insecurity-disability',
    title: 'Food Insecurity Among Canadians with Disabilities',
    description: 'Study showing 1 in 3 Canadian households with disabilities experience food insecurity, 2.5x the national rate.',
    type: 'study',
    topics: ['Poverty', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://proof.utoronto.ca/food-insecurity/disability/',
    source: 'University of Toronto',
    year: '2023'
  },
  {
    id: 'food-bank-reality',
    title: 'The Food Bank Reality for Disabled Canadians',
    description: 'Investigation into food insecurity rates and lived experiences of persons with disabilities relying on food banks.',
    type: 'article',
    topics: ['Poverty'],
    regions: ['Federal'],
    link: 'https://foodbankscanada.ca/poverty-and-disability',
    readTime: '8 min read'
  },

  // === ADDICTIONS ===
  {
    id: 'substance-use-disability',
    title: 'Substance Use and Disability: National Study',
    description: 'Research on co-occurrence of substance use disorders and disability. Shows 42% higher rates of substance use among persons with disabilities.',
    type: 'study',
    topics: ['Addictions', 'Psychosocial/Mental Health'],
    regions: ['Federal'],
    link: 'https://www.ccsa.ca/disability-and-substance-use',
    source: 'CCSA',
    year: '2023'
  },
  {
    id: 'ccsa-substance-use-2024',
    title: 'Canadian Substance Use Costs and Harms Report',
    description: 'National report examining substance use impacts, including specific analysis of disability populations.',
    type: 'report',
    topics: ['Addictions', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.ccsa.ca/canadian-substance-use-costs-and-harms',
    source: 'CCSA',
    year: '2024'
  },
  {
    id: 'substance-use-disability-article',
    title: 'Substance Use, Disability, and Stigma',
    description: 'Understanding the connection between disability, chronic pain, and substance use disorders.',
    type: 'article',
    topics: ['Addictions', 'Chronic Pain'],
    regions: ['Federal'],
    link: 'https://www.ccsa.ca/disability-and-substance-use-stigma',
    readTime: '10 min read'
  },
  {
    id: 'opioid-crisis-injured-workers',
    title: 'Opioid Prescribing Patterns in WCB Claimants',
    description: 'Study examining opioid dependency rates among injured workers across Canadian compensation systems.',
    type: 'study',
    topics: ['Addictions', 'Chronic Pain', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://www.iwh.on.ca/scientific-reports/opioid-prescribing',
    source: 'IWH Ontario',
    year: '2023'
  },
  {
    id: 'opioid-crisis-canada-2024',
    title: 'Opioid Crisis: Annual Report',
    description: 'Federal surveillance data on opioid-related deaths and harms. Highlights disabled and injured worker populations.',
    type: 'report',
    topics: ['Addictions', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants',
    source: 'PHAC Canada',
    year: '2024'
  },
  {
    id: 'opioid-crisis-injured-workers-article',
    title: 'Opioid Crisis: The Injured Worker Story',
    description: 'How workplace injury pain management contributes to opioid dependency and what needs to change.',
    type: 'article',
    topics: ['Addictions', 'Chronic Pain', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://www.iwh.on.ca/articles/opioid-prescribing-injured-workers',
    readTime: '12 min read'
  },
  {
    id: 'ont-concurrent-disorders',
    title: 'Concurrent Mental Health and Addiction Disorders in Ontario',
    description: 'Provincial research on prevalence and treatment gaps for concurrent disorders, particularly in disability populations.',
    type: 'study',
    topics: ['Addictions', 'Psychosocial/Mental Health'],
    regions: ['Ontario'],
    link: 'https://www.camh.ca/en/science-and-research/research-areas/concurrent-disorders',
    source: 'CAMH',
    year: '2023'
  },
  {
    id: 'ont-mental-health-addictions',
    title: 'Ontario Mental Health and Addictions Strategy',
    description: 'Provincial roadmap for improving concurrent mental health and addiction treatment services.',
    type: 'report',
    topics: ['Addictions', 'Psychosocial/Mental Health', 'Healthcare'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/roadmap-wellness-mental-health-and-addictions-strategy',
    source: 'Ontario Health',
    year: '2023'
  },
  {
    id: 'harm-reduction-disability',
    title: 'Harm Reduction and Disability Justice',
    description: 'Why harm reduction approaches are essential for persons with disabilities and concurrent disorders.',
    type: 'article',
    topics: ['Addictions', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.camh.ca/en/health-info/guides-and-publications/harm-reduction',
    readTime: '9 min read'
  },
  {
    id: 'recovery-accessibility',
    title: 'Making Addiction Recovery Accessible',
    description: 'Barriers persons with disabilities face in accessing addiction treatment and recovery supports.',
    type: 'article',
    topics: ['Addictions', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/health-canada/services/substance-use/problematic-prescription-drug-use.html',
    readTime: '11 min read'
  },

  // === ABUSE ===
  {
    id: 'violence-women-disabilities',
    title: 'Violence Against Women with Disabilities',
    description: 'Federal research showing women with disabilities experience violence at rates 2-5x higher than women without disabilities.',
    type: 'study',
    topics: ['Abuse', 'Disabilities'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence/publications/women-disabilities-violence.html',
    source: 'PHAC Canada',
    year: '2023'
  },
  {
    id: 'family-violence-disability-2024',
    title: 'Family Violence and Disability Report',
    description: 'Federal report documenting violence rates against persons with disabilities. Shows 2-5x higher victimization rates.',
    type: 'report',
    topics: ['Abuse', 'Disabilities'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence.html',
    source: 'PHAC Canada',
    year: '2024'
  },
  {
    id: 'recognizing-disability-abuse',
    title: 'Recognizing Abuse of Persons with Disabilities',
    description: 'Types of abuse, warning signs, and how to report abuse in institutional and community settings.',
    type: 'article',
    topics: ['Abuse', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence/prevention-resource-centre/women/women-disabilities-violence-fact-sheet.html',
    readTime: '10 min read'
  },
  {
    id: 'elder-abuse-disability',
    title: 'Elder Abuse and Disability in Canadian Care Settings',
    description: 'Study examining abuse prevalence in long-term care and community settings for older adults with disabilities.',
    type: 'study',
    topics: ['Abuse'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/corporate/seniors/forum/elder-abuse.html',
    source: 'ESDC Canada',
    year: '2023'
  },
  {
    id: 'elder-abuse-report-2023',
    title: 'Elder Abuse in Canada: National Report',
    description: 'Comprehensive federal report on elder abuse, with focus on older adults with disabilities in institutional settings.',
    type: 'report',
    topics: ['Abuse'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/corporate/seniors/forum/elder-abuse.html',
    source: 'ESDC Canada',
    year: '2023'
  },
  {
    id: 'financial-abuse-disability',
    title: 'Financial Abuse and Exploitation',
    description: 'How to identify financial abuse targeting persons with disabilities and steps to protect yourself.',
    type: 'article',
    topics: ['Abuse', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/financial-consumer-agency/services/vulnerable-persons.html',
    readTime: '8 min read'
  },
  {
    id: 'ont-vulnerable-persons-abuse',
    title: 'Ontario Vulnerable Persons Abuse Prevention Study',
    description: 'Provincial research on financial, physical, and emotional abuse of persons with disabilities.',
    type: 'study',
    topics: ['Abuse'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/prevent-abuse-and-neglect-older-adults',
    source: 'Ontario Government',
    year: '2023'
  },
  {
    id: 'ont-vulnerable-persons-2024',
    title: 'Ontario Vulnerable Persons Protection Report',
    description: 'Provincial report on financial, physical, and systemic abuse of vulnerable persons with disabilities.',
    type: 'report',
    topics: ['Abuse'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/reporting-abuse-and-neglect',
    source: 'Ontario Government',
    year: '2024'
  },
  {
    id: 'institutional-abuse-advocacy',
    title: 'Fighting Institutional Abuse',
    description: 'Advocacy strategies for addressing systemic abuse in care homes, hospitals, and disability services.',
    type: 'article',
    topics: ['Abuse', 'Advocacy'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/long-term-care-homes-residents-bill-rights',
    readTime: '14 min read'
  },
  {
    id: 'domestic-violence-disability',
    title: 'Domestic Violence and Disability',
    description: 'Resources and safety planning for disabled individuals experiencing intimate partner violence.',
    type: 'article',
    topics: ['Abuse'],
    regions: ['Federal'],
    link: 'https://endingviolence.org/disability-and-violence',
    readTime: '9 min read'
  },

  // === HOMELESSNESS ===
  {
    id: 'disability-homelessness-federal',
    title: 'Disability and Homelessness: National Study',
    description: 'Federal research showing persons with disabilities represent 45% of Canada\'s homeless population despite being 22% of general population.',
    type: 'study',
    topics: ['Homelessness', 'Disabilities', 'Housing'],
    regions: ['Federal'],
    link: 'https://www.infrastructure.gc.ca/homelessness-sans-abri/index-eng.html',
    source: 'Infrastructure Canada',
    year: '2023'
  },
  {
    id: 'homelessness-federal-strategy-2024',
    title: 'Reaching Home: Canada\'s Homelessness Strategy',
    description: 'Federal homelessness prevention report showing persons with disabilities comprise 45% of homeless population.',
    type: 'report',
    topics: ['Homelessness', 'Housing'],
    regions: ['Federal'],
    link: 'https://www.infrastructure.gc.ca/homelessness-sans-abri/index-eng.html',
    source: 'Infrastructure Canada',
    year: '2024'
  },
  {
    id: 'disability-homelessness-crisis',
    title: 'The Disability-Homelessness Crisis',
    description: 'Why persons with disabilities are overrepresented in homeless populations and what needs to change.',
    type: 'article',
    topics: ['Homelessness', 'Housing', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.homelesshub.ca/about-homelessness/topics/disability',
    readTime: '10 min read'
  },
  {
    id: 'mental-health-homelessness',
    title: 'Mental Health Disabilities and Housing Instability',
    description: 'Study examining pathways between mental health disabilities and homelessness in Canadian cities.',
    type: 'study',
    topics: ['Homelessness', 'Psychosocial/Mental Health', 'Housing'],
    regions: ['Federal'],
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/housing-and-homelessness',
    source: 'Mental Health Commission',
    year: '2023'
  },
  {
    id: 'mental-health-housing-first',
    title: 'Housing First and Mental Health Disabilities',
    description: 'How Housing First programs serve persons with mental health disabilities and addiction.',
    type: 'article',
    topics: ['Homelessness', 'Psychosocial/Mental Health', 'Housing'],
    regions: ['Federal'],
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/housing-and-homelessness',
    readTime: '11 min read'
  },
  {
    id: 'bc-homelessness-count',
    title: 'BC Homeless Count: Disability Prevalence',
    description: 'Provincial point-in-time count showing 54% of homeless individuals in BC report having a disability.',
    type: 'study',
    topics: ['Homelessness'],
    regions: ['BC'],
    link: 'https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/poverty-reduction-strategy/homelessness',
    source: 'BC Government',
    year: '2024'
  },
  {
    id: 'bc-housing-report-2024',
    title: 'BC Housing Affordability and Homelessness Report',
    description: 'Provincial analysis showing 54% of homeless individuals in BC have disabilities, with average 5-7 year housing waitlists.',
    type: 'report',
    topics: ['Homelessness', 'Housing'],
    regions: ['BC'],
    link: 'https://www.bchousing.org/research-centre',
    source: 'BC Housing',
    year: '2024'
  },
  {
    id: 'ont-housing-waitlist-disability',
    title: 'Ontario Social Housing Waitlist Analysis',
    description: 'Provincial study showing persons with disabilities wait 30% longer for accessible housing, averaging 5-7 years.',
    type: 'study',
    topics: ['Homelessness', 'Housing'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/social-housing',
    source: 'Ontario Government',
    year: '2023'
  },
  {
    id: 'ont-homelessness-counts-2023',
    title: 'Ontario Point-in-Time Homeless Counts',
    description: 'Provincial homeless count data showing disability prevalence, mental health needs, and service gaps.',
    type: 'report',
    topics: ['Homelessness'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/homelessness-ontario',
    source: 'Ontario Government',
    year: '2023'
  },
  {
    id: 'navigating-housing-waitlists',
    title: 'Surviving Housing Waitlists',
    description: 'Practical guide to navigating 5-7 year social housing waitlists while homeless or precariously housed.',
    type: 'article',
    topics: ['Homelessness', 'Housing'],
    regions: ['Federal'],
    link: 'https://www.cmhc-schl.gc.ca/en/consumers/housing-accessibility',
    readTime: '12 min read'
  },
  {
    id: 'accessible-housing-shortage',
    title: 'The Accessible Housing Crisis',
    description: 'Investigation into Canada\'s shortage of accessible, affordable housing and its impact on disabled persons.',
    type: 'article',
    topics: ['Homelessness', 'Housing'],
    regions: ['Federal'],
    link: 'https://www.cmhc-schl.gc.ca/en/developing-and-renovating/accessible-adaptable-housing',
    readTime: '13 min read'
  },

  // === DISABILITY-BORN / CONGENITAL ===
  {
    id: 'early-childhood-disability',
    title: 'Early Childhood Disability in Canada',
    description: 'Federal study on prevalence and support needs for children born with disabilities. Examines access to early intervention services.',
    type: 'study',
    topics: ['Disability-born'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/diseases/developmental-disabilities.html',
    source: 'PHAC Canada',
    year: '2023'
  },
  {
    id: 'early-intervention-report-2024',
    title: 'Early Childhood Intervention Services in Canada',
    description: 'Federal review of early intervention services for children born with disabilities, identifying access gaps.',
    type: 'report',
    topics: ['Disability-born', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/diseases/developmental-disabilities.html',
    source: 'PHAC Canada',
    year: '2024'
  },
  {
    id: 'growing-up-disabled-canada',
    title: 'Growing Up Disabled in Canada',
    description: 'First-person narratives of Canadians born with disabilities navigating education, healthcare, and independence.',
    type: 'article',
    topics: ['Disability-born'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/diseases/developmental-disabilities.html',
    readTime: '10 min read'
  },
  {
    id: 'congenital-disabilities-lifespan',
    title: 'Lifespan Outcomes for Congenital Disabilities',
    description: 'Longitudinal research tracking health, employment, and social outcomes for Canadians with congenital disabilities.',
    type: 'study',
    topics: ['Disability-born', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.cihr-irsc.gc.ca/e/193.html',
    source: 'CIHR',
    year: '2023'
  },
  {
    id: 'ndis-comparison-study',
    title: 'Disability Supports: Canada vs International Models',
    description: 'Comparative analysis of supports for persons born with disabilities, examining gaps in Canadian system.',
    type: 'study',
    topics: ['Disability-born', 'Benefits/Support'],
    regions: ['Federal', 'International'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/arc.html',
    source: 'ESDC Canada',
    year: '2023'
  },
  {
    id: 'transition-to-adulthood',
    title: 'The Transition Cliff: Turning 18 with Disabilities',
    description: 'Navigating the loss of pediatric services and transition to adult systems for youth with congenital disabilities.',
    type: 'article',
    topics: ['Disability-born', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.cihr-irsc.gc.ca/e/193.html',
    readTime: '11 min read'
  },
  {
    id: 'rdsp-planning-guide',
    title: 'Registered Disability Savings Plan (RDSP) Guide',
    description: 'Complete guide to RDSPs, grants, bonds, and long-term financial planning for persons with disabilities.',
    type: 'article',
    topics: ['Disability-born', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-disability-savings-plan-rdsp.html',
    readTime: '14 min read'
  },
  {
    id: 'ont-special-needs-strategy',
    title: 'Ontario Special Needs Strategy',
    description: 'Provincial framework for supporting children and youth with developmental disabilities.',
    type: 'report',
    topics: ['Disability-born'],
    regions: ['Ontario'],
    link: 'https://www.ontario.ca/page/ontario-autism-program',
    source: 'Ontario MCCSS',
    year: '2024'
  },

  // === INDIGENOUS / ABORIGINAL ===
  {
    id: 'indigenous-disability-health-survey',
    title: 'First Nations Regional Health Survey: Disability',
    description: 'National study showing Indigenous peoples experience disability at rates 1.5x higher than non-Indigenous Canadians. Examines barriers in on-reserve and urban settings.',
    type: 'study',
    topics: ['Indigenous', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://fnigc.ca/fnrehs/',
    source: 'FNIGC',
    year: '2023'
  },
  {
    id: 'indigenous-disability-federal-2024',
    title: 'Indigenous Peoples and Disability in Canada',
    description: 'Federal report showing Indigenous peoples experience disability at 1.5x national rate. Examines systemic barriers, jurisdictional gaps, and cultural approaches.',
    type: 'report',
    topics: ['Indigenous', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.sac-isc.gc.ca/eng/1602010609492/1602010631711',
    source: 'ISC Canada',
    year: '2024'
  },
  {
    id: 'indigenous-disability-advocacy',
    title: 'Indigenous Disability Advocacy and Self-Determination',
    description: 'Guide to navigating disability systems as Indigenous person, including Jordan\'s Principle, cultural accommodations, and Two-Spirit perspectives.',
    type: 'article',
    topics: ['Indigenous', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.sac-isc.gc.ca/eng/1602010609492/1602010631711',
    readTime: '12 min read'
  },
  {
    id: 'jordan-principle-disability',
    title: 'Jordan\'s Principle and Disability Supports',
    description: 'Research on access to disability services for First Nations children, examining jurisdictional barriers and Jordan\'s Principle implementation.',
    type: 'study',
    topics: ['Indigenous', 'Disability-born'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/indigenous-services-canada/services/jordans-principle.html',
    source: 'ISC Canada',
    year: '2023'
  },
  {
    id: 'first-nations-disability-services',
    title: 'First Nations Disability Services Report',
    description: 'Analysis of on-reserve disability supports, Jordan\'s Principle implementation, and service delivery gaps.',
    type: 'report',
    topics: ['Indigenous', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://fnigc.ca/research-reports/',
    source: 'FNIGC',
    year: '2024'
  },
  {
    id: 'first-nations-disability-services-article',
    title: 'Accessing Disability Services on Reserve',
    description: 'Practical guide to on-reserve disability supports, jurisdictional issues, and how to leverage Jordan\'s Principle.',
    type: 'article',
    topics: ['Indigenous', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://fnigc.ca/resources/',
    readTime: '10 min read'
  },
  {
    id: 'inuit-disability-nunavut',
    title: 'Disability and Accessibility in Inuit Communities',
    description: 'Territorial study on disability prevalence, service access barriers, and cultural approaches to disability in Nunavut Inuit communities.',
    type: 'study',
    topics: ['Indigenous'],
    regions: ['Territorial'],
    link: 'https://www.gov.nu.ca/health',
    source: 'Government of Nunavut',
    year: '2023'
  },
  {
    id: 'inuit-accessibility-strategy',
    title: 'Inuit Nunangat Accessibility Strategy',
    description: 'Regional report on disability and accessibility in Inuit territories, addressing northern barriers and cultural inclusion.',
    type: 'report',
    topics: ['Indigenous'],
    regions: ['Territorial'],
    link: 'https://www.itk.ca/disability-accessibility/',
    source: 'ITK',
    year: '2023'
  },
  {
    id: 'inuit-disability-northern-barriers',
    title: 'Disability in Inuit Communities: Unique Barriers',
    description: 'Understanding northern accessibility challenges, medical travel, and culturally-appropriate disability supports in Inuit Nunangat.',
    type: 'article',
    topics: ['Indigenous', 'Healthcare'],
    regions: ['Territorial'],
    link: 'https://www.itk.ca/disability/',
    readTime: '11 min read'
  },
  {
    id: 'metis-disability-outcomes',
    title: 'Métis Nation Health and Disability Study',
    description: 'Multi-provincial research on disability rates, chronic conditions, and healthcare access among Métis populations.',
    type: 'study',
    topics: ['Indigenous', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.metisnation.ca/health',
    source: 'Métis National Council',
    year: '2023'
  },
  {
    id: 'metis-health-disability-report',
    title: 'Métis Nation Disability and Health Report',
    description: 'Multi-provincial analysis of disability prevalence, healthcare access, and support needs in Métis communities.',
    type: 'report',
    topics: ['Indigenous', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.metisnation.ca/publications',
    source: 'Métis National Council',
    year: '2024'
  },
  {
    id: 'metis-disability-rights',
    title: 'Métis Disability Rights and Recognition',
    description: 'How Métis citizens can access federal and provincial disability supports, plus Métis Nation-specific programs.',
    type: 'article',
    topics: ['Indigenous', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.metisnation.ca/health-disability',
    readTime: '9 min read'
  },
  {
    id: 'indigenous-residential-schools-disability',
    title: 'Intergenerational Trauma and Disability',
    description: 'Study linking residential school trauma to higher disability rates in Indigenous communities, including PTSD, addiction, and chronic illness.',
    type: 'study',
    topics: ['Indigenous', 'Psychosocial/Mental Health'],
    regions: ['Federal'],
    link: 'https://www.rcaanc-cirnac.gc.ca/eng/1450124405592/1529106060525',
    source: 'CIRNAC',
    year: '2023'
  },
  {
    id: 'indigenous-traditional-healing',
    title: 'Traditional Healing and Western Disability Systems',
    description: 'Integrating Indigenous wellness approaches with conventional disability supports and medical evidence.',
    type: 'article',
    topics: ['Indigenous', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.ccnsa-nccah.ca/traditional-healing',
    readTime: '13 min read'
  },

  // === VISUAL DISABILITIES ===
  {
    id: 'vision-loss-canada-study',
    title: 'Vision Loss and Blindness in Canada',
    description: 'National epidemiological study showing 1.5 million Canadians have vision loss. Examines employment barriers and assistive technology gaps.',
    type: 'study',
    topics: ['Visual Disability', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.nib.ca/research',
    source: 'National Institute for the Blind',
    year: '2024'
  },
  {
    id: 'vision-loss-report-2024',
    title: 'Vision Loss and Blindness: National Report',
    description: 'Federal report on 1.5 million Canadians with vision loss. Details employment barriers, technology access, and CNIB service gaps.',
    type: 'report',
    topics: ['Visual Disability', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.nib.ca/reports',
    source: 'National Institute for the Blind',
    year: '2024'
  },
  {
    id: 'navigating-vision-loss',
    title: 'Navigating Life with Vision Loss',
    description: 'Guide to assistive technology, CNIB services, accessible employment, and advocating for workplace accommodations.',
    type: 'article',
    topics: ['Visual Disability', 'Employment', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.cnib.ca/en/programs-and-services',
    readTime: '14 min read'
  },

  // === DEAF / HARD OF HEARING ===
  {
    id: 'deaf-employment-canada',
    title: 'Deaf and Hard of Hearing Employment Study',
    description: 'Federal research showing unemployment rate for Deaf Canadians is 2.5x national average. Examines communication barriers and discrimination.',
    type: 'study',
    topics: ['Deaf/Hard of Hearing', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.cad.ca/research',
    source: 'CAD',
    year: '2023'
  },
  {
    id: 'deaf-community-rights-report',
    title: 'Deaf Community Rights and Recognition',
    description: 'Advocacy report calling for official recognition of ASL/LSQ, interpreter access, and ending Deaf unemployment crisis.',
    type: 'report',
    topics: ['Deaf/Hard of Hearing', 'Legal/Rights'],
    regions: ['Federal'],
    link: 'https://www.cad.ca/advocacy-reports/',
    source: 'CAD',
    year: '2024'
  },
  {
    id: 'deaf-workplace-rights',
    title: 'Deaf Workers: Know Your Rights',
    description: 'Legal guide to ASL/LSQ interpreter access, communication accommodations, and fighting audism in the workplace.',
    type: 'article',
    topics: ['Deaf/Hard of Hearing', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://www.cad.ca/workplace-rights/',
    readTime: '11 min read'
  },

  // === MOBILITY / PHYSICAL DISABILITIES ===
  {
    id: 'spinal-cord-injury-outcomes',
    title: 'Spinal Cord Injury Canada: Long-term Outcomes',
    description: 'Longitudinal study tracking employment, housing, and health outcomes for Canadians with spinal cord injuries.',
    type: 'study',
    topics: ['Mobility/Physical', 'Employment', 'Housing'],
    regions: ['Federal'],
    link: 'https://sci-can.ca/research/',
    source: 'SCI Canada',
    year: '2023'
  },
  {
    id: 'spinal-cord-injury-report',
    title: 'Spinal Cord Injury Canada: Annual Report',
    description: 'National report on SCI prevalence, rehabilitation access, attendant care shortages, and employment outcomes.',
    type: 'report',
    topics: ['Mobility/Physical', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://sci-can.ca/annual-reports/',
    source: 'SCI Canada',
    year: '2024'
  },
  {
    id: 'wheelchair-user-employment',
    title: 'Wheelchair Users: Employment Rights',
    description: 'Guide to physical accessibility accommodations, attendant care at work, and fighting discrimination.',
    type: 'article',
    topics: ['Mobility/Physical', 'Employment', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/mobility.html',
    readTime: '12 min read'
  },
  {
    id: 'ms-workplace-accommodation',
    title: 'Multiple Sclerosis: Workplace Accommodation Study',
    description: 'Analysis of MS-specific accommodation needs, fatigue management, and employment retention strategies.',
    type: 'study',
    topics: ['Mobility/Physical', 'Employment'],
    regions: ['Federal'],
    link: 'https://mssociety.ca/research',
    source: 'MS Society Canada',
    year: '2023'
  },
  {
    id: 'ms-canada-report',
    title: 'Multiple Sclerosis: Impact and Needs',
    description: 'Report on 90,000+ Canadians living with MS, examining disability progression, treatment access, and financial strain.',
    type: 'report',
    topics: ['Mobility/Physical', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://mssociety.ca/reports',
    source: 'MS Society Canada',
    year: '2024'
  },
  {
    id: 'ms-workplace-management',
    title: 'Managing MS in the Workplace',
    description: 'Strategies for fatigue management, episodic disability disclosure, and maintaining employment with MS.',
    type: 'article',
    topics: ['Mobility/Physical', 'Episodic Disability', 'Employment'],
    regions: ['Federal'],
    link: 'https://mssociety.ca/managing-ms/employment',
    readTime: '11 min read'
  },

  // === COGNITIVE / INTELLECTUAL / AUTISM / BRAIN INJURY ===
  {
    id: 'intellectual-disability-employment',
    title: 'Employment Outcomes for Intellectual Disabilities',
    description: 'Federal study on supported employment, job coaching, and inclusive hiring practices for persons with intellectual disabilities.',
    type: 'study',
    topics: ['Cognitive/Intellectual', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/research.html',
    source: 'ESDC Canada',
    year: '2023'
  },
  {
    id: 'intellectual-disability-inclusion',
    title: 'Inclusion Canada: State of the Nation',
    description: 'Federal report on employment, housing, and social inclusion for persons with intellectual disabilities.',
    type: 'report',
    topics: ['Cognitive/Intellectual', 'Employment', 'Housing'],
    regions: ['Federal'],
    link: 'https://inclusioncanada.ca/resources/',
    source: 'Inclusion Canada',
    year: '2024'
  },
  {
    id: 'intellectual-disability-self-advocacy',
    title: 'Self-Advocacy for Intellectual Disabilities',
    description: 'People First language, rights to supported decision-making, and fighting for inclusive employment.',
    type: 'article',
    topics: ['Cognitive/Intellectual', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://inclusioncanada.ca/self-advocacy/',
    readTime: '9 min read'
  },
  {
    id: 'autism-adults-canada',
    title: 'Autism in Adulthood: Canadian Study',
    description: 'Research on transition challenges, underemployment, and mental health outcomes for autistic adults in Canada.',
    type: 'study',
    topics: ['Autism', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.autismcanada.org/research/',
    source: 'Autism Canada',
    year: '2023'
  },
  {
    id: 'autism-adults-canada-report',
    title: 'Autism in Adulthood: Canada Report',
    description: 'National analysis showing 80% underemployment rate for autistic adults, calling for policy reform.',
    type: 'report',
    topics: ['Autism', 'Employment', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.autismcanada.org/reports/',
    source: 'Autism Canada',
    year: '2024'
  },
  {
    id: 'autism-employment-guide',
    title: 'Autistic Adults: Employment Survival Guide',
    description: 'Sensory accommodations, social communication supports, disclosure strategies, and finding inclusive employers.',
    type: 'article',
    topics: ['Autism', 'Employment', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://www.autismcanada.org/employment-guide/',
    readTime: '14 min read'
  },
  {
    id: 'brain-injury-recovery',
    title: 'Acquired Brain Injury: Recovery and Rehabilitation',
    description: 'Multi-site study on ABI rehabilitation outcomes, cognitive supports, and return-to-work success rates.',
    type: 'study',
    topics: ['Brain Injury', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.braininjurycanada.ca/research/',
    source: 'Brain Injury Canada',
    year: '2023'
  },
  {
    id: 'brain-injury-report',
    title: 'Acquired Brain Injury: National Strategy',
    description: 'Federal report calling for coordinated ABI supports, rehabilitation standards, and long-term care access.',
    type: 'report',
    topics: ['Brain Injury', 'Healthcare'],
    regions: ['Federal'],
    link: 'https://www.braininjurycanada.ca/reports/',
    source: 'Brain Injury Canada',
    year: '2023'
  },
  {
    id: 'brain-injury-recovery-advocacy',
    title: 'Brain Injury Recovery and Advocacy',
    description: 'Understanding cognitive changes, accessing rehab, managing fatigue, and rebuilding your life post-ABI.',
    type: 'article',
    topics: ['Brain Injury', 'Healthcare', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.braininjurycanada.ca/resources/',
    readTime: '13 min read'
  },

  // === INVISIBLE / EPISODIC DISABILITIES ===
  {
    id: 'fibromyalgia-disability-recognition',
    title: 'Fibromyalgia and Disability Claim Outcomes',
    description: 'Study on validation barriers for fibromyalgia in disability systems, examining denial rates and appeal strategies.',
    type: 'study',
    topics: ['Invisible Disability', 'Chronic Pain', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.fmaware.org/research',
    source: 'FM Aware',
    year: '2023'
  },
  {
    id: 'invisible-disabilities-recognition',
    title: 'Invisible Disabilities: Validation Crisis',
    description: 'Advocacy report on systemic barriers for persons with fibromyalgia, ME/CFS, chronic pain, and other invisible disabilities.',
    type: 'report',
    topics: ['Invisible Disability', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/invisible.html',
    source: 'Disability Alliance',
    year: '2024'
  },
  {
    id: 'fibromyalgia-validation-fight',
    title: 'Fibromyalgia: The Validation Fight',
    description: 'How to document invisible pain, find validating doctors, and strengthen disability claims for fibromyalgia.',
    type: 'article',
    topics: ['Invisible Disability', 'Chronic Pain', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.fmaware.org/disability-advocacy/',
    readTime: '12 min read'
  },
  {
    id: 'episodic-disabilities-policy',
    title: 'Episodic Disabilities: Policy Framework',
    description: 'Federal policy recommendations for accommodating episodic conditions like MS, epilepsy, Crohn\'s, and mental health disabilities.',
    type: 'report',
    topics: ['Episodic Disability'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/public-health/services/chronic-diseases/episodic-disability.html',
    source: 'PHAC Canada',
    year: '2023'
  },
  {
    id: 'invisible-disability-validation',
    title: 'Invisible Disabilities: Being Believed',
    description: 'Strategies for documenting, proving, and advocating for disabilities that aren\'t visible to others.',
    type: 'article',
    topics: ['Invisible Disability', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/invisible-disabilities.html',
    readTime: '9 min read'
  },

  // === PSYCHOSOCIAL / MENTAL HEALTH ===
  {
    id: 'schizophrenia-employment-barriers',
    title: 'Schizophrenia and Employment Participation',
    description: 'Research on supported employment models and workplace integration for persons with schizophrenia.',
    type: 'study',
    topics: ['Psychosocial/Mental Health', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.schizophrenia.ca/research',
    source: 'Schizophrenia Society',
    year: '2023'
  },
  {
    id: 'psychosocial-disability-rights',
    title: 'Psychosocial Disability Rights in Canada',
    description: 'Report examining discrimination, forced treatment, and rights violations for persons with mental health disabilities.',
    type: 'report',
    topics: ['Psychosocial/Mental Health', 'Legal/Rights'],
    regions: ['Federal'],
    link: 'https://www.ohrc.on.ca/en/policy-preventing-discrimination-based-mental-health-disabilities-and-addictions',
    source: 'OHRC',
    year: '2024'
  },
  {
    id: 'schizophrenia-recovery-employment',
    title: 'Schizophrenia: Recovery and Employment',
    description: 'Supported employment, medication management at work, disclosure decisions, and fighting stigma.',
    type: 'article',
    topics: ['Psychosocial/Mental Health', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.schizophrenia.ca/employment-recovery',
    readTime: '12 min read'
  },
  {
    id: 'bipolar-disability-benefits',
    title: 'Bipolar Disorder: Disability Benefit Access',
    description: 'Study on episodic disability recognition in CPP-D and provincial systems for persons with bipolar disorder.',
    type: 'study',
    topics: ['Psychosocial/Mental Health', 'Episodic Disability', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.mdsc.ca/research/',
    source: 'MDSC',
    year: '2023'
  },
  {
    id: 'bipolar-workplace-management',
    title: 'Bipolar Disorder: Workplace Management',
    description: 'Managing mood episodes at work, episodic disability accommodations, and medical leave planning.',
    type: 'article',
    topics: ['Psychosocial/Mental Health', 'Episodic Disability', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.mdsc.ca/workplace-bipolar/',
    readTime: '11 min read'
  },
  {
    id: 'ptsd-disability-claims',
    title: 'PTSD and Complex PTSD: Disability Guide',
    description: 'Documenting trauma-based disability, finding trauma-informed practitioners, and accessing benefits.',
    type: 'article',
    topics: ['Psychosocial/Mental Health', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.ptsdassociation.com/disability-benefits',
    readTime: '13 min read'
  },

  // === CHRONIC PAIN ===
  {
    id: 'chronic-pain',
    title: 'Chronic Pain in Disability Claims',
    description: 'Evidence-based research on chronic pain management and its recognition in disability benefit adjudication.',
    type: 'study',
    topics: ['Chronic Pain', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/chronic-pain-disability',
    source: 'NCBI',
    year: '2023'
  },
  {
    id: 'chronic-pain-validation',
    title: 'Chronic Pain: Fighting for Validation',
    description: 'Strategies for documenting and advocating for chronic pain recognition in disability claims and workplace settings.',
    type: 'article',
    topics: ['Chronic Pain', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://painbc.ca/resources/chronic-pain-advocacy',
    readTime: '10 min read'
  },

  // === WORKPLACE / WSIB ===
  {
    id: 'wsib-cptsd',
    title: 'CPTSD in Injured Workers',
    description: 'Research on Complex Post-Traumatic Stress Disorder prevalence and impacts in workplace injury cases.',
    type: 'study',
    topics: ['Psychosocial/Mental Health', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://pubmed.ncbi.nlm.nih.gov/topics/workplace-ptsd',
    source: 'NCBI',
    year: '2023'
  },
  {
    id: 'wsib-annual-2023',
    title: 'WSIB Annual Report 2023',
    description: 'Workplace Safety and Insurance Board annual statistics on workplace injuries, claims, and return-to-work outcomes.',
    type: 'report',
    topics: ['Workplace Rights'],
    regions: ['Ontario'],
    link: 'https://www.wsib.ca/en/annualreport',
    source: 'WSIB Ontario',
    year: '2023'
  },
  {
    id: 'rtw-barriers',
    title: 'Return-to-Work Barriers Study',
    description: 'Comprehensive study on systemic barriers preventing successful return-to-work outcomes for injured workers.',
    type: 'study',
    topics: ['Workplace Rights', 'Employment'],
    regions: ['Federal'],
    link: 'https://www.iwh.on.ca/scientific-reports',
    source: 'IWH Ontario',
    year: '2023'
  },
  {
    id: 'mental-health-work-2023',
    title: 'Mental Health in the Workplace',
    description: 'Report on mental health accommodations, stigma, and workplace supports across Canadian industries.',
    type: 'report',
    topics: ['Psychosocial/Mental Health', 'Workplace Rights'],
    regions: ['Federal'],
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/workplace',
    source: 'Mental Health Commission',
    year: '2023'
  },
  {
    id: 'mental-health-stigma',
    title: 'Breaking Mental Health Stigma at Work',
    description: 'How to advocate for mental health accommodations and combat stigma in workplace and claims processes.',
    type: 'article',
    topics: ['Psychosocial/Mental Health', 'Workplace Rights', 'Advocacy'],
    regions: ['Federal'],
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/workplace',
    readTime: '7 min read'
  },

  // === ADVOCACY / GENERAL ===
  {
    id: 'navigating-appeals',
    title: 'Navigating the Appeals Process',
    description: 'Step-by-step guide to appealing disability benefit denials, including timelines, evidence requirements, and hearing preparation.',
    type: 'article',
    topics: ['Advocacy', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/arc/appeals.html',
    readTime: '12 min read'
  },
  {
    id: 'evidence-collection',
    title: 'Building Your Evidence File',
    description: 'What documentation to collect, how to organize it, and strategies for strengthening your disability claim.',
    type: 'article',
    topics: ['Advocacy', 'Benefits/Support'],
    regions: ['Federal'],
    link: 'https://www.disabilityalliancebc.org/factsheet/building-your-case',
    readTime: '15 min read'
  },
  {
    id: 'intersectionality',
    title: 'Disability and Intersectionality',
    description: 'Examining how race, gender, class, and other identities intersect with disability experiences and advocacy.',
    type: 'article',
    topics: ['Advocacy', 'Legal/Rights'],
    regions: ['Federal'],
    link: 'https://www.ohrc.on.ca/en/policy-ableism-and-discrimination-based-disability',
    readTime: '9 min read'
  },
  {
    id: 'uncrpd-canada-review',
    title: 'UN CRPD Canada Review 2023',
    description: 'United Nations review of Canada\'s implementation of the Convention on the Rights of Persons with Disabilities.',
    type: 'report',
    topics: ['Legal/Rights'],
    regions: ['Federal', 'International'],
    link: 'https://www.ohchr.org/EN/HRBodies/CRPD/Pages/CountryReports.aspx',
    source: 'UN Human Rights',
    year: '2023'
  },
];

// Export utility functions
export function filterByType(items: ResearchItem[], type: ResearchType): ResearchItem[] {
  return items.filter(item => item.type === type);
}

export function filterByTopic(items: ResearchItem[], topic: ResearchTopic): ResearchItem[] {
  return items.filter(item => item.topics.includes(topic));
}

export function filterByRegion(items: ResearchItem[], region: ResearchRegion): ResearchItem[] {
  return items.filter(item => item.regions.includes(region));
}

export function searchResearch(items: ResearchItem[], query: string): ResearchItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  
  return items.filter(item => 
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.topics.some(topic => topic.toLowerCase().includes(q)) ||
    item.regions.some(region => region.toLowerCase().includes(q)) ||
    item.source?.toLowerCase().includes(q)
  );
}

export const allTopics: ResearchTopic[] = [
  'Disabilities',
  'Poverty',
  'Addictions',
  'Abuse',
  'Homelessness',
  'Disability-born',
  'Indigenous',
  'Visual Disability',
  'Deaf/Hard of Hearing',
  'Mobility/Physical',
  'Cognitive/Intellectual',
  'Autism',
  'Brain Injury',
  'Invisible Disability',
  'Episodic Disability',
  'Psychosocial/Mental Health',
  'Chronic Pain',
  'Workplace Rights',
  'Advocacy',
  'Legal/Rights',
  'Employment',
  'Healthcare',
  'Housing',
  'Benefits/Support',
];

export const allRegions: ResearchRegion[] = [
  'Federal',
  'Ontario',
  'BC',
  'Quebec',
  'Alberta',
  'Other Provincial',
  'Territorial',
  'International',
];
