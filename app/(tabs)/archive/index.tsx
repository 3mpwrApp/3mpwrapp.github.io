import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { whatsnew } from "../../../data/whatsnew";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";

export const options = { href: null };

export default function ArchiveScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Archive");
  useFocusOnRefOnMount(titleRef);

  const now = React.useMemo(() => new Date(), []);
  const older = whatsnew.filter(
    (i) =>
      (now.getTime() - new Date(i.date).getTime()) / (1000 * 60 * 60 * 24) > 30,
  );

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Archive
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <FlatList
        data={older}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemText}>{item.summary}</Text>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      color: palette.text,
      marginBottom: 8,
    },
    item: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    itemTitle: { color: palette.text, fontWeight: "600" },
    itemText: { color: palette.text, opacity: 1 },
  });
}

