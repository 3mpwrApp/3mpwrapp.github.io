/**
 * Enhanced Mood Tracker Component
 * Displays insights, patterns, coping strategies, streaks, and achievements
 */

import { Link } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import {
    calculateStreaks,
    detectPatterns,
    getMoodAchievements,
    suggestCopingStrategies,
    type CopingStrategy,
    type MoodAchievement,
    type MoodPattern,
    type MoodStreak,
} from '../services/moodInsights';
import type { MoodEntry } from '../store/mood';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

interface MoodInsightsProps {
  entries: MoodEntry[];
  currentScore?: number;
}

export default function MoodInsights({ entries, currentScore }: MoodInsightsProps) {
  const palette = useAppPalette();

  const patterns = useMemo(() => detectPatterns(entries), [entries]);
  const strategies = useMemo(
    () => (currentScore !== undefined && currentScore !== null) 
      ? suggestCopingStrategies(currentScore, entries.slice(0, 14))
      : [],
    [currentScore, entries]
  );
  const streaks = useMemo(() => calculateStreaks(entries), [entries]);
  const achievements = useMemo(() => getMoodAchievements(entries, streaks), [entries, streaks]);

  if (entries.length < 3) {
    return (
      <View style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
        <Text style={[styles.emptyTitle, { color: palette.text }]}>✨ Start Your Journey</Text>
        <Text style={[styles.emptyText, { color: palette.text }]}>
          Log a few more mood entries to unlock insights, patterns, and personalized suggestions!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: palette.background }}>
      {/* Active Streaks */}
      {streaks.length > 0 && (
        <View style={[styles.section, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>🔥 Active Streaks</Text>
          {streaks.map((streak, idx) => (
            <StreakCard key={idx} streak={streak} palette={palette} />
          ))}
        </View>
      )}

      {/* Coping Strategies */}
      {strategies.length > 0 && currentScore !== undefined && (
        <View style={[styles.section, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            💡 Suggested for You
          </Text>
          <Text style={[styles.sectionSubtitle, { color: palette.text }]}>
            Based on your current mood
          </Text>
          <GapView gap={12} style={{ marginTop: 12 }}>
            {strategies.map((strategy) => (
              <CopingStrategyCard key={strategy.id} strategy={strategy} palette={palette} />
            ))}
          </GapView>
        </View>
      )}

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <View style={[styles.section, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>📊 Mood Patterns</Text>
          {patterns.map((pattern, idx) => (
            <PatternCard key={idx} pattern={pattern} palette={palette} />
          ))}
        </View>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <View style={[styles.section, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>🏆 Achievements</Text>
          <GapView gap={8} style={{ marginTop: 8 }}>
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} palette={palette} />
            ))}
          </GapView>
        </View>
      )}

      {/* Integration Links */}
      <View style={[styles.section, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.primary }]}>
          🔗 Connect Your Wellness
        </Text>
        <Text style={[styles.sectionSubtitle, { color: palette.text }]}>
          Explore related tools for holistic support
        </Text>
        <GapView gap={8} style={{ marginTop: 12 }}>
          <Link href="/(tabs)/wellness/pacing-partner" asChild>
            <A11yPressable
              style={[styles.linkCard, { borderColor: palette.muted }]}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="link"
              accessibilityLabel="Navigate to Pacing Partner"
              accessibilityHint="Manage your energy levels and avoid overexertion"
            >
              <View>
                <Text style={[styles.linkTitle, { color: palette.text }]}>
                  ⚡ Pacing Partner
                </Text>
                <Text style={[styles.linkSubtitle, { color: palette.text }]}>
                  Low mood may signal low energy. Track your activity levels.
                </Text>
              </View>
            </A11yPressable>
          </Link>

          <Link href="/(tabs)/wellness/self-care-library" asChild>
            <A11yPressable
              style={[styles.linkCard, { borderColor: palette.muted }]}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="link"
              accessibilityLabel="Navigate to Self-Care Library"
              accessibilityHint="Browse self-care resources and activities"
            >
              <View>
                <Text style={[styles.linkTitle, { color: palette.text }]}>
                  🌿 Self-Care Library
                </Text>
                <Text style={[styles.linkSubtitle, { color: palette.text }]}>
                  Discover activities tailored to your current mood.
                </Text>
              </View>
            </A11yPressable>
          </Link>

          <Link href="/(tabs)/community" asChild>
            <A11yPressable
              style={[styles.linkCard, { borderColor: palette.muted }]}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="link"
              accessibilityLabel="Navigate to Community"
              accessibilityHint="Connect with others for support"
            >
              <View>
                <Text style={[styles.linkTitle, { color: palette.text }]}>
                  👥 Community Support
                </Text>
                <Text style={[styles.linkSubtitle, { color: palette.text }]}>
                  You're not alone. Connect with others who understand.
                </Text>
              </View>
            </A11yPressable>
          </Link>
        </GapView>
      </View>
    </ScrollView>
  );
}

