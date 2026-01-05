/**
 * useModalTimer Hook
 * Manages auto-dismiss timing for modals with accessibility support
 * 
 * Features:
 * - User-configurable timeout duration
 * - Pause/resume on focus
 * - Accessibility announcements before auto-dismiss
 * - Countdown timer for user awareness
 * - Manual cancel support
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppStateStatus } from 'react-native';
import { AccessibilityInfo, AppState } from 'react-native';

import { logger } from '../utils/logger';

export interface ModalTimerConfig {
  /** Timeout duration in milliseconds (default: 5000) */
  duration?: number;
  /** Callback when timer auto-dismisses modal */
  onDismiss: () => void;
  /** Optional callback for countdown updates (e.g., for UI display) */
  onCountdownChange?: (remaining: number) => void;
  /** Enable pause on app focus loss (default: true) */
  pauseOnBlur?: boolean;
  /** Enable accessibility announcements (default: true) */
  announceBeforeDismiss?: boolean;
  /** Seconds before dismissal to announce (default: 3) */
  announceAtSeconds?: number;
  /** Manual dismiss callback for screen readers */
  onAccessibilityDismiss?: (action: 'auto' | 'manual') => void;
}

interface ModalTimerState {
  isActive: boolean;
  isPaused: boolean;
  remainingMs: number;
  hasAnnounced: boolean;
}

/**
 * Helper to announce for accessibility
 */
async function announceForAccessibility(message: string): Promise<void> {
  if (typeof AccessibilityInfo?.announceForAccessibility === 'function') {
    try {
      await AccessibilityInfo.announceForAccessibility(message);
    } catch (error) {
      logger.warn('useModalTimer', 'Failed to announce', error);
    }
  }
}

/**
 * Hook for managing modal auto-dismiss timing with accessibility
 * 
 * @example
 * const { startTimer, pauseTimer, resumeTimer, cancelTimer, remainingMs } = useModalTimer({
 *   duration: 5000,
 *   onDismiss: () => setShowModal(false),
 *   announceBeforeDismiss: true,
 * });
 * 
 * // In your component:
 * useEffect(() => {
 *   startTimer();
 * }, [showModal]);
 */
export function useModalTimer(config: ModalTimerConfig) {
  const {
    duration = 5000,
    onDismiss,
    onCountdownChange,
    pauseOnBlur = true,
    announceBeforeDismiss = true,
    announceAtSeconds = 3,
    onAccessibilityDismiss,
  } = config;

  const [state, setState] = useState<ModalTimerState>({
    isActive: false,
    isPaused: false,
    remainingMs: duration,
    hasAnnounced: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  // Cleanup timer
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Announce dismissal warning
  const announceWarning = useCallback(async () => {
    if (!announceBeforeDismiss || state.hasAnnounced) return;

    try {
      const message = `Modal will dismiss in ${announceAtSeconds} seconds`;
      await announceForAccessibility(message);
      setState(prev => ({ ...prev, hasAnnounced: true }));
      logger.info('useModalTimer', 'Accessibility announcement made before auto-dismiss');
    } catch (error) {
      logger.warn('useModalTimer', 'Failed to announce dismissal warning', error);
    }
  }, [announceBeforeDismiss, announceAtSeconds, state.hasAnnounced]);

  // Start or resume timer
  const startTimer = useCallback(() => {
    if (state.isActive && !state.isPaused) return; // Already running

    cleanupTimer();
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      remainingMs: duration,
      hasAnnounced: false,
    }));

    const startTime = Date.now();
    const announceAtMs = announceAtSeconds * 1000;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);

      // Update countdown display
      if (onCountdownChange) {
        const seconds = Math.ceil(remaining / 1000);
        onCountdownChange(seconds);
      }

      // Announce warning at threshold
      if (remaining <= announceAtMs && remaining > announceAtMs - 100 && !state.hasAnnounced) {
        announceWarning();
      }

      // Auto-dismiss when time expires
      if (remaining <= 0) {
        cleanupTimer();
        setState(prev => ({ ...prev, isActive: false }));
        onAccessibilityDismiss?.('auto');
        onDismiss();
      } else {
        setState(prev => ({ ...prev, remainingMs: remaining }));
      }
    }, 100); // Check every 100ms for accuracy

    logger.info('useModalTimer', `Timer started for ${duration}ms`);
  }, [
    duration,
    onDismiss,
    onCountdownChange,
    announceWarning,
    announceAtSeconds,
    cleanupTimer,
    state.isActive,
    state.isPaused,
    state.hasAnnounced,
    onAccessibilityDismiss,
  ]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!state.isActive || state.isPaused) return;

    cleanupTimer();
    setState(prev => ({ ...prev, isPaused: true }));
    logger.info('useModalTimer', 'Timer paused');
  }, [state.isActive, state.isPaused, cleanupTimer]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (!state.isActive || !state.isPaused) return;

    setState(prev => ({ ...prev, isPaused: false }));
    
    const remainingAtResume = state.remainingMs;
    const startTime = Date.now();
    const announceAtMs = announceAtSeconds * 1000;

    cleanupTimer();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, remainingAtResume - elapsed);

      if (onCountdownChange) {
        const seconds = Math.ceil(remaining / 1000);
        onCountdownChange(seconds);
      }

      if (remaining <= announceAtMs && remaining > announceAtMs - 100 && !state.hasAnnounced) {
        announceWarning();
      }

      if (remaining <= 0) {
        cleanupTimer();
        setState(prev => ({ ...prev, isActive: false }));
        onAccessibilityDismiss?.('auto');
        onDismiss();
      } else {
        setState(prev => ({ ...prev, remainingMs: remaining }));
      }
    }, 100);

    logger.info('useModalTimer', `Timer resumed with ${remainingAtResume}ms remaining`);
  }, [
    state.isActive,
    state.isPaused,
    state.remainingMs,
    state.hasAnnounced,
    announceAtSeconds,
    announceWarning,
    onCountdownChange,
    onDismiss,
    onAccessibilityDismiss,
    cleanupTimer,
  ]);

  // Cancel timer
  const cancelTimer = useCallback(() => {
    if (!state.isActive) return;

    cleanupTimer();
    setState({
      isActive: false,
      isPaused: false,
      remainingMs: duration,
      hasAnnounced: false,
    });

    onAccessibilityDismiss?.('manual');
    logger.info('useModalTimer', 'Timer cancelled');
  }, [state.isActive, duration, cleanupTimer, onAccessibilityDismiss]);

  // Handle app state changes (pause on blur)
  useEffect(() => {
    if (!pauseOnBlur) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground - resume timer
        if (state.isActive && state.isPaused) {
          resumeTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to background - pause timer
        if (state.isActive && !state.isPaused) {
          pauseTimer();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [state.isActive, state.isPaused, pauseOnBlur, resumeTimer, pauseTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  return {
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    isActive: state.isActive,
    isPaused: state.isPaused,
    remainingMs: state.remainingMs,
    remainingSeconds: Math.ceil(state.remainingMs / 1000),
  };
}

export default useModalTimer;
