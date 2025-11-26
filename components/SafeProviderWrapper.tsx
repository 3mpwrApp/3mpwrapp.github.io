import React from 'react';

import { logError } from '../utils/errorLogger';

// Track logged errors to prevent spam (deduplicate by provider name + error message)
const loggedErrors = new Set<string>();

/**
 * SafeProviderWrapper prevents any provider initialization errors from crashing the app.
 * Used at the root level to wrap providers that might throw during initialization.
 */
export class SafeProviderWrapper extends React.Component<
  { 
    children: React.ReactNode;
    providerName?: string;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; providerName?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorKey = `${this.props.providerName || 'Provider'}:${error.message}`;
    
    // Only log each unique provider error once to prevent console spam
    if (!loggedErrors.has(errorKey)) {
      loggedErrors.add(errorKey);
      logError('SafeProviderWrapper', `${this.props.providerName || 'Provider'} failed to initialize`, error);
      if (__DEV__) {
        // Only log first 3 lines of stack trace to reduce noise
        const stackPreview = errorInfo.componentStack?.split('\n').slice(0, 3).join('\n');
        logError('SafeProviderWrapper', 'Stack trace preview', stackPreview);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const errorKey = `${this.props.providerName || 'Provider'}:render`;
      
      // Only warn once per provider to prevent console spam
      if (!loggedErrors.has(errorKey)) {
        loggedErrors.add(errorKey);
        console.warn(`[SafeProviderWrapper] ${this.props.providerName || 'Provider'} initialization failed - continuing with defaults`);
      }
      
      // Still render children with default state, allowing rest of app to work
      // This prevents cascading failures in the provider tree
      return this.props.children;
    }

    return this.props.children;
  }
}
