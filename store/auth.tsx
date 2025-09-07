import React from "react";
import type { ProvinceCode } from "../types/models";

type User = { id: string; name: string } | null;

type AuthStatus =
  | "loading"
  | "needsOnboarding"
  | "signedOut"
  | "anonymous"
  | "signedIn";

type AuthState = {
  status: AuthStatus;
  user: User;
  isOnboarded: boolean;
  province?: ProvinceCode;
};

type AuthContextType = {
  state: AuthState;
  completeOnboarding: () => Promise<void>;
  setProvince: (p: ProvinceCode) => Promise<void>;
  signIn: (name?: string) => Promise<void>;
  continueAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
};

let AsyncStorage: any;
try {
  // Optional dependency
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const ONBOARDED_KEY = "empowr.onboarded";
const AUTH_MODE_KEY = "empowr.authMode"; // anonymous | signedIn | signedOut
const USER_KEY = "empowr.user";
const PROVINCE_KEY = "empowr.province";

const defaultState: AuthState = {
  status: "loading",
  user: null,
  isOnboarded: false,
  province: undefined,
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(defaultState);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let onboarded = false;
        let mode: string | null = null;
        let user: User = null;
        if (AsyncStorage) {
          const [o, m, u, p] = await Promise.all([
            AsyncStorage.getItem(ONBOARDED_KEY),
            AsyncStorage.getItem(AUTH_MODE_KEY),
            AsyncStorage.getItem(USER_KEY),
            AsyncStorage.getItem(PROVINCE_KEY),
          ]);
          onboarded = o === "1";
          mode = m;
          user = u ? JSON.parse(u) : null;
          const province = p as ProvinceCode | null;
          if (province) {
            // apply province if present
            setState((s) => ({ ...s, province }));
          }
        }

        const status: AuthStatus = !onboarded
          ? "needsOnboarding"
          : mode === "anonymous"
            ? "anonymous"
            : user
              ? "signedIn"
              : "signedOut";
        if (!mounted) return;
        setState((s) => ({ ...s, status, isOnboarded: onboarded, user }));
      } catch {
        if (!mounted) return;
        setState({ status: "signedOut", isOnboarded: false, user: null });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (key: string, value: string | null) => {
    if (!AsyncStorage) return;
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, value);
  };

  const completeOnboarding = async () => {
    await persist(ONBOARDED_KEY, "1");
    setState((s) => ({ ...s, isOnboarded: true, status: "signedOut" }));
  };

  const setProvince = async (p: ProvinceCode) => {
    await persist(PROVINCE_KEY, p);
    setState((s) => ({ ...s, province: p }));
  };

  const signIn = async (name = "Empowr User") => {
    const user: User = { id: "local", name };
    await persist(AUTH_MODE_KEY, "signedIn");
    await persist(USER_KEY, JSON.stringify(user));
    setState({ status: "signedIn", isOnboarded: true, user });
  };

  const continueAnonymously = async () => {
    await persist(AUTH_MODE_KEY, "anonymous");
    await persist(USER_KEY, null);
    setState({ status: "anonymous", isOnboarded: true, user: null });
  };

  const signOut = async () => {
    await persist(AUTH_MODE_KEY, "signedOut");
    await persist(USER_KEY, null);
    setState({ status: "signedOut", isOnboarded: true, user: null });
  };

  const value: AuthContextType = {
    state,
    completeOnboarding,
    setProvince,
    signIn,
    continueAnonymously,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
