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

function escapeICS(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

