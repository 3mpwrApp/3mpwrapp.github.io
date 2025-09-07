export function buildICS({ title, description, startISO, durationMinutes = 60 }: { title: string; description?: string; startISO: string; durationMinutes?: number }) {
  const dt = (iso: string) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const start = dt(startISO);
  const endDate = new Date(new Date(startISO).getTime() + durationMinutes * 60000).toISOString();
  const end = dt(endDate);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Empowr//Calendar 1.0//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@empowr`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function buildICSMany(events: { title: string; description?: string; startISO: string; durationMinutes?: number }[]) {
  const dt = (iso: string) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Empowr//Calendar 1.0//EN');
  const now = dt(new Date().toISOString());
  events.forEach(ev => {
    const start = dt(ev.startISO);
    const endDate = new Date(new Date(ev.startISO).getTime() + (ev.durationMinutes ?? 60) * 60000).toISOString();
    const end = dt(endDate);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${Date.now()}_${Math.random().toString(36).slice(2)}@empowr`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeICS(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
