import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import ContrastToggle from "../../../components/ContrastToggle";
import SettingsLink from "../../../components/SettingsLink";
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTextScale } from "../../../theme/typography";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function ResearchScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Research");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Research
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>
        Access studies, reports, articles, history timeline, and case wait-times.
      </Text>
      <View style={styles.sectionGrid}>
        <Link href="/(tabs)/research/studies" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel="Studies - Access clinical and workplace studies"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="library-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Studies</Text>
            <Text style={styles.sectionDescription}>Access clinical and workplace studies</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/reports" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel="Reports - Community and government reports made easy"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="document-text-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Reports</Text>
            <Text style={styles.sectionDescription}>Community and government reports made easy</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/articles" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel="Articles - Insights on disability, workplace rights, and advocacy"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="newspaper-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Articles</Text>
            <Text style={styles.sectionDescription}>Insights on disability, workplace rights, advocacy</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/history-timeline" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel="History Timeline - Track milestones in disability and worker rights"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="time-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>History Timeline</Text>
            <Text style={styles.sectionDescription}>Track milestones in disability, worker, and injured worker rights</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/wait-times" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel="Case Wait-Times - Estimate how long processes may take"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="time-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Case/File Wait-Times</Text>
            <Text style={styles.sectionDescription}>Estimate how long processes may take</Text>
          </A11yPressable>
        </Link>
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.9, marginBottom: 16 },
    sectionGrid: { gap: 16, paddingBottom: 20 },
    sectionCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, alignItems: 'center', minHeight: 140, justifyContent: 'center' },
    sectionTitle: { fontSize: Math.round(18 * factor), fontWeight: '700', color: palette.text, marginTop: 12, marginBottom: 8, textAlign: 'center' },
    sectionDescription: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.8, textAlign: 'center' },
  });
}


