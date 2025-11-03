import React from 'react';

import { logError } from '../utils/errorLogger';

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
    logError('SafeProviderWrapper', `${this.props.providerName || 'Provider'} failed to initialize`, error);
    if (__DEV__) {
      console.error('Stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      // Still render children with default state, allowing rest of app to work
      // This prevents cascading failures in the provider tree
      console.warn(`[SafeProviderWrapper] ${this.props.providerName || 'Provider'} initialization failed - continuing with defaults`);
      return this.props.children;
    }

    return this.props.children;
  }
}
