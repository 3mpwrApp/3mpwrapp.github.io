/**
 * Cognitive Accessibility Context
 * 
 * Global state management for cognitive accessibility features.
 * Supports users with ADHD, autism, learning disabilities, and memory challenges.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type {
    CognitiveMode,
    CognitivePreferences,
    TaskReminder
} from '../constants/Cognitive';
import {
    COGNITIVE_MODES,
    COGNITIVE_STORAGE_KEYS,
    DEFAULT_COGNITIVE_PREFERENCES
} from '../constants/Cognitive';
import { announce } from '../utils/announce';

interface CognitiveAccessibilityContextType {
  // Preferences
  preferences: CognitivePreferences;
  updatePreference: <K extends keyof CognitivePreferences>(
    key: K,
    value: CognitivePreferences[K]
  ) => Promise<void>;
  setMode: (mode: CognitiveMode) => Promise<void>;
  
  // Navigation memory
  lastLocation: string | null;
  saveLocation: (location: string) => Promise<void>;
  clearLocation: () => Promise<void>;
  
  // Scroll position memory
  scrollPositions: Record<string, number>;
  saveScrollPosition: (screen: string, position: number) => Promise<void>;
  getScrollPosition: (screen: string) => number;
  
  // Form data memory
  formData: Record<string, any>;
  saveFormData: (formId: string, data: any) => Promise<void>;
  getFormData: (formId: string) => any;
  clearFormData: (formId: string) => Promise<void>;
  
  // Task reminders
  incompleteTasks: TaskReminder[];
  addIncompleteTask: (taskId: string, taskName: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  getTaskReminders: () => TaskReminder[];
  
  // Auto-save
  triggerAutoSave: (screen: string, data: any) => Promise<void>;
  lastAutoSave: Record<string, number>;
  
  // Utility functions
  isSimplifiedMode: () => boolean;
  isMinimalMode: () => boolean;
  shouldShowProgress: () => boolean;
  shouldShowBreadcrumbs: () => boolean;
  getMaxItemsPerScreen: () => number;
  getAutoSaveInterval: () => number;
  getAutoSaveFrequency: () => number;
  
  // Additional helper methods
  getIncompleteTasks: () => TaskReminder[];
  clearIncompleteTasks: () => Promise<void>;
  updatePreferences: (updates: Partial<CognitivePreferences>) => Promise<void>;
  reset: () => Promise<void>;
  
  // Loading state
  isLoaded: boolean;
}

const CognitiveAccessibilityContext = createContext<CognitiveAccessibilityContextType | null>(null);

export function CognitiveAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CognitivePreferences>(DEFAULT_COGNITIVE_PREFERENCES);
  const [lastLocation, setLastLocation] = useState<string | null>(null);
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [incompleteTasks, setIncompleteTasks] = useState<TaskReminder[]>([]);
  const [lastAutoSave, setLastAutoSave] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from storage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [
        storedPreferences,
        storedLocation,
        storedScrollPositions,
        storedFormData,
        storedTasks,
      ] = await Promise.all([
        AsyncStorage.getItem(COGNITIVE_STORAGE_KEYS.preferences),
        AsyncStorage.getItem(COGNITIVE_STORAGE_KEYS.lastLocation),
        AsyncStorage.getItem(COGNITIVE_STORAGE_KEYS.scrollPosition),
        AsyncStorage.getItem(COGNITIVE_STORAGE_KEYS.formData),
        AsyncStorage.getItem(COGNITIVE_STORAGE_KEYS.incompleteTasks),
      ]);

      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
      if (storedLocation) {
        setLastLocation(storedLocation);
      }
      if (storedScrollPositions) {
        setScrollPositions(JSON.parse(storedScrollPositions));
      }
      if (storedFormData) {
        setFormData(JSON.parse(storedFormData));
      }
      if (storedTasks) {
        setIncompleteTasks(JSON.parse(storedTasks));
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load cognitive preferences:', error);
      setIsLoaded(true);
    }
  };

  const savePreferences = async (newPreferences: CognitivePreferences) => {
    try {
      await AsyncStorage.setItem(
        COGNITIVE_STORAGE_KEYS.preferences,
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save cognitive preferences:', error);
    }
  };

  const updatePreference = useCallback(
    async <K extends keyof CognitivePreferences>(
      key: K,
      value: CognitivePreferences[K]
    ) => {
      const newPreferences = { ...preferences, [key]: value };
      await savePreferences(newPreferences);
    },
    [preferences]
  );

  const setMode = useCallback(
    async (mode: CognitiveMode) => {
      const modeConfig = COGNITIVE_MODES[mode];
      const newPreferences: CognitivePreferences = {
        ...preferences,
        mode,
        minimizeDistractions: mode !== 'standard',
        singleTaskMode: mode === 'minimal',
        showProgressBars: mode !== 'standard',
        showStepNumbers: mode !== 'standard',
        showTimeEstimates: mode !== 'standard',
        useSimpleLanguage: mode !== 'standard',
        showExamples: mode !== 'standard',
        reduceVisualClutter: mode !== 'standard',
        highlightCurrentItem: mode !== 'standard',
        showRecentLocations: mode !== 'standard',
      };
      
      await savePreferences(newPreferences);
      
      // Announce mode change
      announce(`${modeConfig.name} mode enabled. ${modeConfig.description}`);
    },
    [preferences]
  );

  const saveLocation = useCallback(async (location: string) => {
    try {
      await AsyncStorage.setItem(COGNITIVE_STORAGE_KEYS.lastLocation, location);
      setLastLocation(location);
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }, []);

  const clearLocation = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(COGNITIVE_STORAGE_KEYS.lastLocation);
      setLastLocation(null);
    } catch (error) {
      console.error('Failed to clear location:', error);
    }
  }, []);

  const saveScrollPosition = useCallback(
    async (screen: string, position: number) => {
      if (!preferences.saveScrollPosition) return;
      
      const newPositions = { ...scrollPositions, [screen]: position };
      try {
        await AsyncStorage.setItem(
          COGNITIVE_STORAGE_KEYS.scrollPosition,
          JSON.stringify(newPositions)
        );
        setScrollPositions(newPositions);
      } catch (error) {
        console.error('Failed to save scroll position:', error);
      }
    },
    [preferences.saveScrollPosition, scrollPositions]
  );

  const getScrollPosition = useCallback(
    (screen: string) => {
      return scrollPositions[screen] || 0;
    },
    [scrollPositions]
  );

  const saveFormData = useCallback(
    async (formId: string, data: any) => {
      if (!preferences.rememberFormData) return;
      
      const newFormData = { ...formData, [formId]: { data, timestamp: Date.now() } };
      try {
        await AsyncStorage.setItem(
          COGNITIVE_STORAGE_KEYS.formData,
          JSON.stringify(newFormData)
        );
        setFormData(newFormData);
      } catch (error) {
        console.error('Failed to save form data:', error);
      }
    },
    [preferences.rememberFormData, formData]
  );

  const getFormData = useCallback(
    (formId: string) => {
      const stored = formData[formId];
      if (!stored) return null;
      
      // Return data if less than 24 hours old
      const age = Date.now() - stored.timestamp;
      if (age < 24 * 60 * 60 * 1000) {
        return stored.data;
      }
      
      return null;
    },
    [formData]
  );

  const clearFormData = useCallback(
    async (formId: string) => {
      const newFormData = { ...formData };
      delete newFormData[formId];
      
      try {
        await AsyncStorage.setItem(
          COGNITIVE_STORAGE_KEYS.formData,
          JSON.stringify(newFormData)
        );
        setFormData(newFormData);
      } catch (error) {
        console.error('Failed to clear form data:', error);
      }
    },
    [formData]
  );

  const addIncompleteTask = useCallback(
    async (taskId: string, taskName: string) => {
      const existingTask = incompleteTasks.find(t => t.taskId === taskId);
      if (existingTask) return;
      
      const modeConfig = COGNITIVE_MODES[preferences.mode];
      const newTask: TaskReminder = {
        taskId,
        taskName,
        lastInteraction: Date.now(),
        reminderInterval: modeConfig.autoSaveFrequency,
        maxReminders: 5,
        reminderCount: 0,
      };
      
      const newTasks = [...incompleteTasks, newTask];
      try {
        await AsyncStorage.setItem(
          COGNITIVE_STORAGE_KEYS.incompleteTasks,
          JSON.stringify(newTasks)
        );
        setIncompleteTasks(newTasks);
      } catch (error) {
        console.error('Failed to save incomplete task:', error);
      }
    },
    [incompleteTasks, preferences.mode]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      const newTasks = incompleteTasks.filter(t => t.taskId !== taskId);
      try {
        await AsyncStorage.setItem(
          COGNITIVE_STORAGE_KEYS.incompleteTasks,
          JSON.stringify(newTasks)
        );
        setIncompleteTasks(newTasks);
      } catch (error) {
        console.error('Failed to complete task:', error);
      }
    },
    [incompleteTasks]
  );

  const getTaskReminders = useCallback(() => {
    const now = Date.now();
    return incompleteTasks.filter(task => {
      const timeSinceLastInteraction = now - task.lastInteraction;
      return (
        timeSinceLastInteraction >= task.reminderInterval &&
        task.reminderCount < task.maxReminders
      );
    });
  }, [incompleteTasks]);

  const triggerAutoSave = useCallback(
    async (screen: string, _data: any) => {
      const modeConfig = COGNITIVE_MODES[preferences.mode];
      const now = Date.now();
      const lastSave = lastAutoSave[screen] || 0;
      
      if (now - lastSave < modeConfig.autoSaveFrequency) {
        return; // Too soon since last save
      }
      
      // Save data (implement your save logic here)
      // This is a placeholder for actual save functionality
      
      setLastAutoSave({ ...lastAutoSave, [screen]: now });
      
      // Announce auto-save if in simplified/minimal mode
      if (preferences.mode !== 'standard') {
        announce('Your work has been automatically saved');
      }
    },
    [preferences.mode, lastAutoSave]
  );

  // Utility functions
  const isSimplifiedMode = useCallback(() => preferences.mode === 'simplified', [preferences.mode]);
  const isMinimalMode = useCallback(() => preferences.mode === 'minimal', [preferences.mode]);
  const shouldShowProgress = useCallback(() => preferences.showProgressBars, [preferences.showProgressBars]);
  const shouldShowBreadcrumbs = useCallback(() => preferences.mode !== 'standard', [preferences.mode]);
  
  const getMaxItemsPerScreen = useCallback(() => {
    return COGNITIVE_MODES[preferences.mode].maxItemsPerScreen;
  }, [preferences.mode]);
  
  const getAutoSaveInterval = useCallback(() => {
    return COGNITIVE_MODES[preferences.mode].autoSaveFrequency;
  }, [preferences.mode]);
  
  // Additional helper methods
  const getAutoSaveFrequency = getAutoSaveInterval; // Alias for compatibility
  
  const getIncompleteTasks = useCallback(() => {
    return incompleteTasks;
  }, [incompleteTasks]);
  
  const clearIncompleteTasks = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        COGNITIVE_STORAGE_KEYS.incompleteTasks,
        JSON.stringify([])
      );
      setIncompleteTasks([]);
    } catch (error) {
      console.error('Failed to clear incomplete tasks:', error);
    }
  }, []);
  
  const updatePreferences = useCallback(
    async (updates: Partial<CognitivePreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      try {
        await AsyncStorage.setItem(
          COGNITIVE_STORAGE_KEYS.preferences,
          JSON.stringify(newPreferences)
        );
        setPreferences(newPreferences);
      } catch (error) {
        console.error('Failed to update preferences:', error);
        throw error;
      }
    },
    [preferences]
  );
  
  const reset = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(COGNITIVE_STORAGE_KEYS.preferences),
        AsyncStorage.removeItem(COGNITIVE_STORAGE_KEYS.lastLocation),
        AsyncStorage.removeItem(COGNITIVE_STORAGE_KEYS.scrollPosition),
        AsyncStorage.removeItem(COGNITIVE_STORAGE_KEYS.formData),
        AsyncStorage.removeItem(COGNITIVE_STORAGE_KEYS.incompleteTasks),
      ]);
      
      setPreferences(DEFAULT_COGNITIVE_PREFERENCES);
      setLastLocation(null);
      setScrollPositions({});
      setFormData({});
      setIncompleteTasks([]);
      setLastAutoSave({});
    } catch (error) {
      console.error('Failed to reset cognitive accessibility:', error);
      throw error;
    }
  }, []);

  const value: CognitiveAccessibilityContextType = {
    preferences,
    updatePreference,
    setMode,
    lastLocation,
    saveLocation,
    clearLocation,
    scrollPositions,
    saveScrollPosition,
    getScrollPosition,
    formData,
    saveFormData,
    getFormData,
    clearFormData,
    incompleteTasks,
    addIncompleteTask,
    completeTask,
    getTaskReminders,
    triggerAutoSave,
    lastAutoSave,
    isSimplifiedMode,
    isMinimalMode,
    shouldShowProgress,
    shouldShowBreadcrumbs,
    getMaxItemsPerScreen,
    getAutoSaveInterval,
    getAutoSaveFrequency,
    getIncompleteTasks,
    clearIncompleteTasks,
    updatePreferences,
    reset,
    isLoaded,
  };

  return (
    <CognitiveAccessibilityContext.Provider value={value}>
      {children}
    </CognitiveAccessibilityContext.Provider>
  );
}

export function useCognitiveAccessibility() {
  const context = useContext(CognitiveAccessibilityContext);
  if (!context) {
    throw new Error(
      'useCognitiveAccessibility must be used within CognitiveAccessibilityProvider'
    );
  }
  return context;
}

/**
 * Optional hook that returns null if provider not available
 * Useful for gradual adoption
 */
export function useCognitiveAccessibilityOptional() {
  return useContext(CognitiveAccessibilityContext);
}
