import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/a11y';
import { useAppPalette } from '../theme/usePalette';
import type { ProvinceCode } from '../types/models';

import A11yPressable from './A11yPressable';

const CODES: ProvinceCode[] = [
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'
];

export function ProvincePicker({ value, onChange }: { value?: string | null; onChange: (p: ProvinceCode | '') => void; }) {
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.wrap} accessibilityLabel="Province picker">
      <Text style={s.label}>Province</Text>
      <View style={s.row}>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel="All provinces"
          onPress={() => onChange('' as any)}
          style={[s.chip, (!value || value==='') && s.active]}
        >
          <Text style={[s.text, (!value || value==='') && s.textActive]}>All</Text>
        </A11yPressable>
        {CODES.map((code) => (
          <A11yPressable
            key={code}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={`Province ${code}`}
            onPress={() => onChange(code)}
            style={[s.chip, value === code && s.active]}
          >
            <Text style={[s.text, value === code && s.textActive]}>{code}</Text>
          </A11yPressable>
        ))}
      </View>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    wrap: { marginBottom: 8 },
    label: { color: palette.text, opacity: 0.8, marginBottom: 4 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface },
    active: { backgroundColor: palette.primary, borderColor: palette.primary },
    text: { color: palette.text, fontWeight: '700' },
    textActive: { color: palette.onPrimary },
  });
}

export default ProvincePicker;
