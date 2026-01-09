import { useCallback, useEffect, useRef, useState } from 'react';

interface UseLoadingOptions {
  timeout?: number; // ms to auto-clear loading state (default 30s)
  onError?: (error: Error) => void;
}

interface UseLoadingReturn {
  loading: boolean;
  setLoading: (value: boolean) => void;
  withLoading: <T,>(fn: () => Promise<T>) => Promise<T>;
  error: Error | null;
  setError: (error: Error | null) => void;
}

/**
 * Hook to manage loading states with automatic timeout and error handling
 * Prevents stuck loading states that frustrate users
 * 
 * @example
 * const { loading, withLoading } = useLoading();
 * 
 * const fetchData = async () => {
 *   await withLoading(async () => {
 *     const data = await fetchAPI();
 *     setData(data);
 *   });
 * };
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { timeout = 30000, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearLoadingState = useCallback(() => {
    if (isMountedRef.current) {
      setLoading(false);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setLoadingWithTimeout = useCallback((value: boolean) => {
    if (!isMountedRef.current) return;

    setLoading(value);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to auto-clear loading state
    if (value) {
      timeoutRef.current = setTimeout(() => {
        console.warn('[useLoading] Loading state exceeded timeout, clearing...');
        clearLoadingState();
      }, timeout) as unknown as NodeJS.Timeout;
    }
  }, [timeout, clearLoadingState]);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setLoadingWithTimeout(true);
      setError(null);

      try {
        const result = await fn();
        clearLoadingState();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(error);
          onError?.(error);
        }
        clearLoadingState();
        throw error;
      }
    },
    [setLoadingWithTimeout, clearLoadingState, onError]
  );

  return {
    loading,
    setLoading: setLoadingWithTimeout,
    withLoading,
    error,
    setError: (err) => {
      if (isMountedRef.current) {
        setError(err);
      }
    },
  };
}

// Re-export for convenience

