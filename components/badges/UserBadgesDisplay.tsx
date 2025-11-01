import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '../../hooks/useThemeColor';
import { useTranslation } from '../../i18n';
import { useProfileLocal } from '../../store/profileLocal';
import { GapView } from '../GapView';

import type { BadgeType } from './UserBadge';
import UserBadge from './UserBadge';

export default function UserBadgesDisplay() {
  const textColor = useThemeColor({}, 'text');
  const { t } = useTranslation();
  const { profile } = useProfileLocal();

  const badges = profile.badges || {};
  const badgeEntries = Object.entries(badges) as [BadgeType, any][];

  if (badgeEntries.length === 0) {
    return null; // Don't show empty badges section
  }

  return (
    <View style={styles.container}>
      <Text
        style={[styles.heading, { color: textColor }]}
        accessibilityRole="header"
      >
        {t('profile.badges.title', 'Badges')}
      </Text>
      
      <Text
        style={[styles.description, { color: textColor, opacity: 0.7 }]}
      >
        {t('profile.badges.description', 'Recognition for your participation and contributions')}
      </Text>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessible={true}
        accessibilityLabel={t(
          'profile.badges.scrollLabel',
          'Scroll through your badges'
        )}
      >
        <GapView gap={12} style={{ flexDirection: 'row', paddingVertical: 4 }}>
          {badgeEntries.map(([type, data]) => (
            <UserBadge
              key={type}
              type={type}
              data={data}
              size="medium"
              showLabel={true}
            />
          ))}
        </GapView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  scrollContent: {
    paddingVertical: 4,
  },
});
