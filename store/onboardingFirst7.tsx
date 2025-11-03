import React from 'react';
import { logError } from '../utils/errorLogger';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback for web or environments without AsyncStorage
  AsyncStorage = null;
}

export type First7StepId =
  | 'capture_basics'
  | 'choose_role'
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
  role?: 'self' | 'supporter' | 'ally'; // Track selected role
};

const KEY = 'onboarding:first7:v1';

const defaultState: First7State = {
  startedAt: undefined,
  completed: {
    capture_basics: false,
    choose_role: false,
    first_evidence_note: false,
    tag_key_contacts: false,
    bookmark_resources: false,
    set_reminders: false,
    record_denial_dates: false,
    setup_privacy: false,
    export_backup: false,
  },
  dismissed: false,
  role: undefined,
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
  const [error, setError] = React.useState<Error | null>(null);
  
  // Load persisted state on mount
  React.useEffect(() => { 
    (async()=>{ 
      try {
        if (!AsyncStorage) return; 
        const raw = await AsyncStorage.getItem(KEY); 
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({ ...defaultState, ...parsed }); 
        }
      } catch (err) {
        logError('First7Provider', 'load state', err);
        setError(err as Error);
        // Silently fail - keep using default state
      }
    })(); 
  }, []);
  
  // Persist state whenever it changes
  const persist = React.useCallback(async(next: First7State)=>{ 
    try {
      setState(next); 
      if (!AsyncStorage) return;
      await AsyncStorage.setItem(KEY, JSON.stringify(next)); 
    } catch (err) {
      logError('First7Provider', 'persist state', err);
      // Don't crash - just log
    }
  }, []);
  
  const toggle = React.useCallback(async(id: First7StepId, done?: boolean)=>{
    try {
      setState(prevState => {
        const next = { 
          ...prevState, 
          completed: { 
            ...prevState.completed, 
            [id]: typeof done==='boolean'? done: !prevState.completed[id] 
          } 
        };
        // Persist asynchronously in background
        if (AsyncStorage) {
          AsyncStorage.setItem(KEY, JSON.stringify(next)).catch((err: any) => {
            logError('First7Provider', 'toggle persist', err);
          });
        }
        return next;
      });
    } catch (err) {
      logError('First7Provider', 'toggle', err);
    }
  }, []);
  
  const start = React.useCallback(async()=>{ 
    try {
      setState(prevState => {
        const next = { ...prevState, startedAt: prevState.startedAt ?? Date.now(), dismissed: false };
        if (AsyncStorage) {
          AsyncStorage.setItem(KEY, JSON.stringify(next)).catch((err: any) => {
            logError('First7Provider', 'start persist', err);
          });
        }
        return next;
      });
    } catch (err) {
      logError('First7Provider', 'start', err);
    }
  }, []);
  
  const reset = React.useCallback(async()=>{ 
    try {
      await persist(defaultState); 
    } catch (err) {
      logError('First7Provider', 'reset', err);
    }
  }, [persist]);
  
  const dismiss = React.useCallback(async()=>{ 
    try {
      setState(prevState => {
        const next = { ...prevState, dismissed: true };
        if (AsyncStorage) {
          AsyncStorage.setItem(KEY, JSON.stringify(next)).catch((err: any) => {
            logError('First7Provider', 'dismiss persist', err);
          });
        }
        return next;
      });
    } catch (err) {
      logError('First7Provider', 'dismiss', err);
    }
  }, []);
  
  if (error) {
    logError('First7Provider', 'Provider has error state - still rendering with default state', error);
  }
  
  // Render state always - never throw
  try {
    return <First7Context.Provider value={{ state, toggle, start, reset, dismiss }}>{children}</First7Context.Provider>;
  } catch (err) {
    logError('First7Provider', 'render error', err);
    // Emergency fallback - render children with empty provider
    return (
      <First7Context.Provider value={{ state: defaultState, toggle: async () => {}, start: async () => {}, reset: async () => {}, dismiss: async () => {} }}>
        {children}
      </First7Context.Provider>
    );
  }
}

export function useFirst7(){
  return React.useContext(First7Context);
}
