/* eslint-disable no-restricted-syntax -- Discord brand colors are required */
/**
 * Discord Hub Component - Community Discord Integration
 * 
 * Displays Discord server info and quick links in the Community Hub:
 * - Server invite button
 * - Online member count (via widget)
 * - Quick links to specific channels
 * - User connection status
 * - Beautiful card-based UI
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import {
    disconnectDiscord,
    formatUsername,
    getAvatarUrl,
    getDiscordQuickLinks,
    getDiscordStatus,
    openDiscordInvite,
    type DiscordServerWidget,
    type DiscordUser
} from '../services/discord';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

interface DiscordHubProps {
  compact?: boolean;
  showQuickLinks?: boolean;
  onUserConnected?: (user: DiscordUser) => void;
}

export default function DiscordHub({
  compact = false,
  showQuickLinks = true,
  onUserConnected: _onUserConnected,
}: DiscordHubProps) {
  const palette = useAppPalette();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<DiscordUser | null>(null);
  const [_serverWidget, _setServerWidget] = React.useState<DiscordServerWidget | null>(null);
  const [quickLinks, setQuickLinks] = React.useState<Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    action: () => Promise<void>;
  }>>([]);
  const [_isConnecting, _setIsConnecting] = React.useState(false);

  // Load Discord status and server info
  React.useEffect(() => {
    async function loadDiscordData() {
      setLoading(true);
      try {
        // Get user status
        const status = await getDiscordStatus();
        setUser(status.user);
        
        // Get quick links
        const links = await getDiscordQuickLinks();
        setQuickLinks(links);
        
        // Try to fetch server widget (public info)
        // Using a placeholder server ID - will show invite button regardless
        // Widget fetch is optional - server must have widget enabled
        try {
          // This will fail gracefully if widget not enabled
          // const widget = await fetchServerWidget(serverConfig.serverId);
          // setServerWidget(widget);
        } catch {}
        
      } catch (err) {
        console.warn('[DiscordHub] Failed to load Discord data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadDiscordData();
  }, []);

  const handleJoinDiscord = async () => {
    await openDiscordInvite();
  };

  const handleDisconnect = async () => {
    await disconnectDiscord();
    setUser(null);
  };

  const styles = React.useMemo(() => createStyles(palette, compact), [palette, compact]);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Loading Discord...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.discordLogo}>
            <Text style={styles.logoEmoji}>🎮</Text>
          </View>
          <View>
            <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Discord Community
            </Text>
            {serverWidget && (
              <Text style={styles.subtitle}>
                🟢 {serverWidget.presence_count} online
              </Text>
            )}
          </View>
        </View>
        
        {user && (
          <View style={styles.userBadge}>
            {user.avatar && (
              <Image
                source={{ uri: getAvatarUrl(user, 32) }}
                style={styles.userAvatar}
              />
            )}
            <Text style={styles.userName} numberOfLines={1}>
              {formatUsername(user)}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Join our Discord server to chat in real-time with beta testers, 
        get support, and stay updated on new features!
      </Text>

      {/* Main Action Button */}
      <A11yPressable
        onPress={handleJoinDiscord}
        accessibilityRole="button"
        accessibilityLabel="Join Discord server"
        hitSlop={HIT_SLOP_8}
        style={({ pressed }) => [
          styles.joinButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name="logo-discord" size={20} color="#FFFFFF" />
        <Text style={styles.joinButtonText}>
          {user ? 'Open Discord' : 'Join Discord Server'}
        </Text>
      </A11yPressable>

      {/* Quick Links */}
      {showQuickLinks && quickLinks.length > 0 && !compact && (
        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksTitle}>Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            {quickLinks.slice(1).map((link) => ( // Skip first "Join" link
              <A11yPressable
                key={link.id}
                onPress={link.action}
                accessibilityRole="button"
                accessibilityLabel={link.title}
                hitSlop={HIT_SLOP_8}
                style={({ pressed }) => [
                  styles.quickLinkButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                <Text style={styles.quickLinkText} numberOfLines={1}>
                  {link.title}
                </Text>
              </A11yPressable>
            ))}
          </View>
        </View>
      )}

      {/* Benefits List */}
      {!compact && (
        <View style={styles.benefits}>
          <View style={styles.benefitRow}>
            <Ionicons name="chatbubbles" size={16} color={palette.primary} />
            <Text style={styles.benefitText}>Real-time chat with community</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="megaphone" size={16} color={palette.primary} />
            <Text style={styles.benefitText}>Early access to announcements</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="help-circle" size={16} color={palette.primary} />
            <Text style={styles.benefitText}>Direct support from developers</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="people" size={16} color={palette.primary} />
            <Text style={styles.benefitText}>Connect with other users</Text>
          </View>
        </View>
      )}

      {/* Disconnect option if connected */}
      {user && !compact && (
        <A11yPressable
          onPress={handleDisconnect}
          accessibilityRole="button"
          accessibilityLabel="Disconnect Discord account"
          style={styles.disconnectButton}
        >
          <Text style={styles.disconnectText}>Disconnect Discord Account</Text>
        </A11yPressable>
      )}
    </View>
  );
}

function createStyles(palette: any, compact: boolean) {
  return StyleSheet.create({
    card: {
      padding: compact ? 12 : 16,
      marginBottom: 16,
      backgroundColor: palette.surface,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      gap: 12,
    },
    loadingText: {
      color: palette.textSecondary,
      fontSize: 14,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: compact ? 8 : 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    discordLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#5865F2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoEmoji: {
      fontSize: 20,
    },
    title: {
      fontSize: compact ? 16 : 18,
      fontWeight: '700',
      color: palette.text,
    },
    subtitle: {
      fontSize: 13,
      color: palette.textSecondary,
      marginTop: 2,
    },
    userBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.muted,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      gap: 6,
      maxWidth: 120,
    },
    userAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    userName: {
      fontSize: 12,
      color: palette.text,
      fontWeight: '500',
    },
    description: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
      marginBottom: compact ? 12 : 16,
    },
    joinButton: {
      backgroundColor: '#5865F2', // Discord blurple
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      gap: 8,
    },
    joinButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonPressed: {
      opacity: 0.8,
    },
    quickLinks: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    quickLinksTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 10,
    },
    quickLinksGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    quickLinkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      gap: 6,
    },
    quickLinkIcon: {
      fontSize: 14,
    },
    quickLinkText: {
      fontSize: 13,
      color: palette.text,
      fontWeight: '500',
    },
    benefits: {
      marginTop: 16,
      gap: 8,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    benefitText: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    disconnectButton: {
      marginTop: 16,
      alignItems: 'center',
    },
    disconnectText: {
      fontSize: 13,
      color: palette.error,
      textDecorationLine: 'underline',
    },
  });
}
