import React from "react";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type TextScale = "normal" | "large" | "xlarge";

export type SettingsState = {
  highContrast: boolean;
  textScale: TextScale;
  province: import("../types/models").ProvinceCode | null;
};

type Ctx = SettingsState & {
  setHighContrast: (v: boolean) => void;
  setTextScale: (v: TextScale) => void;
  setProvince: (p: SettingsState["province"]) => void;
};

const DEFAULTS: SettingsState = {
  highContrast: false,
  textScale: "normal",
  province: null,
};

const KEY = "settings:v1";

const CtxImpl = React.createContext<Ctx | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SettingsState>(DEFAULTS);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({ ...DEFAULTS, ...parsed });
        }
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    })();
  }, [state]);

  const setHighContrast = (v: boolean) => setState((s) => ({ ...s, highContrast: v }));
  const setTextScale = (v: TextScale) => setState((s) => ({ ...s, textScale: v }));
  const setProvince = (p: SettingsState["province"]) => setState((s) => ({ ...s, province: p }));

  const value: Ctx = { ...state, setHighContrast, setTextScale, setProvince };
  return <CtxImpl.Provider value={value}>{children}</CtxImpl.Provider>;
}

export function useSettings() {
  const ctx = React.useContext(CtxImpl);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

