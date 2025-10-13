import type { User } from "firebase/auth";
import { signOut as fbSignOut, getIdTokenResult, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

import { auth } from "../firebase/config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
  signInGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Handle strict BYOC mode where auth is null
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  setUser(firebaseUser);
  setIsGuest(!!firebaseUser?.isAnonymous);
      setLoading(false);
      if (firebaseUser) {
        try {
          const res = await getIdTokenResult(firebaseUser, true);
          setIsAdmin(Boolean((res.claims as any)?.admin));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    if (!auth) return;
    await fbSignOut(auth);
  };

  const refreshClaims = async () => {
    if (!user || !auth) return;
    try {
      const res = await getIdTokenResult(user, true);
      setIsAdmin(Boolean((res.claims as any)?.admin));
    } catch {}
  };

  const signInGuest = async () => {
    if (!auth) return;
    await signInAnonymously(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isGuest, setUser, signOut, refreshClaims, signInGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
