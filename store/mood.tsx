import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { usage } from '../services/usage';

export interface MoodEntry {
  id: string;
  ts: number; // epoch ms
  score: number; // -2..+2 simple scale
  note?: string;
  tags?: string[];
}

interface MoodContextShape {
  entries: MoodEntry[];
  addEntry: (score: number, note?: string, tags?: string[]) => void;
  recentAverage: number | null;
  todayEntries: MoodEntry[];
}

const MoodContext = createContext<MoodContextShape | undefined>(undefined);

const STORAGE_KEY = 'mood:entries:v1';

function computeRecentAverage(entries: MoodEntry[]): number | null {
  if (!entries.length) return null;
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000; // 7 days
  const recent = entries.filter(e => e.ts >= cutoff);
  if (!recent.length) return null;
  return recent.reduce((sum, e) => sum + e.score, 0) / recent.length;
}

export const MoodProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (next: MoodEntry[]) => {
    setEntries(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addEntry = useCallback((score: number, note?: string, tags?: string[]) => {
    const entry: MoodEntry = { id: Math.random().toString(36).slice(2), ts: Date.now(), score, note, tags };
    const next = [entry, ...entries].slice(0, 500); // cap
    persist(next);
  usage.view('mood', '/(tabs)/wellness.mood', { event: 'add', score, hasNote: !!note, tagsCount: tags?.length || 0 });
  }, [entries, persist]);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEntries = entries.filter(e => e.ts >= todayStart.getTime());
  const recentAverage = computeRecentAverage(entries);

  return (
    <MoodContext.Provider value={{ entries, addEntry, recentAverage, todayEntries }}>
      {children}
    </MoodContext.Provider>
  );
};

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
}
