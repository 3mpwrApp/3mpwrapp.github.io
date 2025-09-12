import { db as sharedDb } from "../firebase/config";

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
  // Always reuse the singleton Firestore instance configured in firebase/config
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
