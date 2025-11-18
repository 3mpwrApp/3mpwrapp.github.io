import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const mountTimeRef = useRef<number | undefined>(undefined);
  const renderStartRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    mountTimeRef.current = performance.now();

    // Log mount performance
    const mountDuration = mountTimeRef.current;
    console.warn(`[Performance] ${componentName} mounted in ${mountDuration.toFixed(2)}ms`);

    return () => {
      if (mountTimeRef.current) {
        const unmountTime = performance.now();
        const totalTime = unmountTime - mountTimeRef.current;
        console.warn(`[Performance] ${componentName} unmounted after ${totalTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  const startRender = () => {
    renderStartRef.current = performance.now();
  };

  const endRender = () => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      renderStartRef.current = undefined;
    }
  };

  const logInteraction = (interactionName: string, startTime?: number) => {
    const endTime = performance.now();
    const duration = startTime ? endTime - startTime : 0;
    console.warn(`[Performance] ${componentName} - ${interactionName}: ${duration.toFixed(2)}ms`);
  };

  return {
    startRender,
    endRender,
    logInteraction,
  };
};

// Hook for monitoring slow operations
export const useSlowOperationMonitor = (operationName: string, thresholdMs: number = 100) => {
  const startTimeRef = useRef<number | undefined>(undefined);

  const start = () => {
    startTimeRef.current = performance.now();
  };

  const end = () => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      if (duration > thresholdMs) {
        console.warn(`[Performance] Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      startTimeRef.current = undefined;
      return duration;
    }
    return 0;
  };

  return { start, end };
};

// Hook for monitoring memory usage (where available)
export const useMemoryMonitor = (componentName: string) => {
  useEffect(() => {
    const logMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.warn(`[Memory] ${componentName}:`, {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        });
      }
    };

    logMemoryUsage();

    return () => {
      logMemoryUsage();
    };
  }, [componentName]);
};