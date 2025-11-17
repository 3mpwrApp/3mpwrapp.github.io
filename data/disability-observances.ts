import type { Event } from "./events";

// Key disability-related observances and awareness dates in 2025 (Canada-focused where applicable)
export const disabilityObservances2025: Event[] = [
  {
    id: "obs-2025-01-04-braille",
    title: "World Braille Day",
    description: "Awareness of Braille and accessibility",
    date: "2025-01-04",
    location: "Canada",
  },
  {
    id: "obs-2025-03-01-wheelchair",
    title: "International Wheelchair Day",
    description: "Celebration of wheelchair users and support",
    date: "2025-03-01",
    location: "Canada",
  },
  {
    id: "obs-2025-04-02-autism",
    title: "World Autism Awareness Day",
    description: "Awareness and acceptance of autism",
    date: "2025-04-02",
    location: "Canada",
  },
  {
    id: "obs-2025-04-28-mourning",
    title: "National Day of Mourning",
    description: "Remembering workers killed, injured or made ill at work",
    date: "2025-04-28",
    location: "Canada",
  },
  // GAAD: Third Thursday in May 2025 is May 15
  {
    id: "obs-2025-05-15-gaad",
    title: "Global Accessibility Awareness Day",
    description: "Digital accessibility and inclusion awareness",
    date: "2025-05-15",
    location: "Canada",
  },
  {
    id: "obs-2025-06-01-injured-workers",
    title: "Injured Workers Day",
    description: "Solidarity with injured and ill workers",
    date: "2025-06-01",
    location: "Canada",
  },
  {
    id: "obs-2025-06-01-deafblind-month",
    title: "Deafblind Awareness Month begins",
    description: "Month-long observance in Canada",
    date: "2025-06-01",
    location: "Canada",
  },
  {
    id: "obs-2025-10-01-ndeam",
    title: "Disability Employment Awareness Month begins",
    description: "NDEAM in Canada (October)",
    date: "2025-10-01",
    location: "Canada",
  },
  {
    id: "obs-2025-09-23-sign-lang",
    title: "International Day of Sign Languages",
    description: "Linguistic identity of deaf people",
    date: "2025-09-23",
    location: "Canada",
  },
  {
    id: "obs-2025-12-03-idpd",
    title: "International Day of Persons with Disabilities",
    description: "Promoting rights and well-being",
    date: "2025-12-03",
    location: "Canada",
  },
];

