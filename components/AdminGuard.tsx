import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

type Props = {
  children: React.ReactNode;
  redirectTo?: string; // if provided and not admin, navigate there
  fallback?: React.ReactNode; // custom fallback UI
  silent?: boolean; // if true and not admin, render null
};

export default function AdminGuard({ children, redirectTo, fallback, silent }: Props) {
  const { isAdmin, loading } = useAuth();
  const palette = useAppPalette();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && redirectTo && !isAdmin) {
      try { router.replace(redirectTo as any); } catch {}
    }
  }, [loading, isAdmin, redirectTo]);

  if (loading) return null;
  if (isAdmin) return <>{children}</>;
  if (silent) return null;
  if (fallback) return <>{fallback}</>;
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 6 }}>
        {t('admin.onlyTitle','Admin Only')}
      </Text>
      <Text style={{ color: palette.text }}>
        {t('admin.onlyDescription','You must be an admin to access this area.')}
      </Text>
    </View>
  );
}

