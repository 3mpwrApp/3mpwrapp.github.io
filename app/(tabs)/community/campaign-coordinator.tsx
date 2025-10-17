import React, { Suspense } from 'react';

import LoadingScreen from '../../../components/LoadingScreen';

export const options = { href: null };

const isJest =
  typeof process !== 'undefined' &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === 'test') || !!(process as any).env.JEST_WORKER_ID);

const Impl: React.ComponentType<any> = isJest
  ? require('./campaign-coordinator.impl').default
  : React.lazy(async () => ({
      default: (await import('./campaign-coordinator.impl')).default as React.ComponentType<any>,
    }));

/**
 * Advocacy Campaign Coordinator - Lazy Loaded Route
 * This component wraps the implementation with React.lazy and Suspense
 * to enable code splitting and on-demand loading of the 43.9KB module.
 *
 * Benefits:
 * - Reduces initial bundle size by ~43.9KB
 * - Component loads only when user navigates to campaign coordinator
 * - Smooth loading experience with accessibility-friendly fallback
 *
 * Phase 5.5 Optimization: Route-based lazy loading
 */
export default function CampaignCoordinatorLazy() {
  if (isJest) return <Impl />;

  return (
    <Suspense fallback={<LoadingScreen message="Loading campaign coordinator..." />}>
      <Impl />
    </Suspense>
  );
}
