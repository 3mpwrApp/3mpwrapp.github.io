import { View, Text, StyleSheet } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function AllyshipPlaybook() {
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.container}>
      <Text style={s.title}>Allyship Playbook</Text>
      <Text style={s.text}>Mini‑guides for friends, family, and coworkers on supporting injured workers and people with disabilities.</Text>
      <Text style={[s.text,{ marginTop: 8 }]}>Examples: how to offer help, respectful language, accessibility checklists for events, and solidarity best practices.</Text>
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
