import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { logger } from '../utils/logger';

export interface NeurodivergentPreferences {
  // Sensory-friendly options
  reducedMotion: boolean;
  highContrast: boolean;
  colorBlindFriendly: boolean;
  sensoryFriendlyMode: boolean;
  minimalInterface: boolean;
  
  // Focus and attention aids
  focusMode: boolean;
  distractionReduction: boolean;
  taskBreakReminders: boolean;
  timeAwareness: boolean;
  
  // Executive function support
  stepByStepGuidance: boolean;
  visualProgressIndicators: boolean;
  taskChunking: boolean;
  priorityHighlighting: boolean;
  
  // Cognitive load management
  simplifiedLanguage: boolean;
  extraProcessingTime: boolean;
  confirmationDialogs: boolean;
  undoAvailable: boolean;
  
  // Communication preferences
  literalLanguage: boolean;
  clearInstructions: boolean;
  alternativeFormats: boolean;
  
  // Interaction preferences
  extendedTouchTargets: boolean;
  gestureAlternatives: boolean;
  voiceControlFriendly: boolean;
  
  // Sensory theme
  theme: 'default' | 'high-contrast' | 'soft-pastels' | 'monochrome' | 'warm-earth' | 'cool-blues';
}

const defaultPreferences: NeurodivergentPreferences = {
  reducedMotion: false,
  highContrast: false,
  colorBlindFriendly: false,
  sensoryFriendlyMode: false,
  minimalInterface: false,
  focusMode: false,
  distractionReduction: false,
  taskBreakReminders: false,
  timeAwareness: false,
  stepByStepGuidance: false,
  visualProgressIndicators: false,
  taskChunking: false,
  priorityHighlighting: false,
  simplifiedLanguage: false,
  extraProcessingTime: false,
  confirmationDialogs: false,
  undoAvailable: false,
  literalLanguage: false,
  clearInstructions: false,
  alternativeFormats: false,
  extendedTouchTargets: false,
  gestureAlternatives: false,
  voiceControlFriendly: false,
  theme: 'default',
};

interface NeurodivergentContextType {
  preferences: NeurodivergentPreferences;
  updatePreference: <K extends keyof NeurodivergentPreferences>(
    key: K,
    value: NeurodivergentPreferences[K]
  ) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  enableProfile: (profile: 'adhd' | 'autism' | 'dyslexia' | 'sensory-processing') => Promise<void>;
}

const NeurodivergentContext = createContext<NeurodivergentContextType | null>(null);

const STORAGE_KEY = 'neurodivergent-preferences:v1';

