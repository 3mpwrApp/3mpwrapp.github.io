/**
 * Simple Mode Welcome Banner
 * 
 * Friendly message for users in Simple mode explaining reduced features
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useComplexityMode } from '../store/complexityMode';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

type SimpleModeWelcomeProps = {
  tabName: string;
  availableFeatures?: string[];
  hiddenCount?: number;
};

export default function SimpleModeWelcome({ tabName, availableFeatures, hiddenCount }: SimpleModeWelcomeProps) {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const { mode, isBadDayMode } = useComplexityMode();
  const router = useRouter();

  // Only show in Simple mode
  if (mode !== 'simple' && !isBadDayMode) return null;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: palette.primary + '15',
      borderWidth: 1,
      borderColor: palette.primary,
      borderRadius: 12,
      padding: 16,
      marginVertical: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.primary,
      marginLeft: 8,
      flex: 1,
    },
    message: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    featureList: {
      marginVertical: 8,
    },
    feature: {
      fontSize: 13,
      color: palette.text,
      lineHeight: 18,
      marginLeft: 16,
    },
    link: {
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: palette.primary,
      borderRadius: 6,
      alignItems: 'center',
    },
    linkText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.onPrimary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={24} color={palette.primary} />
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {isBadDayMode ? t('components.simpleMode.badDayActive', '🌙 Bad Day Mode Active') : t('components.simpleMode.simpleModeActive', '🎯 Simple Mode Active')}
        </Text>
      </View>
      
      <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {isBadDayMode 
          ? t('components.simpleMode.badDayMessage', `You're in Bad Day Mode. Showing only essential {{tabName}} features to reduce overwhelm.`, { tabName })
          : t('components.simpleMode.simpleModeMessage', `You're in Simple Mode. Showing {{count}} essential {{tabName}} feature{{plural}}.`, { 
              count: availableFeatures?.length || 'core',
              tabName,
              plural: (availableFeatures?.length || 0) === 1 ? '' : 's'
            })}
      </Text>

      {availableFeatures && availableFeatures.length > 0 && (
        <View style={styles.featureList}>
          {availableFeatures.map((feature, index) => (
            <Text key={index} style={styles.feature} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              • {feature}
            </Text>
          ))}
        </View>
      )}

      {hiddenCount !== undefined && hiddenCount > 0 && (
        <Text style={[styles.message, { fontSize: 13, opacity: 0.8 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('components.simpleMode.hiddenFeatures', '{{count}} advanced feature{{plural}} {{verb}} hidden. Need more tools?', {
            count: hiddenCount,
            plural: hiddenCount === 1 ? '' : 's',
            verb: hiddenCount === 1 ? 'is' : 'are'
          })}
        </Text>
      )}

      <A11yPressable 
        onPress={() => router.push('/(tabs)/settings')}
        style={styles.link}
        hitSlop={HIT_SLOP_8}
        accessibilityLabel={t('components.simpleMode.settingsLabel', 'Change complexity mode settings')}
      >
        <Text style={styles.linkText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('components.simpleMode.seeMore', 'See More Features (Settings)')}
        </Text>
      </A11yPressable>
    </View>
  );
}
