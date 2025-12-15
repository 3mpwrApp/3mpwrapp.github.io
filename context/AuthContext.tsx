import type { User } from 'firebase/auth';
import { signOut as fbSignOut, getIdTokenResult, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
// pii-scan-ignore-file - Contains user email in auth state
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
    if (!auth) {
      setLoading(false);
      setUser(null);
      setIsGuest(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          
          setUser(firebaseUser);
          setIsGuest(!!firebaseUser?.isAnonymous);
          setLoading(false);

          // Clear session expired flag when user is authenticated
          if (firebaseUser) {
            setSessionExpired(false);
            
            // Register push notification token for non-anonymous users
            if (!firebaseUser.isAnonymous) {
              try {
                // Check if Firestore is available before attempting to register token
                const { db } = await import('../firebase/config');
                if (db) {
                  const { registerUserPushToken } = await import('../services/notifications');
                  await registerUserPushToken(firebaseUser.uid);
                } else if (__DEV__) {
                  logger.log('[AuthContext] Skipping push token registration - Firestore not available (BYOC mode)');
                }
              } catch (notifErr) {
                logger.warn('[AuthContext] Failed to register push token', { error: notifErr });
              }
              
              // Initialize cloud sync for authenticated users (only if Firestore available)
              try {
                const { db } = await import('../firebase/config');
                if (db) {
                  const { initializeCloudSync } = await import('../services/cloudSync');
                  await initializeCloudSync();
                  if (__DEV__) logger.log('[AuthContext] Cloud sync initialized');
                } else if (__DEV__) {
                  logger.log('[AuthContext] Skipping cloud sync - Firestore not available (BYOC mode)');
                }
              } catch (syncErr) {
                logger.warn('[AuthContext] Failed to initialize cloud sync', { error: syncErr });
              }
            }
            
            // Grant absolute admin access to empowrapp08162025@gmail.com
            const superAdminEmail = 'empowrapp08162025@gmail.com';
            const isSuperAdmin = firebaseUser.email === superAdminEmail;
            
            try {
              const res = await getIdTokenResult(firebaseUser, true);
              setIsAdmin(isSuperAdmin || Boolean((res.claims as any)?.admin));
              if (__DEV__) logger.log('[AuthContext] Claims refreshed');
            } catch (error) {
              logger.warn('[AuthContext] Failed to refresh claims', {
                error: error instanceof Error ? error.message : 'Unknown',
              });
              // Still grant admin if super admin email, even if claims fail
              setIsAdmin(isSuperAdmin);

              // Check if this is a real auth error (401/403) vs network error
              if (error instanceof Error) {
                if (error.message.includes('401') || error.message.includes('403')) {
                  if (__DEV__) logger.log('[AuthContext] Session expired - auth error');
                  setSessionExpired(true);
                }
              }
            }
          } else {
            if (__DEV__) logger.log('[AuthContext] No user - signed out');
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
    if (!auth) {
      throw new Error('Firebase auth is not available');
    }
    try {
      await signInAnonymously(auth);
      setSessionExpired(false);
    } catch (error) {
      logger.error('Guest sign in error', { error: error instanceof Error ? error.message : 'Unknown' });
      throw error; // Re-throw so caller can handle
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

