import { Share } from 'react-native';

export type SimpleEvent = {
  id: string;
  title: string;
  date: string; // ISO-ish
  description?: string;
  location?: string;
  isVirtual?: boolean;
};

export function makeICS(evt: SimpleEvent) {
  const dt = evt.date.replace(/[-: ]/g, '');
  const uid = `${dt}-${evt.id}`;
  const loc = evt.isVirtual ? 'Virtual' : (evt.location ?? '');
  return (
    'BEGIN:VCALENDAR\n' +
    'VERSION:2.0\n' +
    'BEGIN:VEVENT\n' +
    `UID:${uid}\n` +
    `DTSTART:${dt}\n` +
    `SUMMARY:${evt.title}\n` +
    `DESCRIPTION:${evt.description ?? ''}\n` +
    `LOCATION:${loc}\n` +
    'END:VEVENT\n' +
    'END:VCALENDAR'
  );
}

export function makeCSVRow(evt: SimpleEvent) {
  const cells = [evt.date, evt.title, evt.description ?? '', evt.isVirtual ? 'Virtual' : (evt.location ?? '')];
  // naive CSV escape
  return cells.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',');
}

export async function shareText(filename: string, content: string) {
  // Minimal approach: share via the platform share sheet; native calendar intent is handled elsewhere
  try {
    await Share.share({ message: content, title: filename });
    return true;
  } catch {
    return false;
  }
}
