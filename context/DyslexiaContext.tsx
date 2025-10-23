/**
 * Dyslexia Context
 * 
 * Global state management for dyslexia support features including:
 * - Font selection (OpenDyslexic, Lexend)
 * - Letter/line/word spacing
 * - Colored overlays
 * - Reading ruler
 * - Word highlighting
 * 
 * Persisted to AsyncStorage for cross-session consistency.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { logger } from '../utils/logger';
import {
    DEFAULT_DYSLEXIA_PREFERENCES,
    DYSLEXIA_PRESETS,
    DYSLEXIA_STORAGE_KEYS,
    type DyslexiaPreferences,
    type DyslexiaPresetKey,
} from '../constants/Dyslexia';

// ============================================================================
// Context Interface
// ============================================================================

interface DyslexiaContextValue {
  preferences: DyslexiaPreferences;
  currentPreset: DyslexiaPresetKey | 'custom';
  
  // Actions
  setPreferences: (prefs: Partial<DyslexiaPreferences>) => Promise<void>;
  applyPreset: (preset: DyslexiaPresetKey) => Promise<void>;
  reset: () => Promise<void>;
  
  // Getters
  isEnabled: boolean; // True if any dyslexia feature is active
}

const DyslexiaContext = createContext<DyslexiaContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function DyslexiaProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<DyslexiaPreferences>(
    DEFAULT_DYSLEXIA_PREFERENCES
  );
  const [currentPreset, setCurrentPreset] = useState<DyslexiaPresetKey | 'custom'>('standard');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedPrefs, savedPreset] = await Promise.all([
        AsyncStorage.getItem(DYSLEXIA_STORAGE_KEYS.PREFERENCES),
        AsyncStorage.getItem(DYSLEXIA_STORAGE_KEYS.PRESET),
      ]);

      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferencesState({ ...DEFAULT_DYSLEXIA_PREFERENCES, ...parsed });
      }

      if (savedPreset) {
        setCurrentPreset(savedPreset as DyslexiaPresetKey | 'custom');
      }
    } catch (error) {
      logger.warn('Failed to load dyslexia preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setPreferences = useCallback(async (prefs: Partial<DyslexiaPreferences>) => {
    setPreferencesState(prev => {
      const updated = { ...prev, ...prefs };
      
      // Persist to AsyncStorage
      AsyncStorage.setItem(
        DYSLEXIA_STORAGE_KEYS.PREFERENCES,
        JSON.stringify(updated)
      ).catch(err => logger.warn('Failed to save dyslexia preferences:', err));
      
      return updated;
    });
    
    // Mark as custom preset since user manually adjusted
    setCurrentPreset('custom');
    await AsyncStorage.setItem(DYSLEXIA_STORAGE_KEYS.PRESET, 'custom');
  }, []);

  const applyPreset = useCallback(async (preset: DyslexiaPresetKey) => {
    const presetConfig = DYSLEXIA_PRESETS[preset];
    if (!presetConfig) return;

    setPreferencesState(presetConfig.preferences);
    setCurrentPreset(preset);

    await Promise.all([
      AsyncStorage.setItem(
        DYSLEXIA_STORAGE_KEYS.PREFERENCES,
        JSON.stringify(presetConfig.preferences)
      ),
      AsyncStorage.setItem(DYSLEXIA_STORAGE_KEYS.PRESET, preset),
    ]);
  }, []);

  const reset = useCallback(async () => {
    setPreferencesState(DEFAULT_DYSLEXIA_PREFERENCES);
    setCurrentPreset('standard');
    
    await Promise.all([
      AsyncStorage.removeItem(DYSLEXIA_STORAGE_KEYS.PREFERENCES),
      AsyncStorage.removeItem(DYSLEXIA_STORAGE_KEYS.PRESET),
    ]);
  }, []);

  // Check if any dyslexia feature is enabled
  const isEnabled = React.useMemo(() => {
    return (
      preferences.font !== 'system' ||
      preferences.fontSize !== 100 ||
      preferences.letterSpacing !== 'normal' ||
      preferences.wordSpacing !== 'normal' ||
      preferences.lineHeight !== 'normal' ||
      preferences.coloredOverlay !== 'none' ||
      preferences.textContrast !== 'blackOnWhite' ||
      preferences.readingRuler !== 'none' ||
      preferences.syllableBreaks ||
      preferences.wordHighlighting ||
      preferences.autoScrolling
    );
  }, [preferences]);

  const value: DyslexiaContextValue = {
    preferences,
    currentPreset,
    setPreferences,
    applyPreset,
    reset,
    isEnabled,
  };

  // Don't render until loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <DyslexiaContext.Provider value={value}>
      {children}
    </DyslexiaContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useDyslexia(): DyslexiaContextValue {
  const context = useContext(DyslexiaContext);
  if (!context) {
    throw new Error('useDyslexia must be used within DyslexiaProvider');
  }
  return context;
}

// Optional hook that returns null if context not available
export function useDyslexiaOptional(): DyslexiaContextValue | null {
  const context = useContext(DyslexiaContext);
  return context || null;
}

