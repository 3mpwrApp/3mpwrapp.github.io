import React from "react";

let AsyncStorage: any;
try {
  // Optional persistence if AsyncStorage is installed
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

/** Font scaling options */
export type TextScale = "normal" | "large" | "xlarge";

/** Shape of the settings state */
export type SettingsState = {
  highContrast: boolean;
  textScale: TextScale;
  province: import("../types/models").ProvinceCode | null;
  includeProvincialHolidays: boolean;
  youtubeOpenPreference: "ask" | "app" | "browser";
};

/** Context type including setters */
type Ctx = SettingsState & {
  setHighContrast: (v: boolean) => void;
  setTextScale: (v: TextScale) => void;
  setProvince: (p: SettingsState["province"]) => void;
  setIncludeProvincialHolidays: (v: boolean) => void;
  setYoutubeOpenPreference: (v: SettingsState["youtubeOpenPreference"]) => void;
};

/** Default values if nothing stored */
const DEFAULTS: SettingsState = {
  highContrast: false,
  textScale: "normal",
  province: null,
  includeProvincialHolidays: false,
  youtubeOpenPreference: "ask",
};

const STORAGE_KEY = "settings:v1";

/** React Context */
const SettingsContext = React.createContext<Ctx | undefined>(undefined);

/** Provider component */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SettingsState>(DEFAULTS);

  // Load persisted state on mount
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({ ...DEFAULTS, ...parsed });
        }
      } catch (e) {
        console.warn("Failed to load settings", e);
      }
    })();
  }, []);

  // Persist whenever state changes
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("Failed to save settings", e);
      }
    })();
  }, [state]);

  // Setters
  const setHighContrast = (v: boolean) =>
    setState((s) => ({ ...s, highContrast: v }));
  const setTextScale = (v: TextScale) =>
    setState((s) => ({ ...s, textScale: v }));
  const setProvince = (p: SettingsState["province"]) =>
    setState((s) => ({ ...s, province: p }));
  const setIncludeProvincialHolidays = (v: boolean) =>
    setState((s) => ({ ...s, includeProvincialHolidays: v }));
  const setYoutubeOpenPreference = (v: SettingsState["youtubeOpenPreference"]) =>
    setState((s) => ({ ...s, youtubeOpenPreference: v }));

  const value: Ctx = { ...state, setHighContrast, setTextScale, setProvince, setIncludeProvincialHolidays, setYoutubeOpenPreference };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/** Hook to consume settings */
export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
