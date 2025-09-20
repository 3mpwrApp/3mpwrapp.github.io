import type { ProvinceCode } from "../types/models";
import type { Event } from "./events";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function ymd(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)} 00:00`;
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
function mondayPrecedingMay25(year: number) {
  // Monday preceding May 25 (i.e., the Monday before May 25). Start from May 24, go backwards to Monday.
  const d = new Date(year, 4, 24);
  while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
  return d;
}
function easterSunday(year: number) {
  // Anonymous Gregorian algorithm (Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function generateCanadianHolidays(year: number): Event[] {
  const events: Event[] = [];
  // New Year's Day
  events.push({
    id: `holiday-${year}-01-01`,
    title: "New Year's Day",
    description: "Federal holiday",
    date: ymd(year, 0, 1),
    location: "Canada",
  });
  // Family Day (most provinces) - 3rd Monday in Feb (advisory)
  const familyDay = nthWeekdayOfMonth(year, 1, 1, 3);
  events.push({
    id: `holiday-${year}-${pad2(familyDay.getMonth() + 1)}-${pad2(familyDay.getDate())}-family`,
    title: "Family Day (Most Provinces)",
    description: "Observed in many provinces",
    date: ymd(year, familyDay.getMonth(), familyDay.getDate()),
    location: "Canada",
  });
  // Good Friday (Easter Sunday - 2 days)
  const easter = easterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(goodFriday.getDate() - 2);
  events.push({
    id: `holiday-${year}-${pad2(goodFriday.getMonth() + 1)}-${pad2(goodFriday.getDate())}-goodfriday`,
    title: "Good Friday",
    description: "Federal holiday",
    date: ymd(year, goodFriday.getMonth(), goodFriday.getDate()),
    location: "Canada",
  });
  // Victoria Day (Monday preceding May 25)
  const victoria = mondayPrecedingMay25(year);
  events.push({
    id: `holiday-${year}-${pad2(victoria.getMonth() + 1)}-${pad2(victoria.getDate())}-victoria`,
    title: "Victoria Day",
    description: "Federal holiday",
    date: ymd(year, victoria.getMonth(), victoria.getDate()),
    location: "Canada",
  });
  // Canada Day
  events.push({
    id: `holiday-${year}-07-01`,
    title: "Canada Day",
    description: "Federal holiday",
    date: ymd(year, 6, 1),
    location: "Canada",
  });
  // Labour Day (1st Monday in September)
  const labour = nthWeekdayOfMonth(year, 8, 1, 1);
  events.push({
    id: `holiday-${year}-${pad2(labour.getMonth() + 1)}-${pad2(labour.getDate())}-labour`,
    title: "Labour Day",
    description: "Federal holiday",
    date: ymd(year, labour.getMonth(), labour.getDate()),
    location: "Canada",
  });
  // Thanksgiving (2nd Monday in October)
  const thanksgiving = nthWeekdayOfMonth(year, 9, 1, 2);
  events.push({
    id: `holiday-${year}-${pad2(thanksgiving.getMonth() + 1)}-${pad2(thanksgiving.getDate())}-thanks`,
    title: "Thanksgiving",
    description: "Federal holiday",
    date: ymd(year, thanksgiving.getMonth(), thanksgiving.getDate()),
    location: "Canada",
  });
  // Remembrance Day
  events.push({
    id: `holiday-${year}-11-11`,
    title: "Remembrance Day",
    description: "Federal holiday",
    date: ymd(year, 10, 11),
    location: "Canada",
  });
  // Christmas Day
  events.push({
    id: `holiday-${year}-12-25`,
    title: "Christmas Day",
    description: "Federal holiday",
    date: ymd(year, 11, 25),
    location: "Canada",
  });
  // Boxing Day
  events.push({
    id: `holiday-${year}-12-26`,
    title: "Boxing Day",
    description: "Federal holiday",
    date: ymd(year, 11, 26),
    location: "Canada",
  });
  return events;
}

export function generateProvincialHolidays(
  year: number,
  province: ProvinceCode | null,
): Event[] {
  const events: Event[] = [];
  // February (3rd Monday): named variants in some provinces
  const thirdMonFeb = nthWeekdayOfMonth(year, 1, 1, 3);
  if (province === "MB") {
    events.push({
      id: `prov-${year}-${pad2(thirdMonFeb.getMonth() + 1)}-${pad2(thirdMonFeb.getDate())}-louis-riel`,
      title: "Louis Riel Day",
      description: "Provincial holiday",
      date: ymd(year, thirdMonFeb.getMonth(), thirdMonFeb.getDate()),
      location: "Manitoba",
    });
  } else if (province === "PE") {
    events.push({
      id: `prov-${year}-${pad2(thirdMonFeb.getMonth() + 1)}-${pad2(thirdMonFeb.getDate())}-islander`,
      title: "Islander Day",
      description: "Provincial holiday",
      date: ymd(year, thirdMonFeb.getMonth(), thirdMonFeb.getDate()),
      location: "Prince Edward Island",
    });
  } else if (province === "NS") {
    events.push({
      id: `prov-${year}-${pad2(thirdMonFeb.getMonth() + 1)}-${pad2(thirdMonFeb.getDate())}-ns-heritage`,
      title: "Nova Scotia Heritage Day",
      description: "Provincial holiday",
      date: ymd(year, thirdMonFeb.getMonth(), thirdMonFeb.getDate()),
      location: "Nova Scotia",
    });
  }
  // Civic Holiday (first Monday in August) - common in many provinces (e.g., ON, BC as BC Day, SK, MB as Terry Fox Day, NS Natal Day)
  const civic = nthWeekdayOfMonth(year, 7, 1, 1); // August, Monday, 1st
  events.push({
    id: `prov-${year}-${pad2(civic.getMonth() + 1)}-${pad2(civic.getDate())}-civic`,
    title:
      province === "MB"
        ? "Terry Fox Day"
        : province === "BC"
          ? "BC Day"
          : province === "NS"
            ? "Natal Day"
            : "Civic Holiday",
    description: "Provincial holiday",
    date: ymd(year, civic.getMonth(), civic.getDate()),
    location: "Canada",
  });

  // Québec National Holiday (Saint-Jean-Baptiste Day) - June 24
  if (!province || province === "QC") {
    events.push({
      id: `prov-${year}-06-24-sjb`,
      title: "Saint-Jean-Baptiste Day",
      description: "Québec national holiday",
      date: ymd(year, 5, 24),
      location: "Québec",
    });
  }

  return events;
}
