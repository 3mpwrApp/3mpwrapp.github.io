import { Resource } from "../types/models";

export const resources: Resource[] = [
  // Tools & Downloads
  { id: "r1", title: "Mental Health Toolkit", description: "Guides and exercises for daily wellbeing.", scope: "canada", category: "tools_downloads" },
  { id: "r2", title: "Community Support Map", description: "Find local support groups and services.", scope: "canada", category: "tools_downloads" },
  { id: "r3", title: "Advocacy Handbook", description: "Best practices for effective advocacy.", scope: "canada", category: "tools_downloads" },
  { id: "tl-checklists", title: "Doctor Visit Checklist", description: "Prep questions and key info for appointments.", url: "https://choosingwiselycanada.org/patient-resources/4-questions/", scope: "canada", category: "tools_downloads" },
  { id: "tl-medlog", title: "Medication Log (Printable)", description: "Track medications, doses, and changes.", url: "https://www.heartandstroke.ca/-/media/pdf-files/canada/2020-lists/medication-list_en.ashx", scope: "canada", category: "tools_downloads" },
  { id: "tl-paintracker", title: "Pain Tracker (Apps)", description: "Manage My Pain, Flaredown.", url: "https://www.managemypain.com/", scope: "canada", category: "tools_downloads" },
  { id: "tl-accommodation-letter", title: "Workplace Accommodation Request", description: "Template and tips (coming soon).", scope: "canada", category: "tools_downloads" },
  { id: "tl-appeal-letter", title: "Appeal Letter (Denied Benefits)", description: "Template and guidance (coming soon).", scope: "canada", category: "tools_downloads" },

  // Work & Financial Support — Canada-wide
  { id: "wf-employment-rights-fed", title: "Employment Rights (Federal)", description: "Federal labour standards and workplace rights.", url: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html", scope: "canada", category: "work_financial" },
  { id: "wf-human-rights-canada", title: "Human Rights in Canada", description: "Canadian Human Rights and duty to accommodate.", url: "https://www.chrc-ccdp.gc.ca/en/resources/what-duty-accommodate", scope: "canada", category: "work_financial" },
  { id: "wf-employment-support", title: "Employment Supports (Canada)", description: "Funding and supports for persons with disabilities.", url: "https://www.canada.ca/en/employment-social-development/services/funding/disability-opportunity.html", scope: "canada", category: "work_financial" },
  { id: "wf-uncrpd", title: "UN CRPD", description: "UN Convention on the Rights of Persons with Disabilities.", url: "https://www.un.org/development/desa/disabilities/convention-on-the-rights-of-persons-with-disabilities.html", scope: "canada", category: "work_financial" },
  { id: "wf-benefits-canada", title: "Disability Benefits (Canada)", description: "Overview of federal disability benefits.", url: "https://www.canada.ca/en/services/benefits/disability.html", scope: "canada", category: "work_financial" },
  { id: "wf-cppd", title: "CPP Disability", description: "Canada Pension Plan disability benefits.", url: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html", scope: "canada", category: "work_financial" },
  { id: "wf-dtc", title: "Disability Tax Credit", description: "CRA Disability Tax Credit information.", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/persons-disabilities/disability-tax-credit.html", scope: "canada", category: "work_financial" },

  // Work & Financial Support — Provincial examples
  { id: "wf-ow", title: "Ontario Works (OW)", description: "Financial and employment assistance.", url: "https://www.ontario.ca/page/ontario-works", scope: "province", province: "ON", category: "work_financial" },
  { id: "wf-odsp", title: "ODSP", description: "Ontario Disability Support Program.", url: "https://www.ontario.ca/page/ontario-disability-support-program-odsp", scope: "province", province: "ON", category: "work_financial" },

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
