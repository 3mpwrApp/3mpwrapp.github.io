import { View, Text, StyleSheet } from 'react-native';

import { useAppPalette } from '../../theme/usePalette';
import { useTranslation } from '../../i18n';

export const options = { href: null };

export default function VoiceHelp() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const s = styles(palette);
  const cmdKeys: Array<[string,string]> = [
    ['voiceHelp.commands.openResources','openResources'],
    ['voiceHelp.commands.openRatings','openRatings'],
    ['voiceHelp.commands.openAdvocacy','openAdvocacy'],
    ['voiceHelp.commands.openCommunity','openCommunity'],
    ['voiceHelp.commands.openSettings','openSettings'],
    ['voiceHelp.commands.openAdminPending','openAdminPending'],
    ['voiceHelp.commands.openRightsExplainer','openRightsExplainer'],
    ['voiceHelp.commands.openDoctorPrep','openDoctorPrep'],
    ['voiceHelp.commands.openA11yLog','openA11yLog'],
    ['voiceHelp.commands.openRehabTracker','openRehabTracker'],
    ['voiceHelp.commands.openWorldMap','openWorldMap'],
    ['voiceHelp.commands.openMediaStudio','openMediaStudio'],
    ['voiceHelp.commands.goBack','goBack']
  ];
  return (
    <View style={s.container} accessibilityLabel={t('voiceHelp.title','Voice Help')}>
      <Text style={s.title}>{t('voiceHelp.title','Voice Help')}</Text>
      <Text style={s.text}>{t('voiceHelp.intro','Press the mic and say a command:')}</Text>
      {cmdKeys.map(([k,id]) => (
        <Text key={id} style={s.text}>• {t(k)}</Text>
      ))}
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
