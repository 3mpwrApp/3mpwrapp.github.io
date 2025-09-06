export async function addEvent({ title, notes, startISO, durationMinutes = 60 }: { title: string; notes?: string; startISO: string; durationMinutes?: number }) {
  try {
    const Calendar = require('expo-calendar');
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return false;
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCal = calendars.find((c: any) => c.allowsModifications) || calendars[0];
    const startDate = new Date(startISO);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    await Calendar.createEventAsync(defaultCal.id, {
      title,
      notes,
      startDate,
      endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return true;
  } catch {
    return false;
  }
}

