import React, { Suspense } from 'react';

import ScreenSkeleton from '../../../components/ScreenSkeleton';

export const options = { href: null };

const isJest =
  typeof process !== 'undefined' &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === 'test') || !!(process as any).env.JEST_WORKER_ID);
const Impl: React.ComponentType<any> = isJest
  ? require('./index.impl').default
  : React.lazy(async () => ({ default: (await import('./index.impl')).default as React.ComponentType<any> }));

export default function CommunityIndexLazy() {
  if (isJest) return <Impl />;
  return (
    <Suspense fallback={<ScreenSkeleton labelKey="loading.community" /> }>
      <Impl />
    </Suspense>
  );
}
