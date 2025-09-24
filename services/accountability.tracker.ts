import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'accountability:cases:v1';

export type AccEventType = 'plan' | 'violations' | 'letter' | 'response' | 'ally';
export type AccEvent = { id: string; ts: number; type: AccEventType; text: string };
export type AccCase = {
  id: string;
  target?: string;
  issue: string;
  createdAt: number;
  updatedAt: number;
  events: AccEvent[];
};

async function readAll(): Promise<AccCase[]> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
async function writeAll(items: AccCase[]): Promise<void> { try { await AsyncStorage.setItem(KEY, JSON.stringify(items)); } catch {} }

export async function upsertCase(c: Partial<AccCase> & { issue: string; target?: string; id?: string }, evt?: Omit<AccEvent,'id'|'ts'> & { text: string; type: AccEventType }): Promise<AccCase> {
  const id = c.id || makeId(c.target, c.issue);
  const now = Date.now();
  const all = await readAll();
  let existing = all.find(x => x.id === id);
  if (!existing) {
    existing = { id, issue: c.issue, target: c.target, createdAt: now, updatedAt: now, events: [] };
    all.unshift(existing);
  } else {
    existing.issue = c.issue;
    existing.target = c.target;
    existing.updatedAt = now;
  }
  if (evt && evt.text?.trim()) {
    existing.events.unshift({ id: Math.random().toString(36).slice(2), ts: now, type: evt.type, text: evt.text.trim() });
  }
  await writeAll(all.slice(0, 50));
  return existing;
}

export async function addEvent(caseId: string, type: AccEventType, text: string): Promise<void> {
  const all = await readAll();
  const it = all.find(x => x.id === caseId);
  if (!it) return;
  it.events.unshift({ id: Math.random().toString(36).slice(2), ts: Date.now(), type, text: (text||'').trim() });
  it.updatedAt = Date.now();
  await writeAll(all);
}

export async function listCases(): Promise<AccCase[]> { return await readAll(); }
export async function getCaseByKey(target: string|undefined, issue: string): Promise<AccCase|undefined> {
  const id = makeId(target, issue);
  const all = await readAll();
  return all.find(x => x.id === id);
}

export async function getCaseById(id: string): Promise<AccCase|undefined> {
  const all = await readAll();
  return all.find(x => x.id === id);
}

export async function updateEvent(caseId: string, eventId: string, text: string): Promise<boolean> {
  const all = await readAll();
  const it = all.find(x => x.id === caseId);
  if (!it) return false;
  const evt = it.events.find(e => e.id === eventId);
  if (!evt) return false;
  evt.text = (text || '').trim();
  it.updatedAt = Date.now();
  await writeAll(all);
  return true;
}

export async function deleteEvent(caseId: string, eventId: string): Promise<boolean> {
  const all = await readAll();
  const it = all.find(x => x.id === caseId);
  if (!it) return false;
  const before = it.events.length;
  it.events = it.events.filter(e => e.id !== eventId);
  if (it.events.length === before) return false;
  it.updatedAt = Date.now();
  await writeAll(all);
  return true;
}

function makeId(target?: string, issue?: string){
  return (target||'unknown') + '::' + (issue||'').slice(0,120).toLowerCase().replace(/\s+/g,' ').trim();
}
