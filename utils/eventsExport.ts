// pii-scan-ignore-file - Contains organizer email in exported event data
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
  const uid = `${dt}-${evt.id}@3mpwrapp.pages.dev`;
  const loc = evt.isVirtual ? 'Virtual' : (evt.location ?? '');
  
  // Add 3mpwrApp branding to description
  const brandedDescription = evt.description 
    ? `${evt.description}\n\nPowered by 3mpwrApp\nhttps://3mpwrapp.pages.dev/events/`
    : 'Powered by 3mpwrApp\nhttps://3mpwrapp.pages.dev/events/';
  
  return (
    'BEGIN:VCALENDAR\n' +
    'VERSION:2.0\n' +
    'PRODID:-//3mpwrApp//Events//EN\n' +
    'CALSCALE:GREGORIAN\n' +
    'METHOD:PUBLISH\n' +
    'X-WR-CALNAME:3mpwrApp Events\n' +
    'X-WR-TIMEZONE:America/Toronto\n' +
    'BEGIN:VEVENT\n' +
    `UID:${uid}\n` +
    `DTSTART:${dt}\n` +
    `SUMMARY:${evt.title}\n` +
    `DESCRIPTION:${brandedDescription}\n` +
    `LOCATION:${loc}\n` +
    `URL:https://3mpwrapp.pages.dev/events/\n` +
    `ORGANIZER;CN=3mpwrApp:MAILTO:empowrapp08162025@gmail.com\n` +
    'STATUS:CONFIRMED\n' +
    'SEQUENCE:0\n' +
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
