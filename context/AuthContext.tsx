import type { User } from 'firebase/auth';
import { signOut as fbSignOut, getIdTokenResult, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
// pii-scan-ignore-file - Contains user email in auth state
import React, { createContext, useContext, useEffect, useState } from 'react';

import { auth } from '../firebase/config';
import { logger } from '../utils/logger';
import {
  startTransaction,
  startSpan,
  captureException,
  addBreadcrumb,
  setMeasurement,
} from '../services/sentryLabeling';

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
            // Attempt to identify device/user in optional vexo analytics
            try {
              import('vexo-analytics')
                .then((mod) => {
                  try {
                    const identifyDevice = (mod as any).identifyDevice;
                    if (typeof identifyDevice === 'function') {
                      const id = firebaseUser.email || firebaseUser.uid || firebaseUser.phoneNumber || 'unknown';
                      identifyDevice(id);
                      if (__DEV__) logger.log('[AuthContext] vexo identifyDevice called', id);
                    }
                  } catch (e) {
                    if (__DEV__) logger.warn('[AuthContext] vexo identify failed', e);
                  }
                })
                .catch(() => {
                  if (__DEV__) logger.log('[AuthContext] vexo-analytics not installed (identify skipped)');
                });
            } catch {
              // ignore dynamic import errors
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

    const transaction = startTransaction('user_signout', 'task', {
      description: 'User signing out',
      tags: { feature: 'auth', action: 'signout' },
    });

    try {
      addBreadcrumb('User initiating sign out', 'user.action', 'info');
      await fbSignOut(auth);
      setSessionExpired(false);
      transaction?.setStatus('ok');
      addBreadcrumb('Sign out successful', 'auth', 'info');
    } catch (error) {
      logger.error('Sign out error', { error: error instanceof Error ? error.message : 'Unknown' });
      transaction?.setStatus('internal_error');
      captureException(error as Error, {
        feature: 'auth',
        severity: 'error',
        tags: { operation: 'signout' },
      });
    } finally {
      transaction?.finish();
    }
  };

  const refreshClaims = async () => {
    if (!user || !auth) return;

    const transaction = startTransaction('refresh_claims', 'task', {
      description: 'Refreshing user claims and permissions',
      tags: { feature: 'auth', action: 'refresh_claims' },
    });

    try {
      addBreadcrumb('Refreshing user claims', 'auth', 'info');
      const res = await getIdTokenResult(user, true);
      setIsAdmin(Boolean((res.claims as any)?.admin));
      setSessionExpired(false);
      transaction?.setStatus('ok');
      addBreadcrumb('Claims refreshed successfully', 'auth', 'info');
    } catch (error) {
      logger.warn('Failed to refresh claims', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      // Check if this is a real auth error (401/403)
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          setSessionExpired(true);
          transaction?.setStatus('unauthenticated');
        } else {
          transaction?.setStatus('internal_error');
        }
      } else {
        transaction?.setStatus('internal_error');
      }

      captureException(error as Error, {
        feature: 'auth',
        severity: 'warning',
        tags: { operation: 'refresh_claims' },
      });
    } finally {
      transaction?.finish();
    }
  };

  const signInGuest = async () => {
    if (!auth) {
      throw new Error('Firebase auth is not available');
    }

    const transaction = startTransaction('guest_signin', 'task', {
      description: 'Guest user signing in anonymously',
      tags: { feature: 'auth', action: 'guest_signin' },
    });

    try {
      addBreadcrumb('Guest sign in initiated', 'user.action', 'info');
      await signInAnonymously(auth);
      setSessionExpired(false);
      transaction?.setStatus('ok');
      addBreadcrumb('Guest sign in successful', 'auth', 'info');
    } catch (error) {
      logger.error('Guest sign in error', { error: error instanceof Error ? error.message : 'Unknown' });
      transaction?.setStatus('internal_error');
      captureException(error as Error, {
        feature: 'auth',
        severity: 'error',
        tags: { operation: 'guest_signin' },
      });
      throw error; // Re-throw so caller can handle
    } finally {
      transaction?.finish();
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

