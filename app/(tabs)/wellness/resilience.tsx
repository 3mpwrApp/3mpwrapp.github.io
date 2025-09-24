import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useResilience } from '../../../store/resilience';
import { useAppPalette } from '../../../theme/usePalette';

export default function ResiliencePoints() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const rs = useResilience();
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.resilience.title','Resilience Points')}</Text>
      <Text style={s.points}>{t('wellness.resilience.points','Points: {{points}}',{ points: rs.points })}</Text>
      <View style={{ gap:8 }}>
        {rs.actions.map(a => (
          <Pressable key={a.id} style={s.action} onPress={()=> rs.award(a.id)}>
            <Text style={{ color: palette.text }}>{a.icon} {t(a.tKey, a.name)} (+{a.points})</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    points:{ color: palette.text, fontWeight:'700', marginBottom:8 },
    action:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12 }
  });
}
