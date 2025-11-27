import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useResilience } from '../../../store/resilience';
import { useAppPalette } from '../../../theme/usePalette';

export default function ResiliencePoints() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const rs = useResilience();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Resilience Points');
  useFocusOnRefOnMount(titleRef);

  const MILESTONES = [100, 250, 500, 1000];

  const getPointsLevel = (points: number) => {
    if (points >= 1000) return { level: 'Champion', color: palette.success, icon: '🏆' };
    if (points >= 500) return { level: 'Warrior', color: palette.info, icon: '⚔️' };
    if (points >= 250) return { level: 'Achiever', color: palette.primary, icon: '🌟' };
    if (points >= 100) return { level: 'Builder', color: palette.warning, icon: '🔨' };
    return { level: 'Starter', color: palette.text, icon: '🌱' };
  };

  const level = getPointsLevel(rs.points);
  
  // Find next milestone
  const nextMilestone = MILESTONES.find(m => m > rs.points) || MILESTONES[MILESTONES.length - 1];
  const progress = ((rs.points % nextMilestone) / nextMilestone) * 100;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }}>
      <Text 
        ref={titleRef}
        accessibilityRole="header" 
        style={s.header}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('wellness.resilience.title','Resilience Points')}
      </Text>
      <DisclaimerBanner type="medical" compact={true} />
      
      {/* Points Display Card */}
      <View style={[s.card, { backgroundColor: level.color + '22' }]}>
        <Text style={s.levelIcon}>{level.icon}</Text>
        <Text style={[s.levelText, { color: level.color }]}>{level.level}</Text>
        <Text style={s.pointsLarge}>{rs.points}</Text>
        <Text style={s.pointsLabel}>{t('wellness.resilience.points','Total Points')}</Text>
        
        {/* Progress Bar */}
        <View style={s.progressContainer}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: level.color }]} />
          </View>
          <Text style={s.progressText}>
            {rs.points % nextMilestone}/{nextMilestone} to next level
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={[s.card, { backgroundColor: palette.info + '11' }]}>
        <Text style={s.infoText}>
          🎯 Track your recovery journey by earning points for therapy steps, self-care activities, and daily wins. Each action builds your resilience!
        </Text>
      </View>

      {/* Actions */}
      <Text style={s.sectionTitle}>Earn Points</Text>
      <GapView gap={12}>
        {rs.actions.map(a => (
          <Pressable // a11y-scan: attributes on following lines
            hitSlop={HIT_SLOP_8} 
            accessibilityRole="button" 
            key={a.id} 
            style={s.actionCard} 
            onPress={()=> rs.award(a.id)}
          >
            <View style={s.actionIcon}>
              <Text style={s.actionIconText}>{a.icon}</Text>
            </View>
            <View style={s.actionContent}>
              <Text style={s.actionTitle}>{t(a.tKey, a.name)}</Text>
              <View style={s.actionPoints}>
                <Text style={s.actionPointsText}>+{a.points} points</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </GapView>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container:{ 
      flex:1, 
      backgroundColor: palette.background 
    },
    header:{ 
      color: palette.text, 
      fontSize: 24, 
      fontWeight:'800', 
      marginBottom: 12 
    },
    card: {
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    levelIcon: {
      fontSize: 48,
      marginBottom: 8,
    },
    levelText: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    pointsLarge: {
      fontSize: 48,
      fontWeight: '800',
      color: palette.text,
      marginBottom: 4,
    },
    pointsLabel: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    progressContainer: {
      width: '100%',
      marginTop: 16,
    },
    progressBar: {
      height: 8,
      backgroundColor: palette.muted,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: palette.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    infoText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
    },
    actionCard: { 
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16,
      backgroundColor: palette.surface,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    actionIconText: {
      fontSize: 24,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    actionPoints: {
      alignSelf: 'flex-start',
      backgroundColor: palette.success + '22',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    actionPointsText: {
      color: palette.success,
      fontSize: 12,
      fontWeight: '700',
    },
  });
}
