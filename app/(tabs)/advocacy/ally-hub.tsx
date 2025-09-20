import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useAppPalette } from '../../../theme/usePalette';

const links = [
  { title:'Climate Justice x Disability', url:'https://www.climatedisability.org' },
  { title:'Gender Justice + Accessibility', url:'https://example.org/gender-disability' },
  { title:'Labour + Injury Solidarity', url:'https://example.org/labour-injury' },
];

export const options = { href: null };

export default function AllyHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.container}>
      <Text style={s.title}>Cross‑Movement Ally Hub</Text>
      <Text style={s.text}>Links across movements for solidarity and learning.</Text>
      {links.map(l => (
        <A11yPressable key={l.title} hitSlop={HIT_SLOP_8} onPress={()=> require('expo-linking').openURL(l.url)} style={s.card}>
          <Text style={s.cardTitle}>{l.title}</Text>
          <Text style={[s.text,{ color: palette.primary }]}>{l.url}</Text>
        </A11yPressable>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700' },
  });
}
