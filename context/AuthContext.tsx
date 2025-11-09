import type { User } from 'firebase/auth';
import { signOut as fbSignOut, getIdTokenResult, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { auth } from '../firebase/config';
import { logger } from '../utils/logger';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  sessionExpired: boolean;
  setSessionExpired: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Handle strict BYOC mode where auth is null
    if (!auth) {
      logger.log('[AuthContext] Strict BYOC mode - auth is null');
      setLoading(false);
      return;
    }

    logger.log('[AuthContext] Setting up auth state listener');

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          logger.log('[AuthContext] Auth state changed', { 
            hasUser: !!firebaseUser, 
            isAnonymous: firebaseUser?.isAnonymous,
            uid: firebaseUser?.uid,
            email: firebaseUser?.email,
            provider: firebaseUser?.providerData?.[0]?.providerId
          });
          
          setUser(firebaseUser);
          setIsGuest(!!firebaseUser?.isAnonymous);
          setLoading(false);

          // Clear session expired flag when user is authenticated
          if (firebaseUser) {
            setSessionExpired(false);
            
            // Register push notification token for non-anonymous users
            if (!firebaseUser.isAnonymous) {
              try {
                const { registerUserPushToken } = await import('../services/notifications');
                await registerUserPushToken(firebaseUser.uid);
              } catch (notifErr) {
                logger.warn('[AuthContext] Failed to register push token', { error: notifErr });
              }
            }
            
            // Grant absolute admin access to empowrapp08162025@gmail.com
            const superAdminEmail = 'empowrapp08162025@gmail.com';
            const isSuperAdmin = firebaseUser.email === superAdminEmail;
            
            try {
              const res = await getIdTokenResult(firebaseUser, true);
              setIsAdmin(isSuperAdmin || Boolean((res.claims as any)?.admin));
              logger.log('[AuthContext] Claims refreshed', { isAdmin: isSuperAdmin || Boolean((res.claims as any)?.admin) });
            } catch (error) {
              logger.warn('[AuthContext] Failed to refresh claims', {
                error: error instanceof Error ? error.message : 'Unknown',
              });
              // Still grant admin if super admin email, even if claims fail
              setIsAdmin(isSuperAdmin);

              // Check if this is a real auth error (401/403) vs network error
              if (error instanceof Error) {
                if (error.message.includes('401') || error.message.includes('403')) {
                  logger.log('[AuthContext] Session expired - real auth error');
                  setSessionExpired(true);
                }
              }
            }
          } else {
            logger.log('[AuthContext] No user - signed out');
            setIsAdmin(false);
            setSessionExpired(false);
          }
        } catch (error) {
          logger.error('[AuthContext] Auth state change error', {
            error: error instanceof Error ? error.message : 'Unknown',
          });
          setLoading(false);
        }
      },
      (error) => {
        // Handle auth listener errors
        logger.error('[AuthContext] Auth listener error', {
          code: (error as any)?.code,
          message: error instanceof Error ? error.message : 'Unknown',
        });

        // Only set sessionExpired for real authentication errors
        if ((error as any)?.code === 'auth/invalid-token' || (error as any)?.code === 'auth/credential-expired') {
          setSessionExpired(true);
          logger.log('[AuthContext] Session expired - detected from auth listener');
        }

        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const signOut = async () => {
    if (!auth) return;
    try {
      await fbSignOut(auth);
      setSessionExpired(false);
    } catch (error) {
      logger.error('Sign out error', { error: error instanceof Error ? error.message : 'Unknown' });
    }
  };

  const refreshClaims = async () => {
    if (!user || !auth) return;
    try {
      const res = await getIdTokenResult(user, true);
      setIsAdmin(Boolean((res.claims as any)?.admin));
      setSessionExpired(false);
    } catch (error) {
      logger.warn('Failed to refresh claims', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      // Check if this is a real auth error (401/403)
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          setSessionExpired(true);
        }
      }
    }
  };

  const signInGuest = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
      setSessionExpired(false);
    } catch (error) {
      logger.error('Guest sign in error', { error: error instanceof Error ? error.message : 'Unknown' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isGuest,
        sessionExpired,
        setSessionExpired,
        setUser,
        signOut,
        refreshClaims,
        signInGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