// Helpers to compute variable observances
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function ymd(year: number, monthIndex: number, day: number) {
  // monthIndex is 0-based; output date string without time for all-day events
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}
function nthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  n: number,
) {
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
  events.push({
    id: `obs-${year}-01-04-braille`,
    title: "World Braille Day",
    description: "Awareness of Braille and accessibility",
    date: ymd(year, 0, 4),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-03-01-wheelchair`,
    title: "International Wheelchair Day",
    description: "Celebration of wheelchair users and support",
    date: ymd(year, 2, 1),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-04-02-autism`,
    title: "World Autism Awareness Day",
    description: "Awareness and acceptance of autism",
    date: ymd(year, 3, 2),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-04-28-mourning`,
    title: "National Day of Mourning",
    description: "Remembering workers killed, injured or made ill at work",
    date: ymd(year, 3, 28),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-06-01-injured-workers`,
    title: "Injured Workers Day",
    description: "Solidarity with injured and ill workers",
    date: ymd(year, 5, 1),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-06-01-deafblind-month`,
    title: "Deafblind Awareness Month begins",
    description: "Month-long observance in Canada",
    date: ymd(year, 5, 1),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-09-23-sign-lang`,
    title: "International Day of Sign Languages",
    description: "Linguistic identity of deaf people",
    date: ymd(year, 8, 23),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-10-01-ndeam`,
    title: "Disability Employment Awareness Month begins",
    description: "NDEAM in Canada (October)",
    date: ymd(year, 9, 1),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-12-03-idpd`,
    title: "International Day of Persons with Disabilities",
    description: "Promoting rights and well-being",
    date: ymd(year, 11, 3),
    location: "Canada",
  });

  // Indigenous observances
  events.push({
    id: `obs-${year}-05-05-mmiwg`,
    title: "National Day of Awareness for Missing and Murdered Indigenous Women and Girls",
    description: "Honoring and remembering MMIWG and 2SLGBTQQIA+ people",
    date: ymd(year, 4, 5),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-06-21-indigenous-peoples`,
    title: "National Indigenous Peoples Day",
    description: "Celebrating Indigenous cultures and contributions",
    date: ymd(year, 5, 21),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-09-30-orange-shirt`,
    title: "Orange Shirt Day (National Day for Truth and Reconciliation)",
    description: "Honoring residential school survivors and remembering children who never returned home",
    date: ymd(year, 8, 30),
    location: "Canada",
  });
  events.push({
    id: `obs-${year}-11-01-indigenous-disability`,
    title: "Indigenous Disability Awareness Month begins",
    description: "Month-long observance recognizing Indigenous peoples with disabilities",
    date: ymd(year, 10, 1),
    location: "Canada",
  });

  // Additional important awareness days
  events.push({
    id: `obs-${year}-02-04-world-cancer`,
    title: "World Cancer Day",
    description: "Raising awareness about cancer and its prevention",
    date: ymd(year, 1, 4),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-02-28-rare-disease`,
    title: "Rare Disease Day",
    description: "Raising awareness for rare diseases (last day of February)",
    date: ymd(year, 1, year % 4 === 0 ? 29 : 28),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-03-21-down-syndrome`,
    title: "World Down Syndrome Day",
    description: "Advocating for rights and inclusion of people with Down syndrome",
    date: ymd(year, 2, 21),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-04-07-world-health`,
    title: "World Health Day",
    description: "Global health awareness",
    date: ymd(year, 3, 7),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-05-12-fibromyalgia`,
    title: "Fibromyalgia Awareness Day",
    description: "Raising awareness about fibromyalgia",
    date: ymd(year, 4, 12),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-06-27-ptsd`,
    title: "PTSD Awareness Day",
    description: "Raising awareness about post-traumatic stress disorder",
    date: ymd(year, 5, 27),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-07-11-world-population`,
    title: "World Population Day",
    description: "Focus on population issues including health and rights",
    date: ymd(year, 6, 11),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-08-19-humanitarian`,
    title: "World Humanitarian Day",
    description: "Honoring humanitarian workers and those they help",
    date: ymd(year, 7, 19),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-09-10-suicide-prevention`,
    title: "World Suicide Prevention Day",
    description: "Raising awareness and prevention of suicide",
    date: ymd(year, 8, 10),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-10-10-mental-health`,
    title: "World Mental Health Day",
    description: "Promoting mental health awareness and support",
    date: ymd(year, 9, 10),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-10-15-white-cane`,
    title: "White Cane Safety Day",
    description: "Celebrating achievements of people who are blind or visually impaired",
    date: ymd(year, 9, 15),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-11-14-diabetes`,
    title: "World Diabetes Day",
    description: "Raising awareness about diabetes",
    date: ymd(year, 10, 14),
    location: "Global",
  });
  events.push({
    id: `obs-${year}-12-01-world-aids`,
    title: "World AIDS Day",
    description: "Raising awareness about HIV/AIDS",
    date: ymd(year, 11, 1),
    location: "Global",
  });

  // GAAD: Third Thursday in May
  const gaad = nthWeekdayOfMonth(year, 4, 4, 3); // May, Thu=4, 3rd
  events.push({
    id: `obs-${year}-${pad2(gaad.getMonth() + 1)}-${pad2(gaad.getDate())}-gaad`,
    title: "Global Accessibility Awareness Day",
    description: "Digital accessibility and inclusion awareness",
    date: ymd(year, gaad.getMonth(), gaad.getDate()),
    location: "Canada",
  });

  // NAAW: last Sunday in May → through following Saturday; create one entry for the opening day
  const naawStart = lastWeekdayOfMonth(year, 4, 0); // Sunday=0 in May
  events.push({
    id: `obs-${year}-${pad2(naawStart.getMonth() + 1)}-${pad2(naawStart.getDate())}-naaw`,
    title: "National AccessAbility Week (begins)",
    description: "Week-long observance in Canada",
    date: ymd(year, naawStart.getMonth(), naawStart.getDate()),
    location: "Canada",
  });

  // Red Shirt Day: Wednesday of NAAW (start Sunday + 3 days)
  const redShirt = new Date(naawStart);
  redShirt.setDate(redShirt.getDate() + 3);
  events.push({
    id: `obs-${year}-${pad2(redShirt.getMonth() + 1)}-${pad2(redShirt.getDate())}-redshirt`,
    title: "Red Shirt Day",
    description: "Show support for persons with disabilities",
    date: ymd(year, redShirt.getMonth(), redShirt.getDate()),
    location: "Canada",
  });

  return events;
}
