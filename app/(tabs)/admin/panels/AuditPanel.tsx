import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import GapView from '../../../../components/GapView';
import { HIT_SLOP_8 } from '../../../../constants/A11Y';
import { listAdminAudit, listAdminAuditAll, subscribeAdminAudit } from '../../../../services/adminAudit';
import { useAppPalette } from '../../../../theme/usePalette';

export default function AuditPanel() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [auditEvents, setAuditEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeAdminAudit((rows) => setAuditEvents(rows.slice(0, 50)), { limit: 50 });
    } catch {
      setAuditEvents([]);
    }
    return () => { try { if (unsub) unsub(); } catch {} };
  }, []);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Admin Audit (latest)</Text>
      <GapView style={{ flexDirection:'row', marginBottom: 8 }} gap={8}>
        <A11yPressable
          accessibilityRole="button"
          accessibilityLabel="Export admin audit events as CSV"
          hitSlop={HIT_SLOP_8}
          onPress={async()=>{
            try {
              const rows = await listAdminAudit({ limit: 1000 });
              const header = ['ts','actorUid','action','target','details','client_platform','client_version'];
              const esc = (v: any) => `"${String(v ?? '').replace(/"/g,'""')}"`;
              const data = rows.map(r => [
                new Date(r.ts).toISOString(),
                r.actorUid ?? '',
                r.action ?? '',
                r.target ?? '',
                (r.details ? JSON.stringify(r.details) : ''),
                r.client?.platform ?? '',
                r.client?.version ?? ''
              ].map(esc).join(',')).join('\n');
              const csv = [header.map(esc).join(','), data].filter(Boolean).join('\n');
              const FileSystem = await import('expo-file-system');
              const Sharing = await import('expo-sharing');
              const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
              const path = `${baseDir}admin_audit_${Date.now()}.csv`;
              await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
              try { if (await (Sharing as any).isAvailableAsync?.()) await (Sharing as any).shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Admin Audit CSV' }); }
              catch {}
              Alert.alert('Export ready','CSV saved to cache directory.');
            } catch { Alert.alert('Export failed','Could not create CSV.'); }
          }}
          style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
        >
          <Text style={{ color: palette.text, fontWeight:'700' }}>Export CSV</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityRole="button"
          accessibilityLabel="Export admin audit events as JSON (paged)"
          hitSlop={HIT_SLOP_8}
          onPress={async()=>{
            try {
              const rows = await listAdminAuditAll({ batchSize: 500, maxDocs: 5000 });
              const payload = rows.map(r => ({
                id: (r as any).id || undefined,
                ts: r.ts,
                iso: new Date(r.ts).toISOString(),
                actorUid: r.actorUid ?? null,
                action: r.action ?? null,
                target: r.target ?? null,
                details: r.details ?? null,
                client: r.client ?? null,
              }));
              const json = JSON.stringify({
                exportedAt: new Date().toISOString(),
                count: payload.length,
                items: payload,
              }, null, 2);
              const FileSystem = await import('expo-file-system');
              const Sharing = await import('expo-sharing');
              const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
              const path = `${baseDir}admin_audit_${Date.now()}.json`;
              await (FileSystem as any).writeAsStringAsync(path, json, { encoding: (FileSystem as any).EncodingType?.UTF8 });
              try { if (await (Sharing as any).isAvailableAsync?.()) await (Sharing as any).shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Admin Audit JSON' }); }
              catch {}
              Alert.alert('Export ready',`JSON saved to cache (${payload.length} events).`);
            } catch {
              Alert.alert('Export failed','Could not create JSON export.');
            }
          }}
          style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
        >
          <Text style={{ color: palette.text, fontWeight:'700' }}>Export JSON (All)</Text>
        </A11yPressable>
      </GapView>
      {auditEvents.length === 0 ? (
        <Text style={{ color: palette.text }}>No recent admin actions.</Text>
      ) : (
        auditEvents.slice(0, 10).map((e) => (
          <View key={e.id} style={{ paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
            <Text style={{ color: palette.text }}>
              {new Date(e.ts).toLocaleString()} — {e.action}
              {e.target ? ` · ${e.target}` : ''}
            </Text>
            {e.actorUid ? <Text style={{ color: palette.text, opacity:0.7 }}>by {e.actorUid}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    card: { backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 10 },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
  });
}
