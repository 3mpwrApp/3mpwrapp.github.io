import React from "react";

import { notifyNewUser } from "../services/discordNotifications";
import {
    clearAuthToken,
    getAuthToken,
    initializeSecureStorage,
    saveAuthToken,
} from "../services/secureStorage";
import * as persistence from "../store/persistence";
import type { ProvinceCode } from "../types/models";
import { logger } from "../utils/logger";

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
  authToken?: string;
};

type AuthContextType = {
  state: AuthState;
  completeOnboarding: () => Promise<void>;
  setProvince: (p: ProvinceCode) => Promise<void>;
  signIn: (name?: string, token?: string) => Promise<void>;
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
const AUTH_TOKEN_KEY = "auth_token_v1";

const defaultState: AuthState = {
  status: "loading",
  user: null,
  isOnboarded: false,
  province: undefined,
  authToken: undefined,
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(defaultState);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Initialize secure storage
        await initializeSecureStorage();

        let onboarded = false;
        let mode: string | null = null;
        let user: User = null;
        let authToken: string | undefined;

        if (AsyncStorage) {
          const [o, m, u, p] = await Promise.all([
            persistence.getItem(ONBOARDED_KEY),
            persistence.getItem(AUTH_MODE_KEY),
            persistence.getItem(USER_KEY),
            persistence.getItem(PROVINCE_KEY),
          ]);

          // Also try to get auth token from SecureStore
          const token = await getAuthToken();

          onboarded = o === "1";
          mode = m;
          user = u ? JSON.parse(u) : null;
          authToken = token || undefined;
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
        setState((s) => ({
          ...s,
          status,
          isOnboarded: onboarded,
          user,
          authToken,
        }));
      } catch (error) {
        logger.error('[Auth] Initialization failed:', error);
        if (!mounted) return;
        setState({
          status: "signedOut",
          isOnboarded: false,
          user: null,
          authToken: undefined,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (key: string, value: string | null) => {
    if (!AsyncStorage) return;
    try {
      if (value === null) {
        await persistence.removeItem(key);
      } else {
        await persistence.setItem(key, value);
      }
    } catch (error) {
      logger.error('[Auth] Failed to persist to AsyncStorage:', error);
      // Don't throw - allow app to continue even if storage fails
    }
  };

  const persistAuthToken = async (token: string | null) => {
    try {
      if (token) {
        await saveAuthToken(token);
      } else {
        await clearAuthToken();
      }
    } catch (error) {
      logger.error('[Auth] Failed to persist auth token to SecureStore:', error);
      // Don't throw - allow app to continue even if storage fails
    }
  };

  const completeOnboarding = async () => {
    await persist(ONBOARDED_KEY, "1");
    setState((s) => ({ ...s, isOnboarded: true, status: "signedOut" }));
  };

  const setProvince = async (p: ProvinceCode) => {
    await persist(PROVINCE_KEY, p);
    setState((s) => ({ ...s, province: p }));
  };

  const signIn = async (name = "3mpwr User", token?: string) => {
    const user: User = { id: "local", name };
    await persist(AUTH_MODE_KEY, "signedIn");
    await persist(USER_KEY, JSON.stringify(user));
    if (token) {
      await persistAuthToken(token);
    }
    setState({ status: "signedIn", isOnboarded: true, user, authToken: token });
    // Notify Discord of new user (fire and forget)
    notifyNewUser({ isGuest: false, source: 'app' }).catch(() => {});
  };

  const continueAnonymously = async () => {
    await persist(AUTH_MODE_KEY, "anonymous");
    await persist(USER_KEY, null);
    setState({ status: "anonymous", isOnboarded: true, user: null });
    // Notify Discord of new guest user (fire and forget)
    notifyNewUser({ isGuest: true, source: 'app' }).catch(() => {});
  };

  const signOut = async () => {
    await persist(AUTH_MODE_KEY, "signedOut");
    await persist(USER_KEY, null);
    await persistAuthToken(null);
    setState({
      status: "signedOut",
      isOnboarded: true,
      user: null,
      authToken: undefined,
    });
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
