import { trackEvent } from './analyticsClient';
import { getDB } from "./firestore";

export async function fsAddViolationReport(r: {
  id: string;
  type: string;
  province?: string;
  details?: string;
  createdAt: number;
}) {
  try {
    const m = await import("firebase/firestore");
    const db = await getDB();
    if (!db) return false;
    await m.setDoc(m.doc(db, "violations", r.id), r as any);
    // aggregate counter by type
    await m.setDoc(
      m.doc(db, "violation_counts", r.type),
      { count: m.increment(1) } as any,
      { merge: true },
    );
    const res = true;
  trackEvent('advocacy.collective.submit', { type: r?.type });
    return res;
  } catch {
    return false;
  }
}