// Subcomponents

function StreakCard({ streak, palette }: { streak: MoodStreak; palette: ReturnType<typeof useAppPalette> }) {
  const getStreakInfo = () => {
    switch (streak.type) {
      case 'logging':
        return {
          icon: '📅',
          title: 'Consistent Tracker',
          description: `${streak.count} days in a row`,
        };
      case 'positive':
        return {
          icon: '😊',
          title: 'Positive Streak',
          description: `${streak.count} good mood entries`,
        };
      case 'stable':
        return {
          icon: '⚖️',
          title: 'Stable Mood',
          description: `${streak.count} days of emotional balance`,
        };
      default:
        return { icon: '✨', title: 'Streak', description: `${streak.count} days` };
    }
  };

  const info = getStreakInfo();

  return (
    <View
      style={[styles.card, { backgroundColor: palette.background, borderLeftColor: palette.primary }]}
      accessibilityLabel={`${info.title}: ${info.description}`}
    >
      <Text style={[styles.cardIcon, { color: palette.text }]}>{info.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{info.title}</Text>
        <Text style={[styles.cardDescription, { color: palette.text }]}>{info.description}</Text>
      </View>
    </View>
  );
}

function CopingStrategyCard({ strategy, palette }: { strategy: CopingStrategy; palette: ReturnType<typeof useAppPalette> }) {
  const categoryIcons = {
    breathing: '🫁',
    movement: '🚶',
    social: '💬',
    mindfulness: '🧘',
    creative: '🎨',
    rest: '🛌',
  };

  return (
    <View
      style={[styles.strategyCard, { backgroundColor: palette.background, borderColor: palette.muted }]}
      accessibilityLabel={`${strategy.title}. ${strategy.description}. Estimated time: ${strategy.estimatedMinutes} minutes.`}
    >
      <View style={styles.strategyHeader}>
        <Text style={[styles.strategyIcon, { color: palette.text }]}>
          {categoryIcons[strategy.category]}
        </Text>
        <Text style={[styles.strategyTitle, { color: palette.text }]}>{strategy.title}</Text>
      </View>
      <Text style={[styles.strategyDescription, { color: palette.text }]}>
        {strategy.description}
      </Text>
      <Text style={[styles.strategyTime, { color: palette.muted }]}>
        ⏱ {strategy.estimatedMinutes} min
      </Text>
    </View>
  );
}

function PatternCard({ pattern, palette }: { pattern: MoodPattern; palette: ReturnType<typeof useAppPalette> }) {
  const typeIcons = {
    daily: '🌅',
    weekly: '📅',
    trigger: '⚠️',
    seasonal: '🍂',
  };

  return (
    <View
      style={[styles.patternCard, { backgroundColor: palette.background }]}
      accessibilityLabel={`Pattern detected: ${pattern.description}. Confidence: ${Math.round(pattern.confidence * 100)}%. ${pattern.suggestion || ''}`}
    >
      <View style={styles.patternHeader}>
        <Text style={[styles.patternIcon, { color: palette.text }]}>
          {typeIcons[pattern.type]}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.patternDescription, { color: palette.text }]}>
            {pattern.description}
          </Text>
          <View style={[styles.confidenceBar, { backgroundColor: palette.muted }]}>
            <View
              style={[
                styles.confidenceFill,
                { backgroundColor: palette.primary, width: `${pattern.confidence * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>
      {pattern.suggestion && (
        <Text style={[styles.patternSuggestion, { color: palette.text }]}>
          💡 {pattern.suggestion}
        </Text>
      )}
    </View>
  );
}

function AchievementCard({ achievement, palette }: { achievement: MoodAchievement; palette: ReturnType<typeof useAppPalette> }) {
  const isUnlocked = achievement.progress === 100;

  return (
    <View
      style={[
        styles.achievementCard,
        { backgroundColor: palette.background, borderColor: isUnlocked ? palette.primary : palette.muted },
        !isUnlocked && { opacity: 0.6 },
      ]}
      accessibilityLabel={`${achievement.title}. ${achievement.description}. ${isUnlocked ? 'Unlocked' : `Progress: ${Math.round(achievement.progress || 0)}%`}`}
    >
      <Text style={[styles.achievementIcon, { color: palette.text }]}>{achievement.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.achievementTitle, { color: palette.text }]}>{achievement.title}</Text>
        <Text style={[styles.achievementDescription, { color: palette.text }]}>
          {achievement.description}
        </Text>
        {!isUnlocked && achievement.progress !== undefined && (
          <View style={[styles.progressBar, { backgroundColor: palette.muted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: palette.primary, width: `${achievement.progress}%` },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  strategyCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  strategyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  strategyDescription: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 6,
  },
  strategyTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  patternCard: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  patternIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  patternDescription: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
  },
  patternSuggestion: {
    fontSize: 14,
    opacity: 0.85,
    marginTop: 8,
    fontStyle: 'italic',
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  linkCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
});
