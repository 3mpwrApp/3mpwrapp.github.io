import { View, Text, StyleSheet } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function SolidarityToolkit() {
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.container}>
      <Text style={s.title}>Union & Worker Solidarity Toolkit</Text>
      <Text style={s.text}>Step‑by‑step resources for organizing workplace support, including accommodation campaigns. This section will grow with templates, checklists, and guides.</Text>
      <Text style={[s.text,{ marginTop: 8 }]}>Coming soon: sample petitions, meeting agendas, escalation ladders, and campaign timelines.</Text>
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
