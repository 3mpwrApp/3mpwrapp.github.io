import type { Event } from "./events";

// Key disability-related observances and awareness dates in 2025 (Canada-focused where applicable)
export const disabilityObservances2025: Event[] = [
  { id: "obs-2025-01-04-braille", title: "World Braille Day", description: "Awareness of Braille and accessibility", date: "2025-01-04 00:00", location: "Canada" },
  { id: "obs-2025-03-01-wheelchair", title: "International Wheelchair Day", description: "Celebration of wheelchair users and support", date: "2025-03-01 00:00", location: "Canada" },
  { id: "obs-2025-04-02-autism", title: "World Autism Awareness Day", description: "Awareness and acceptance of autism", date: "2025-04-02 00:00", location: "Canada" },
  { id: "obs-2025-04-28-mourning", title: "National Day of Mourning", description: "Remembering workers killed, injured or made ill at work", date: "2025-04-28 00:00", location: "Canada" },
  // GAAD: Third Thursday in May 2025 is May 15
  { id: "obs-2025-05-15-gaad", title: "Global Accessibility Awareness Day", description: "Digital accessibility and inclusion awareness", date: "2025-05-15 00:00", location: "Canada" },
  { id: "obs-2025-06-01-injured-workers", title: "Injured Workers Day", description: "Solidarity with injured and ill workers", date: "2025-06-01 00:00", location: "Canada" },
  { id: "obs-2025-06-01-deafblind-month", title: "Deafblind Awareness Month begins", description: "Month-long observance in Canada", date: "2025-06-01 00:00", location: "Canada" },
  { id: "obs-2025-10-01-ndeam", title: "Disability Employment Awareness Month begins", description: "NDEAM in Canada (October)", date: "2025-10-01 00:00", location: "Canada" },
  { id: "obs-2025-09-23-sign-lang", title: "International Day of Sign Languages", description: "Linguistic identity of deaf people", date: "2025-09-23 00:00", location: "Canada" },
  { id: "obs-2025-12-03-idpd", title: "International Day of Persons with Disabilities", description: "Promoting rights and well-being", date: "2025-12-03 00:00", location: "Canada" },
];

// Helpers to compute variable observances
function pad2(n: number) { return String(n).padStart(2, "0"); }
function ymd(year: number, monthIndex: number, day: number) {
  // monthIndex is 0-based; output local date string
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)} 00:00`;
}
function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, n: number) {
  // weekday: 0=Sun..6=Sat
  const first = new Date(year, monthIndex, 1);
  const firstWeekday = first.getDay();
  const offset = (7 + weekday - firstWeekday) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return new Date(year, monthIndex, day);
}
function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number) {
  const last = new Date(year, monthIndex + 1, 0); // last day of month
  const lastWeekday = last.getDay();
  const offset = (7 + lastWeekday - weekday) % 7; // how many days since target weekday
  const day = last.getDate() - offset;
  return new Date(year, monthIndex, day);
}

export function generateDisabilityObservances(year: number): Event[] {
  const events: Event[] = [];
  // Fixed-date items
  events.push({ id: `obs-${year}-01-04-braille`, title: "World Braille Day", description: "Awareness of Braille and accessibility", date: ymd(year, 0, 4), location: "Canada" });
  events.push({ id: `obs-${year}-03-01-wheelchair`, title: "International Wheelchair Day", description: "Celebration of wheelchair users and support", date: ymd(year, 2, 1), location: "Canada" });
  events.push({ id: `obs-${year}-04-02-autism`, title: "World Autism Awareness Day", description: "Awareness and acceptance of autism", date: ymd(year, 3, 2), location: "Canada" });
  events.push({ id: `obs-${year}-04-28-mourning`, title: "National Day of Mourning", description: "Remembering workers killed, injured or made ill at work", date: ymd(year, 3, 28), location: "Canada" });
  events.push({ id: `obs-${year}-06-01-injured-workers`, title: "Injured Workers Day", description: "Solidarity with injured and ill workers", date: ymd(year, 5, 1), location: "Canada" });
  events.push({ id: `obs-${year}-06-01-deafblind-month`, title: "Deafblind Awareness Month begins", description: "Month-long observance in Canada", date: ymd(year, 5, 1), location: "Canada" });
  events.push({ id: `obs-${year}-09-23-sign-lang`, title: "International Day of Sign Languages", description: "Linguistic identity of deaf people", date: ymd(year, 8, 23), location: "Canada" });
  events.push({ id: `obs-${year}-10-01-ndeam`, title: "Disability Employment Awareness Month begins", description: "NDEAM in Canada (October)", date: ymd(year, 9, 1), location: "Canada" });
  events.push({ id: `obs-${year}-12-03-idpd`, title: "International Day of Persons with Disabilities", description: "Promoting rights and well-being", date: ymd(year, 11, 3), location: "Canada" });

  // GAAD: Third Thursday in May
  const gaad = nthWeekdayOfMonth(year, 4, 4, 3); // May, Thu=4, 3rd
  events.push({ id: `obs-${year}-${pad2(gaad.getMonth() + 1)}-${pad2(gaad.getDate())}-gaad`, title: "Global Accessibility Awareness Day", description: "Digital accessibility and inclusion awareness", date: ymd(year, gaad.getMonth(), gaad.getDate()), location: "Canada" });

  // NAAW: last Sunday in May → through following Saturday; create one entry for the opening day
  const naawStart = lastWeekdayOfMonth(year, 4, 0); // Sunday=0 in May
  events.push({ id: `obs-${year}-${pad2(naawStart.getMonth() + 1)}-${pad2(naawStart.getDate())}-naaw`, title: "National AccessAbility Week (begins)", description: "Week-long observance in Canada", date: ymd(year, naawStart.getMonth(), naawStart.getDate()), location: "Canada" });

  // Red Shirt Day: Wednesday of NAAW (start Sunday + 3 days)
  const redShirt = new Date(naawStart);
  redShirt.setDate(redShirt.getDate() + 3);
  events.push({ id: `obs-${year}-${pad2(redShirt.getMonth() + 1)}-${pad2(redShirt.getDate())}-redshirt`, title: "Red Shirt Day", description: "Show support for persons with disabilities", date: ymd(year, redShirt.getMonth(), redShirt.getDate()), location: "Canada" });

  return events;
}
