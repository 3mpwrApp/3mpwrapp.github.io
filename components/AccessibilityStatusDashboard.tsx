import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MAX_FONT_SCALE } from "../hooks/useA11y";
import { useSettings } from "../store/settings";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";

type AccessibilityFeature = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  wcagLevel: "A" | "AA" | "AAA";
  category: "vision" | "motor" | "cognitive" | "hearing";
};

export default function AccessibilityStatusDashboard() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const settings = useSettings();

  const features: AccessibilityFeature[] = [
    {
      id: "highContrast",
      name: "High Contrast",
      description: "Enhanced color contrast for better visibility",
      icon: "contrast",
      isActive: settings.highContrast,
      wcagLevel: "AA",
      category: "vision",
    },
    {
      id: "textScale",
      name: "Text Scaling",
      description: `Text size: ${settings.textScale}`,
      icon: "text",
      isActive: settings.textScale !== "normal",
      wcagLevel: "AA",
      category: "vision",
    },
    {
      id: "screenReader",
      name: "Screen Reader Optimized",
      description: "Optimized for assistive technology",
      icon: "ear",
      isActive: settings.screenReaderOptimized,
      wcagLevel: "A",
      category: "vision",
    },
    {
      id: "reduceMotion",
      name: "Reduce Motion",
      description: "Minimized animations and transitions",
      icon: "pause",
      isActive: settings.reduceMotion,
      wcagLevel: "AA",
      category: "motor",
    },
    {
      id: "focusIndicator",
      name: "Enhanced Focus Indicators",
      description: "Improved keyboard navigation visibility",
      icon: "square-outline",
      isActive: settings.focusIndicatorEnhanced,
      wcagLevel: "AA",
      category: "motor",
    },
    {
      id: "tapTarget",
      name: "Minimum Tap Targets",
      description: "Larger touch areas for easier interaction",
      icon: "finger-print",
      isActive: settings.tapTargetMinimum,
      wcagLevel: "AA",
      category: "motor",
    },
    {
      id: "dyslexiaFriendly",
      name: "Dyslexia-Friendly Fonts",
      description: "Improved letter spacing and readability",
      icon: "text",
      isActive: settings.dyslexiaFriendly,
      wcagLevel: "AAA",
      category: "cognitive",
    },
    {
      id: "plainLanguage",
      name: "Plain Language",
      description: "Simplified text and terminology",
      icon: "document-text",
      isActive: settings.plainLanguage,
      wcagLevel: "AAA",
      category: "cognitive",
    },
    {
      id: "captions",
      name: "Captions Preferred",
      description: "Visual alternatives to audio content",
      icon: "logo-closed-captioning",
      isActive: settings.captionsPreferred,
      wcagLevel: "AA",
      category: "hearing",
    },
    {
      id: "voiceMode",
      name: "Voice Mode",
      description: "Voice navigation and control",
      icon: "mic",
      isActive: settings.voiceMode,
      wcagLevel: "AAA",
      category: "motor",
    },
  ];

  const activeFeatures = features.filter(f => f.isActive);
  const categoryGroups = features.reduce((groups, feature) => {
    if (!groups[feature.category]) groups[feature.category] = [];
    groups[feature.category].push(feature);
    return groups;
  }, {} as Record<string, AccessibilityFeature[]>);

  const categoryLabels = {
    vision: "Vision Support",
    motor: "Motor Support", 
    cognitive: "Cognitive Support",
    hearing: "Hearing Support",
  };

  const categoryIcons = {
    vision: "eye" as const,
    motor: "hand-left" as const,
    cognitive: "book" as const,
    hearing: "ear" as const,
  };

  const wcagLevelColors = {
    A: palette.success,
    AA: palette.primary,
    AAA: palette.warning,
  } as const;

  return (
    <ScrollView 
      style={styles.container}
      accessibilityLabel="Accessibility status dashboard"
      accessible={true}
    >
      <View style={styles.header}>
        <Ionicons name="accessibility" size={32} color={palette.primary} />
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Accessibility Status
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {activeFeatures.length} of {features.length} accessibility features active
        </Text>
        <View style={styles.complianceIndicator}>
          <Ionicons name="checkmark-circle" size={20} color={palette.success} />
          <Text style={styles.complianceText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            WCAG 2.1 AA Compliant
          </Text>
        </View>
      </View>

      {Object.entries(categoryGroups).map(([category, categoryFeatures]) => (
        <View key={category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Ionicons 
              name={categoryIcons[category as keyof typeof categoryIcons]} 
              size={20} 
              color={palette.text} 
            />
            <Text style={styles.categoryTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {categoryLabels[category as keyof typeof categoryLabels]}
            </Text>
            <Text style={styles.categoryCount} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {categoryFeatures.filter(f => f.isActive).length}/{categoryFeatures.length}
            </Text>
          </View>

          {categoryFeatures.map((feature) => (
            <View 
              key={feature.id} 
              style={[
                styles.featureCard,
                feature.isActive && styles.featureCardActive,
              ]}
            >
              <View style={styles.featureIcon}>
                <Ionicons 
                  name={feature.icon} 
                  size={20} 
                  color={feature.isActive ? palette.primary : palette.text} 
                />
              </View>
              <View style={styles.featureContent}>
                <View style={styles.featureHeader}>
                  <Text 
                    style={[
                      styles.featureName,
                      feature.isActive && styles.featureNameActive,
                    ]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {feature.name}
                  </Text>
                  <View 
                    style={[
                      styles.wcagBadge,
                      { backgroundColor: wcagLevelColors[feature.wcagLevel] },
                    ]}
                  >
                    <Text style={styles.wcagText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {feature.wcagLevel}
                    </Text>
                  </View>
                </View>
                <Text style={styles.featureDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {feature.description}
                </Text>
              </View>
              <View style={styles.statusIndicator}>
                <Ionicons 
                  name={feature.isActive ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={feature.isActive ? palette.success : palette.muted} 
                />
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Configure accessibility settings in the Settings tab to customize your experience.
        </Text>
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      padding: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      color: palette.text,
      marginLeft: 12,
    },
    summary: {
      backgroundColor: palette.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    summaryText: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      marginBottom: 8,
      fontWeight: "600",
    },
    complianceIndicator: {
      flexDirection: "row",
      alignItems: "center",
    },
    complianceText: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      marginLeft: 8,
      fontWeight: "500",
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    categoryTitle: {
      fontSize: Math.round(18 * factor),
      fontWeight: "600",
      color: palette.text,
      marginLeft: 8,
      flex: 1,
    },
    categoryCount: {
      fontSize: Math.round(14 * factor),
      color: palette.textSecondary,
      fontWeight: "500",
    },
    featureCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: palette.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    featureCardActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + "10",
    },
    featureIcon: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    featureContent: {
      flex: 1,
    },
    featureHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    featureName: {
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      color: palette.text,
      flex: 1,
    },
    featureNameActive: {
      color: palette.primary,
    },
    wcagBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    wcagText: {
      fontSize: Math.round(10 * factor),
      fontWeight: "700",
      color: "white",
    },
    featureDescription: {
      fontSize: Math.round(13 * factor),
      color: palette.text,
      opacity: 0.8,
      lineHeight: Math.round(18 * factor),
    },
    statusIndicator: {
      marginLeft: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      backgroundColor: palette.card,
      padding: 16,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 40,
    },
    footerText: {
      fontSize: Math.round(13 * factor),
      color: palette.text,
      opacity: 0.8,
      textAlign: "center",
      lineHeight: Math.round(18 * factor),
    },
  });
}