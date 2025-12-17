import Constants from 'expo-constants';

import { getDB } from './firestore';

export type SystemOverview = {
  eventsCount: number;
  campaignsCount: number;
  usersCount: number;
  pendingSubmissions: number;
};

export async function getSystemOverview(): Promise<SystemOverview> {
  const db = await getDB();
  if (!db) return { eventsCount: 0, campaignsCount: 0, usersCount: 0, pendingSubmissions: 0 };

  const m = await import('firebase/firestore');

  try {
    const [eventsSnap, campaignsSnap, usersSnap] = await Promise.all([
      m.getDocs(m.collection(db, 'events')),
      m.getDocs(m.collection(db, 'campaigns')),
      m.getDocs(m.collection(db, 'users')),
    ]);

    let pending = 0;

    // If a website admin API is configured, try to fetch pending submissions count
    const cfg = (Constants.expoConfig && (Constants.expoConfig as any).extra) || {};
    const adminUrl = cfg.ADMIN_API_URL || process.env.EXPO_PUBLIC_ADMIN_API_URL;
    const adminKey = cfg.ADMIN_API_KEY || process.env.EXPO_PUBLIC_ADMIN_API_KEY;

    if (adminUrl && adminKey) {
      try {
        const res = await fetch(`${adminUrl.replace(/\/$/, '')}/api/admin/submissions?status=pending`, {
          headers: { 'X-Admin-Key': adminKey },
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) pending = json.length;
          else if (typeof json.count === 'number') pending = json.count;
        }
      } catch (err) {
        // ignore - fall back to 0
      }
    }

    return {
      eventsCount: eventsSnap.size ?? 0,
      campaignsCount: campaignsSnap.size ?? 0,
      usersCount: usersSnap.size ?? 0,
      pendingSubmissions: pending,
    };
  } catch (error) {
    return { eventsCount: 0, campaignsCount: 0, usersCount: 0, pendingSubmissions: 0 };
  }
}
