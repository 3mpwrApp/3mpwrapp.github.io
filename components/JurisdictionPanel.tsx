import { StyleSheet, Text, View } from 'react-native';

import { useJurisdiction } from '../store/jurisdiction';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

export function JurisdictionPanel() {
  const { code, setCode, data, all } = useJurisdiction();
  const palette = useAppPalette();
  const s = styles(palette);
  return (
  <View style={s.container} accessibilityLabel={`Jurisdiction context ${data?.name || code}`}>   
      <View style={s.headerRow}>
        <Text style={s.header}>Jurisdiction: {data?.name || code}</Text>
        {/* Simple cycle button for now (future: picker modal) */}
        <A11yPressable accessibilityRole="button" accessibilityLabel="Change jurisdiction" onPress={() => {
          const idx = all.findIndex(j => j.code === code);
          const next = all[(idx + 1) % all.length].code;
            setCode(next);
        }} style={s.changeBtn}>
          <Text style={s.changeBtnText}>Change</Text>
        </A11yPressable>
      </View>
      {data?.evidenceFocus?.length ? (
        <View style={s.block}>
          <Text style={s.blockTitle}>Evidence Focus</Text>
          {data.evidenceFocus.map(item => <Text key={item} style={s.item}>• {item}</Text>)}
        </View>
      ) : null}
      {data?.accommodationGuidance?.length ? (
        <View style={s.block}>
          <Text style={s.blockTitle}>Accommodation Principles</Text>
          {data.accommodationGuidance.map(item => <Text key={item} style={s.item}>• {item}</Text>)}
        </View>
      ) : null}
      {data?.limitationNotes?.length ? (
        <View style={s.block}>
          <Text style={s.blockTitle}>Limitations / Deadlines</Text>
          {data.limitationNotes.map(item => <Text key={item} style={s.item}>• {item}</Text>)}
        </View>
      ) : null}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, padding: 12, borderRadius: 10, marginBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    header: { fontWeight: '700', color: palette.text },
    changeBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: palette.primary, borderRadius: 6 },
    changeBtnText: { color: palette.onPrimary, fontWeight: '600' },
    block: { marginTop: 4 },
    blockTitle: { fontWeight: '600', color: palette.text, marginTop: 8 },
    item: { color: palette.text, opacity: 0.9, marginTop: 2 },
  });
}
