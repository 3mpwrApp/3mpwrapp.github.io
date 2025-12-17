// AsyncStorage dynamic import helper
async function getAsyncStorage() {
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    if (mod && (mod.default || mod)) {
      return mod.default || mod;
    }
  } catch {}
  return null;
}
import React from 'react';

export type MedicationSchedule = {
  id: string; // uuid
  name: string;
  dose?: string;
  notes?: string;
  timezone?: string; // IANA tz name
  // recurrence using simple rule: daysOfWeek (0-6 Sun-Sat) or intervals in hours
  daysOfWeek?: number[]; // e.g. [1,3,5]
  times: string[]; // local times in HH:MM (24h)
  enabled: boolean;
  snoozeMinutes?: number;
};

type MedicationsStore = {
  medications: MedicationSchedule[];
  loading: boolean;
  addMedication: (m: MedicationSchedule) => Promise<void>;
  updateMedication: (id: string, patch: Partial<MedicationSchedule>) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  toggleMedication: (id: string) => Promise<void>;
  reload: () => Promise<void>;
};

const STORAGE_KEY = 'medications:v1';

const MedicationsContext = React.createContext<MedicationsStore | undefined>(undefined);

export const MedicationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [medications, setMedications] = React.useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = React.useState(true);

  const persist = React.useCallback(async (items: MedicationSchedule[]) => {
    try {
      const AsyncStorage = await getAsyncStorage();
      if (!AsyncStorage) throw new Error('AsyncStorage unavailable');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore persistence errors
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Failed to persist medications', msg);
    }
  }, []);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const AsyncStorage = await getAsyncStorage();
      if (!AsyncStorage) throw new Error('AsyncStorage unavailable');
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : [];
      setMedications((prev) => (prev && prev.length ? prev : stored));
    } catch (e) {
      setMedications((prev) => (prev && prev.length ? prev : []));
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Failed to load medications', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const addMedication = React.useCallback(async (m: MedicationSchedule) => {
    setMedications((prev) => {
      const next = [...prev, m];
      persist(next);
      return next;
    });
  }, [persist]);

  const updateMedication = React.useCallback(async (id: string, patch: Partial<MedicationSchedule>) => {
    setMedications((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, ...patch } : it));
      persist(next);
      return next;
    });
  }, [persist]);

  const removeMedication = React.useCallback(async (id: string) => {
    setMedications((prev) => {
      const next = prev.filter((it) => it.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleMedication = React.useCallback(async (id: string) => {
    setMedications((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it));
      persist(next);
      return next;
    });
  }, [persist]);

  const value: MedicationsStore = React.useMemo(() => ({
    medications,
    loading,
    addMedication,
    updateMedication,
    removeMedication,
    toggleMedication,
    reload,
  }), [medications, loading, addMedication, updateMedication, removeMedication, toggleMedication, reload]);

  return <MedicationsContext.Provider value={value}>{children}</MedicationsContext.Provider>;
};

export const useMedications = () => {
  const ctx = React.useContext(MedicationsContext);
  if (!ctx) throw new Error('useMedications must be used within MedicationsProvider');
  return ctx;
};