export function NeurodivergentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<NeurodivergentPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      logger.warn('Failed to load neurodivergent preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePreferences = async (newPreferences: NeurodivergentPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      logger.warn('Failed to save neurodivergent preferences:', error);
    }
  };

  const updatePreference = async <K extends keyof NeurodivergentPreferences>(
    key: K,
    value: NeurodivergentPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const resetToDefaults = async () => {
    setPreferences(defaultPreferences);
    await savePreferences(defaultPreferences);
  };

  const enableProfile = async (profile: 'adhd' | 'autism' | 'dyslexia' | 'sensory-processing') => {
    let profilePreferences: Partial<NeurodivergentPreferences> = {};

    switch (profile) {
      case 'adhd':
        profilePreferences = {
          focusMode: true,
          distractionReduction: true,
          taskBreakReminders: true,
          timeAwareness: true,
          stepByStepGuidance: true,
          taskChunking: true,
          priorityHighlighting: true,
          confirmationDialogs: true,
          theme: 'cool-blues',
        };
        break;

      case 'autism':
        profilePreferences = {
          sensoryFriendlyMode: true,
          minimalInterface: true,
          reducedMotion: true,
          literalLanguage: true,
          clearInstructions: true,
          stepByStepGuidance: true,
          confirmationDialogs: true,
          extraProcessingTime: true,
          theme: 'soft-pastels',
        };
        break;

      case 'dyslexia':
        profilePreferences = {
          simplifiedLanguage: true,
          alternativeFormats: true,
          extraProcessingTime: true,
          undoAvailable: true,
          highContrast: true,
          visualProgressIndicators: true,
          theme: 'warm-earth',
        };
        break;

      case 'sensory-processing':
        profilePreferences = {
          sensoryFriendlyMode: true,
          reducedMotion: true,
          minimalInterface: true,
          distractionReduction: true,
          extendedTouchTargets: true,
          gestureAlternatives: true,
          theme: 'monochrome',
        };
        break;
    }

    const newPreferences = { ...preferences, ...profilePreferences };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  if (!isLoaded) {
    return null; // Or loading component
  }

  return (
    <NeurodivergentContext.Provider value={{
      preferences,
      updatePreference,
      resetToDefaults,
      enableProfile,
    }}>
      {children}
    </NeurodivergentContext.Provider>
  );
}

export function useNeurodivergent() {
  const context = useContext(NeurodivergentContext);
  if (!context) {
    throw new Error('useNeurodivergent must be used within NeurodivergentProvider');
  }
  return context;
}

// Theme configurations
export const neurodivergentThemes = {
  'default': {
    name: 'Default',
    description: 'Standard app colors',
  },
  'high-contrast': {
    name: 'High Contrast',
    description: 'Strong color contrasts for better visibility',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#333333',
      border: '#000000',
      success: '#006600',
      warning: '#CC6600',
      error: '#CC0000',
    },
  },
  'soft-pastels': {
    name: 'Soft Pastels',
    description: 'Gentle, calming colors',
    colors: {
      primary: '#8E9AAF',
      secondary: '#CBC0D3',
      background: '#F7F5F3',
      surface: '#FFFFFF',
      text: '#2F3542',
      textSecondary: '#57606F',
      border: '#DDD6FE',
      success: '#A7C957',
      warning: '#F2CC8F',
      error: '#EF476F',
    },
  },
  'monochrome': {
    name: 'Monochrome',
    description: 'Grayscale for reduced sensory input',
    colors: {
      primary: '#404040',
      secondary: '#707070',
      background: '#F8F8F8',
      surface: '#FFFFFF',
      text: '#202020',
      textSecondary: '#606060',
      border: '#C0C0C0',
      success: '#606060',
      warning: '#808080',
      error: '#404040',
    },
  },
  'warm-earth': {
    name: 'Warm Earth',
    description: 'Warm, grounding earth tones',
    colors: {
      primary: '#8B4513',
      secondary: '#D2B48C',
      background: '#FDF6E3',
      surface: '#FFFFFF',
      text: '#3C2415',
      textSecondary: '#8B4513',
      border: '#DEB887',
      success: '#8FBC8F',
      warning: '#CD853F',
      error: '#B22222',
    },
  },
  'cool-blues': {
    name: 'Cool Blues',
    description: 'Calming blue tones for focus',
    colors: {
      primary: '#4682B4',
      secondary: '#87CEEB',
      background: '#F0F8FF',
      surface: '#FFFFFF',
      text: '#191970',
      textSecondary: '#4682B4',
      border: '#B0C4DE',
      success: '#20B2AA',
      warning: '#DAA520',
      error: '#DC143C',
    },
  },
};

// Helper hook for applying neurodivergent styles
export function useNeurodivergentStyles() {
  const { preferences } = useNeurodivergent();
  
  const getAnimationDuration = (defaultDuration: number) => {
    return preferences.reducedMotion ? 0 : defaultDuration;
  };
  
  const getTouchTargetSize = (defaultSize: number) => {
    return preferences.extendedTouchTargets ? Math.max(defaultSize, 44) : defaultSize;
  };
  
  const getTextSize = (baseSize: number) => {
    // Add 2px for easier reading if needed
    return baseSize + (preferences.extraProcessingTime ? 2 : 0);
  };
  
  const shouldShowConfirmation = (action: 'delete' | 'submit' | 'navigate') => {
    if (!preferences.confirmationDialogs) return false;
    return ['delete', 'submit'].includes(action);
  };
  
  return {
    getAnimationDuration,
    getTouchTargetSize,
    getTextSize,
    shouldShowConfirmation,
    preferences,
  };
}
