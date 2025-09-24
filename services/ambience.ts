import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

import { useAppPalette } from '../theme/usePalette';

export type AmbienceSuggestion = {
  palette: 'calm' | 'focus' | 'uplift' | 'lowStim';
  color: string;
  soundscape: 'rain' | 'forest' | 'ocean' | 'silence';
  brightness: 'low' | 'medium' | 'high';
};

export function computeAmbience(moodScore: number | null, trend: 'improving'|'declining'|'stable'|'none'): AmbienceSuggestion {
  if (moodScore == null) return { palette:'calm', color:'#334155', soundscape:'silence', brightness:'low' };
  if (trend === 'declining') return { palette:'lowStim', color:'#1f2937', soundscape:'rain', brightness:'low' };
  if (moodScore >= 1) return { palette:'uplift', color:'#14532d', soundscape:'forest', brightness:'high' };
  if (moodScore <= -1) return { palette:'calm', color:'#0f172a', soundscape:'ocean', brightness:'low' };
  return { palette:'focus', color:'#1e293b', soundscape:'silence', brightness:'medium' };
}

export function useApplyAmbience(moodScore: number | null, trend: 'improving'|'declining'|'stable'|'none') {
  const palette = useAppPalette();
  useEffect(() => {
    computeAmbience(moodScore, trend);
    // We cannot set OS wallpaper from Expo reliably; adjust in-app accents only
    // Trigger a light haptic as subtle feedback
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    // The app palette can be extended to react to this suggestion; currently returned to callers
  }, [moodScore, trend, palette]);
}
