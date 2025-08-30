import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, Image, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { colors, type Palette } from "../../theme/colors";
import { useTranslation } from "../../i18n";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";

export default function TabsHome() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentPadding = isTablet ? 32 : 20;
  const logoSize = isTablet ? 120 : 88;
  const titleSize = isTablet ? 32 : 28;
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Home");
  useFocusOnRefOnMount(titleRef);
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: contentPadding, paddingVertical: contentPadding },
      ]}
      accessibilityLabel="Home screen"
      accessible
    >
      <Image
        source={require("../../assets/images/empowr-logo.png")}
        style={[styles.logo, { width: logoSize, height: logoSize, marginBottom: isTablet ? 16 : 12 }]}
        accessible
        accessibilityLabel="Empowr logo"
      />
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={[styles.title, { fontSize: titleSize }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("home.title")}
      </Text>
      <Text style={styles.subtitle}>{t("home.subtitle")}</Text>
      <Text style={styles.description}>
        {t("home.welcome")}
      </Text>
      {/* Keep Home minimal; tabs below handle navigation */}
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: palette.background, justifyContent: "center", alignItems: "center" },
    logo: { width: 96, height: 96, marginBottom: 12, resizeMode: "contain" },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 8, color: palette.text, textAlign: "center" },
    subtitle: { fontSize: 17, color: palette.text, opacity: 0.9, textAlign: "center" },
    description: { fontSize: 16, color: palette.text, textAlign: "center", marginTop: 8, lineHeight: 22 },
    row: { flexDirection: "row", gap: 12, justifyContent: "center", marginTop: 8 },
    chip: { backgroundColor: palette.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, minHeight: 44, alignItems: "center", justifyContent: "center" },
    chipText: { color: palette.onPrimary, fontSize: 14, fontWeight: "700" },
  });
}
