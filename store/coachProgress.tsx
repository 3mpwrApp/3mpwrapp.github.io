import React from 'react';

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export interface CoachLessonProgress {
  id: string; // lesson id
  firstViewed: number; // epoch ms
  completed: boolean; // viewed counts as completed for current simple model
  completedAt?: number; // timestamp when flagged complete
}

interface CoachProgressState {
  lessons: CoachLessonProgress[];
  markViewed: (id: string) => void;
  reset: () => void;
  percentComplete: number;
}

const KEY = 'coachProgress:v1';

const Ctx = React.createContext<CoachProgressState | undefined>(undefined);

export function CoachProgressProvider({ children }: { children: React.ReactNode }) {
  const [lessons, setLessons] = React.useState<CoachLessonProgress[]>([]);

  React.useEffect(() => { (async () => { try { const raw = await AsyncStorage?.getItem?.(KEY); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setLessons(parsed); else if (Array.isArray(parsed.lessons)) setLessons(parsed.lessons); } } catch {} })(); }, []);
  React.useEffect(() => { (async () => { try { await AsyncStorage?.setItem?.(KEY, JSON.stringify(lessons)); } catch {} })(); }, [lessons]);

  const markViewed = (id: string) => {
    setLessons(prev => {
      const existing = prev.find(l => l.id === id);
      if (existing) {
        if (!existing.completed) return prev.map(l => l.id === id ? { ...l, completed: true, completedAt: Date.now() } : l);
        return prev; // already completed
      }
      return [...prev, { id, firstViewed: Date.now(), completed: true, completedAt: Date.now() }];
    });
  };

  const reset = () => setLessons([]);
  const completeCount = lessons.filter(l => l.completed).length;
  const percentComplete = lessons.length ? Math.round((completeCount / lessons.length) * 100) : 0;

  return <Ctx.Provider value={{ lessons, markViewed, reset, percentComplete }}>{children}</Ctx.Provider>;
}

export function useCoachProgress() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useCoachProgress must be used within CoachProgressProvider');
  return ctx;
}

// Test helper (mirrors pattern used elsewhere)
export function __getCoachProgressTestSnapshot() {
  return { lessons: JSON.parse(JSON.stringify((global as any).__coachProgressLessons || [])) };
}