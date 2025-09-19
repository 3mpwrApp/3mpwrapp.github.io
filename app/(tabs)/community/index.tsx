import React from "react";
import { View, Text, StyleSheet, useColorScheme, SectionList, Pressable } from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import { useAnnounceOnMount, useFocusOnRefOnMount, MAX_FONT_SCALE } from "../../../hooks/useA11y";
import { channels, seedThreads, seedComments } from "../../../data/community";
import { useCommunity, CommunityProvider } from "../../../store/community";
import { getChannelUnread, setChannelLastRead } from "../../../services/community";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { HIT_SLOP_8, touchTarget } from "../../../constants/a11y";

function ScreenInner() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Community Hub");
  useFocusOnRefOnMount(titleRef);
  const { state, seed } = useCommunity();
  const [unread, setUnread] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (state.channels.length === 0) {
      seed({ channels, threads: seedThreads, comments: seedComments });
    }
  }, [state.channels.length, seed]);

  const prov = state.channels.filter((c) => c.type === "province");
  const topics = state.channels.filter((c) => c.type === "topic");

  React.useEffect(() => {
    (async () => {
      try {
        const all = [...prov, ...topics];
        const out: Record<string, number> = {};
        for (const ch of all) {
          out[ch.slug] = await getChannelUnread(ch.slug, 50);
        }
        setUnread(out);
      } catch {}
    })();
  }, [prov.length, topics.length]);

  return (
    <View style={styles.container} accessibilityLabel="Community Hub screen" accessible>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Community Hub
      </Text>
      <Text style={styles.subtitle}>Connect, share, and support each other through various community features.</Text>

      {/* Community Features Navigation */}
      <View style={styles.featuresContainer}>
        <View style={styles.featuresRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Media Studio to create and share memes, posters, and graphics"
            style={({ pressed }) => [styles.featureButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(tabs)/community/media-studio' as Href)}
          >
            <Text style={styles.featureTitle}>🎨 Media Studio</Text>
            <Text style={styles.featureDesc}>Create & share memes, posters, graphics</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Mutual Aid to exchange support and resources"
            style={({ pressed }) => [styles.featureButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(tabs)/community/mutual-aid' as Href)}
          >
            <Text style={styles.featureTitle}>🤝 Mutual Aid</Text>
            <Text style={styles.featureDesc}>Exchange support, resources, peer help</Text>
          </Pressable>
        </View>

        <View style={styles.featuresRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Mutual Chat for real-time group and one-on-one conversations"
            style={({ pressed }) => [styles.featureButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(tabs)/community/mutual-chat?id=general' as Href)}
          >
            <Text style={styles.featureTitle}>💬 Mutual Chat</Text>
            <Text style={styles.featureDesc}>Real-time group & 1-1 conversations</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Beta Testers Chat for live collaboration and feedback"
            style={({ pressed }) => [styles.featureButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(tabs)/community/testers-chat' as Href)}
          >
            <Text style={styles.featureTitle}>🧪 Beta Testers Chat</Text>
            <Text style={styles.featureDesc}>Live chat to collaborate & give feedback</Text>
          </Pressable>
        </View>

        <View style={styles.featuresRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compose a new post"
            style={({ pressed }) => [styles.featureButton, styles.composeButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(tabs)/community/compose' as Href)}
          >
            <Text style={[styles.featureTitle, { color: palette.onPrimary }]}>✏️ Compose Post</Text>
            <Text style={[styles.featureDesc, { color: palette.onPrimary }]}>Create a new forum post</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Community Forum</Text>
      <Text style={styles.subtitle}>Join a province or topic channel to participate in discussions.</Text>

      <SectionList
        sections={[{ title: "Provinces & Territories", data: prov }, { title: "Topics", data: topics }]}
        keyExtractor={(item) => `channel-${item.id}`}
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => { await setChannelLastRead(item.slug); router.push(`/(tabs)/community/${item.slug}` as Href); }}
            accessibilityRole="button"
            accessibilityLabel={`Open channel ${item.title}`}
            hitSlop={HIT_SLOP_8}
            style={({ pressed }) => [styles.row, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.rowText}>{item.title}{unread[item.slug] ? ` (${unread[item.slug]})` : ''}</Text>
          </Pressable>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

export default function CommunityIndex() {
  return (
    <CommunityProvider>
      <ScreenInner />
    </CommunityProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 17, color: palette.text, opacity: 1, marginBottom: 8 },
    sectionHeader: { fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8, color: palette.text },
    featuresContainer: { marginBottom: 16 },
    featuresRow: { 
      flexDirection: 'row', 
      gap: 12, 
      marginBottom: 12,
      justifyContent: 'space-between'
    },
    featureButton: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      minHeight: 80,
      justifyContent: 'center'
    },
    composeButton: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4
    },
    featureDesc: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.8,
      lineHeight: 18
    },
    section: { marginTop: 12, marginBottom: 6, fontWeight: "700", color: palette.text },
    row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    rowText: { color: palette.text, fontSize: 16 },
  });
}
