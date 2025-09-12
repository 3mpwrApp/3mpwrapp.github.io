import { auth, db } from '../firebase/config';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';

export type AidPost = { id?: string; type: string; description: string; city?: string; contact?: string; createdAt?: any };
export type AidResponse = { id?: string; message: string; createdAt?: any };

export async function addAidPost(p: Omit<AidPost,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid || 'anon';
  await addDoc(collection(db, 'mutual_aid_posts'), { ...p, uid, createdAt: serverTimestamp() });
}
export async function listAidPosts(): Promise<AidPost[]> {
  const snap = await getDocs(query(collection(db, 'mutual_aid_posts'), orderBy('createdAt','desc')));
  return snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
}
export async function respondToPost(postId: string, message: string) {
  await addDoc(collection(db, 'mutual_aid_posts', postId, 'responses'), { message, createdAt: serverTimestamp() });
}
export async function deletePost(id: string) {
  await deleteDoc(doc(db, 'mutual_aid_posts', id));
}
export async function softDeletePost(id: string) {
  await updateDoc(doc(db,'mutual_aid_posts', id), { deleted: true });
}
