import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, Linking } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";

export default function WellnessScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Wellness");
  useFocusOnRefOnMount(titleRef);

  const onOpen = React.useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const sections: { title: string; items: { label: string; url?: string; description?: string }[] }[] = [
    {
      title: "Physical Wellness",
      items: [
        { label: "Gentle Exercise & Recovery", url: "https://www.canada.ca/en/public-health/services/being-active/physical-activity-your-health.html", description: "Slow pace; range of motion first." },
        { label: "Water-Based & Low-Impact Therapies", url: "https://arthritis.ca/living-well/exercise/aquatic-exercise", description: "Less joint load; steady mobility." },
        { label: "Aquatic Therapy — Overview", url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/expert-answers/water-exercise/faq-20057974", description: "Hydrotherapy basics for recovery." },
        { label: "Manage My Pain", url: "https://www.managemypain.com/", description: "Log pain to find patterns." },
        { label: "Flaredown", url: "https://www.flaredown.com/", description: "Track symptoms and triggers." },
        { label: "UnlockFood (Canada)", url: "https://www.unlockfood.ca/en/Home.aspx", description: "Evidence‑based nutrition tips." },
        { label: "Budget Bytes", url: "https://www.budgetbytes.com/", description: "Low‑cost, simple meals." },
        { label: "Insight Timer", url: "https://insighttimer.com/", description: "Free meditations and sleep." },
        { label: "CBT‑i Coach", url: "https://mobile.va.gov/app/cbt-i-coach", description: "CBT‑I support; not a replacement for care." },
      ],
    },
    {
      title: "Mental & Emotional Wellness",
      items: [
        { label: "Moodflow", url: "https://moodflow.co/", description: "Ad‑free mood tracker." },
        { label: "MindShift CBT", url: "https://www.anxietycanada.com/resources/mindshift-cbt/", description: "Anxiety tools by Anxiety Canada." },
        { label: "Headspace", url: "https://www.headspace.com/", description: "Mindfulness practice." },
        { label: "Breathwrk", url: "https://www.breathwrk.com/", description: "Breathing for stress relief." },
        { label: "Daylio", url: "https://daylio.net/", description: "Tap‑based journaling." },
        { label: "Reflectly", url: "https://reflectly.app/", description: "Guided reflections." },
      ],
    },
    { title: "Inspiration & Motivation", items: [] },
  ];

  return (
    <View style={styles.container} accessibilityLabel="Wellness screen" accessible>
      <Text
        ref={titleRef}
        nativeID="wellness-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Wellness
      </Text>
      <Text style={styles.subtitle}>
        Your wellbeing matters. This page is a safe, inclusive space for Injured Workers and the Disability Community. Here you’ll find guidance on physical, mental, emotional, and social wellness — designed to be supportive, accessible, and empowering.
      </Text>

      {sections.map((sec) => (
        <View key={sec.title} style={styles.section} accessibilityLabel={`${sec.title} section`} accessible>
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          {sec.items.length === 0 ? (
            <Text style={styles.tipText}>Curated resources coming soon.</Text>
          ) : (
            sec.items.map((it) => (
              <View key={it.label} style={styles.itemRow} accessible accessibilityLabel={it.label}>
                {it.url ? (
                  <Pressable
                    onPress={() => onOpen(it.url!)}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${it.label}`}
                    style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.linkLabel}>{it.label}</Text>
                    {!!it.description && <Text style={styles.tipText}>{it.description}</Text>}
                  </Pressable>
                ) : (
                  <View>
                    <Text style={styles.itemLabel}>{it.label}</Text>
                    {!!it.description && <Text style={styles.tipText}>{it.description}</Text>}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      ))}

      <Text style={[styles.disclaimer, { marginTop: 16 }]}>
        This information is educational and not a substitute for professional medical advice. Consult your healthcare provider for personalized guidance.
      </Text>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 17, color: palette.text, opacity: 0.9, marginBottom: 16 },
    section: { paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    sectionTitle: { color: palette.text, fontWeight: "700", marginBottom: 8, fontSize: 18 },
    itemRow: { paddingVertical: 8 },
    itemLabel: { color: palette.text, fontWeight: "600", marginBottom: 4 },
    linkRow: {},
    linkLabel: { color: palette.primary, fontWeight: "600", marginBottom: 4 },
    tipText: { color: palette.text, opacity: 0.9 },
    disclaimer: { color: palette.muted, fontSize: 13 },
  });
}
