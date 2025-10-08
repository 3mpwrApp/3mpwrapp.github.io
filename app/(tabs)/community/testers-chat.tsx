export const options = { href: null };
import React, { Suspense } from 'react';

const isJest = typeof process !== 'undefined' && !!(process as any).env && ((((process as any).env.NODE_ENV) === 'test') || !!(process as any).env.JEST_WORKER_ID);
const Impl: React.ComponentType<any> = isJest ? require('./testers-chat.impl').default : React.lazy(() => import('./testers-chat.impl'));

export default function TestersChatLazyWrapper() {
  if (isJest) return <Impl />;
  return (
    <Suspense fallback={null}>
      <Impl />
    </Suspense>
  );
}
 
