import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

interface UseDwellClickOptions {
  onDwell: () => void;
  delay?: number; // Milliseconds to wait (default: 2000)
  enabled?: boolean; // Can be disabled globally
  haptics?: boolean; // Haptic feedback on activation (default: true)
  onCancel?: () => void; // Called when dwell is cancelled
}

interface UseDwellClickReturn {
  isDwelling: boolean;
  progress: number; // 0-100
  handlePressIn: (e: GestureResponderEvent) => void;
  handlePressOut: (e: GestureResponderEvent) => void;
}

/**
 * Hook for dwell-click (hover-to-click) functionality.
 * Activates onDwell callback after user holds press for specified delay.
 * 
 * Usage:
 * ```tsx
 * const { isDwelling, progress, handlePressIn, handlePressOut } = useDwellClick({
 *   onDwell: () => console.log('Activated!'),
 *   delay: 2000,
 *   enabled: true,
 * });
 * 
 * <A11yPressable 
 *   onPressIn={handlePressIn}
 *   onPressOut={handlePressOut}
 * >
 *   {isDwelling && <CircularProgress value={progress} />}
 *   <Text>Hover to click</Text>
 * </A11yPressable>
 * ```
 */
export function useDwellClick(options: UseDwellClickOptions): UseDwellClickReturn {
  const {
    onDwell,
    delay = 2000,
    enabled = true,
    haptics = true,
    onCancel,
  } = options;

  const [isDwelling, setIsDwelling] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activatedRef = useRef(false);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handlePressIn = () => {
    if (!enabled) return;

    setIsDwelling(true);
    setProgress(0);
    activatedRef.current = false;

    // Update progress every 50ms
    const steps = delay / 50;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Activate after delay
    timerRef.current = setTimeout(() => {
      if (!activatedRef.current) {
        activatedRef.current = true;
        
        // Haptic feedback
        if (haptics) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch {
            // Haptics not available, silently fail
          }
        }

        onDwell();
        clearTimers();
        setIsDwelling(false);
        setProgress(0);
      }
    }, delay);
  };

  const handlePressOut = () => {
    if (!enabled) return;

    // Cancel dwell if released before delay
    if (!activatedRef.current) {
      clearTimers();
      setIsDwelling(false);
      setProgress(0);
      if (onCancel) onCancel();
    }
  };

  return {
    isDwelling,
    progress,
    handlePressIn,
    handlePressOut,
  };
}
