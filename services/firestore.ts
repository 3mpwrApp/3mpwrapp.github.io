import { getFirebaseApp } from "../firebase/config";

type Fire = typeof import("firebase/firestore");

let mod: Fire | null = null;

async function ensure(): Promise<Fire | null> {
  if (mod) return mod;
  try {
    mod = await import("firebase/firestore");
    return mod;
  } catch {
    return null;
  }
}

export async function getDB() {
  const m = await ensure();
  if (!m) return null;
  const app = getFirebaseApp();
  return m.getFirestore(app);
}

// Campaigns
export async function fsAddCampaign(c: { id: string; title: string; summary: string; createdAt?: number }) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, "campaigns", c.id), { ...c, createdAt: c.createdAt ?? Date.now(), membersCount: 0 });
    return true;
  } catch {
    return false;
  }
}

export async function fsIncrementCampaignMembers(id: string, delta: number) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, "campaigns", id), { membersCount: m.increment(delta) }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

// Community
export async function fsAddThread(data: { id: string; channelId: string; title: string; author: string | null; createdAt: number }) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, "threads", data.id), data);
    return true;
  } catch {
    return false;
  }
}

export async function fsAddComment(data: { id: string; threadId: string; author: string | null; content: string; createdAt: number }) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, "comments", data.id), data);
    return true;
  } catch {
    return false;
  }
}
