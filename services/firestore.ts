import type * as Fire from "firebase/firestore";

import { db as sharedDb } from "../firebase/config";

import { isStrictBYOC } from "./dataPolicy";

let mod: typeof Fire | null = null;

async function ensure(): Promise<typeof Fire | null> {
  if (mod) return mod;
  try {
    mod = await import("firebase/firestore");
    return mod;
  } catch {
    return null;
  }
}

export async function getDB() {
  // Always reuse the singleton Firestore instance configured in firebase/config
  if (isStrictBYOC()) return null;
  return sharedDb ?? null;
}

// Campaigns
export async function fsAddCampaign(c: {
  id: string;
  title: string;
  summary: string;
  createdAt?: number;
  target?: string;
  goalCount?: number;
  contactEmail?: string;
}) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, "campaigns", c.id), {
      ...c,
      createdAt: c.createdAt ?? Date.now(),
      membersCount: 0,
    });
    return true;
  } catch {
    return false;
  }
}

// Events
export async function fsAddEvent(e: {
  id: string;
  title: string;
  description: string;
  date: string; // ISO or friendly
  location?: string;
  isVirtual?: boolean;
  asl?: boolean;
  captions?: boolean;
  stepFree?: boolean;
  sensorySpace?: boolean;
}) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, "events", e.id), { ...e, createdAt: Date.now() } as any, { merge: true });
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
    await m.setDoc(
      m.doc(db, "campaigns", id),
      { membersCount: m.increment(delta) },
      { merge: true },
    );
    return true;
  } catch {
    return false;
  }
}

// Campaign membership (per-user)
export async function fsJoinCampaign(campaignId: string, uid: string) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(m.doc(db, `campaigns/${campaignId}/members`, uid), { uid, joinedAt: Date.now() } as any, { merge: true });
    await fsIncrementCampaignMembers(campaignId, 1);
    return true;
  } catch {
    return false;
  }
}

export async function fsLeaveCampaign(campaignId: string, uid: string) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.deleteDoc(m.doc(db, `campaigns/${campaignId}/members`, uid));
    await fsIncrementCampaignMembers(campaignId, -1);
    return true;
  } catch {
    return false;
  }
}

export async function fsFetchJoinedCampaigns(uid: string): Promise<string[]> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return [];
  try {
    // Query all campaigns with membership subcollection containing uid (fan out): not directly queryable without collection group.
    // Use collection group on members
    const cg = m.collectionGroup(db, 'members');
    const q = m.query(cg, m.where('uid', '==', uid));
    const snap = await m.getDocs(q);
    const list: string[] = [];
    snap.forEach(doc => {
      const path = doc.ref.path; // campaigns/<id>/members/<uid>
      const parts = path.split('/');
      if (parts.length >= 4) list.push(parts[1]);
    });
    return list;
  } catch {
    return [];
  }
}

// Community
export async function fsAddThread(data: {
  id: string;
  channelId: string;
  title: string;
  author: string | null;
  createdAt: number;
}) {
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

export async function fsAddComment(data: {
  id: string;
  threadId: string;
  author: string | null;
  content: string;
  createdAt: number;
}) {
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

// Campaign Rooms (collab)
export async function fsRoomAddTask(
  roomId: string,
  task: { id: string; kind: string; title: string; done?: boolean },
) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(
      m.doc(db, `campaign_rooms/${roomId}/tasks`, task.id),
      task as any,
      { merge: true },
    );
    return true;
  } catch {
    return false;
  }
}

export async function fsRoomToggleTask(
  roomId: string,
  taskId: string,
  done: boolean,
) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(
      m.doc(db, `campaign_rooms/${roomId}/tasks`, taskId),
      { done } as any,
      { merge: true },
    );
    return true;
  } catch {
    return false;
  }
}

export async function fsRoomSetNotes(roomId: string, notes: string) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    await m.setDoc(
      m.doc(db, `campaign_rooms/${roomId}`, "notes"),
      { id: "notes", text: notes } as any,
      { merge: true },
    );
    return true;
  } catch {
    return false;
  }
}

// Room meta helpers
export async function fsRoomEnsureMeta(roomId: string, ownerUid: string) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    const ref = m.doc(db, `campaign_rooms/${roomId}`);
    const snap = await m.getDoc(ref as any);
    if (!snap.exists()) {
      await m.setDoc(ref, { ownerUid, mods: [] } as any, { merge: true });
    }
    return true;
  } catch {
    return false;
  }
}

export async function fsRoomCreateInvite(roomId: string) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return null;
  try {
    const token = String(Date.now());
    await m.setDoc(m.doc(db, `campaign_rooms/${roomId}/invites`, token), { id: token, createdAt: Date.now() } as any);
    return token;
  } catch {
    return null;
  }
}

export async function fsRoomAcceptInvite(roomId: string, token: string, uid: string) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return false;
  try {
    const invRef = m.doc(db, `campaign_rooms/${roomId}/invites`, token);
    const inv = await m.getDoc(invRef as any);
    if (!inv.exists()) return false;
    const roomRef = m.doc(db, `campaign_rooms/${roomId}`);
    await m.setDoc(roomRef, { mods: m.arrayUnion(uid) } as any, { merge: true });
    await m.deleteDoc(invRef as any);
    return true;
  } catch {
    return false;
  }
}

export async function fsRoomSubscribe(
  roomId: string,
  handlers: { onTasks: (list: any[]) => void; onNotes: (txt: string) => void },
) {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) return { unsubscribe: () => {} };
  const unsubTasks = m.onSnapshot(
    m.collection(db, `campaign_rooms/${roomId}/tasks`),
    (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      handlers.onTasks(list);
    },
  );
  const unsubNotes = m.onSnapshot(
    m.doc(db, `campaign_rooms/${roomId}`, "notes"),
    (doc) => {
      handlers.onNotes((doc.data() as any)?.text ?? "");
    },
  );
  return {
    unsubscribe: () => {
      try {
        (unsubTasks as any)();
        (unsubNotes as any)();
      } catch {}
    },
  };
}
