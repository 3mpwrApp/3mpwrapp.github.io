import React from "react";

type Ctx = {
  tick: number;
  refreshAll: () => void;
};

const RefreshContext = React.createContext<Ctx | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = React.useState(0);
  const refreshAll = React.useCallback(
    () => setTick((t) => (t + 1) % 1_000_000),
    [],
  );
  return (
    <RefreshContext.Provider value={{ tick, refreshAll }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const ctx = React.useContext(RefreshContext);
  if (!ctx) {
    console.warn('[useRefresh] Used outside provider - returning safe defaults');
    return {
      tick: 0,
      refreshAll: () => {},
    };
  }
  return ctx;
}
