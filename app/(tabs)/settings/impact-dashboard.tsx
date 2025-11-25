/**
 * Impact Score Dashboard
 * 
 * Gamified view of user's advocacy impact with level progression,
 * shareable cards, and detailed metrics
 */

/* eslint-disable no-restricted-syntax */

import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { useTranslation } from '../../../i18n';
import {
    calculateImpactPoints,
    getAdvocacyLevel,
    getImpactMetrics,
    getNextLevel,
    syncImpactMetrics,
    type ImpactMetrics
} from '../../../services/impactScore';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

const MAX_FONT_SCALE = 1.4;

export default function ImpactDashboard() {
  const palette = useAppPalette();
  const { t: _t } = useTranslation();
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);
  
  useEffect(() => {
    loadMetrics();
  }, []);
  
  const loadMetrics = async () => {
    setLoading(true);
    try {
      await syncImpactMetrics();
      const data = await getImpactMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading impact metrics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Your Impact!',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }
  
  if (!metrics) return null;
  
  const points = calculateImpactPoints(metrics);
  const level = getAdvocacyLevel(points);
  const { next, progress, pointsNeeded } = getNextLevel(points);
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Shareable Impact Card */}
      <View 
        ref={cardRef} 
        style={[styles.card, { backgroundColor: palette.surface }]}
        collapsable={false}
      >
        <View style={styles.levelBadge}>
          <Text style={styles.levelIcon} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {level.icon}
          </Text>
          <Text style={[styles.levelTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {level.title}
          </Text>
          <Text style={[styles.levelDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {level.description}
          </Text>
        </View>
        
        <View style={styles.pointsBadge}>
          <Text style={[styles.pointsValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {points}
          </Text>
          <Text style={[styles.pointsLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Impact Points
          </Text>
        </View>
        
        {next && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {pointsNeeded} points to {next.title} {next.icon}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: palette.muted }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: palette.primary, width: `${Math.min(progress, 100)}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        <Text style={[styles.appTag, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Powered by 3mpwr App
        </Text>
      </View>
      
      {/* Share Button */}
      <Pressable
        onPress={handleShare}
        disabled={sharing}
        style={[styles.shareButton, { backgroundColor: palette.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Share your impact"
      >
        {sharing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Share Your Impact
            </Text>
          </>
        )}
      </Pressable>
      
      {/* Detailed Metrics */}
      <View style={[styles.metricsSection, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Your Advocacy Impact
        </Text>
        
        <MetricRow
          icon="📝"
          label="Letters Sent"
          value={metrics.lettersSent}
          points={metrics.lettersSent * 10}
          color={palette}
        />
        
        <MetricRow
          icon="🎯"
          label="Appeals Won"
          value={metrics.appealsWon}
          points={metrics.appealsWon * 100}
          color={palette}
        />
        
        {metrics.appealsInProgress > 0 && (
          <MetricRow
            icon="⏳"
            label="Appeals In Progress"
            value={metrics.appealsInProgress}
            points={metrics.appealsInProgress * 25}
            color={palette}
          />
        )}
        
        {metrics.benefitsSecured > 0 && (
          <MetricRow
            icon="💰"
            label="Benefits Secured"
            value={`$${metrics.benefitsSecured.toLocaleString()}/year`}
            points={Math.floor(metrics.benefitsSecured / 100)}
            color={palette}
          />
        )}
        
        <MetricRow
          icon="🤝"
          label="People Helped"
          value={metrics.communityHelped}
          points={metrics.communityHelped * 30}
          color={palette}
        />
        
        <MetricRow
          icon="📅"
          label="Days Advocating"
          value={metrics.daysAdvocating}
          points={Math.min(metrics.daysAdvocating * 2, 730)}
          color={palette}
        />
      </View>
      
      {/* Wellness Metrics */}
      <View style={[styles.metricsSection, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Wellness Journey
        </Text>
        
        <MetricRow
          icon="🔒"
          label="Evidence Items"
          value={metrics.evidenceItems}
          points={metrics.evidenceItems * 5}
          color={palette}
        />
        
        <MetricRow
          icon="😊"
          label="Mood Logs"
          value={metrics.moodLogsCompleted}
          points={Math.min(metrics.moodLogsCompleted * 2, 200)}
          color={palette}
        />
        
        <MetricRow
          icon="⚡"
          label="Pacing Activities"
          value={metrics.pacingActivities}
          points={Math.min(metrics.pacingActivities * 2, 200)}
          color={palette}
        />
        
        <MetricRow
          icon="💪"
          label="Skills Used"
          value={metrics.skillsUsed}
          points={metrics.skillsUsed * 3}
          color={palette}
        />
      </View>
      
      {/* Refresh Button */}
      <Pressable
        onPress={loadMetrics}
        style={[styles.refreshButton, { borderColor: palette.muted }]}
        accessibilityRole="button"
        accessibilityLabel="Refresh metrics"
      >
        <Ionicons name="refresh" size={20} color={palette.primary} />
        <Text style={[styles.refreshText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Refresh Metrics
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function MetricRow({ 
  icon, 
  label, 
  value, 
  points, 
  color 
}: { 
  icon: string; 
  label: string; 
  value: number | string; 
  points: number; 
  color: any;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricIcon} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {icon}
      </Text>
      <View style={styles.metricContent}>
        <Text style={[styles.metricLabel, { color: color.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
        </Text>
        <Text style={[styles.metricValue, { color: color.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {value}
        </Text>
      </View>
      <Text style={[styles.metricPoints, { color: color.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        +{points}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  levelBadge: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: 16,
    textAlign: 'center',
  },
  pointsBadge: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  appTag: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricsSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  metricIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    marginTop: 2,
  },
  metricPoints: {
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
