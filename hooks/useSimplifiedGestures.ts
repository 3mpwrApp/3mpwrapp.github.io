/**
 * Simplified Gestures Hook for Motor Accessibility
 * 
 * Provides gesture alternatives for users with motor difficulties.
 */

import { useCallback, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

export interface SimplifiedGesturesConfig {
  enabled?: boolean;
  doubleTapForPinch?: boolean;
  tripleTapForSpread?: boolean;
  edgeTapForBack?: boolean;
  cornerTapForMenu?: boolean;
  doubleTapMaxDelayMs?: number;
  longPressMs?: number;
  edgeThresholdPx?: number;
  cornerThresholdPx?: number;
}

type GestureType = 'tap' | 'double-tap' | 'triple-tap' | 'long-press' | 'edge-tap' | 'corner-tap';
type Region = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

interface GestureHandler { gesture: GestureType; handler: () => void; region?: Region; }

const DEFAULT_CONFIG = {
  enabled: true, doubleTapForPinch: true, tripleTapForSpread: true, edgeTapForBack: true, cornerTapForMenu: true,
  doubleTapMaxDelayMs: 300, longPressMs: 500, edgeThresholdPx: 44, cornerThresholdPx: 64,
};

export function useSimplifiedGestures(customConfig?: Partial<SimplifiedGesturesConfig>) {
  const [config] = useState({ ...DEFAULT_CONFIG, ...customConfig });
  const tapHistory = useRef<{ timestamp: number; x: number; y: number }[]>([]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [handlers, setHandlers] = useState<GestureHandler[]>([]);
  const [screenDimensions, setScreenDimensions] = useState({ width: 400, height: 800 });

  const detectRegion = useCallback((x: number, y: number): Region => {
    const { width, height } = screenDimensions;
    const edge = config.edgeThresholdPx;
    const corner = config.cornerThresholdPx;
    if (x < corner && y < corner) return 'top-left';
    if (x > width - corner && y < corner) return 'top-right';
    if (x < corner && y > height - corner) return 'bottom-left';
    if (x > width - corner && y > height - corner) return 'bottom-right';
    if (x < edge) return 'left';
    if (x > width - edge) return 'right';
    if (y < edge) return 'top';
    if (y > height - edge) return 'bottom';
    return 'center';
  }, [screenDimensions, config]);

  const processTap = useCallback((x: number, y: number): GestureType => {
    const now = Date.now();
    const region = detectRegion(x, y);
    tapHistory.current = tapHistory.current.filter(t => now - t.timestamp < config.doubleTapMaxDelayMs * 2);
    const nearby = tapHistory.current.filter(t => Math.abs(t.x - x) < 30 && Math.abs(t.y - y) < 30 && now - t.timestamp < config.doubleTapMaxDelayMs);
    tapHistory.current.push({ timestamp: now, x, y });
    if (nearby.length >= 2) { tapHistory.current = []; return 'triple-tap'; }
    if (nearby.length >= 1) return 'double-tap';
    if (region !== 'center' && region.includes('-')) return 'corner-tap';
    if (region !== 'center') return 'edge-tap';
    return 'tap';
  }, [detectRegion, config]);

  const handleTouchStart = useCallback((_event: GestureResponderEvent) => {
    if (!config.enabled) return;
    longPressTimer.current = setTimeout(() => {
      const h = handlers.find(h => h.gesture === 'long-press');
      if (h) h.handler();
    }, config.longPressMs);
  }, [config, handlers]);

  const handleTouchEnd = useCallback((event: GestureResponderEvent) => {
    if (!config.enabled) return null;
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    const { locationX, locationY } = event.nativeEvent;
    const gesture = processTap(locationX, locationY);
    const region = detectRegion(locationX, locationY);
    const match = handlers.find(h => h.gesture === gesture && (!h.region || h.region === region));
    if (match) { match.handler(); return { gesture, region, handled: true }; }
    return { gesture, region, handled: false };
  }, [config, handlers, processTap, detectRegion]);

  const registerGesture = useCallback((gesture: GestureType, handler: () => void, region?: Region) => {
    setHandlers(p => [...p.filter(h => !(h.gesture === gesture && h.region === region)), { gesture, handler, region }]);
    return () => setHandlers(p => p.filter(h => !(h.gesture === gesture && h.region === region)));
  }, []);

  const createGestureResponders = useCallback(() => {
    if (!config.enabled) return {};
    return {
      onStartShouldSetResponder: () => true,
      onResponderGrant: handleTouchStart,
      onResponderRelease: handleTouchEnd,
      onResponderTerminate: () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } },
    };
  }, [config, handleTouchStart, handleTouchEnd]);

  const updateDimensions = useCallback((w: number, h: number) => setScreenDimensions({ width: w, height: h }), []);

  return { config, registerGesture, createGestureResponders, updateDimensions, detectRegion, processTap, isEnabled: config.enabled };
}

export default useSimplifiedGestures;
