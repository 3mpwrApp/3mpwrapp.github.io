import { View, Text, StyleSheet } from 'react-native';

import { useAppPalette } from '../../theme/usePalette';

export const options = { href: null };

export default function VoiceHelp() {
  const palette = useAppPalette();
  const s = styles(palette);
  const cmds = [
    'Open resources',
    'Open ratings',
    'Open advocacy',
    'Open community',
    'Open settings',
    'Open admin pending / approved / trash',
    'Open rights explainer',
    'Open doctor visit prep',
    'Open accessibility log',
    'Open rehab tracker',
    'Open world map',
    'Open media studio',
    'Back / Go back',
  ];
  return (
    <View style={s.container}>
      <Text style={s.title}>Voice Help</Text>
      <Text style={s.text}>Press the mic and say a command:</Text>
      {cmds.map(c => (<Text key={c} style={s.text}>• {c}</Text>))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
  });
}
