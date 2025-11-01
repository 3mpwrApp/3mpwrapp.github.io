import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function SolidarityToolkit() {
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.container}>
      <Text style={s.title}>Union & Worker Solidarity Toolkit</Text>
      <DisclaimerBanner type="general" compact={true} />
      <DyslexiaText style={s.text}>Step‑by‑step resources for organizing workplace support, including accommodation campaigns. This section will grow with templates, checklists, and guides.</DyslexiaText>
      <View style={{ height: 12 }} />
      <Text style={s.h2}>Templates & Kits</Text>
      <Link href={("/(tabs)/resources/templates-gallery" as any)} asChild={true}>
        <Text style={s.link}>Template Gallery (letters)</Text>
      </Link>
      <Link href={("/(tabs)/resources/letter-accommodation" as any)} asChild={true}>
        <Text style={s.link}>Accommodation Request Letter</Text>
      </Link>
      <Link href={("/(tabs)/resources/letter-union-request" as any)} asChild={true}>
        <Text style={s.link}>Request Union Support/Representation</Text>
      </Link>
      <View style={{ height: 12 }} />
      <Text style={s.h2}>Meeting Aids</Text>
      <Link href={("/(tabs)/resources/doctor-visit-prep" as any)} asChild={true}>
        <Text style={s.link}>Doctor/Case Manager Visit Prep</Text>
      </Link>
      <Link href={("/(tabs)/resources/case-timeline" as any)} asChild={true}>
        <Text style={s.link}>Case Timeline & Deadlines</Text>
      </Link>
      <View style={{ height: 12 }} />
      <Text style={s.h2}>Campaign Tools</Text>
      <Link href={("/(tabs)/resources/support-directory" as any)} asChild={true}>
        <Text style={s.link}>Support Directory (advocates)</Text>
      </Link>
      <Link href={("/(tabs)/resources/impact-simulator" as any)} asChild={true}>
        <Text style={s.link}>Policy Impact Simulator</Text>
      </Link>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    h2: { color: palette.text, fontWeight: '700', marginTop: 6 },
    link: { color: palette.primary, fontWeight: '600', marginTop: 6 },
  });
}
