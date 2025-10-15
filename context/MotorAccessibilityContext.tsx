import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'motor_accessibility_preferences_v1';

export interface MotorAccessibilityPreferences {
  dwellClickEnabled: boolean;
  dwellClickDelay: number; // 1000-5000ms
  stickyKeysEnabled: boolean;
  voiceCommandsEnabled: boolean;
  oneHandedMode: 'left' | 'right' | 'both';
  increasedTouchTargets: boolean;
  tremorCompensation: boolean;
  gestureSimplification: boolean;
}

const DEFAULT_PREFERENCES: MotorAccessibilityPreferences = {
  dwellClickEnabled: false,
  dwellClickDelay: 2000,
  stickyKeysEnabled: false,
  voiceCommandsEnabled: false,
  oneHandedMode: 'both',
  increasedTouchTargets: false,
  tremorCompensation: false,
  gestureSimplification: false,
};

interface MotorAccessibilityContextValue {
  preferences: MotorAccessibilityPreferences;
  setPreferences: (prefs: Partial<MotorAccessibilityPreferences>) => void;
  reset: () => void;
  isEnabled: boolean; // True if any motor feature active
  isLoading: boolean;
}

const MotorAccessibilityContext = createContext<MotorAccessibilityContextValue | null>(null);

export function MotorAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<MotorAccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferencesState({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (error) {
        logger.warn('[MotorAccessibility] Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Save preferences to storage whenever they change
  const setPreferences = async (partial: Partial<MotorAccessibilityPreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferencesState(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      logger.warn('[MotorAccessibility] Failed to save preferences:', error);
    }
  };

  // Reset to defaults
  const reset = async () => {
    setPreferencesState(DEFAULT_PREFERENCES);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.warn('[MotorAccessibility] Failed to reset preferences:', error);
    }
  };

  // Calculate if any motor feature is enabled
  const isEnabled =
    preferences.dwellClickEnabled ||
    preferences.stickyKeysEnabled ||
    preferences.voiceCommandsEnabled ||
    preferences.oneHandedMode !== 'both' ||
    preferences.increasedTouchTargets ||
    preferences.tremorCompensation ||
    preferences.gestureSimplification;

  return (
    <MotorAccessibilityContext.Provider
      value={{
        preferences,
        setPreferences,
        reset,
        isEnabled,
        isLoading,
      }}
    >
      {children}
    </MotorAccessibilityContext.Provider>
  );
}

/**
 * Hook to access motor accessibility preferences.
 * Throws if used outside MotorAccessibilityProvider.
 */
export function useMotorAccessibility() {
  const context = useContext(MotorAccessibilityContext);
  if (!context) {
    throw new Error('useMotorAccessibility must be used within MotorAccessibilityProvider');
  }
  return context;
}

/**
 * Optional hook - returns null if provider not available.
 * Useful for components that may be rendered outside the provider.
 */
export function useMotorAccessibilityOptional() {
  return useContext(MotorAccessibilityContext);
}

