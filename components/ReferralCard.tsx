/**
 * ReferralCard - Share your referral code and track rewards
 * 
 * Used in Settings and Profile screens to encourage viral growth.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { trackReferralCodeShared } from '../services/analyticsTracking';
import {
    getNextRewardMilestone,
    getReferralShareMessage,
    getReferralStats,
    type ReferralStats,
} from '../services/referral';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

interface ReferralCardProps {
  compact?: boolean;
}

export default function ReferralCard({ compact = false }: ReferralCardProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!stats) return;
    
    await Clipboard.setStringAsync(stats.myCode);
    setCopied(true);
    trackReferralCodeShared('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!stats) return;
    
    const { title, message, url } = getReferralShareMessage(stats.myCode);
    
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        // Note: Expo Sharing doesn't support text directly, would need Share API
        Alert.alert(
          title,
          `${message}\n\n${url}`,
          [
            { text: t('common.copy', 'Copy'), onPress: handleCopy },
            { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          ]
        );
        trackReferralCodeShared('share');
      } else {
        handleCopy();
      }
    } catch {
      handleCopy();
    }
  };

  const styles = createStyles(palette, compact);
  const nextMilestone = stats ? getNextRewardMilestone(stats.successfulReferrals) : null;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (!stats) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🎁</Text>
        <View style={styles.headerText}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('referral.title', 'Invite Friends')}
          </Text>
          {!compact && (
            <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('referral.subtitle', 'Share 3mpwr and earn rewards')}
            </Text>
          )}
        </View>
      </View>

      {!compact && <GapView style={{ height: 16 }} />}

      {/* Referral Code */}
      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('referral.yourCode', 'Your referral code')}
        </Text>
        <View style={styles.codeRow}>
          <Text style={styles.code} selectable maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {stats.myCode}
          </Text>
          <A11yPressable
            onPress={handleCopy}
            accessibilityLabel={copied ? 'Copied' : 'Copy code'}
            hitSlop={HIT_SLOP_8}
            style={styles.copyButton}
          >
            <Ionicons 
              name={copied ? 'checkmark' : 'copy-outline'} 
              size={20} 
              color={copied ? palette.success : palette.primary} 
            />
          </A11yPressable>
        </View>
      </View>

      {!compact && (
        <>
          <GapView style={{ height: 16 }} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.successfulReferrals}</Text>
              <Text style={styles.statLabel}>
                {t('referral.friends', 'Friends joined')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.rewards.length}</Text>
              <Text style={styles.statLabel}>
                {t('referral.rewards', 'Rewards earned')}
              </Text>
            </View>
          </View>

          {/* Next Milestone */}
          {nextMilestone && (
            <>
              <GapView style={{ height: 12 }} />
              <View style={styles.milestone}>
                <Ionicons name="trophy-outline" size={16} color={palette.warning} />
                <Text style={styles.milestoneText}>
                  {t('referral.nextReward', 'Invite {{count}} more for: {{reward}}', {
                    count: nextMilestone.threshold - stats.successfulReferrals,
                    reward: nextMilestone.reward,
                  })}
                </Text>
              </View>
            </>
          )}

          <GapView style={{ height: 16 }} />

          {/* Share Button */}
          <A11yPressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share your referral code"
            hitSlop={HIT_SLOP_8}
            style={styles.shareButton}
          >
            <Ionicons name="share-social-outline" size={20} color={palette.onPrimary} />
            <Text style={styles.shareButtonText}>
              {t('referral.share', 'Share Invite Link')}
            </Text>
          </A11yPressable>
        </>
      )}

      {compact && (
        <A11yPressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share"
          hitSlop={HIT_SLOP_8}
          style={styles.compactShareButton}
        >
          <Ionicons name="share-outline" size={18} color={palette.primary} />
        </A11yPressable>
      )}
    </View>
  );
}

const createStyles = (palette: any, compact: boolean) => StyleSheet.create({
  container: {
    backgroundColor: palette.card,
    borderRadius: compact ? 12 : 16,
    padding: compact ? 12 : 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: compact ? 24 : 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: compact ? 16 : 18,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.secondaryText,
    marginTop: 2,
  },
  codeContainer: {
    marginTop: compact ? 8 : 0,
  },
  codeLabel: {
    fontSize: 12,
    color: palette.secondaryText,
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    fontSize: compact ? 14 : 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: palette.primary,
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
  },
  statLabel: {
    fontSize: 12,
    color: palette.secondaryText,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.warning + '15',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  milestoneText: {
    fontSize: 13,
    color: palette.text,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.onPrimary,
  },
  compactShareButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
});
