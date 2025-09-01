import { Resource } from "../types/models";

export const resources: Resource[] = [
  { id: "r1", title: "Mental Health Toolkit", description: "Guides and exercises for daily wellbeing.", scope: "canada" },
  { id: "r2", title: "Community Support Map", description: "Find local support groups and services.", scope: "canada" },
  { id: "r3", title: "Advocacy Handbook", description: "Best practices for effective advocacy.", scope: "canada" },
  // Canada-wide and Provincial Workers' Compensation resources
  { id: "rca-ccohs", title: "CCOHS (Canada)", description: "Canadian Centre for Occupational Health and Safety", url: "https://www.ccohs.ca/", scope: "canada" },
  { id: "rca-wsib", title: "WSIB (Ontario)", description: "Workplace Safety and Insurance Board", url: "https://www.wsib.ca/", scope: "province", province: "ON" },
  { id: "rca-worksafebc", title: "WorkSafeBC (British Columbia)", description: "Claims and return‑to‑work", url: "https://www.worksafebc.com/", scope: "province", province: "BC" },
  { id: "rca-wcbab", title: "WCB Alberta", description: "Workers' compensation and rehab", url: "https://www.wcb.ab.ca/", scope: "province", province: "AB" },
  { id: "rca-wcbsask", title: "WCB Saskatchewan", description: "Claims and benefits", url: "https://www.wcbsask.com/", scope: "province", province: "SK" },
  { id: "rca-wcbmb", title: "WCB Manitoba", description: "Support and benefits", url: "https://www.wcb.mb.ca/", scope: "province", province: "MB" },
  { id: "rca-cnesst", title: "CNESST (Québec)", description: "Normes, équité, santé et sécurité du travail", url: "https://www.cnesst.gouv.qc.ca/", scope: "province", province: "QC" },
  { id: "rca-worksafenb", title: "WorkSafeNB (New Brunswick)", description: "Injury claims and services", url: "https://www.worksafenb.ca/", scope: "province", province: "NB" },
  { id: "rca-workplacenl", title: "WorkplaceNL (Newfoundland & Labrador)", description: "Claims and safety", url: "https://workplacenl.ca/", scope: "province", province: "NL" },
  { id: "rca-wcbns", title: "WCB Nova Scotia", description: "Compensation and prevention", url: "https://www.wcb.ns.ca/", scope: "province", province: "NS" },
  { id: "rca-wcbpei", title: "WCB Prince Edward Island", description: "Claims and return‑to‑work", url: "https://www.wcb.pe.ca/", scope: "province", province: "PE" },
  { id: "rca-wscc", title: "WSCC (NWT & Nunavut)", description: "Workers’ Safety and Compensation Commission", url: "https://www.wscc.nt.ca/", scope: "province", province: "NT" },
  { id: "rca-ywchsb", title: "Yukon Workers’ Compensation Board", description: "Compensation and OHS", url: "https://www.yukon.ca/en/health-and-wellness/workplace-health-and-safety/compensation-and-benefits", scope: "province", province: "YT" },
];
