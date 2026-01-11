/**
 * Provider Helpers - Utilities for safe, non-blocking provider initialization
 * 
 * KEY PRINCIPLES:
 * 1. NEVER block rendering - always return children
 * 2. Initialize asynchronously when possible
 * 3. Use timeouts to prevent infinite loading
 * 4. Fail gracefully with defaults
 * 5. Log errors but continue execution
 */

import type { ReactNode} from 'react';
import React, { useEffect, useState } from 'react';

/**
 * AsyncProvider - Wraps a provider with async initialization
 * Ensures the provider doesn't block rendering during initialization
 */
export function createAsyncProvider<T>(
  Provider: React.ComponentType<{ children: ReactNode }>,
  initFn: () => Promise<void>,
  options: {
    name: string;
    timeout?: number;
    fallbackComponent?: React.ComponentType<{ children: ReactNode }>;
  }
) {
  const { name, timeout = 3000, fallbackComponent: Fallback } = options;
  
  return function AsyncProviderWrapper({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
    
    useEffect(() => {
      if (__DEV__) console.log(`[${name}] Starting async initialization...`);
      
      const timeoutId = setTimeout(() => {
        if (__DEV__) console.warn(`[${name}] Initialization timeout - proceeding with defaults`);
        setStatus('ready');
      }, timeout);
      
      initFn()
        .then(() => {
          clearTimeout(timeoutId);
          if (__DEV__) console.log(`[${name}] Initialization complete`);
          setStatus('ready');
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error(`[${name}] Initialization failed:`, error);
          setStatus('failed');
        });
      
      return () => clearTimeout(timeoutId);
    }, []);
    
    // CRITICAL: Always render children, even during loading
    // The provider initializes in the background
    try {
      return <Provider>{children}</Provider>;
    } catch (error) {
      console.error(`[${name}] Provider render failed:`, error);
      if (Fallback) {
        return <Fallback>{children}</Fallback>;
      }
      return <>{children}</>;
    }
  };
}

/**
 * ProviderComposer - Composes multiple providers without deep nesting
 * Makes provider hierarchies more readable and maintainable
 */
export function composeProviders(
  providers: Array<React.ComponentType<{ children: ReactNode }>>
) {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}

/**
 * LazyProvider - Loads a provider only when needed
 * Useful for large providers that aren't needed immediately
 */
export function createLazyProvider(
  importFn: () => Promise<{ default: React.ComponentType<{ children: ReactNode }> }>,
  name: string
) {
  return function LazyProviderWrapper({ children }: { children: ReactNode }) {
    const [Provider, setProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);
    
    useEffect(() => {
      if (__DEV__) console.log(`[${name}] Loading provider...`);
      importFn()
        .then((mod) => {
          setProvider(() => mod.default);
          if (__DEV__) console.log(`[${name}] Provider loaded`);
        })
        .catch((error) => {
          console.error(`[${name}] Failed to load provider:`, error);
        });
    }, []);
    
    // Render children immediately, provider wraps them when loaded
    if (!Provider) {
      return <>{children}</>;
    }
    
    return <Provider>{children}</Provider>;
  };
}

/**
 * withDefaultContext - HOC that provides default context values
 * Prevents "hook called outside provider" errors
 */
export function withDefaultContext<T>(
  Context: React.Context<T>,
  defaultValue: T
) {
  return function DefaultContextProvider({ children }: { children: ReactNode }) {
    return (
      <Context.Provider value={defaultValue}>
        {children}
      </Context.Provider>
    );
  };
}

/**
 * logProviderStatus - Logs provider initialization status to console
 * Useful for debugging provider issues
 */
export function logProviderStatus(
  providers: Array<{ name: string; status: 'loading' | 'ready' | 'failed' }>
) {
  if (!__DEV__) return;
  
  const allReady = providers.every(p => p.status === 'ready');
  const anyFailed = providers.some(p => p.status === 'failed');
  
  console.log('[Provider Status]', {
    state: anyFailed ? 'FAILED' : allReady ? 'READY' : 'LOADING',
    providers: providers.map(p => `${p.name}: ${p.status === 'ready' ? '✓' : p.status === 'failed' ? '✗' : '⏳'}`).join(', ')
  });
}
