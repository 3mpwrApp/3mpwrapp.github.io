import React, { Suspense } from 'react';

export const options = { href: null };

const isJest =
  typeof process !== 'undefined' &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === 'test') || !!(process as any).env.JEST_WORKER_ID);
const Impl: React.ComponentType<any> = isJest
  ? require('./reflections-calendar.jest').default
  : React.lazy(() => import('./reflections-calendar.impl'));

export default function ReflectionsCalendarLazyWrapper() {
  if (isJest) return <Impl />;
  return (
    <Suspense fallback={null}>
      <Impl />
    </Suspense>
  );
}
