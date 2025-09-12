import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { useSettings } from '../../../store/settings';

export const options = { href: null };

export default function DenialDecoder() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [result, setResult] = React.useState<{ summary: string; next: string[]; template?: string } | null>(null);
  const { province } = useSettings();
  const analyze = async () => {
    try {
      const DP = await import('expo-document-picker');
      const res = await DP.getDocumentAsync({ type: ['application/pdf','text/*','image/*'] as any });
      const f = res?.assets?.[0]; if (!f?.uri) return;
      const base = process.env.EXPO_PUBLIC_LLM_BASE;
      if (base) {
        const fd = new FormData();
        const file: any = { uri: f.uri, name: f.name || 'file', type: f.mimeType || 'application/octet-stream' };
        // @ts-ignore
        fd.append('file', file);
        fd.append('province', String(province || 'GEN'));
        const r = await fetch(`${base.replace(/\/$/,'')}/decode-denial`, { method:'POST', body: fd as any });
        if (r.ok) { const data = await r.json(); setResult(data); return; }
      }
      // Fallback heuristics
      setResult({ summary: 'This letter likely explains a denied claim. Common reasons include lack of medical evidence or missed deadlines.', next: ['Request your full claim file','Gather medical notes addressing the reasons','File a reconsideration/appeal before the deadline'], template: 'Dear [Officer], I am requesting reconsideration of my claim decision. Key points: [facts/evidence]. Sincerely, [Your Name]' });
    } catch { Alert.alert('Failed','Could not analyze'); }
  };
  return (
    <View style={s.container}>
      <Text style={s.title}>AI Claim Denial Decoder</Text>
      <Pressable onPress={analyze} style={s.button}><Text style={s.buttonText}>Upload denial letter</Text></Pressable>
      {result && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Summary</Text>
          <Text style={s.text}>{result.summary}</Text>
          <Text style={s.cardTitle}>Next steps</Text>
          {result.next.map((n,i)=>(<Text key={i} style={s.text}>• {n}</Text>))}
          {!!result.template && (<>
            <Text style={s.cardTitle}>Appeal template</Text>
            <Text style={s.text}>{result.template}</Text>
          </>)}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginTop: 8 },
  });
}
