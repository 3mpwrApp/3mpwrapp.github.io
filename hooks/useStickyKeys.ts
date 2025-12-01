/**
 * Sticky Keys Hook for Motor Accessibility
 * 
 * Enables one-finger typing by allowing modifier keys (Shift, Ctrl, Alt)
 * to "stick" until another key is pressed.
 */

import { useCallback, useState } from 'react';
export type ModifierKey = 'shift' | 'ctrl' | 'alt' | 'meta';

export interface StickyKeysState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export interface StickyKeysConfig {
  autoUnlockAfterMs?: number;
  doubleTapToLock?: boolean;
  hapticFeedback?: boolean;
}

const DEFAULT_CONFIG: StickyKeysConfig = {
  autoUnlockAfterMs: 5000,
  doubleTapToLock: true,
  hapticFeedback: true,
};

export function useStickyKeys(customConfig?: Partial<StickyKeysConfig>) {
  const [config] = useState<StickyKeysConfig>({ ...DEFAULT_CONFIG, ...customConfig });
  const [stickyState, setStickyState] = useState<StickyKeysState>({ shift: false, ctrl: false, alt: false, meta: false });
  const [lockedState, setLockedState] = useState<StickyKeysState>({ shift: false, ctrl: false, alt: false, meta: false });
  const [lastTapTime, setLastTapTime] = useState<Record<ModifierKey, number>>({ shift: 0, ctrl: 0, alt: 0, meta: 0 });

  const toggleModifier = useCallback((key: ModifierKey) => {
    const now = Date.now();
    const isDoubleTap = config.doubleTapToLock && (now - lastTapTime[key]) < 300;
    setLastTapTime(prev => ({ ...prev, [key]: now }));

    if (isDoubleTap && stickyState[key]) {
      setLockedState(prev => ({ ...prev, [key]: true }));
    } else if (lockedState[key]) {
      setLockedState(prev => ({ ...prev, [key]: false }));
      setStickyState(prev => ({ ...prev, [key]: false }));
    } else if (stickyState[key]) {
      setStickyState(prev => ({ ...prev, [key]: false }));
    } else {
      setStickyState(prev => ({ ...prev, [key]: true }));
      if (config.autoUnlockAfterMs && config.autoUnlockAfterMs > 0) {
        setTimeout(() => {
          setStickyState(prev => (!lockedState[key] && prev[key]) ? { ...prev, [key]: false } : prev);
        }, config.autoUnlockAfterMs);
      }
    }
  }, [config, stickyState, lockedState, lastTapTime]);

  const consumeModifiers = useCallback(() => {
    setStickyState({ shift: lockedState.shift, ctrl: lockedState.ctrl, alt: lockedState.alt, meta: lockedState.meta });
  }, [lockedState]);

  const resetAll = useCallback(() => {
    setStickyState({ shift: false, ctrl: false, alt: false, meta: false });
    setLockedState({ shift: false, ctrl: false, alt: false, meta: false });
  }, []);

  return {
    stickyState,
    lockedState,
    config,
    toggleModifier,
    consumeModifiers,
    resetAll,
    isShiftActive: stickyState.shift || lockedState.shift,
    isCtrlActive: stickyState.ctrl || lockedState.ctrl,
    isShiftLocked: lockedState.shift,
  };
}

export default useStickyKeys;
