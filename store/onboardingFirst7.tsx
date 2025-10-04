import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export type First7StepId =
  | 'capture_basics'
  | 'first_evidence_note'
  | 'tag_key_contacts'
  | 'bookmark_resources'
  | 'set_reminders'
  | 'record_denial_dates'
  | 'setup_privacy'
  | 'export_backup';

export type First7State = {
  startedAt?: number;
  completed: Record<First7StepId, boolean>;
  dismissed?: boolean;
};

const KEY = 'onboarding:first7:v1';

const defaultState: First7State = {
  startedAt: undefined,
  completed: {
    capture_basics: false,
    first_evidence_note: false,
    tag_key_contacts: false,
    bookmark_resources: false,
    set_reminders: false,
    record_denial_dates: false,
    setup_privacy: false,
    export_backup: false,
  },
  dismissed: false,
};

type Ctx = {
  state: First7State;
  toggle: (id: First7StepId, done?: boolean) => Promise<void>;
  start: () => Promise<void>;
  reset: () => Promise<void>;
  dismiss: () => Promise<void>;
};

export const First7Context = React.createContext<Ctx>({
  state: defaultState,
  toggle: async () => {},
  start: async () => {},
  reset: async () => {},
  dismiss: async () => {},
});

export function First7Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<First7State>(defaultState);
  React.useEffect(() => { (async()=>{ try { const raw = await AsyncStorage.getItem(KEY); if (raw) setState({ ...defaultState, ...JSON.parse(raw) }); } catch {} })(); }, []);
  const persist = React.useCallback(async(next: First7State)=>{ setState(next); try{ await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {} },[]);
  const toggle = React.useCallback(async(id: First7StepId, done?: boolean)=>{
    const next = { ...state, completed: { ...state.completed, [id]: typeof done==='boolean'? done: !state.completed[id] } };
    await persist(next);
  }, [state, persist]);
  const start = React.useCallback(async()=>{ const next = { ...state, startedAt: state.startedAt ?? Date.now(), dismissed: false }; await persist(next); }, [state, persist]);
  const reset = React.useCallback(async()=>{ await persist(defaultState); }, [persist]);
  const dismiss = React.useCallback(async()=>{ const next = { ...state, dismissed: true }; await persist(next); }, [state, persist]);
  return <First7Context.Provider value={{ state, toggle, start, reset, dismiss }}>{children}</First7Context.Provider>;
}

export function useFirst7(){
  return React.useContext(First7Context);
}
