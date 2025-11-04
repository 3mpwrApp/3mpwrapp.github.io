export function buildICS({
  title,
  description,
  startISO,
  durationMinutes = 60,
}: {
  title: string;
  description?: string;
  startISO: string;
  durationMinutes?: number;
}) {
  const dt = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = dt(startISO);
  const endDate = new Date(
    new Date(startISO).getTime() + durationMinutes * 60000,
  ).toISOString();
  const end = dt(endDate);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
  "PRODID:-//3mpwr//Calendar 1.0//EN",
    "BEGIN:VEVENT",
  `UID:${Date.now()}@3mpwr`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function buildICSMany(
  events: {
    title: string;
    description?: string;
    startISO: string;
    durationMinutes?: number;
  }[],
  options?: {
    calendarName?: string;
    refreshInterval?: number; // minutes
    timezone?: string;
    subscribable?: boolean; // If true, adds subscription metadata
  },
) {
  const dt = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//3mpwr//Calendar 1.0//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  
  // Add subscription metadata if this is a subscribable feed
  if (options?.subscribable) {
    lines.push(`X-WR-CALNAME:${escapeICS(options.calendarName || '3mpwrApp Events')}`);
    lines.push(`X-WR-CALDESC:${escapeICS('Community events, disability observances, and awareness days from 3mpwrApp')}`);
    lines.push(`X-WR-TIMEZONE:${options.timezone || 'America/Toronto'}`);
    if (options.refreshInterval) {
      lines.push(`X-PUBLISHED-TTL:PT${options.refreshInterval}M`);
      lines.push(`REFRESH-INTERVAL;VALUE=DURATION:PT${options.refreshInterval}M`);
    }
  }
  
  const now = dt(new Date().toISOString());
  events.forEach((ev) => {
    const start = dt(ev.startISO);
    const endDate = new Date(
      new Date(ev.startISO).getTime() + (ev.durationMinutes ?? 60) * 60000,
    ).toISOString();
    const end = dt(endDate);
    lines.push("BEGIN:VEVENT");
    // Use stable UID for subscriptions to avoid duplicates
    const uid = options?.subscribable 
      ? `${ev.startISO}-${ev.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@3mpwrapp.pages.dev`
      : `${Date.now()}_${Math.random().toString(36).slice(2)}@3mpwr`;
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    lines.push(`URL:https://3mpwrapp.pages.dev/`);
    lines.push(`ORGANIZER;CN=3mpwrApp:MAILTO:empowrapp08162025@gmail.com`);
    lines.push("STATUS:CONFIRMED");
    lines.push(`SEQUENCE:${options?.subscribable ? 0 : 0}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeICS(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Minimal ICS parser for DTSTART, SUMMARY, DESCRIPTION inside VEVENT blocks
export function parseICS(text: string): { title: string; description?: string; startISO: string }[] {
  // Handle folded lines (continuation lines start with a space)
  const normalized = text.replace(/\r\n[ ]/g, '');
  const lines = normalized.split(/\r?\n/);
  const events: any[] = [];
  let cur: any = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    if (line.startsWith('DTSTART')) {
      const parts = line.split(':');
      const val = parts[1] || '';
      cur.startISO = icsDateToISO(val);
    } else if (line.startsWith('SUMMARY:')) {
      cur.title = unescapeICS(line.slice('SUMMARY:'.length));
    } else if (line.startsWith('DESCRIPTION:')) {
      cur.description = unescapeICS(line.slice('DESCRIPTION:'.length));
    }
  }
  return events.filter((e) => e.startISO && e.title);
}

function icsDateToISO(v: string): string {
  // Examples: 20250131T140000Z or 20250131
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/);
  if (!m) return new Date(v).toISOString();
  const [_, y, mo, d, hh, mm, ss] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh || '0'), Number(mm || '0'), Number(ss || '0')));
  return date.toISOString();
}

function unescapeICS(s: string) {
  return s.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}
