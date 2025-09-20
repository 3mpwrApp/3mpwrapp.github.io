export type Advocate = {
  id: string;
  name: string;
  org?: string;
  city?: string;
  province?: string; // e.g., ON
  issues: string[]; // e.g., WSIB, LTD, human-rights
  proBono?: boolean;
  phone?: string;
  website?: string;
  email?: string;
};

export const advocates: Advocate[] = [
  { id: 'a1', name: 'Downtown Community Legal Clinic', org: 'CLINIC', city: 'Toronto', province: 'ON', issues: ['WSIB','employment','tenancy'], proBono: true, website: 'https://www.downtownlegalclinic.ca' },
  { id: 'a2', name: 'Access Law Group', city: 'Vancouver', province: 'BC', issues: ['human-rights','workplace-accommodation'], proBono: false, website: 'https://example.com' },
  { id: 'a3', name: 'Workers’ Rights Centre', city: 'Ottawa', province: 'ON', issues: ['WSIB','appeals'], proBono: true, email: 'help@wrc.ca' },
  { id: 'a4', name: 'Prairie Legal Aid', city: 'Winnipeg', province: 'MB', issues: ['WSIB','employment'], proBono: true, website: 'https://example.org' },
  { id: 'a5', name: 'Atlantic Disability Advocates', city: 'Halifax', province: 'NS', issues: ['human-rights','accommodation'], proBono: false, email: 'info@ada.ca' },
  { id: 'a6', name: 'Northern Justice Network', city: 'Yellowknife', province: 'NT', issues: ['appeals','human-rights'], proBono: true },
  { id: 'a7', name: 'Injured Workers Community Legal Clinic (IWC)', org: 'Community Legal Clinic', city: 'Toronto', province: 'ON', issues: ['WSIB','appeals','policy-reform','occupational-disease'], proBono: true, website: 'https://injuredworkersonline.org/' },
  { id: 'a8', name: 'FightWCB.org (Paul Taylor)', org: 'Advocacy / Story Archive', issues: ['WSIB','claim-suppression','poverty','law-reform'], proBono: true, website: 'https://fightwcb.org/' },
];
