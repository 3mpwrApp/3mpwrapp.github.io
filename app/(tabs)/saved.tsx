// Jest-aware lazy route wrapper for the Saved tab
import React, { Suspense } from "react";

import ScreenSkeleton from '../../components/ScreenSkeleton';

export const options = { href: null };

// In tests, avoid React.lazy to keep snapshot and unit tests stable.
const isTestEnv =
  typeof process !== "undefined" &&
  !!(process as any).env &&
  (((process as any).env.NODE_ENV === "test") || !!(process as any).env.JEST_WORKER_ID);

let Screen: React.ComponentType<any> | null = null;

if (isTestEnv) {
  // Synchronous require during tests
  Screen = require("./saved.impl").default;
}

export default function SavedLazyWrapper(props: any) {
  const Impl = React.useMemo(() => {
    if (Screen) return Screen;
    const Lazy = React.lazy(() => import("./saved.impl"));
    return Lazy as unknown as React.ComponentType<any>;
  }, []);

  if (isTestEnv) return <Impl {...props} />;
  return (
    <Suspense fallback={<ScreenSkeleton labelKey="loading.generic" /> }>
      <Impl {...props} />
    </Suspense>
  );
}