import { Resource } from "../types/models";

export const resources: Resource[] = [
  // Tools & Downloads
  { id: "r1", title: "Mental Health Toolkit", description: "Guides and exercises for daily wellbeing.", scope: "canada", category: "tools_downloads" },
  { id: "r2", title: "Community Support Map", description: "Find local support groups and services.", scope: "canada", category: "tools_downloads" },
  { id: "r3", title: "Advocacy Handbook", description: "Best practices for effective advocacy.", scope: "canada", category: "tools_downloads" },
  { id: "tl-checklists", title: "Doctor Visit Checklist", description: "Prep questions and key info for appointments.", url: "https://choosingwiselycanada.org/patient-resources/4-questions/", scope: "canada", category: "tools_downloads" },
  { id: "tl-medlog", title: "Medication Log (Printable)", description: "Track medications, doses, and changes.", url: "https://www.heartandstroke.ca/-/media/pdf-files/canada/2020-lists/medication-list_en.ashx", scope: "canada", category: "tools_downloads" },
  { id: "tl-paintracker", title: "Pain Tracker (Apps)", description: "Manage My Pain, Flaredown.", url: "https://www.managemypain.com/", scope: "canada", category: "tools_downloads" },
  { id: "tl-accommodation-letter", title: "Workplace Accommodation Request", description: "In‑app template and guidance.", scope: "canada", category: "tools_downloads" },
  { id: "tl-appeal-letter", title: "Appeal Letter (Denied Benefits)", description: "In‑app template and guidance.", scope: "canada", category: "tools_downloads" },
  { id: "tl-union-letter", title: "Union Representation/Request Letter", description: "In‑app template to request support from your union.", scope: "canada", category: "tools_downloads" },

  // Work & Financial Support — Canada-wide
  { id: "wf-employment-rights-fed", title: "Employment Rights (Federal)", description: "Federal labour standards and workplace rights.", url: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html", scope: "canada", category: "work_financial" },
  { id: "wf-human-rights-canada", title: "Human Rights in Canada", description: "Canadian Human Rights and duty to accommodate.", url: "https://www.chrc-ccdp.gc.ca/en/resources/what-duty-accommodate", scope: "canada", category: "work_financial" },
  { id: "wf-employment-support", title: "Employment Supports (Canada)", description: "Funding and supports for persons with disabilities.", url: "https://www.canada.ca/en/employment-social-development/services/funding/disability-opportunity.html", scope: "canada", category: "work_financial" },
  { id: "wf-ccrw", title: "CCRW", description: "Canadian Council on Rehabilitation and Work — employment services.", url: "https://www.ccrw.org/", scope: "canada", category: "work_financial" },
  { id: "wf-asc", title: "Accessibility Standards Canada", description: "Federal accessibility standards and resources.", url: "https://accessible.canada.ca/", scope: "canada", category: "work_financial" },
  { id: "wf-uncrpd", title: "UN CRPD", description: "UN Convention on the Rights of Persons with Disabilities.", url: "https://www.un.org/development/desa/disabilities/convention-on-the-rights-of-persons-with-disabilities.html", scope: "canada", category: "work_financial" },
  { id: "wf-benefits-canada", title: "Disability Benefits (Canada)", description: "Overview of federal disability benefits.", url: "https://www.canada.ca/en/services/benefits/disability.html", scope: "canada", category: "work_financial" },
  { id: "wf-cppd", title: "CPP Disability", description: "Canada Pension Plan disability benefits.", url: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html", scope: "canada", category: "work_financial" },
  { id: "wf-dtc", title: "Disability Tax Credit", description: "CRA Disability Tax Credit information.", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/persons-disabilities/disability-tax-credit.html", scope: "canada", category: "work_financial" },

  // Work & Financial Support — Provincial examples
  { id: "wf-ow", title: "Ontario Works (OW)", description: "Financial and employment assistance.", url: "https://www.ontario.ca/page/ontario-works", scope: "province", province: "ON", category: "work_financial" },
  { id: "wf-odsp", title: "ODSP", description: "Ontario Disability Support Program.", url: "https://www.ontario.ca/page/ontario-disability-support-program-odsp", scope: "province", province: "ON", category: "work_financial" },
  { id: "wf-on-esa", title: "Employment Standards (ON)", description: "Guide to the Employment Standards Act.", url: "https://www.ontario.ca/document/your-guide-employment-standards-act-0", scope: "province", province: "ON", category: "work_financial" },
  { id: "wf-on-ohrc", title: "Human Rights (ON)", description: "Ontario Human Rights Commission.", url: "https://www.ohrc.on.ca/", scope: "province", province: "ON", category: "work_financial" },
  { id: "wf-on-aoda", title: "Accessibility (ON)", description: "Accessibility for Ontarians with Disabilities Act (AODA).", url: "https://www.ontario.ca/page/accessibility-laws", scope: "province", province: "ON", category: "work_financial" },

  // British Columbia
  { id: "wf-bc-standards", title: "Employment Standards (BC)", description: "Hours, wages, leaves and more.", url: "https://www2.gov.bc.ca/gov/content/employment-business/employment-standards-advice/employment-standards", scope: "province", province: "BC", category: "work_financial" },
  { id: "wf-bc-hrc", title: "Human Rights (BC)", description: "BC Human Rights resources.", url: "https://bchumanrights.ca/", scope: "province", province: "BC", category: "work_financial" },
  { id: "wf-bc-pwd", title: "Disability Assistance (BC)", description: "PWD designation & assistance.", url: "https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/bc-employment-and-assistance-program/disability-assistance", scope: "province", province: "BC", category: "work_financial" },
  { id: "wf-bc-workbc", title: "WorkBC", description: "Employment services and supports.", url: "https://www.workbc.ca/", scope: "province", province: "BC", category: "work_financial" },

  // Alberta
  { id: "wf-ab-standards", title: "Employment Standards (AB)", description: "Rules for pay, hours, overtime.", url: "https://www.alberta.ca/employment-standards", scope: "province", province: "AB", category: "work_financial" },
  { id: "wf-ab-hrc", title: "Human Rights (AB)", description: "Alberta Human Rights Commission.", url: "https://www.albertahumanrights.ab.ca/", scope: "province", province: "AB", category: "work_financial" },
  { id: "wf-ab-aish", title: "AISH (AB)", description: "Assured Income for the Severely Handicapped.", url: "https://www.alberta.ca/aish", scope: "province", province: "AB", category: "work_financial" },

  // Saskatchewan
  { id: "wf-sk-standards", title: "Employment Standards (SK)", description: "Rights at work in Saskatchewan.", url: "https://www.saskatchewan.ca/business/employment-standards", scope: "province", province: "SK", category: "work_financial" },
  { id: "wf-sk-hrc", title: "Human Rights (SK)", description: "Saskatchewan Human Rights Commission.", url: "https://saskatchewanhumanrights.ca/", scope: "province", province: "SK", category: "work_financial" },
  { id: "wf-sk-said", title: "SAID (SK)", description: "Saskatchewan Assured Income for Disability.", url: "https://www.saskatchewan.ca/residents/family-and-social-support/financial-help/assured-income-for-disability", scope: "province", province: "SK", category: "work_financial" },

  // Manitoba
  { id: "wf-mb-standards", title: "Employment Standards (MB)", description: "Provincial employment rights.", url: "https://www.gov.mb.ca/labour/standards/", scope: "province", province: "MB", category: "work_financial" },
  { id: "wf-mb-hrc", title: "Human Rights (MB)", description: "Manitoba Human Rights Commission.", url: "https://www.manitobahumanrights.ca/", scope: "province", province: "MB", category: "work_financial" },
  { id: "wf-mb-eia", title: "EIA (MB)", description: "Employment and Income Assistance.", url: "https://www.gov.mb.ca/fs/eia/", scope: "province", province: "MB", category: "work_financial" },

  // Québec
  { id: "wf-qc-standards", title: "Employment Standards (QC)", description: "Labour standards via CNESST.", url: "https://www.cnesst.gouv.qc.ca/fr/conditions-travail", scope: "province", province: "QC", category: "work_financial" },
  { id: "wf-qc-hrc", title: "Human Rights (QC)", description: "Commission des droits de la personne.", url: "https://www.cdpdj.qc.ca/", scope: "province", province: "QC", category: "work_financial" },
  { id: "wf-qc-qppd", title: "QPP Disability (QC)", description: "Retraite Québec disability benefits.", url: "https://www.rrq.gouv.qc.ca/en/retirement-plans/qpp/disability", scope: "province", province: "QC", category: "work_financial" },
  { id: "wf-qc-solidarity", title: "Social Solidarity Program (QC)", description: "Financial assistance program.", url: "https://www.quebec.ca/en/family-and-support-for-individuals/financial-social-assistance/social-solidarity-program", scope: "province", province: "QC", category: "work_financial" },

  // New Brunswick
  { id: "wf-nb-standards", title: "Employment Standards (NB)", description: "Labour & employment rights.", url: "https://www2.gnb.ca/content/gnb/en/departments/post-secondary_education_training_and_labour/employment_content/labour.html", scope: "province", province: "NB", category: "work_financial" },
  { id: "wf-nb-hrc", title: "Human Rights (NB)", description: "New Brunswick Human Rights Commission.", url: "https://www2.gnb.ca/content/gnb/en/departments/nbhrc.html", scope: "province", province: "NB", category: "work_financial" },
  { id: "wf-nb-dsp", title: "Disability Support (NB)", description: "Disability Support Program.", url: "https://www2.gnb.ca/content/gnb/en/departments/social_development/disabilities.html", scope: "province", province: "NB", category: "work_financial" },

  // Nova Scotia
  { id: "wf-ns-standards", title: "Employment Standards (NS)", description: "Labour standards and rights.", url: "https://novascotia.ca/lae/employmentrights/", scope: "province", province: "NS", category: "work_financial" },
  { id: "wf-ns-hrc", title: "Human Rights (NS)", description: "Nova Scotia Human Rights Commission.", url: "https://humanrights.novascotia.ca/", scope: "province", province: "NS", category: "work_financial" },
  { id: "wf-ns-dsp", title: "Disability Support (NS)", description: "Disability Support Program.", url: "https://novascotia.ca/coms/disabilities/", scope: "province", province: "NS", category: "work_financial" },

  // Newfoundland & Labrador
  { id: "wf-nl-standards", title: "Employment Standards (NL)", description: "Labour standards and rights.", url: "https://www.gov.nl.ca/ipgs/labourstandards/", scope: "province", province: "NL", category: "work_financial" },
  { id: "wf-nl-hrc", title: "Human Rights (NL)", description: "Newfoundland & Labrador Human Rights Commission.", url: "https://www.thinkhumanrights.ca/", scope: "province", province: "NL", category: "work_financial" },
  { id: "wf-nl-income", title: "Income Support (NL)", description: "Provincial income support program.", url: "https://www.gov.nl.ca/cssd/income-support/", scope: "province", province: "NL", category: "work_financial" },

  // Prince Edward Island
  { id: "wf-pe-standards", title: "Employment Standards (PE)", description: "Employment rights and standards.", url: "https://www.princeedwardisland.ca/en/information/economic-growth-tourism-and-culture/employment-standards", scope: "province", province: "PE", category: "work_financial" },
  { id: "wf-pe-hrc", title: "Human Rights (PE)", description: "PEI Human Rights Commission.", url: "https://www.peihumanrights.ca/", scope: "province", province: "PE", category: "work_financial" },
  { id: "wf-pe-dsp", title: "Disability Support (PE)", description: "Disability Support Program.", url: "https://www.princeedwardisland.ca/en/information/social-development-and-housing/disability-support-program", scope: "province", province: "PE", category: "work_financial" },

  // Northwest Territories
  { id: "wf-nt-standards", title: "Employment Standards (NT)", description: "Standards for workers and employers.", url: "https://www.ece.gov.nt.ca/en/services/employment-standards", scope: "province", province: "NT", category: "work_financial" },
  { id: "wf-nt-hrc", title: "Human Rights (NT)", description: "NWT Human Rights Commission.", url: "https://www.nwthumanrights.ca/", scope: "province", province: "NT", category: "work_financial" },
  { id: "wf-nt-income", title: "Income Assistance (NT)", description: "Income Assistance Program.", url: "https://www.ece.gov.nt.ca/en/services/income-assistance", scope: "province", province: "NT", category: "work_financial" },

  // Nunavut
  { id: "wf-nu-hrc", title: "Human Rights (NU)", description: "Nunavut Human Rights Tribunal.", url: "https://www.nhrt.ca/", scope: "province", province: "NU", category: "work_financial" },
  { id: "wf-nu-income", title: "Income Assistance (NU)", description: "Basic needs, shelter, and utilities.", url: "https://www.gov.nu.ca/family-services/programs-services/income-assistance", scope: "province", province: "NU", category: "work_financial" },

  // Yukon
  { id: "wf-yt-standards", title: "Employment Standards (YT)", description: "Employment standards and rights.", url: "https://yukon.ca/en/employment-standards", scope: "province", province: "YT", category: "work_financial" },
  { id: "wf-yt-hrc", title: "Human Rights (YT)", description: "Yukon Human Rights Commission.", url: "https://yukonhumanrights.ca/", scope: "province", province: "YT", category: "work_financial" },
  { id: "wf-yt-income", title: "Income Assistance (YT)", description: "Income support program.", url: "https://yukon.ca/en/health-and-wellness/health-concerns-diseases-and-conditions/income-support", scope: "province", province: "YT", category: "work_financial" },

  // Emergency & Crisis Support — Canada-wide
  { id: "em-988", title: "Talk Suicide Canada (988)", description: "Call or text 988 for immediate help.", url: "https://988.ca/", scope: "canada", category: "emergency_crisis" },
  { id: "em-crisisservices", title: "Crisis Services Canada", description: "National crisis and suicide support.", url: "https://www.crisisservicescanada.ca/en/", scope: "canada", category: "emergency_crisis" },
  { id: "em-distress-dir", title: "Provincial Distress Line Directory", description: "Find crisis lines by province.", url: "https://suicideprevention.ca/crisis-centres/", scope: "canada", category: "emergency_crisis" },
  { id: "em-211", title: "211 Canada", description: "Shelters, food banks, emergency help.", url: "https://211.ca/", scope: "canada", category: "emergency_crisis" },

  // Canada-wide and Provincial Workers' Compensation resources (tagged work_financial)
  { id: "rca-ccohs", title: "CCOHS (Canada)", description: "Canadian Centre for Occupational Health and Safety", url: "https://www.ccohs.ca/", scope: "canada", category: "work_financial" },
  { id: "rca-wsib", title: "WSIB (Ontario)", description: "Workplace Safety and Insurance Board", url: "https://www.wsib.ca/", scope: "province", province: "ON", category: "work_financial" },
  { id: "rca-worksafebc", title: "WorkSafeBC (British Columbia)", description: "Claims and return‑to‑work", url: "https://www.worksafebc.com/", scope: "province", province: "BC", category: "work_financial" },
  { id: "rca-wcbab", title: "WCB Alberta", description: "Workers' compensation and rehab", url: "https://www.wcb.ab.ca/", scope: "province", province: "AB", category: "work_financial" },
  { id: "rca-wcbsask", title: "WCB Saskatchewan", description: "Claims and benefits", url: "https://www.wcbsask.com/", scope: "province", province: "SK", category: "work_financial" },
  { id: "rca-wcbmb", title: "WCB Manitoba", description: "Support and benefits", url: "https://www.wcb.mb.ca/", scope: "province", province: "MB", category: "work_financial" },
  { id: "rca-cnesst", title: "CNESST (Québec)", description: "Normes, équité, santé et sécurité du travail", url: "https://www.cnesst.gouv.qc.ca/", scope: "province", province: "QC", category: "work_financial" },
  { id: "rca-worksafenb", title: "WorkSafeNB (New Brunswick)", description: "Injury claims and services", url: "https://www.worksafenb.ca/", scope: "province", province: "NB", category: "work_financial" },
  { id: "rca-workplacenl", title: "WorkplaceNL (Newfoundland & Labrador)", description: "Claims and safety", url: "https://workplacenl.ca/", scope: "province", province: "NL", category: "work_financial" },
  { id: "rca-wcbns", title: "WCB Nova Scotia", description: "Compensation and prevention", url: "https://www.wcb.ns.ca/", scope: "province", province: "NS", category: "work_financial" },
  { id: "rca-wcbpei", title: "WCB Prince Edward Island", description: "Claims and return‑to‑work", url: "https://www.wcb.pe.ca/", scope: "province", province: "PE", category: "work_financial" },
  { id: "rca-wscc", title: "WSCC (NWT & Nunavut)", description: "Workers’ Safety and Compensation Commission", url: "https://www.wscc.nt.ca/", scope: "province", province: "NT", category: "work_financial" },
  { id: "rca-ywchsb", title: "Yukon Workers’ Compensation Board", description: "Compensation and OHS", url: "https://www.yukon.ca/en/health-and-wellness/workplace-health-and-safety/compensation-and-benefits", scope: "province", province: "YT", category: "work_financial" },
];
