import { getApps } from 'firebase/app';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminGuard from '../../components/AdminGuard';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { subscribeToActivityFeed } from '../../services/activity';
import { subscribeAdminAudit } from '../../services/adminAudit';
import { useBookmarks } from '../../store/bookmarks';
import { useNotifications } from '../../store/notifications';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

function AdminMetrics() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);

  const { inbox } = useNotifications();
  const { items } = useBookmarks();
  const [activityCount, setActivityCount] = React.useState<string>('—');
  const [auditCount, setAuditCount] = React.useState<string>('—');

  // Activity feed (latest N)
  React.useEffect(() => {
    try {
      if (getApps().length === 0) { setActivityCount('0'); return undefined; }
      const unsub = subscribeToActivityFeed((events: any[]) => {
        setActivityCount(String(events.length));
      }, { limit: 100 });
      return () => { try { (unsub as any)(); } catch {} };
    } catch { setActivityCount('0'); }
    return undefined;
  }, []);

  // Admin audit (latest N)
  React.useEffect(() => {
    try {
      if (getApps().length === 0) { setAuditCount('0'); return undefined; }
      const unsub = subscribeAdminAudit((events: any[]) => {
        setAuditCount(String(events.length));
      }, { limit: 100 });
      return () => { try { (unsub as any)(); } catch {} };
    } catch { setAuditCount('0'); }
    return undefined;
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Admin Metrics</Text>
      <View style={s.card}>
        <Text style={s.label}>Notifications inbox size</Text>
        <Text style={s.value}>{String(inbox.length)}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.label}>Bookmarks count</Text>
        <Text style={s.value}>{String(items.length)}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.label}>Activity feed (latest)</Text>
        <Text style={s.value}>{activityCount}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.label}>Admin audit events (latest)</Text>
        <Text style={s.value}>{auditCount}</Text>
      </View>
      <Text style={[s.label,{opacity:0.7, marginTop:16}]}>More metrics coming soon…</Text>
    </ScrollView>
  );
}

export default function AdminScreen() {
  return (
    <AdminGuard>
      <AdminMetrics />
    </AdminGuard>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { color: palette.text, fontWeight: '700', fontSize: Math.round(22 * factor), marginBottom: 12 },
    card: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, marginBottom: 12 },
    label: { color: palette.text, fontSize: Math.round(14 * factor) },
    value: { color: palette.text, fontSize: Math.round(18 * factor), fontWeight: '700', marginTop: 4 },
  });
}
