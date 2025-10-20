import { StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '../../hooks/useThemeColor';
import { useTranslation } from '../../i18n';

export type BadgeType = 'betaTester' | 'earlyAdopter' | 'contributor' | 'verified';

interface BadgeData {
  awarded: string; // ISO date
  phase?: 'closed' | 'open' | 'rc';
  metadata?: Record<string, any>;
}

export interface UserBadgeProps {
  type: BadgeType;
  data: BadgeData;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const BADGE_ICONS: Record<BadgeType, string> = {
  betaTester: '🏅',
  earlyAdopter: '🌟',
  contributor: '💪',
  verified: '✅',
};

// Badge colors - using standard web colors that work across themes
// These are intentionally hardcoded as they represent badge identity/branding
 
const BADGE_COLORS: Record<BadgeType, string> = {
  betaTester: '#FF6B35', // Orange for beta
  earlyAdopter: '#FFD700', // Gold for early adopters
  contributor: '#4ECDC4', // Teal for contributors
  verified: '#4CAF50', // Green for verified
};

export default function UserBadge({ 
  type, 
  data, 
  size = 'medium',
  showLabel = true 
}: UserBadgeProps) {
  const textColor = useThemeColor({}, 'text');
  const { t } = useTranslation();

  const sizeStyles = {
    small: { iconSize: 16, fontSize: 12, padding: 4, gap: 4 },
    medium: { iconSize: 20, fontSize: 14, padding: 6, gap: 6 },
    large: { iconSize: 24, fontSize: 16, padding: 8, gap: 8 },
  };

  const currentSize = sizeStyles[size];
  const badgeColor = BADGE_COLORS[type];
  const icon = BADGE_ICONS[type];

  // Get localized badge name
  const getBadgeName = (): string => {
    switch (type) {
      case 'betaTester':
        return t('profile.badges.betaTester', 'Beta Tester');
      case 'earlyAdopter':
        return t('profile.badges.earlyAdopter', 'Early Adopter');
      case 'contributor':
        return t('profile.badges.contributor', 'Contributor');
      case 'verified':
        return t('profile.badges.verified', 'Verified');
      default:
        return type;
    }
  };

  // Get badge description/tooltip
  const getBadgeDescription = (): string => {
    switch (type) {
      case 'betaTester':
        return t('profile.badges.betaTesterDesc', 'Participated in beta testing');
      case 'earlyAdopter':
        return t('profile.badges.earlyAdopterDesc', 'Joined during early access');
      case 'contributor':
        return t('profile.badges.contributorDesc', 'Contributed to the app');
      case 'verified':
        return t('profile.badges.verifiedDesc', 'Verified user');
      default:
        return '';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          padding: currentSize.padding,
          gap: currentSize.gap,
          borderColor: badgeColor,
          backgroundColor: `${badgeColor}15`,
        },
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${getBadgeName()} badge. ${getBadgeDescription()}`}
    >
      <Text
        style={[styles.icon, { fontSize: currentSize.iconSize }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {icon}
      </Text>
      
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              fontSize: currentSize.fontSize,
              color: textColor,
            },
          ]}
          numberOfLines={1}
        >
          {getBadgeName()}
        </Text>
      )}

      {data.phase && type === 'betaTester' && (
        <Text
          style={[
            styles.phase,
            {
              fontSize: currentSize.fontSize - 2,
              color: textColor,
              opacity: 0.7,
            },
          ]}
          numberOfLines={1}
        >
          ({data.phase})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    lineHeight: undefined, // Let platform handle
  },
  label: {
    fontWeight: '600',
  },
  phase: {
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
