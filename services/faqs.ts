import { collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';

import type { Faq, NewFaqInput } from '../types/faq';

import { logActivity } from './activity';
import { writeAdminAudit } from './adminAudit';

// Collection name constant to avoid typos and enable reuse.
export const FAQ_COLLECTION = 'faqs';

function db() {
  return getFirestore();
}

export function subscribeFaqs(cb: (faqs: Faq[]) => void, opts: { locale?: string } = {}) {
  // For now locale filtering is client-side; future: add indexed field.
  const q = query(collection(db(), FAQ_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items: Faq[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      items.push({ id: d.id, ...data });
    });
    const filtered = opts.locale ? items.filter(i => !i.locale || i.locale === opts.locale) : items;
    cb(filtered);
  });
}

export async function createFaq(input: NewFaqInput): Promise<Faq> {
  const id = input.id || `faq_${Date.now()}`;
  const ref = doc(collection(db(), FAQ_COLLECTION), id);
  const now = Date.now();
  const faq: Faq = {
    id,
    q: input.q.trim(),
    a: input.a.trim(),
    tags: input.tags || [],
    locale: input.locale,
    createdAt: now,
    updatedAt: now,
    source: input.source || 'admin',
  };
  await setDoc(ref, faq);
  try { await logActivity({ type:'faq.create', payload:{ id, q: faq.q }, summaryKey:'faq.create' }); } catch {}
  try { await writeAdminAudit({ action: 'faq.create', target: id, details: { qLen: faq.q.length, tags: faq.tags?.length || 0 } }); } catch {}
  return faq;
}

export async function updateFaq(id: string, patch: Partial<Omit<Faq, 'id' | 'createdAt'>>): Promise<void> {
  const ref = doc(collection(db(), FAQ_COLLECTION), id);
  await updateDoc(ref, { ...patch, updatedAt: Date.now() });
  try { await logActivity({ type:'faq.update', payload:{ id, ...(patch.q?{ q: patch.q }:{}), ...(patch.a?{ a: patch.a }:{}) }, summaryKey:'faq.update' }); } catch {}
  try { await writeAdminAudit({ action: 'faq.update', target: id, details: { hasQ: !!patch.q, hasA: !!patch.a } }); } catch {}
}

export async function deleteFaq(id: string): Promise<void> {
  const ref = doc(collection(db(), FAQ_COLLECTION), id);
  await deleteDoc(ref);
  try { await logActivity({ type:'faq.delete', payload:{ id }, summaryKey:'faq.delete' }); } catch {}
  try { await writeAdminAudit({ action: 'faq.delete', target: id }); } catch {}
}
