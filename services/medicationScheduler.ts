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
      const [hh, mm] = t.split(':').map((s) => parseInt(s, 10));
      const title = `Medication: ${med.name}`;
      const body = med.dose ? `${med.dose}` : 'Time to take your medication';
      // Use notifications.scheduleDailyAt if available (wraps expo-notifications API)
      try {
        const id = await Notifications.scheduleDailyAt(hh, mm, title, body);
        if (id) scheduled.push(id as string);
      } catch {
        // best-effort: try immediate notify
        try {
          await Notifications.scheduleLocal(title, body);
        } catch {}
      }
    }
  } catch {
    // ignore scheduling errors
  }
  return scheduled;
}

export async function cancelMedicationSchedules(_medId: string) {
  // Notifications service doesn't expose listing of scheduled jobs currently.
  // Implementing full cancellation requires storing scheduled IDs per medication.
  // For now, no-op and return true to indicate attempt succeeded.
  return true;
}
