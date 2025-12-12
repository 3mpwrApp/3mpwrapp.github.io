/**
 * Font Context - Provides app-wide font family preference
 * 
 * Enables users to switch between system, OpenDyslexic, and Lexend fonts
 * for improved accessibility and reading comfort.
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { logError } from '../utils/errorLogger';

import {
    DEFAULT_FONT,
    FONT_STORAGE_KEY,
    getFontFamily,
    type FontFamilyKey
} from './fonts';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

interface FontContextType {
  /** Current font family key */
  fontKey: FontFamilyKey;
  /** Actual font family string for use in styles */
  fontFamily: string;
  /** Change the font family */
  setFontKey: (key: FontFamilyKey) => Promise<void>;
  /** Whether fonts are loaded */
  isLoaded: boolean;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontKey, setFontKeyState] = useState<FontFamilyKey>(DEFAULT_FONT);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load saved preference on mount
  useEffect(() => {
    const load = async () => {
      if (!AsyncStorage) {
        setIsLoaded(true);
        return;
      }
      
      try {
        const saved = await AsyncStorage.getItem(FONT_STORAGE_KEY);
        if (saved && (saved === 'system' || saved === 'openDyslexic' || saved === 'lexend')) {
          setFontKeyState(saved as FontFamilyKey);
        }
      } catch (e) {
        logError('FontContext', 'Failed to load font preference', e as Error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    load();
  }, []);
  
  const setFontKey = async (key: FontFamilyKey) => {
    setFontKeyState(key);
    
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(FONT_STORAGE_KEY, key);
      } catch (e) {
        logError('FontContext', 'Failed to save font preference', e as Error);
      }
    }
  };
  
  const fontFamily = getFontFamily(fontKey);
  
  return (
    <FontContext.Provider value={{ fontKey, fontFamily, setFontKey, isLoaded }}>
      {children}
    </FontContext.Provider>
  );
}

/**
 * Hook to access font preferences
 */
export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      fontKey: DEFAULT_FONT,
      fontFamily: getFontFamily(DEFAULT_FONT),
      setFontKey: async () => {},
      isLoaded: true,
    };
  }
  return context;
}
