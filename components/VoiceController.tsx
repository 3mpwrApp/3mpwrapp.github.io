import * as React from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useAppPalette } from '../theme/usePalette';
import { useVoiceCommands } from '../hooks/useVoiceMode';
import { transcribeAudio } from '../services/stt';

export default function VoiceController() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { voiceMode, handleVoiceCommand } = useVoiceCommands();
  const [recording, setRecording] = React.useState<Audio.Recording | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => { if (recording) { try { recording.stopAndUnloadAsync(); } catch {} } };
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
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(
          Platform.select({
            ios: Audio.RecordingOptionsPresets.HIGH_QUALITY,
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY,
            default: Audio.RecordingOptionsPresets.HIGH_QUALITY,
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
      <Pressable accessibilityLabel="Voice control" onPress={onPress} style={[s.mic, recording && s.micRec]}>
        <Text style={s.micText}>{busy ? '…' : (recording ? 'Stop' : 'Mic')}</Text>
      </Pressable>
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
  });
}
