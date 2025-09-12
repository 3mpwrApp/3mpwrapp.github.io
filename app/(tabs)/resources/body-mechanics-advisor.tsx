import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import A11yPressable from '../../../components/A11yPressable';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { analyzeBodyVideo } from '../../../services/body';

export const options = { href: null };

export default function BodyMechanicsAdvisor() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('AI Body Mechanics Advisor');
  useFocusOnRefOnMount(titleRef);
  const [videoName, setVideoName] = React.useState('');
  const [advice, setAdvice] = React.useState<string[]>([]);

  const analyze = async (uri: string, name?: string) => {
    // Try backend if configured, else local heuristics
    const backend = await analyzeBodyVideo(uri, name || 'video.mp4');
    if (backend?.suggestions?.length) { setAdvice(backend.suggestions); return; }
    setAdvice([
      'Keep wrists neutral; avoid prolonged flexion when typing.',
      'Use hip hinge and keep load close when lifting.',
      'Consider pacing: activity blocks of 20–30 minutes with breaks.',
    ]);
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>AI Body Mechanics Advisor</Text>
      <Text style={s.text}>Upload a short video of a daily task. You’ll get accessibility-first suggestions. Do not rely on this as medical advice.</Text>
      <A11yPressable onPress={async()=>{
        try {
          const DP = await import('expo-document-picker');
          const res = await DP.getDocumentAsync({ type: 'video/*' });
          const asset = res?.assets?.[0];
          if (!asset?.uri) return;
          setVideoName(asset.name || 'video');
          await analyze(asset.uri, asset.name);
        } catch { Alert.alert('Pick failed','Could not select video.'); }
      }} style={s.button}><Text style={s.buttonText}>Pick Video</Text></A11yPressable>

      {!!videoName && <Text style={s.text}>Selected: {videoName}</Text>}
      {!!advice.length && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Suggestions</Text>
          {advice.map((a,i)=>(<Text key={i} style={s.text}>• {a}</Text>))}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
  });
}
