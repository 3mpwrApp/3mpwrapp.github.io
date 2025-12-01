/**
 * Tremor Compensation Hook for Motor Accessibility
 * 
 * Provides motion filtering and tap stabilization for users with tremors.
 */

import { useCallback, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

export interface TremorConfig {
  debounceMs?: number;
  maxTouchRadius?: number;
  averagingWindow?: number;
  enabled?: boolean;
  sensitivity?: 'low' | 'medium' | 'high';
}

const SENSITIVITY_PRESETS = {
  low: { debounceMs: 100, maxTouchRadius: 8, averagingWindow: 3 },
  medium: { debounceMs: 200, maxTouchRadius: 15, averagingWindow: 5 },
  high: { debounceMs: 350, maxTouchRadius: 25, averagingWindow: 7 },
};

const DEFAULT_CONFIG = { debounceMs: 200, maxTouchRadius: 15, averagingWindow: 5, enabled: true, sensitivity: 'medium' as const };

export function useTremorCompensation(customConfig?: Partial<TremorConfig>) {
  const [config] = useState(() => {
    const base = customConfig?.sensitivity ? { ...DEFAULT_CONFIG, ...SENSITIVITY_PRESETS[customConfig.sensitivity] } : DEFAULT_CONFIG;
    return { ...base, ...customConfig };
  });

  const touchHistory = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const lastTapTime = useRef(0);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const [stats, setStats] = useState({ totalTaps: 0, filteredTaps: 0, stabilizedPositions: 0 });

  const getStabilizedPosition = useCallback((x: number, y: number) => {
    if (!config.enabled) return { x, y };
    touchHistory.current.push({ x, y, timestamp: Date.now() });
    while (touchHistory.current.length > config.averagingWindow) touchHistory.current.shift();
    if (touchHistory.current.length < 2) return { x, y };

    let totalWeight = 0, avgX = 0, avgY = 0;
    touchHistory.current.forEach((point, i) => {
      const weight = i + 1;
      avgX += point.x * weight;
      avgY += point.y * weight;
      totalWeight += weight;
    });
    setStats(p => ({ ...p, stabilizedPositions: p.stabilizedPositions + 1 }));
    return { x: avgX / totalWeight, y: avgY / totalWeight };
  }, [config]);

  const shouldAcceptTap = useCallback((x: number, y: number) => {
    if (!config.enabled) return true;
    const now = Date.now();
    setStats(p => ({ ...p, totalTaps: p.totalTaps + 1 }));
    if (now - lastTapTime.current < config.debounceMs) {
      setStats(p => ({ ...p, filteredTaps: p.filteredTaps + 1 }));
      return false;
    }
    if (lastPosition.current) {
      const dist = Math.sqrt(Math.pow(x - lastPosition.current.x, 2) + Math.pow(y - lastPosition.current.y, 2));
      if (dist < config.maxTouchRadius && now - lastTapTime.current < config.debounceMs * 2) {
        setStats(p => ({ ...p, filteredTaps: p.filteredTaps + 1 }));
        return false;
      }
    }
    lastTapTime.current = now;
    lastPosition.current = { x, y };
    return true;
  }, [config]);

  const stabilizePress = useCallback(<T extends Function>(handler: T) => {
    return (event: GestureResponderEvent) => {
      if (!config.enabled) { handler(event); return; }
      const { locationX, locationY } = event.nativeEvent;
      if (shouldAcceptTap(locationX, locationY)) handler(event);
    };
  }, [config, shouldAcceptTap]);

  const resetTracking = useCallback(() => { touchHistory.current = []; }, []);

  return { config, shouldAcceptTap, getStabilizedPosition, stabilizePress, resetTracking, stats, isEnabled: config.enabled };
}

export default useTremorCompensation;
