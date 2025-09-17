import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import A11yPressable from '../../../components/A11yPressable';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { getQueue, clearQueue, processQueue } from '../../../services/evidenceQueue';

export const options = { href: null };

export default function EvidenceQueueScreen() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Upload Queue');
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setItems(await getQueue());
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Upload Queue
      </Text>
      <Text style={s.sub}>Items waiting for cloud save.</Text>
      <A11yPressable
        onPress={async () => {
          try { setBusy('Processing…'); await processQueue(() => {}); await load(); Alert.alert('Done', 'Processed queued items.'); }
          catch { Alert.alert('Error', 'Unable to process queue.'); }
          finally { setBusy(null); }
        }}
        style={s.button}
      >
        <Text style={s.buttonText}>{busy || 'Process queue'}</Text>
      </A11yPressable>
      <A11yPressable
        onPress={async () => { await clearQueue(); await load(); }}
        style={[s.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
      >
        <Text style={[s.buttonText, { color: palette.text }]}>Clear queue</Text>
      </A11yPressable>

      {items.length === 0 ? (
        <Text style={s.sub}>
          Queue is empty.
        </Text>
      ) : (
        items.map((n, idx) => (
          <View key={idx} style={s.card}>
            <Text style={s.text}>{n.text || '(no text)'} {n.tags?.length ? `#${n.tags.join(',#')}` : ''}</Text>
            <Text style={s.meta}>{(n.files?.length || 0)} attachment(s)</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { color: palette.text, fontSize: 22, fontWeight: '700' },
    sub: { color: palette.text, opacity: 0.9, marginVertical: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8 },
    text: { color: palette.text },
    meta: { color: palette.text, opacity: 0.7 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}

