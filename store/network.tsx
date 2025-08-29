import React from "react";

type Ctx = {
  offline: boolean;
  setOffline: (o: boolean) => void;
};

const NetworkContext = React.createContext<Ctx | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = React.useState(false);
  return (
    <NetworkContext.Provider value={{ offline, setOffline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = React.useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used within NetworkProvider");
  return ctx;
}

