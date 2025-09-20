import React from "react";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type State = {
  highContrast: boolean;
};

const KEY = "empowr.a11y.settings.v1";

type A11yCtx = {
  state: State;
  toggleHighContrast: () => Promise<void>;
  setHighContrast: (val: boolean) => Promise<void>;
};

const DEFAULT: State = { highContrast: false };
const Ctx = React.createContext<A11yCtx | undefined>(undefined);

export function A11ySettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<State>(DEFAULT);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        setState(JSON.parse(raw));
      } else {
        // No saved preference: infer a sensible default from system settings if possible
        try {
          const AccessibilityInfo = require("react-native").AccessibilityInfo;
          // iOS exposes bold text as an accessibility aid; use as high-contrast hint
          const bold = await AccessibilityInfo.isBoldTextEnabled?.();
          if (bold) setState({ highContrast: true });
        } catch {}
      }
    })();
  }, []);

  const persist = async (s: State) => {
    if (!AsyncStorage) return;
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  };

  const setHighContrast = async (val: boolean) => {
    const next = { ...state, highContrast: val };
    setState(next);
    await persist(next);
  };

  const toggleHighContrast = async () => setHighContrast(!state.highContrast);

  const value: A11yCtx = { state, toggleHighContrast, setHighContrast };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useA11ySettings() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    {throw new Error("useA11ySettings must be used within A11ySettingsProvider");}
  return ctx;
}
