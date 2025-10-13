/**
 * Auto-Save Hook
 * 
 * Configurable auto-save functionality for cognitive accessibility.
 * Automatically saves form data, scroll positions, and navigation state.
 */

import { useEffect, useRef, useState } from 'react';

import { useCognitiveAccessibility } from '../context/CognitiveAccessibilityContext';

export interface UseAutoSaveOptions<T> {
  /**
   * Unique key for this auto-save session
   */
  key: string;
  
  /**
   * Data to auto-save
   */
  data: T;
  
  /**
   * Custom save function (optional, defaults to context's saveFormData)
   */
  onSave?: (key: string, data: T) => void | Promise<void>;
  
  /**
   * Callback after successful save
   */
  onSaveComplete?: () => void;
  
  /**
   * Callback on save error
   */
  onError?: (error: Error) => void;
  
  /**
   * Override auto-save interval in milliseconds
   * If not provided, uses cognitive accessibility preferences
   */
  intervalMs?: number;
  
  /**
   * Minimum data changes required to trigger save
   * Set to 0 to save on every interval regardless of changes
   */
  minChangeThreshold?: number;
  
  /**
   * Enable/disable auto-save
   */
  enabled?: boolean;
  
  /**
   * Debounce delay in milliseconds (default: 1000)
   * Waits this long after data changes before starting interval timer
   */
  debounceMs?: number;
}

export interface UseAutoSaveResult {
  /**
   * Manually trigger save
   */
  save: () => Promise<void>;
  
  /**
   * Last save timestamp
   */
  lastSaved: number | null;
  
  /**
   * Whether save is currently in progress
   */
  isSaving: boolean;
  
  /**
   * Last save error
   */
  error: Error | null;
  
  /**
   * Reset auto-save state
   */
  reset: () => void;
}

export function useAutoSave<T = unknown>(options: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const {
    key,
    data,
    onSave,
    onSaveComplete,
    onError,
    intervalMs,
    minChangeThreshold = 1,
    enabled = true,
    debounceMs = 1000,
  } = options;
  
  const cognitive = useCognitiveAccessibility();
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const dataRef = useRef<T>(data);
  const changeCountRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Determine save interval
  const effectiveInterval = intervalMs ?? cognitive.getAutoSaveFrequency();
  
  // Manual save function
  const save = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      if (onSave) {
        await onSave(key, data);
      } else {
        cognitive.saveFormData(key, data);
      }
      
      setLastSaved(Date.now());
      changeCountRef.current = 0;
      onSaveComplete?.();
    } catch (err) {
      const saveError = err instanceof Error ? err : new Error(String(err));
      setError(saveError);
      onError?.(saveError);
      console.error(`Auto-save error for key "${key}":`, saveError);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset function
  const reset = () => {
    setLastSaved(null);
    setIsSaving(false);
    setError(null);
    changeCountRef.current = 0;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  };
  
  // Track data changes
  useEffect(() => {
    if (!enabled) return;
    
    // Check if data actually changed
    const hasChanged = JSON.stringify(dataRef.current) !== JSON.stringify(data);
    
    if (hasChanged) {
      dataRef.current = data;
      changeCountRef.current += 1;
      
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Start debounce timer
      debounceTimerRef.current = setTimeout(() => {
        // Check if we have enough changes to warrant a save
        if (changeCountRef.current >= minChangeThreshold) {
          // Clear existing interval
          if (intervalTimerRef.current) {
            clearInterval(intervalTimerRef.current);
          }
          
          // Start new interval
          intervalTimerRef.current = setInterval(() => {
            if (changeCountRef.current >= minChangeThreshold) {
              save();
            }
          }, effectiveInterval);
          
          // Trigger immediate save if threshold met
          if (changeCountRef.current >= minChangeThreshold) {
            save();
          }
        }
      }, debounceMs);
    }
  }, [data, enabled, effectiveInterval, minChangeThreshold, debounceMs]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, []);
  
  // Auto-save when cognitive accessibility mode changes
  useEffect(() => {
    if (!enabled || !cognitive.isSimplifiedMode()) return;
    
    // In simplified mode, trigger auto-save more aggressively
    const currentScreen = 'auto-save-hook'; // Generic screen identifier
    cognitive.triggerAutoSave(currentScreen, data).catch(console.error);
  }, [cognitive.preferences.mode, enabled, data]);
  
  return {
    save,
    lastSaved,
    isSaving,
    error,
    reset,
  };
}

/**
 * Hook for auto-saving scroll position
 */
export function useAutoSaveScrollPosition(screenName: string, enabled = true) {
  const cognitive = useCognitiveAccessibility();
  const [scrollY, setScrollY] = useState(0);
  
  const savePosition = (y: number) => {
    setScrollY(y);
    if (enabled) {
      cognitive.saveScrollPosition(screenName, y);
    }
  };
  
  return {
    scrollY,
    savePosition,
  };
}

/**
 * Hook for saving navigation breadcrumbs
 */
export function useAutoSaveLocation(screenName: string, enabled = true) {
  const cognitive = useCognitiveAccessibility();
  
  useEffect(() => {
    if (enabled) {
      cognitive.saveLocation(screenName);
    }
  }, [screenName, enabled]);
}

/**
 * Hook for restoring saved form data on mount
 */
export function useRestoreFormData<T>(key: string): T | null {
  const [data, setData] = useState<T | null>(null);
  const cognitive = useCognitiveAccessibility();
  
  useEffect(() => {
    const restored = cognitive.getFormData(key) as T | undefined;
    if (restored) {
      setData(restored);
    }
  }, [key, cognitive]);
  
  return data;
}
