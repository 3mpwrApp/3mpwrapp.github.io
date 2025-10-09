import React, { Suspense } from "react";

import ScreenSkeleton from '../../../components/ScreenSkeleton';

// Expo Router option: hide href for non-direct deep linking
export const options = { href: null };

const isJest =
  typeof process !== "undefined" &&
  (process as any).env &&
  (process as any).env.JEST_WORKER_ID !== undefined;

let Impl: React.ComponentType<any> | null = null;
if (isJest) {
  // Keep tests deterministic by loading synchronously under Jest
  Impl = require("./sleep-energy-tracker.impl").default;
}

const LazyImpl = React.lazy(() => import("./sleep-energy-tracker.impl"));

export default function SleepEnergyTrackerLazy() {
  if (Impl) {
    const C = Impl;
    return <C />;
  }
  return (
    <Suspense fallback={<ScreenSkeleton labelKey="loading.wellness" /> }>
      <LazyImpl />
    </Suspense>
  );
}
