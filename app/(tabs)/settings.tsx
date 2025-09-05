import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useAppPalette } from "../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { useTranslation } from "../../i18n";
import { useSettings } from "../../store/settings";
import type { ProvinceCode } from "../../types/models";

const PROVINCES: ProvinceCode[] = ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];

export default function SettingsScreen() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Settings");
  useFocusOnRefOnMount(titleRef);
  const { setLanguage } = useTranslation();
  const { highContrast, setHighContrast, textScale, setTextScale, province, setProvince, includeProvincialHolidays, setIncludeProvincialHolidays, youtubeOpenPreference, setYoutubeOpenPreference } = useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} accessibilityLabel="Settings screen" accessible>
      <Text ref={titleRef} nativeID="settings-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Settings
      </Text>

      <Section title="Display" styles={styles}>
        <Row label="High Contrast" styles={styles}>
          <Chip selected={highContrast} onPress={() => setHighContrast(!highContrast)} styles={styles}>
            {highContrast ? "On" : "Off"}
          </Chip>
        </Row>
        <Row label="Text Size" styles={styles}>
          <Chip selected={textScale === "normal"} onPress={() => setTextScale("normal")} styles={styles}>Normal</Chip>
          <Chip selected={textScale === "large"} onPress={() => setTextScale("large")} styles={styles}>Large</Chip>
          <Chip selected={textScale === "xlarge"} onPress={() => setTextScale("xlarge")} styles={styles}>X-Large</Chip>
        </Row>
      </Section>

      <Section title="Language" styles={styles}>
        <Row label="App Language" styles={styles}>
          <Chip onPress={() => setLanguage("en")} styles={styles}>EN</Chip>
          <Chip onPress={() => setLanguage("fr")} styles={styles}>FR</Chip>
          <Chip onPress={() => setLanguage("es")} styles={styles}>ES</Chip>
        </Row>
      </Section>

      <Section title="Region" styles={styles}>
        <Row label="Province" styles={styles}>
          <Chip selected={!province} onPress={() => setProvince(null)} styles={styles}>Auto/All</Chip>
          {PROVINCES.map((p) => (
            <Chip key={p} selected={province === p} onPress={() => setProvince(p)} styles={styles}>{p}</Chip>
          ))}
        </Row>
        <Row label="Provincial Holidays" styles={styles}>
          <Chip selected={includeProvincialHolidays} onPress={() => setIncludeProvincialHolidays(!includeProvincialHolidays)} styles={styles}>
            {includeProvincialHolidays ? "On" : "Off"}
          </Chip>
        </Row>
      </Section>

      <Section title="Links" styles={styles}>
        <Row label="Open YouTube" styles={styles}>
          <Chip selected={youtubeOpenPreference === "ask"} onPress={() => setYoutubeOpenPreference("ask")} styles={styles}>Ask</Chip>
          <Chip selected={youtubeOpenPreference === "app"} onPress={() => setYoutubeOpenPreference("app")} styles={styles}>App</Chip>
          <Chip selected={youtubeOpenPreference === "browser"} onPress={() => setYoutubeOpenPreference("browser")} styles={styles}>Browser</Chip>
        </Row>
      </Section>

      <Text style={styles.note}>
        Province selection influences default Resources filtering and provincial holidays in Events when enabled. High contrast increases color contrast for better readability.
      </Text>
    </ScrollView>
  );
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children, styles }: { label: string; children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowControls}>{children}</View>
    </View>
  );
}

function Chip({ children, onPress, selected, styles }: { children: React.ReactNode; onPress?: () => void; selected?: boolean; styles: ReturnType<typeof createStyles> }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }} accessibilityLabel={String(children)} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{children}</Text>
    </Pressable>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    section: { paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    sectionTitle: { color: palette.text, fontWeight: "700", marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 8, flexWrap: "wrap" },
    rowLabel: { color: palette.text, opacity: 0.9, width: 120, marginRight: 8 },
    rowControls: { flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    chipActive: { backgroundColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary },
    note: { color: palette.text, opacity: 0.8, marginTop: 16, fontSize: 13 },
  });
}
