import { Pressable, StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
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
      <DisclaimerBanner type="medical" compact={true} />
      <Text style={s.points}>{t('wellness.resilience.points','Points: {{points}}',{ points: rs.points })}</Text>
      <GapView gap={8}>
        {rs.actions.map(a => (
          <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" key={a.id} style={s.action} onPress={()=> rs.award(a.id)}>
            <Text style={{ color: palette.text }}>{a.icon} {t(a.tKey, a.name)} (+{a.points})</Text>
          </Pressable>
        ))}
      </GapView>
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
