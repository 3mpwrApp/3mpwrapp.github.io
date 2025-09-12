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
];

