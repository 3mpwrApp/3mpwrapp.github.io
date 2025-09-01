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
    summary: "A cross-provincial summary of RTW timelines and supports impacting injured workers.",
    year: 2023,
    topics: ["injured workers", "return-to-work", "policy"],
    source: "University Research Brief",
    url: "https://example.org/rtw-outcomes-canada",
  },
  {
    id: "rsh2",
    title: "Barriers to Benefits Access in WSIB/WCB Systems",
    summary: "Qualitative review of common documentation and process barriers in workers' compensation.",
    year: 2022,
    topics: ["WSIB/WCB", "access", "policy"],
    source: "Policy Working Paper",
    url: "https://example.org/benefits-access-barriers",
  },
  {
    id: "rsh3",
    title: "Disability and Mental Health at Work: Evidence Review",
    summary: "Evidence-based practices for accommodations and mental health supports in workplaces.",
    year: 2021,
    topics: ["disability", "mental health", "accommodations"],
    source: "Evidence Review",
    url: "https://example.org/disability-mental-health-review",
  },
];

