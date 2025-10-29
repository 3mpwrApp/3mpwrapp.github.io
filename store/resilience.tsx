import React from 'react';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback for web or environments without AsyncStorage
  AsyncStorage = null;
}

export type ResilienceEvent = { id: string; ts: number; kind: string; points: number; note?: string };
export interface ResilienceState {
  // Gamified points view
  points: number;
  actions: ResilienceAction[];
  award: (id: string) => Promise<void>;
  // Detailed event log + utilities
  total: number;
  events: ResilienceEvent[];
  add: (e: Omit<ResilienceEvent,'id'|'ts'> & { note?: string }) => Promise<void>;
  reset: () => Promise<void>;
}

const KEY = 'resilience:v1';

export const ResilienceContext = React.createContext<ResilienceState | null>(null);

export function ResilienceProvider({ children }: { children: React.ReactNode }) {
  const [total, setTotal] = React.useState(0);
  const [events, setEvents] = React.useState<ResilienceEvent[]>([]);
  React.useEffect(()=>{ (async()=>{
    if (!AsyncStorage) return;
    try { const raw = await AsyncStorage.getItem(KEY); if (raw){ const d = JSON.parse(raw); setTotal(d.total||0); setEvents(d.events||[]);} } catch {}
  })(); },[]);
  const persist = async (t: number, ev: ResilienceEvent[]) => {
    setTotal(t); setEvents(ev);
    if (!AsyncStorage) return;
    try { await AsyncStorage.setItem(KEY, JSON.stringify({ total:t, events:ev })); } catch {}
  };
  const add: ResilienceState['add'] = async (e) => {
    const entry: ResilienceEvent = { id: Math.random().toString(36).slice(2), ts: Date.now(), kind: e.kind, points: e.points, note: e.note };
    const t = total + e.points;
    await persist(t, [entry, ...events].slice(0,500));
  };
  const award: ResilienceState['award'] = async (id) => {
    const a = RESILIENCE_ACTIONS.find(x=> x.id===id);
    if (!a) return;
    await add({ kind: id, points: a.points });
  };
  const reset = async () => { await persist(0, []); };
  const value: ResilienceState = {
    // points & actions API used by UI
    points: total,
    actions: RESILIENCE_ACTIONS,
    award,
    // detailed event log
    total,
    events,
    add,
    reset
  };
  return <ResilienceContext.Provider value={value}>{children}</ResilienceContext.Provider>;
}

export function useResilience() {
  const ctx = React.useContext(ResilienceContext);
  if (!ctx) throw new Error('ResilienceProvider missing');
  return ctx;
}

export type ResilienceAction = { id: string; name: string; tKey: string; points: number; icon: string };
export const RESILIENCE_ACTIONS: ResilienceAction[] = [
  { id:'exposure', name:'Face a fear', tKey:'wellness.resilience.faceFear', points: 10, icon: '🧗' },
  { id:'therapy', name:'Attend therapy', tKey:'wellness.resilience.therapy', points: 8, icon: '🧠' },
  { id:'ground', name:'Practice grounding', tKey:'wellness.resilience.grounding', points: 5, icon: '🌿' },
  { id:'breath', name:'Breathing', tKey:'wellness.resilience.breathing', points: 3, icon: '🌬️' },
];
