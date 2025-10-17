import { Ionicons } from '@expo/vector-icons';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '../hooks/useThemeColor';

import A11yPressable from './A11yPressable';

type UserRoleType = 'verified' | 'supporter' | 'ally' | 'admin' | 'pwd';

interface UserRoleBadgeProps {
  role: UserRoleType;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
  showLabel?: boolean;
}

const getRoleConfig = (role: UserRoleType, textColor: string) => {
  const configs = {
    pwd: {
      label: 'Person with Disability',
      icon: 'accessibility-outline' as const,
      color: textColor,
      backgroundColor: `${textColor}15`,
      description: 'Verified person with disability',
    },
    verified: {
      label: 'Verified',
      icon: 'checkmark-circle-outline' as const,
      color: textColor,
      backgroundColor: `${textColor}15`,
      description: 'Verified user account',
    },
    supporter: {
      label: 'Supporter',
      icon: 'heart-circle-outline' as const,
      color: textColor,
      backgroundColor: `${textColor}15`,
      description: 'Verified supporter or family member',
    },
    ally: {
      label: 'Ally',
      icon: 'people-outline' as const,
      color: textColor,
      backgroundColor: `${textColor}15`,
      description: 'Verified advocate or professional ally',
    },
    admin: {
      label: 'Admin',
      icon: 'shield-checkmark-outline' as const,
      color: textColor,
      backgroundColor: `${textColor}15`,
      description: 'Administrator account',
    },
  };

  return configs[role];
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      badgeSize: 24,
      iconSize: 14,
      fontSize: 10,
      padding: 4,
    },
    medium: {
      badgeSize: 32,
      iconSize: 18,
      fontSize: 12,
      padding: 6,
    },
    large: {
      badgeSize: 44,
      iconSize: 24,
      fontSize: 14,
      padding: 8,
    },
  };

  return sizes[size];
};

export default function UserRoleBadge({
  role,
  size = 'medium',
  style,
  onPress,
  showLabel = false,
}: UserRoleBadgeProps) {
  const textColor = useThemeColor({}, 'text');
  const config = getRoleConfig(role, textColor);
  const sizeConfig = getSizeConfig(size);

  const BadgeContent = (
    <View
      style={[
        styles.badge,
        {
          width: sizeConfig.badgeSize,
          height: sizeConfig.badgeSize,
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          borderRadius: sizeConfig.badgeSize / 2,
        },
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={config.description}
    >
      <Ionicons name={config.icon} size={sizeConfig.iconSize} color={config.color} />
    </View>
  );

  if (onPress) {
    return (
      <A11yPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${config.description}. Activate to view details`}
        style={[styles.container, style]}
      >
        {BadgeContent}
        {showLabel && (
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeConfig.fontSize,
                color: config.color,
              },
            ]}
            numberOfLines={1}
          >
            {config.label}
          </Text>
        )}
      </A11yPressable>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {BadgeContent}
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: config.color,
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  label: {
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
});
