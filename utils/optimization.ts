/**
 * Performance Optimization Utilities
 * 
 * Provides memoization patterns, performance monitoring, and optimization helpers
 * for reducing unnecessary re-renders in React Native components
 */

import type { DependencyList } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

// ============================================================================
// MEMOIZATION PATTERNS
// ============================================================================

/**
 * Deep comparison function for list items
 * Used by React.memo to prevent unnecessary re-renders
 */
export function deepArrayComparison<T>(prevArray: T[], nextArray: T[]): boolean {
  if (prevArray.length !== nextArray.length) return false;
  
  return prevArray.every((item, index) => {
    const nextItem = nextArray[index];
    
    // Primitive comparison
    if (Object.is(item, nextItem)) return true;
    
    // Object/array comparison
    if (typeof item !== 'object' || typeof nextItem !== 'object') return false;
    
    const prevKeys = Object.keys(item || {});
    const nextKeys = Object.keys(nextItem || {});
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => Object.is(item?.[key as keyof T], nextItem?.[key as keyof T]));
  });
}

/**
 * Custom React.memo with deep comparison for objects
 * Prevents re-render if props haven't changed deeply
 */
export function memoWithComparison<P extends object>(
  Component: React.FC<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.FC<P> {
  return React.memo(
    Component,
    propsAreEqual || ((prevProps, nextProps) => {
      const prevKeys = Object.keys(prevProps);
      const nextKeys = Object.keys(nextProps);
      
      if (prevKeys.length !== nextKeys.length) return false;
      
      return prevKeys.every(key => {
        const prevVal = prevProps[key as keyof P];
        const nextVal = nextProps[key as keyof P];
        
        // For arrays, use deep comparison
        if (Array.isArray(prevVal) && Array.isArray(nextVal)) {
          return deepArrayComparison(prevVal, nextVal);
        }
        
        // For objects, shallow comparison
        return Object.is(prevVal, nextVal);
      });
    })
  );
}

/**
 * Enhanced useCallback with stable reference caching
 * Prevents callback recreation unless deps actually change
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  const ref = useRef<T>(callback);
  const depsRef = useRef<DependencyList>(deps);
  
  // Check if deps actually changed
  const depsChanged = useMemo(() => {
    if (!depsRef.current || !deps) return true;
    if (depsRef.current.length !== deps.length) return true;
    
    return !depsRef.current.every((dep, i) => Object.is(dep, deps[i]));
  }, [deps]);
  
  if (depsChanged) {
    ref.current = callback;
    depsRef.current = deps;
  }
  
  return ref.current;
}

/**
 * Memoized array filter operation
 * Prevents new array creation if no items changed
 */
export function useMemoizedFilter<T>(
  items: T[],
  predicate: (item: T) => boolean,
  deps?: DependencyList
): T[] {
  return useMemo(() => {
    return items.filter(predicate);
  }, [items, predicate, ...(deps || [])]);
}

/**
 * Memoized array map operation
 * Prevents new array creation if no items changed
 */
export function useMemoizedMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => R,
  deps?: DependencyList
): R[] {
  return useMemo(() => {
    return items.map(mapper);
  }, [items, mapper, ...(deps || [])]);
}

/**
 * Memoized sort operation
 * Prevents new array creation if items unchanged
 */
export function useMemoizedSort<T>(
  items: T[],
  compareFn: (a: T, b: T) => number,
  deps?: DependencyList
): T[] {
  return useMemo(() => {
    return [...items].sort(compareFn);
  }, [items, compareFn, ...(deps || [])]);
}

/**
 * Hook to prevent inline object creation
 * Creates stable object reference across renders
 */
export function useStableObject<T extends object>(value: T): T {
  const ref = useRef<T>(value);
  
  // Only update if props actually changed
  const propsChanged = !deepArrayComparison(
    Object.values(ref.current),
    Object.values(value)
  );
  
  if (propsChanged) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Hook to prevent inline array creation
 * Creates stable array reference across renders
 */
export function useStableArray<T>(arr: T[]): T[] {
  const ref = useRef<T[]>(arr);
  
  if (!deepArrayComparison(ref.current, arr)) {
    ref.current = arr;
  }
  
  return ref.current;
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface RenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderAt: number;
  averageRenderTime: number;
}

const metricsMap = new Map<string, RenderMetrics>();

/**
 * Hook to measure component render time
 * Logs slow renders (>100ms) to console
 */
export function useRenderPerformance(componentName: string, threshold = 100): void {
  const renderStartRef = useRef<number>(Date.now());
  const metricsRef = useRef<RenderMetrics>(
    metricsMap.get(componentName) || {
      componentName,
      renderTime: 0,
      renderCount: 0,
      lastRenderAt: 0,
      averageRenderTime: 0,
    }
  );

  useEffect(() => {
    const renderEnd = Date.now();
    const renderTime = renderEnd - renderStartRef.current;
    const metrics = metricsRef.current;

    metrics.renderTime = renderTime;
    metrics.renderCount += 1;
    metrics.lastRenderAt = renderEnd;
    metrics.averageRenderTime =
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) /
      metrics.renderCount;

    metricsMap.set(componentName, metrics);

    if (renderTime > threshold) {
      console.warn(
        `🐌 SLOW RENDER: ${componentName} took ${renderTime.toFixed(2)}ms ` +
        `(avg: ${metrics.averageRenderTime.toFixed(2)}ms, renders: ${metrics.renderCount})`
      );
    }

    renderStartRef.current = Date.now();
  });
}

