import type { MedicationSchedule } from '../store/medications';

import * as Notifications from './notifications';

// Lightweight scheduler that converts MedicationSchedule into notification jobs
// Uses services/notifications scheduling API (assumed existing). If not, falls back to simple immediate send.

export async function scheduleForMedication(med: MedicationSchedule) {
  // For each enabled time, schedule a notification id
  if (!med.enabled) return [];
  const scheduled: string[] = [];

  try {
    for (const t of med.times) {
      const id = `med-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
      const [hh, mm] = t.split(':').map((s) => parseInt(s, 10));
      const title = `Medication: ${med.name}`;
      const body = med.dose ? `${med.dose}` : 'Time to take your medication';
      // build trigger - daily at local time. services/notifications.scheduleNotification handles platform details
      try {
        await Notifications.scheduleNotification({
          id,
          title,
          body,
          // provide metadata for cancellation
          data: { medicationId: med.id },
          trigger: {
            hour: hh,
            minute: mm,
            repeats: true,
          },
        });
        scheduled.push(id);
      } catch (e) {
        // best-effort: try immediate notify
        try {
          await Notifications.sendLocalNotification({ title, body, data: { medicationId: med.id } });
        } catch {}
      }
    }
  } catch (err) {
    // ignore scheduling errors
  }
  return scheduled;
}

export async function cancelMedicationSchedules(medId: string) {
  try {
    const scheduled = await Notifications.getScheduledNotifications();
    for (const s of scheduled) {
      if (s.data && s.data.medicationId === medId) {
        try {
          await Notifications.cancelScheduledNotification(s.id);
        } catch {}
      }
    }
  } catch (e) {
    // ignore
  }
}
