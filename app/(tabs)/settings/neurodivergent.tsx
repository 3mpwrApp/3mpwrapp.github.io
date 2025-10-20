import React, { Suspense } from 'react';

import LoadingScreen from '../../../components/LoadingScreen';

const isJest =
  typeof process !== 'undefined' &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === 'test') || !!(process as any).env.JEST_WORKER_ID);

const Impl: React.ComponentType<any> = isJest
  ? require('./neurodivergent.impl').default
  : React.lazy(async () => ({
      default: (await import('./neurodivergent.impl')).default as React.ComponentType<any>,
    }));

/**
 * Neurodivergent Settings - Lazy Loaded Route
 * This component wraps the implementation with React.lazy and Suspense
 * to enable code splitting and on-demand loading of the ~22KB module.
 *
 * Benefits:
 * - Reduces initial bundle size by ~22KB
 * - Component loads only when user navigates to neurodivergent settings
 * - Smooth loading experience with accessibility-friendly fallback
 *
 * Phase 6 Optimization: Route-based lazy loading for large settings screens
 */
export default function NeurodivergentSettingsLazy() {
  if (isJest) return <Impl />;

  return (
    <Suspense fallback={<LoadingScreen message="Loading neurodivergent settings..." />}>
      <Impl />
    </Suspense>
  );
}
