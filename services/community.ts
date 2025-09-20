import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export type Thread = { id?: string; channel: string; title: string; body: string; authorUid: string; createdAt?: any; flagged?: boolean; hidden?: boolean };
export type Comment = { id?: string; threadId: string; text: string; authorUid: string; createdAt?: any; flagged?: boolean; hidden?: boolean };

export async function listThreads(_channel: string, pageSize = 10) {
  const col = collection(db, 'threads');
  let q = query(col, orderBy('createdAt','desc'), limit(pageSize));
  const snap = await getDocs(q);
  return { items: snap.docs.map(d=>({ id: d.id, ...(d.data() as any) })), cursor: snap.docs[snap.docs.length-1] };
}

export async function postThread(channel: string, title: string, body: string) {
  const col = collection(db, 'threads');
  return addDoc(col, { channel, title, body, authorUid: auth.currentUser?.uid, createdAt: serverTimestamp(), flagged:false, hidden:false });
}

export async function postComment(threadId: string, text: string) {
  const col = collection(db, 'comments');
  return addDoc(col, { threadId, text, authorUid: auth.currentUser?.uid, createdAt: serverTimestamp(), flagged:false, hidden:false });
}

// Presence/typing/last_read helpers
export async function setTyping(room: string, isTyping: boolean) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  await setDoc(doc(db, 'chats', room, 'typing', uid), { typing: isTyping, ts: serverTimestamp() }, { merge: true });
}

export async function touchPresence(room: string) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  await setDoc(doc(db, 'chats', room, 'presence', uid), { lastActive: serverTimestamp() }, { merge: true });
}

export async function setLastRead(room: string) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  await setDoc(doc(db, 'chats', room, 'last_read', uid), { ts: serverTimestamp() }, { merge: true });
}

// Channel unread helpers (per-user lastRead stored in chats/channel_<slug>/last_read/{uid})
export async function setChannelLastRead(slug: string) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  await setDoc(doc(db, 'chats', `channel_${slug}`, 'last_read', uid), { ts: serverTimestamp() }, { merge: true });
}

export async function getChannelUnread(slug: string, max: number = 50): Promise<number> {
  try {
    const uid = auth.currentUser?.uid; if (!uid) return 0;
    const lr = await getDocs(query(collection(db, 'chats', `channel_${slug}`, 'last_read')));
    let lastTs = 0;
    lr.forEach(d => { if (d.id === uid) { const t = (d.data() as any)?.ts?.toDate?.()?.getTime?.() || 0; if (t) lastTs = t; } });
    // Fetch recent threads after lastTs
    const col = collection(db, 'threads');
    const q = lastTs
      ? query(col, where('channel','==', slug), where('createdAt','>', new Date(lastTs)), orderBy('createdAt','desc'), limit(max))
      : query(col, where('channel','==', slug), orderBy('createdAt','desc'), limit(max));
    const snap = await getDocs(q);
    if (!lastTs) return snap.size; // best effort
    return snap.docs.filter(d => ((d.data() as any)?.createdAt?.toDate?.()?.getTime?.() || 0) > lastTs).length;
  } catch { return 0; }
}
