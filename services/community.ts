import { db, auth } from '../firebase/config';
import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';

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
