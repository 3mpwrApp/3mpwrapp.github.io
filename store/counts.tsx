import React from "react";

type Key = "campaigns" | "resources" | "advocates" | "podcasts" | "events";

type CountsState = Record<Key, number>;

type Ctx = {
  counts: CountsState;
  setCount: (key: Key, value: number) => void;
};

const CountsContext = React.createContext<Ctx | undefined>(undefined);

export function CountsProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = React.useState<CountsState>({
    campaigns: 0,
    resources: 0,
    advocates: 0,
    podcasts: 0,
    events: 0,
  });

  const setCount = React.useCallback((key: Key, value: number) => {
    setCounts((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <CountsContext.Provider value={{ counts, setCount }}>
      {children}
    </CountsContext.Provider>
  );
}

export function useCounts() {
  const ctx = React.useContext(CountsContext);
  if (!ctx) throw new Error("useCounts must be used within CountsProvider");
  return ctx;
}