/**
 * Get all render metrics
 */
export function getRenderMetrics(): RenderMetrics[] {
  return Array.from(metricsMap.values());
}

/**
 * Get metrics for a specific component
 */
export function getComponentMetrics(componentName: string): RenderMetrics | undefined {
  return metricsMap.get(componentName);
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metricsMap.clear();
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(): void {
  const metrics = getRenderMetrics();
  if (metrics.length === 0) {
    console.log('📊 No render metrics collected yet');
    return;
  }

  console.log('\n📊 RENDER PERFORMANCE SUMMARY');
  console.log('─'.repeat(70));
  
  metrics.forEach(m => {
    const icon = m.averageRenderTime > 100 ? '🐌' : m.averageRenderTime > 50 ? '⚡' : '✅';
    console.log(
      `${icon} ${m.componentName.padEnd(30)} | ` +
      `Renders: ${String(m.renderCount).padStart(3)} | ` +
      `Avg: ${m.averageRenderTime.toFixed(2)}ms | ` +
      `Last: ${m.renderTime.toFixed(2)}ms`
    );
  });
  
  console.log('─'.repeat(70) + '\n');
}

// ============================================================================
// FLATLIST OPTIMIZATION HELPERS
// ============================================================================

/**
 * Configuration for optimized FlatList
 * Prevents rendering large lists at once
 */
export const FLATLIST_OPTIMIZE_CONFIG = {
  initialNumToRender: 10,      // Render only first 10 items
  maxToRenderPerBatch: 10,     // Batch size for rendering
  windowSize: 5,                // Number of items to keep in memory before/after visible
  removeClippedSubviews: true,  // Remove views outside window
  updateCellsBatchingPeriod: 50, // Batch updates every 50ms
};

/**
 * Get optimized FlatList props
 */
export function getOptimizedFlatListProps(overrides = {}) {
  return {
    ...FLATLIST_OPTIMIZE_CONFIG,
    ...overrides,
  };
}

// ============================================================================
// RERENDER TRACKING
// ============================================================================

/**
 * Hook to track unnecessary re-renders
 * Logs when component re-renders without props changing
 */
export function useTrackUnecessaryRerenders(
  componentName: string,
  props: object
): void {
  const prevPropsRef = useRef<object>(props);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;

    const propsChanged = !deepArrayComparison(
      Object.values(prevPropsRef.current),
      Object.values(props)
    );

    if (!propsChanged && renderCountRef.current > 1) {
      console.warn(
        `⚠️ UNNECESSARY RERENDER: ${componentName} ` +
        `(render #${renderCountRef.current})`
      );
    }

    prevPropsRef.current = props;
  });
}

// ============================================================================
// SELECTOR HOOKS (Redux-style)
// ============================================================================

/**
 * Create a memoized selector
 * Similar to reselect for optimal memoization
 */
export function createSelector<State, Selected>(
  selector: (state: State) => Selected,
  equalityFn: (a: Selected, b: Selected) => boolean = Object.is
) {
  let previousState: State | undefined;
  let previousResult: Selected | undefined;

  return (state: State): Selected => {
    const result = selector(state);

    if (!previousState || !equalityFn(result, previousResult!)) {
      previousState = state;
      previousResult = result;
    }

    return previousResult!;
  };
}

/**
 * Use memoized selector (for state)
 */
export function useSelector<State, Selected>(
  state: State,
  selector: (state: State) => Selected
): Selected {
  const resultRef = useRef<Selected | undefined>(undefined);
  const stateRef = useRef<State>(state);

  const result = useMemo(() => {
    const newResult = selector(state);
    
    // Only update if result changed
    if (!Object.is(newResult, resultRef.current)) {
      resultRef.current = newResult;
    }
    
    return resultRef.current!;
  }, [state, selector]);

  return result;
}

// ============================================================================
// BATCH UPDATES HELPER
// ============================================================================

/**
 * Batch multiple state updates to reduce renders
 * Useful for multiple setState calls
 */
export function useBatchState<T extends object>(initialState: T) {
  const [state, setState] = React.useState<T>(initialState);
  const updateBatchRef = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    Object.assign(updateBatchRef.current, updates);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = (setTimeout(() => {
      setState(prev => ({ ...prev, ...updateBatchRef.current }));
      updateBatchRef.current = {};
    }, 0)) as unknown as NodeJS.Timeout;
  }, []);

  const immediateUpdate = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return { state, batchUpdate, immediateUpdate };
}

export default {
  deepArrayComparison,
  memoWithComparison,
  useStableCallback,
  useMemoizedFilter,
  useMemoizedMap,
  useMemoizedSort,
  useStableObject,
  useStableArray,
  useRenderPerformance,
  getRenderMetrics,
  getComponentMetrics,
  clearMetrics,
  logPerformanceSummary,
  FLATLIST_OPTIMIZE_CONFIG,
  getOptimizedFlatListProps,
  useTrackUnecessaryRerenders,
  createSelector,
  useSelector,
  useBatchState,
};
