import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut, User, getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase/config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
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
    await fbSignOut(auth);
  };

  const refreshClaims = async () => {
    if (!user) return;
    try {
      const res = await getIdTokenResult(user, true);
      setIsAdmin(Boolean((res.claims as any)?.admin));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, setUser, signOut, refreshClaims }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
