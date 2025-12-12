/**
 * Movement & Rehab Hub - Power Tool
 * 
 * Consolidates 10 physical wellness features into 4 tabs:
 * - Exercise: Exercise Hub, Exercise Favorites
 * - Rehab: Movement Rehab Hub, Rehab Games
 * - Adaptive: Micro-Movement, Functional Capacity
 * - Recovery: Grief Support, Resilience
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import PowerTool, {
    PowerToolAction,
    PowerToolSection,
    PowerToolTabContent,
    type PowerToolTab,
    type PowerToolTabProps,
} from '../../../components/PowerTool';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { logEvent } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';


// ============================================
// TAB 1: EXERCISE (Simple Mode)
// ============================================
function ExerciseTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const [favoriteExercises] = useState([
    { id: 'stretch-1', emoji: '🧘', name: 'Gentle Stretching', duration: '10 min', difficulty: 'Easy' },
    { id: 'chair-1', emoji: '🪑', name: 'Chair Exercises', duration: '15 min', difficulty: 'Easy' },
    { id: 'breath-1', emoji: '🌬️', name: 'Breathing Exercises', duration: '5 min', difficulty: 'Easy' },
  ]);

  const exerciseCategories = [
    { id: 'all', emoji: '🏃', name: 'All Exercises', count: 45 },
    { id: 'seated', emoji: '🪑', name: 'Seated/Chair', count: 12 },
    { id: 'stretching', emoji: '🧘', name: 'Stretching', count: 15 },
    { id: 'strength', emoji: '💪', name: 'Strength', count: 10 },
    { id: 'balance', emoji: '⚖️', name: 'Balance', count: 8 },
  ];

  const styles = createExerciseStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Energy-Aware Notice */}
      <View style={[styles.notice, { backgroundColor: palette.primary + '15' }]}>
        <Text style={styles.noticeEmoji}>💡</Text>
        <Text style={[styles.noticeText, { color: palette.text }]}>
          {t('movement.notice.energy', 'Exercises are filtered to match your energy level')}
        </Text>
      </View>

      <GapView style={{ height: 16 }} />

      {/* Favorites */}
      <PowerToolSection title={t('movement.favorites.title', 'Your Favorites')}>
        {favoriteExercises.map((ex) => (
          <A11yPressable
            key={ex.id}
            onPress={() => {
              logEvent('movement.exercise.start', { exercise: ex.id });
              router.push({
                pathname: '/wellness/exercise-hub',
                params: { exercise: ex.id },
              } as any);
            }}
            accessibilityLabel={`${ex.name}, ${ex.duration}, ${ex.difficulty}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.exerciseCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.exerciseEmoji}>{ex.emoji}</Text>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: palette.text }]}>{ex.name}</Text>
              <Text style={[styles.exerciseMeta, { color: palette.secondaryText }]}>
                {ex.duration} • {ex.difficulty}
              </Text>
            </View>
            <Ionicons name="play-circle" size={32} color={palette.primary} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Browse Categories */}
      <PowerToolSection title={t('movement.browse.title', 'Browse Exercises')}>
        <View style={styles.categoryGrid}>
          {exerciseCategories.map((cat) => (
            <A11yPressable
              key={cat.id}
              onPress={() => {
                logEvent('movement.category.select', { category: cat.id });
                router.push({
                  pathname: '/wellness/exercise-hub',
                  params: { category: cat.id },
                } as any);
              }}
              accessibilityLabel={`${cat.name}, ${cat.count} exercises`}
              hitSlop={HIT_SLOP_8}
              style={[styles.categoryCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryName, { color: palette.text }]}>{cat.name}</Text>
              <Text style={[styles.categoryCount, { color: palette.secondaryText }]}>
                {cat.count}
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('movement.rehab.explore', 'Explore Rehab Exercises')}
        icon="medical"
        onPress={() => navigateToTab('rehab')}
      />
    </PowerToolTabContent>
  );
}

const createExerciseStyles = (_palette: any) => StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  noticeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    marginTop: 4,
  },
});


// ============================================
// TAB 2: REHAB (Standard Mode)
// ============================================
function RehabTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const rehabPrograms = [
    { id: 'mobility', emoji: '🦵', name: 'Mobility Recovery', desc: 'Joint and muscle flexibility', weeks: 4 },
    { id: 'strength', emoji: '💪', name: 'Strength Building', desc: 'Gradual strength recovery', weeks: 6 },
    { id: 'balance', emoji: '⚖️', name: 'Balance Training', desc: 'Stability and coordination', weeks: 4 },
    { id: 'pain', emoji: '🩹', name: 'Pain Management', desc: 'Exercises for chronic pain', weeks: 8 },
  ];

  const rehabGames = [
    { id: 'range', emoji: '🎯', name: 'Range of Motion', desc: 'Track your progress' },
    { id: 'posture', emoji: '🧍', name: 'Posture Check', desc: 'Improve alignment' },
    { id: 'breath', emoji: '🌬️', name: 'Breath Pacer', desc: 'Guided breathing' },
  ];

  const styles = createRehabStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Rehab Programs */}
      <PowerToolSection title={t('rehab.programs.title', 'Rehabilitation Programs')}>
        {rehabPrograms.map((prog) => (
          <A11yPressable
            key={prog.id}
            onPress={() => {
              logEvent('rehab.program.start', { program: prog.id });
              router.push({
                pathname: '/wellness/movement-rehab-hub',
                params: { program: prog.id },
              } as any);
            }}
            accessibilityLabel={prog.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.programCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.programEmoji}>{prog.emoji}</Text>
            <View style={styles.programInfo}>
              <Text style={[styles.programName, { color: palette.text }]}>{prog.name}</Text>
              <Text style={[styles.programDesc, { color: palette.secondaryText }]}>{prog.desc}</Text>
            </View>
            <View style={[styles.weeksBadge, { backgroundColor: palette.primary + '20' }]}>
              <Text style={[styles.weeksText, { color: palette.primary }]}>{prog.weeks}w</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Rehab Games */}
      <PowerToolSection title={t('rehab.games.title', 'Rehab Games')}>
        <View style={styles.gameGrid}>
          {rehabGames.map((game) => (
            <A11yPressable
              key={game.id}
              onPress={() => {
                logEvent('rehab.game.start', { game: game.id });
                Alert.alert(t('common.comingSoon', 'Coming Soon'), game.name);
              }}
              accessibilityLabel={game.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.gameCard, { backgroundColor: palette.primary + '15' }]}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <Text style={[styles.gameName, { color: palette.text }]}>{game.name}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('movement.adaptive.explore', 'Adaptive Movement')}
        icon="accessibility"
        onPress={() => navigateToTab('adaptive')}
      />
    </PowerToolTabContent>
  );
}

const createRehabStyles = (_palette: any) => StyleSheet.create({
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  programEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
  },
  programDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  weeksBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weeksText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gameGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gameCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  gameName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});


// ============================================
// TAB 3: ADAPTIVE (Standard Mode)
// ============================================
function AdaptiveTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const microMovements = [
    { id: 'neck', emoji: '🦒', name: 'Neck Rolls', time: '30 sec' },
    { id: 'shoulders', emoji: '🙆', name: 'Shoulder Shrugs', time: '30 sec' },
    { id: 'wrists', emoji: '✋', name: 'Wrist Circles', time: '30 sec' },
    { id: 'ankles', emoji: '🦶', name: 'Ankle Rotations', time: '30 sec' },
    { id: 'breathing', emoji: '🌬️', name: 'Deep Breaths', time: '1 min' },
  ];

  const functionalCapacity = [
    { id: 'daily', emoji: '🏠', name: 'Daily Activities', desc: 'Track what you can do' },
    { id: 'work', emoji: '💼', name: 'Work Capacity', desc: 'Monitor work abilities' },
    { id: 'social', emoji: '👥', name: 'Social Activities', desc: 'Track social energy' },
  ];

  const styles = createAdaptiveStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Micro-Movements */}
      <PowerToolSection title={t('adaptive.micro.title', 'Micro-Movements')}>
        <Text style={[styles.microHint, { color: palette.secondaryText }]}>
          {t('adaptive.micro.hint', 'Quick movements you can do anytime, anywhere')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.microRow}>
            {microMovements.map((move) => (
              <A11yPressable
                key={move.id}
                onPress={() => {
                  logEvent('adaptive.micro.start', { movement: move.id });
                  Alert.alert(move.name, `${move.time} - Starting...`);
                }}
                accessibilityLabel={`${move.name}, ${move.time}`}
                hitSlop={HIT_SLOP_8}
                style={[styles.microCard, { backgroundColor: palette.card }]}
              >
                <Text style={styles.microEmoji}>{move.emoji}</Text>
                <Text style={[styles.microName, { color: palette.text }]}>{move.name}</Text>
                <Text style={[styles.microTime, { color: palette.primary }]}>{move.time}</Text>
              </A11yPressable>
            ))}
          </View>
        </ScrollView>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Functional Capacity */}
      <PowerToolSection title={t('adaptive.capacity.title', 'Functional Capacity')}>
        {functionalCapacity.map((cap) => (
          <A11yPressable
            key={cap.id}
            onPress={() => {
              logEvent('adaptive.capacity.open', { capacity: cap.id });
              router.push('/wellness/functional-capacity' as any);
            }}
            accessibilityLabel={cap.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.capacityCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.capacityEmoji}>{cap.emoji}</Text>
            <View style={styles.capacityInfo}>
              <Text style={[styles.capacityName, { color: palette.text }]}>{cap.name}</Text>
              <Text style={[styles.capacityDesc, { color: palette.secondaryText }]}>{cap.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('movement.recovery.explore', 'Recovery & Resilience')}
        icon="heart"
        onPress={() => navigateToTab('recovery')}
      />
    </PowerToolTabContent>
  );
}

const createAdaptiveStyles = (_palette: any) => StyleSheet.create({
  microHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  microRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  microCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  microEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  microName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  microTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  capacityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  capacityEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  capacityInfo: {
    flex: 1,
  },
  capacityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  capacityDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 4: RECOVERY (Power User Mode)
// ============================================
function RecoveryTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const recoveryTools = [
    { id: 'grief', emoji: '💔', name: 'Grief Support', desc: 'Process loss and grief' },
    { id: 'resilience', emoji: '🌱', name: 'Resilience Builder', desc: 'Build mental strength' },
    { id: 'rest', emoji: '😴', name: 'Rest Planning', desc: 'Strategic rest and recovery' },
    { id: 'flare', emoji: '🔥', name: 'Flare Management', desc: 'Handle symptom flares' },
  ];

  const styles = createRecoveryStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Recovery Tools */}
      <PowerToolSection title={t('recovery.tools.title', 'Recovery & Resilience Tools')}>
        {recoveryTools.map((tool) => (
          <A11yPressable
            key={tool.id}
            onPress={() => {
              logEvent('recovery.tool.open', { tool: tool.id });
              router.push({
                pathname: '/wellness/resilience',
                params: { tool: tool.id },
              } as any);
            }}
            accessibilityLabel={tool.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.toolCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.toolEmoji}>{tool.emoji}</Text>
            <View style={styles.toolInfo}>
              <Text style={[styles.toolName, { color: palette.text }]}>{tool.name}</Text>
              <Text style={[styles.toolDesc, { color: palette.secondaryText }]}>{tool.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Progress Tracking */}
      <PowerToolSection title={t('recovery.progress.title', 'Recovery Progress')}>
        <View style={[styles.progressCard, { backgroundColor: palette.primary + '15' }]}>
          <Text style={[styles.progressTitle, { color: palette.text }]}>
            {t('recovery.progress.streak', 'Your Recovery Streak')}
          </Text>
          <Text style={[styles.progressNumber, { color: palette.primary }]}>7</Text>
          <Text style={[styles.progressLabel, { color: palette.secondaryText }]}>
            {t('recovery.progress.days', 'days of consistent self-care')}
          </Text>
        </View>
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

const createRecoveryStyles = (_palette: any) => StyleSheet.create({
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  progressCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function MovementPowerTool() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'exercise',
      label: t('movement.tabs.exercise', 'Exercise'),
      icon: '🏃',
      component: ExerciseTab,
      complexity: 'simple',
      keywords: ['exercise', 'workout', 'stretching', 'fitness'],
    },
    {
      id: 'rehab',
      label: t('movement.tabs.rehab', 'Rehab'),
      icon: '🏥',
      component: RehabTab,
      complexity: 'standard',
      keywords: ['rehabilitation', 'recovery', 'therapy', 'mobility'],
    },
    {
      id: 'adaptive',
      label: t('movement.tabs.adaptive', 'Adaptive'),
      icon: '♿',
      component: AdaptiveTab,
      complexity: 'standard',
      keywords: ['adaptive', 'micro', 'functional', 'capacity'],
    },
    {
      id: 'recovery',
      label: t('movement.tabs.recovery', 'Recovery'),
      icon: '🌱',
      component: RecoveryTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['grief', 'resilience', 'rest', 'flare'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('movement.title', 'Movement & Rehab Hub')}
        subtitle={t('movement.subtitle', 'Exercise, rehabilitation & adaptive movement')}
        icon="💪"
        tabs={tabs}
        defaultTab="exercise"
        showSearch
        searchPlaceholder={t('movement.search', 'Search exercises...')}
        analyticsPrefix="movement_rehab"
      />
    </ResponsiveScreenWrapper>
  );
}

