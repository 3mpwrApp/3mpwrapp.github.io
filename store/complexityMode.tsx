/**
 * Complexity Mode Store
 * Manages Simple/Standard/Power User modes to reduce feature overwhelm
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { logError } from '../utils/errorLogger';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

export type ComplexityMode = 'simple' | 'standard' | 'power_user';

interface ComplexityModeContextType {
  mode: ComplexityMode;
  setMode: (mode: ComplexityMode) => Promise<void>;
  isBadDayMode: boolean;
  setBadDayMode: (enabled: boolean) => Promise<void>;
  isFeatureVisible: (featureLevel: 'simple' | 'standard' | 'power_user') => boolean;
}

const ComplexityModeContext = createContext<ComplexityModeContextType | undefined>(undefined);

const STORAGE_KEY = 'complexity:mode:v1';
const BAD_DAY_KEY = 'complexity:badday:v1';
const PREVIOUS_MODE_KEY = 'complexity:previousmode:v1';

export function ComplexityModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ComplexityMode>('standard');
  const [isBadDayMode, setBadDayModeState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved mode on mount
  useEffect(() => {
    const loadMode = async () => {
      if (!AsyncStorage) {
        setIsLoaded(true);
        return;
      }
      
      try {
        const [savedMode, savedBadDay] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(BAD_DAY_KEY)
        ]);
        
        if (savedMode === 'simple' || savedMode === 'standard' || savedMode === 'power_user') {
          setModeState(savedMode);
        }
        
        if (savedBadDay === 'true') {
          setBadDayModeState(true);
        }
      } catch (error) {
        logError('ComplexityMode', 'Failed to load mode', error as Error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadMode();
  }, []);

  const setMode = async (newMode: ComplexityMode) => {
    setModeState(newMode);
    
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, newMode);
      } catch (error) {
        logError('ComplexityMode', 'Failed to save mode', error as Error);
      }
    }
  };

  const setBadDayMode = async (enabled: boolean) => {
    if (AsyncStorage) {
      try {
        if (enabled) {
          // Save current mode before switching to simple
          await AsyncStorage.setItem(PREVIOUS_MODE_KEY, mode);
          setBadDayModeState(true);
          await setMode('simple');
        } else {
          // Restore previous mode when disabling bad day mode
          const previousMode = await AsyncStorage.getItem(PREVIOUS_MODE_KEY);
          setBadDayModeState(false);
          if (previousMode === 'simple' || previousMode === 'standard' || previousMode === 'power_user') {
            await setMode(previousMode);
          } else {
            // Default to standard if no previous mode
            await setMode('standard');
          }
        }
        await AsyncStorage.setItem(BAD_DAY_KEY, enabled ? 'true' : 'false');
      } catch (error) {
        logError('ComplexityMode', 'Failed to save bad day mode', error as Error);
        setBadDayModeState(enabled);
        if (enabled) {
          await setMode('simple');
        }
      }
    } else {
      // No AsyncStorage - just toggle states in memory
      setBadDayModeState(enabled);
      if (enabled) {
        await setMode('simple');
      } else {
        await setMode('standard');
      }
    }
  };

  const isFeatureVisible = (featureLevel: 'simple' | 'standard' | 'power_user'): boolean => {
    // Bad Day Mode shows only simple features
    if (isBadDayMode) return featureLevel === 'simple';
    
    // Feature visibility hierarchy
    if (mode === 'simple') return featureLevel === 'simple';
    if (mode === 'standard') return featureLevel === 'simple' || featureLevel === 'standard';
    return true; // power_user sees everything
  };

  if (!isLoaded) {
    return null; // Prevent flash of wrong content
  }

  return (
    <ComplexityModeContext.Provider 
      value={{ 
        mode, 
        setMode, 
        isBadDayMode, 
        setBadDayMode, 
        isFeatureVisible 
      }}
    >
      {children}
    </ComplexityModeContext.Provider>
  );
}

export function useComplexityMode() {
  const context = useContext(ComplexityModeContext);
  if (!context) {
    throw new Error('useComplexityMode must be used within ComplexityModeProvider');
  }
  return context;
}

/**
 * Feature visibility levels:
 * 
 * SIMPLE (5 core features):
 * - Evidence Locker
 * - Document Factory (letters, appeals, accommodations)
 * - Crisis Resources
 * - Mood Tracker
 * - Community (Beta Testers Chat)
 * 
 * STANDARD (adds 15 commonly used features):
 * - All Simple features +
 * - AI Advocate Translator
 * - Wellness tracking (energy, pacing)
 * - Support Directory
 * - Campaigns
 * - Events
 * - Profile settings
 * 
 * POWER USER (all 150+ features):
 * - Everything
 */
