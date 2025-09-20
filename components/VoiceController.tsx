import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { HIT_SLOP_8 } from '../constants/a11y';
import { useVoiceCommands } from '../hooks/useVoiceMode';
import { transcribeAudio } from '../services/stt';
import { useAppPalette } from '../theme/usePalette';
import A11yPressable from './A11yPressable';

export default function VoiceController() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { voiceMode, handleVoiceCommand } = useVoiceCommands();
  const [recording, setRecording] = React.useState<any | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    return () => { if (recording) { try { recording.stopAndUnloadAsync?.(); } catch {} } };
  }, [recording]);

  const onPress = async () => {
    if (!voiceMode) return;
    try {
      if (recording) {
        setBusy(true);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          const text = await transcribeAudio(uri);
          if (text) {
            const res = handleVoiceCommand(text);
            if (res.handled) setToast(res.label || text);
            else setToast('Command not recognized');
            setTimeout(() => setToast(null), 2000);
          } else {
            setToast('Heard nothing');
            setTimeout(() => setToast(null), 1500);
          }
        }
      } else {
        // Prefer expo-audio, fallback to expo-av for SDK 53
        let AudioMod: any;
        try { AudioMod = require('expo-audio')?.Audio; } catch { try { AudioMod = require('expo-av')?.Audio; } catch {} }
        if (!AudioMod) { setToast('Voice unavailable'); setTimeout(()=>setToast(null),1500); return; }
        const { granted } = await AudioMod.requestPermissionsAsync();
        if (!granted) return;
        await AudioMod.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new AudioMod.Recording();
        await rec.prepareToRecordAsync(
          Platform.select({
            ios: AudioMod.RecordingOptionsPresets?.HIGH_QUALITY,
            android: AudioMod.RecordingOptionsPresets?.HIGH_QUALITY,
            default: AudioMod.RecordingOptionsPresets?.HIGH_QUALITY,
          }) as any
        );
        await rec.startAsync();
        setRecording(rec);
      }
    } catch {
      // swallow in UI
    } finally {
      setBusy(false);
    }
  };

  if (!voiceMode) return null;
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      {toast && (
        <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View>
      )}
      {showHelp && (
        <View style={s.helpBox}>
          <Text style={s.helpTitle}>Voice commands</Text>
          {[
            'Open resources',
            'Open ratings',
            'Open advocacy',
            'Open community',
            'Open settings',
            'Open admin pending / approved / trash',
            'Open rights explainer',
            'Open doctor visit prep',
            'Back',
          ].map((c)=> (<Text key={c} style={s.helpText}>• {c}</Text>))}
        </View>
      )}
      <A11yPressable role="button" hitSlop={HIT_SLOP_8} accessibilityLabel="Voice control" onPress={onPress} onLongPress={()=> setShowHelp(v=>!v)} style={[s.mic, recording && s.micRec]}>
        <Text style={s.micText}>{busy ? '…' : (recording ? 'Stop' : 'Mic')}</Text>
      </A11yPressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    wrap: { position: 'absolute', right: 16, bottom: 24, zIndex: 1000 },
    mic: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 },
    micRec: { backgroundColor: palette.primary, borderColor: palette.primary },
    micText: { color: palette.text, fontWeight: '700' },
    toast: { position: 'absolute', right: 0, bottom: 56, backgroundColor: palette.surface, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 10, paddingVertical: 6 },
    toastText: { color: palette.text, fontWeight: '700' },
    helpBox: { position: 'absolute', right: 0, bottom: 100, backgroundColor: palette.surface, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding: 10, width: 260 },
    helpTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    helpText: { color: palette.text, opacity: 0.9 },
  });
}
