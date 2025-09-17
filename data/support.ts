export type SupportOrg = {
  id: string;
  name: string;
  province: string; // code, e.g., ON, QC
  phone?: string;
  url?: string;
  accessible?: boolean;
};

export const supportOrgs: SupportOrg[] = [
  {
    id: "s-on-1",
    name: "Injured Workers Support Centre (ON)",
    province: "ON",
    phone: "1-800-555-0100",
    url: "https://example.org/iwsc",
    accessible: true,
  },
  {
    id: "s-qc-1",
    name: "Quebec Disability Alliance",
    province: "QC",
    phone: "1-800-555-0101",
    url: "https://example.org/qda",
    accessible: true,
  },
  {
    id: "s-bc-1",
    name: "BC Accessibility Network",
    province: "BC",
    phone: "1-800-555-0102",
    url: "https://example.org/bcan",
  },
];
