import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HIT_SLOP_12 } from "../constants/A11Y";
import { MAX_FONT_SCALE } from "../hooks/useA11y";
import type { Lang } from "../i18n";
import { useTranslation } from "../i18n";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";

const LANGUAGES = [
  { code: "en" as Lang, name: "English", nativeName: "English", flag: "�🇦" },
  { code: "fr" as Lang, name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es" as Lang, name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

export default function LanguageSelector() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { lang, setLanguage, t } = useTranslation();

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={t("settings.language.title", "Language preferences")}
    >
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t("settings.language.title", "Language")}
      </Text>
      <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t("settings.language.subtitle", "Choose your preferred language")}
      </Text>

      <View style={styles.languageList}>
        {LANGUAGES.map((language) => (
          <Pressable
            key={language.code}
            style={({ pressed }) => [
              styles.languageOption,
              lang === language.code && styles.languageOptionActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setLanguage(language.code)}
            hitSlop={HIT_SLOP_12}
            accessibilityRole="radio"
            accessibilityState={{ 
              checked: lang === language.code,
              selected: lang === language.code 
            }}
            accessibilityLabel={`${language.nativeName} (${language.name})`}
            accessibilityHint={`Switch app language to ${language.name}`}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={styles.languageText}>
                <Text style={[
                  styles.nativeName,
                  lang === language.code && styles.activeText
                ]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {language.nativeName}
                </Text>
                <Text style={[
                  styles.englishName,
                  lang === language.code && styles.activeSubText
                ]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {language.name}
                </Text>
              </View>
              {lang === language.code && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={palette.primary}
                  accessibilityLabel="Selected"
                />
              )}
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={palette.text} />
        <Text style={styles.noteText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Language changes will take effect immediately throughout the app.
        </Text>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    title: {
      fontSize: Math.round(18 * factor),
      fontWeight: "700",
      color: palette.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: Math.round(14 * factor),
      color: palette.textSecondary,
      marginBottom: 16,
      lineHeight: Math.round(20 * factor),
    },
    languageList: {
      marginBottom: 16,
    },
    languageOption: {
      backgroundColor: palette.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: palette.muted,
      minHeight: 44, // WCAG minimum tap target
    },
    languageOptionActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + "10", // 10% opacity
    },
    languageContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    flag: {
      fontSize: Math.round(24 * factor),
      marginRight: 12,
    },
    languageText: {
      flex: 1,
    },
    nativeName: {
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      color: palette.text,
      marginBottom: 2,
    },
    englishName: {
      fontSize: Math.round(13 * factor),
      color: palette.textSecondary,
    },
    activeText: {
      color: palette.primary,
    },
    activeSubText: {
      color: palette.primary,
      opacity: 0.8,
    },
    note: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      backgroundColor: palette.card,
      borderRadius: 8,
    },
    noteText: {
      fontSize: Math.round(12 * factor),
      color: palette.textSecondary,
      marginLeft: 8,
      flex: 1,
      lineHeight: Math.round(16 * factor),
    },
  });
}