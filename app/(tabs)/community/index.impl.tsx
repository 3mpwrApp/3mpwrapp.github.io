import type { Href } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SimpleModeWelcome from '../../../components/SimpleModeWelcome';
import { SkeletonList } from '../../../components/SkeletonLoader';
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import { channels, seedComments, seedThreads } from "../../../data/community";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { CommunityProvider, useCommunity } from "../../../store/community";
import { useComplexityMode } from "../../../store/complexityMode";
import { colors, type Palette } from "../../../theme/colors";

// Section Header Component
const SectionHeader = ({ title, subtitle, palette }: { title: string; subtitle?: string; palette: Palette }) => (
  <View style={{ marginTop: 24, marginBottom: 12 }}>
    <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: subtitle ? 4 : 0 }}>{title}</Text>
    {subtitle && <Text style={{ fontSize: 14, color: palette.textSecondary }}>{subtitle}</Text>}
  </View>
);

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  desc, 
  onPress, 
  variant = 'default',
  palette 
}: { 
  icon: string; 
  title: string; 
  desc: string; 
  onPress: () => void; 
  variant?: 'default' | 'discord' | 'primary';
  palette: Palette;
}) => {
  /* eslint-disable no-restricted-syntax -- Discord brand colors required */
  const bgColor = variant === 'discord' ? '#5865F2' : variant === 'primary' ? palette.primary : palette.surface;
  const textColor = variant === 'default' ? palette.text : '#FFFFFF';
  /* eslint-enable no-restricted-syntax */
  
  return (
    <A11yPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${desc}`}
      hitSlop={HIT_SLOP_8}
      style={({ pressed }) => [{
        backgroundColor: bgColor,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: variant === 'default' ? 1 : 0,
        borderColor: palette.muted,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }, pressed && { opacity: 0.8 }]}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 13, color: textColor, opacity: 0.9 }}>{desc}</Text>
      </View>
      <Text style={{ fontSize: 18, color: textColor, opacity: 0.6 }}>›</Text>
    </A11yPressable>
  );
};

// Quick Link Button
const QuickLink = ({ icon, label, onPress, palette }: { icon: string; label: string; onPress: () => void; palette: Palette }) => (
  <A11yPressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={HIT_SLOP_8}
    style={({ pressed }) => [{
      backgroundColor: palette.surface,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: palette.muted,
      alignItems: 'center',
      flex: 1,
      minWidth: 100,
    }, pressed && { opacity: 0.8 }]}
  >
    <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
    <Text style={{ fontSize: 12, fontWeight: '600', color: palette.text, textAlign: 'center' }}>{label}</Text>
  </A11yPressable>
);

function ScreenInner() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Community Hub");
  useFocusOnRefOnMount(titleRef);
  const { state, seed } = useCommunity();
  const { t: _t } = useTranslation();
  const { mode: complexityMode } = useComplexityMode();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (state.channels.length === 0) {
      seed({ channels, threads: seedThreads, comments: seedComments });
    }
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [state.channels.length, seed]);

  const isSimpleMode = complexityMode === 'simple';

  return (
    <ResponsiveScreenWrapper scrollable={true} testID="community-screen">
      <View style={styles.container} accessibilityLabel="Community Hub screen" accessible={true}>
        {/* Header */}
        <Text ref={titleRef} accessibilityRole="header" style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Community Hub
        </Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Connect with advocates, share experiences, and support each other.
        </Text>

        <SimpleModeWelcome 
          tabName="Community"
          availableFeatures={['Discord Server', 'Beta Testers Chat']}
          hiddenCount={isSimpleMode ? 4 : 0}
        />

        {loading ? (
          <SkeletonList count={6} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            
            {/* Discord - Main CTA */}
            <SectionHeader 
              title="💬 Join the Conversation" 
              subtitle="Discord is our main community hub"
              palette={palette}
            />
            
            <FeatureCard
              icon="🎮"
              title="Join Our Discord"
              desc="Chat, get support, share feedback, and connect with advocates"
              onPress={() => Linking.openURL('https://discord.gg/fJB2DJ7Yn')}
              variant="discord"
              palette={palette}
            />

            {/* Quick Links to Discord Channels */}
            <GapView style={{ flexDirection: 'row', marginBottom: 8 }} gap={8}>
              <QuickLink 
                icon="📢" 
                label="Announcements" 
                onPress={() => Linking.openURL('https://discord.com/channels/1444061902555840667/1444061903684112456')}
                palette={palette}
              />
              <QuickLink 
                icon="🧪" 
                label="Beta Testers" 
                onPress={() => Linking.openURL('https://discord.com/channels/1444061902555840667/1446264193580929066')}
                palette={palette}
              />
              <QuickLink 
                icon="🆘" 
                label="Support" 
                onPress={() => Linking.openURL('https://discord.com/channels/1444061902555840667/1446264655571058718')}
                palette={palette}
              />
            </GapView>

            {/* In-App Features */}
            <SectionHeader 
              title="📱 In-App Features" 
              subtitle="Community tools built into the app"
              palette={palette}
            />

            <FeatureCard
              icon="🧪"
              title="Beta Testers Chat"
              desc="In-app chat for quick beta feedback and collaboration"
              onPress={() => router.push('/(tabs)/community/testers-chat' as Href)}
              variant="default"
              palette={palette}
            />

            {!isSimpleMode && (
              <>
                <FeatureCard
                  icon="🤝"
                  title="Mutual Aid Network"
                  desc="Exchange support, resources, and peer help"
                  onPress={() => router.push('/(tabs)/community/mutual-aid' as Href)}
                  variant="default"
                  palette={palette}
                />

                <FeatureCard
                  icon="🎨"
                  title="Media Studio"
                  desc="Create and share advocacy graphics, memes & posters"
                  onPress={() => router.push('/(tabs)/community/media-studio' as Href)}
                  variant="default"
                  palette={palette}
                />

                <FeatureCard
                  icon="✏️"
                  title="Create Forum Post"
                  desc="Start a discussion in the community forum"
                  onPress={() => router.push('/(tabs)/community/compose' as Href)}
                  variant="primary"
                  palette={palette}
                />
              </>
            )}

            {/* Account & Safety */}
            <SectionHeader 
              title="⚙️ Your Account" 
              palette={palette}
            />

            <View style={{ 
              backgroundColor: palette.surface, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: palette.muted,
              overflow: 'hidden'
            }}>
              <A11yPressable
                accessibilityRole="button"
                accessibilityLabel="View your posts"
                style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: palette.muted }]}
                onPress={() => router.push('/(tabs)/community/my-posts' as Href)}
              >
                <Text style={{ fontSize: 16, color: palette.text }}>📝 My Posts</Text>
                <Text style={{ color: palette.textSecondary }}>›</Text>
              </A11yPressable>
              
              <View style={{ height: 1, backgroundColor: palette.muted }} />
              
              <A11yPressable
                accessibilityRole="button"
                accessibilityLabel="Safety and blocking settings"
                style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: palette.muted }]}
                onPress={() => router.push('/(tabs)/community/safety' as Href)}
              >
                <Text style={{ fontSize: 16, color: palette.text }}>🛡️ Safety & Blocking</Text>
                <Text style={{ color: palette.textSecondary }}>›</Text>
              </A11yPressable>
            </View>

            {/* Community Guidelines Footer */}
            <View style={{ marginTop: 24, padding: 16, backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1, borderColor: palette.muted }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: palette.text, marginBottom: 8 }}>
                📜 Community Guidelines
              </Text>
              <Text style={{ fontSize: 13, color: palette.textSecondary, lineHeight: 18 }}>
                Be respectful, supportive, and inclusive. This is a safe space for disability advocates. 
                Report any concerns via Safety & Blocking.
              </Text>
            </View>

          </ScrollView>
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
}

export default function CommunityIndex() {
  return (
    <CommunityProvider>
      <ScreenInner />
    </CommunityProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  listItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 14, 
    paddingHorizontal: 16,
  },
});
