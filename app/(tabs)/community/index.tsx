import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  SectionList,
  Pressable,
} from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import {
  useAnnounceOnMount,
  useFocusOnRefOnMount,
  MAX_FONT_SCALE,
} from "../../../hooks/useA11y";
import { channels, seedThreads, seedComments } from "../../../data/community";
import { useCommunity, CommunityProvider } from "../../../store/community";
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

  React.useEffect(() => {
    if (state.channels.length === 0) {
      seed({ channels, threads: seedThreads, comments: seedComments });
    }
  }, [state.channels.length, seed]);

  const prov = state.channels.filter((c) => c.type === "province");
  const topics = state.channels.filter((c) => c.type === "topic");

  return (
    <View
      style={styles.container}
      accessibilityLabel="Community Hub screen"
      accessible
    >
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Community Hub
      </Text>
      <Text style={styles.subtitle}>Join a province or topic channel.</Text>

      <SectionList
        sections={[
          { title: "Provinces & Territories", data: prov },
          { title: "Topics", data: topics },
        ]}
        keyExtractor={(item) => `channel-${item.id}`}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push(`/(tabs)/community/${item.slug}` as Href)
            }
            accessibilityRole="button"
            accessibilityLabel={`Open channel ${item.title}`}
            hitSlop={HIT_SLOP_8}
            style={({ pressed }) => [
              styles.row,
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.rowText}>{item.title}</Text>
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
    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: 17,
      color: palette.text,
      opacity: 0.9,
      marginBottom: 8,
    },
    section: {
      marginTop: 12,
      marginBottom: 6,
      fontWeight: "700",
      color: palette.text,
    },
    row: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    rowText: { color: palette.text, fontSize: 16 },
  });
}
