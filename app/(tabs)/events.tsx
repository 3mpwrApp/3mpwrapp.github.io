// Re-export events screen from main events route
import React, { Suspense } from 'react';

import LoadingScreen from '../../components/LoadingScreen';

const isJest =
  typeof process !== 'undefined' &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === 'test') || !!(process as any).env.JEST_WORKER_ID);

const Impl: React.ComponentType<any> = isJest
  ? require('../events/index.impl').default
  : React.lazy(async () => ({
      default: (await import('../events/index.impl')).default as React.ComponentType<any>,
    }));

export default function EventsTab() {
  if (isJest) return <Impl />;

  return (
    <Suspense fallback={<LoadingScreen message="Loading events..." />}>
      <Impl />
    </Suspense>
  );
}
