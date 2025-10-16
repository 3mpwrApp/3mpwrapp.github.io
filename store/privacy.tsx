import React from "react";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type State = {
  passcode?: string; // stored as plain for demo; prefer SecureStore in prod
  lockWellness?: boolean;
  analyticsEnabled?: boolean;
  errorReportingEnabled?: boolean;
};

const STORAGE_KEY = "privacy:state:v1";

type PrivacyCtx = {
  state: State;
  setPasscode: (p: string | undefined) => Promise<void>;
  setLockWellness: (b: boolean) => Promise<void>;
  setAnalyticsEnabled: (b: boolean) => Promise<void>;
  setErrorReportingEnabled: (b: boolean) => Promise<void>;
};

const Ctx = React.createContext<PrivacyCtx | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>({});
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage?.getItem?.(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch {}
    })();
  }, []);
  const persist = async (s: State) => {
    try {
      await AsyncStorage?.setItem?.(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  };
  const setPasscode = async (p?: string) => {
    const next = { ...state, passcode: p };
    setState(next);
    await persist(next);
  };
  const setLockWellness = async (b: boolean) => {
    const next = { ...state, lockWellness: b };
    setState(next);
    await persist(next);
  };
  const setAnalyticsEnabled = async (b: boolean) => {
    const next = { ...state, analyticsEnabled: b };
    setState(next);
    await persist(next);
  };
  const setErrorReportingEnabled = async (b: boolean) => {
    const next = { ...state, errorReportingEnabled: b };
    setState(next);
    await persist(next);
  };
  return (
    <Ctx.Provider value={{ state, setPasscode, setLockWellness, setAnalyticsEnabled, setErrorReportingEnabled }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePrivacy() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("usePrivacy must be used within PrivacyProvider");
  return ctx;
}
