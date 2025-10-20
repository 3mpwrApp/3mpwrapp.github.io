import React, { Suspense } from 'react';

import LoadingScreen from '../../../components/LoadingScreen';

const isJest =
  typeof process !== 'undefined' &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === 'test') || !!(process as any).env.JEST_WORKER_ID);

const Impl: React.ComponentType<any> = isJest
  ? require('./advanced-accessibility.impl').default
  : React.lazy(async () => ({
      default: (await import('./advanced-accessibility.impl')).default as React.ComponentType<any>,
    }));

/**
 * Advanced Accessibility Settings - Lazy Loaded Route
 * This component wraps the implementation with React.lazy and Suspense
 * to enable code splitting and on-demand loading of the ~27KB module.
 *
 * Benefits:
 * - Reduces initial bundle size by ~27KB
 * - Component loads only when user navigates to advanced accessibility settings
 * - Smooth loading experience with accessibility-friendly fallback
 *
 * Phase 6 Optimization: Route-based lazy loading for large settings screens
 */
export default function AdvancedAccessibilityLazy() {
  if (isJest) return <Impl />;

  return (
    <Suspense fallback={<LoadingScreen message="Loading accessibility settings..." />}>
      <Impl />
    </Suspense>
  );
}
