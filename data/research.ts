export type Research = {
  id: string;
  title: string;
  summary: string;
  year: number;
  topics: string[]; // e.g., ["injured workers", "return-to-work"]
  source: string; // organization / journal
  url: string;
};

export const researchItems: Research[] = [
  {
    id: "rsh1",
    title: "Return-to-Work Outcomes for Injured Workers in Canada",
    summary:
      "A cross-provincial summary of RTW timelines and supports impacting injured workers.",
    year: 2023,
    topics: ["injured workers", "return-to-work", "policy"],
    source: "University Research Brief",
    url: "https://example.org/rtw-outcomes-canada",
  },
  {
    id: "rsh2",
    title: "Barriers to Benefits Access in WSIB/WCB Systems",
    summary:
      "Qualitative review of common documentation and process barriers in workers' compensation.",
    year: 2022,
    topics: ["WSIB/WCB", "access", "policy"],
    source: "Policy Working Paper",
    url: "https://example.org/benefits-access-barriers",
  },
  {
    id: "rsh3",
    title: "Disability and Mental Health at Work: Evidence Review",
    summary:
      "Evidence-based practices for accommodations and mental health supports in workplaces.",
    year: 2021,
    topics: ["disability", "mental health", "accommodations"],
    source: "Evidence Review",
    url: "https://example.org/disability-mental-health-review",
  },
  {
    id: "rsh4",
    title: "Government Report on Workplace Accessibility Standards",
    summary:
      "Annual report on implementation of accessibility standards across Canadian workplaces.",
    year: 2023,
    topics: ["accessibility", "standards", "workplace"],
    source: "Government Report",
    url: "https://example.org/accessibility-standards-report",
  },
  {
    id: "rsh5",
    title: "Community Impact Study: Injured Worker Support Services",
    summary:
      "Assessment of community-based support services and their effectiveness for injured workers.",
    year: 2022,
    topics: ["community", "support services", "injured workers"],
    source: "Government Report",
    url: "https://example.org/community-support-study",
  },
  {
    id: "rsh6",
    title: "Understanding Your Rights: A Guide to Workplace Accommodations",
    summary:
      "Comprehensive guide covering legal rights and practical steps for requesting workplace accommodations.",
    year: 2023,
    topics: ["workplace rights", "accommodations", "advocacy"],
    source: "Advocacy Review",
    url: "https://example.org/accommodation-rights-guide",
  },
  {
    id: "rsh7",
    title: "The Evolution of Disability Rights in Canada",
    summary:
      "Historical analysis of key legislation and landmark cases that shaped disability rights.",
    year: 2021,
    topics: ["disability rights", "advocacy", "legal"],
    source: "Legal Review",
    url: "https://example.org/disability-rights-evolution",
  },
  {
    id: "rsh8",
    title: "Clinical Research: Efficacy of Early Intervention Programs",
    summary:
      "Multi-site clinical study examining outcomes of early intervention for workplace injuries.",
    year: 2023,
    topics: ["clinical research", "early intervention", "injured workers"],
    source: "University Research",
    url: "https://example.org/early-intervention-study",
  },
];
