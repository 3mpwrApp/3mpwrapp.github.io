import React from "react";
import { View, Text, StyleSheet, Pressable, Linking, TextInput, Alert } from "react-native";
import { useAppPalette } from "../../theme/usePalette";
import { useTextScale } from "../../theme/typography";
import { useTranslation } from "../../i18n";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import SettingsLink from "../../components/SettingsLink";
import ContrastToggle from "../../components/ContrastToggle";
import { Link } from "expo-router";
import type { Href } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { addReflection, listReflections, type Reflection } from "../../services/wellness";

export default function WellnessScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Wellness");
  useFocusOnRefOnMount(titleRef);
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mood, setMood] = React.useState<Reflection['mood']>('ok');
  const [note, setNote] = React.useState('');
  const [recent, setRecent] = React.useState<Reflection[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      try { setRecent(await listReflections(10)); } catch {}
    })();
  }, [user]);

  const onOpen = React.useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const sections: {
    title: string;
    items: { label: string; url?: string; description?: string }[];
  }[] = [
    {
      title: "Physical Wellness",
      items: [
        {
          label: "Gentle Exercise & Recovery",
          url: "https://www.canada.ca/en/public-health/services/being-active/physical-activity-your-health.html",
          description: "Slow pace; range of motion first.",
        },
        {
          label: "Water-Based & Low-Impact Therapies",
          url: "https://arthritis.ca/living-well/exercise/aquatic-exercise",
          description: "Less joint load; steady mobility.",
        },
        {
          label: "Aquatic Therapy — Overview",
          url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/expert-answers/water-exercise/faq-20057974",
          description: "Hydrotherapy basics for recovery.",
        },
        {
          label: "Manage My Pain",
          url: "https://www.managemypain.com/",
          description: "Log pain to find patterns.",
        },
        {
          label: "Flaredown",
          url: "https://www.flaredown.com/",
          description: "Track symptoms and triggers.",
        },
        {
          label: "UnlockFood (Canada)",
          url: "https://www.unlockfood.ca/en/Home.aspx",
          description: "Evidence-based nutrition tips.",
        },
        {
          label: "Budget Bytes",
          url: "https://www.budgetbytes.com/",
          description: "Low-cost, simple meals.",
        },
        {
          label: "Insight Timer",
          url: "https://insighttimer.com/",
          description: "Free meditations and sleep.",
        },
        {
          label: "CBT-i Coach",
          url: "https://mobile.va.gov/app/cbt-i-coach",
          description: "CBT-I support; not a replacement for care.",
        },
      ],
    },
    {
      title: "Mental & Emotional Wellness",
      items: [
        {
          label: "Moodflow",
          url: "https://moodflow.co/",
          description: "Ad-free mood tracker.",
        },
        {
          label: "MindShift CBT",
          url: "https://www.anxietycanada.com/resources/mindshift-cbt/",
          description: "Anxiety tools by Anxiety Canada.",
        },
        {
          label: "Headspace",
          url: "https://www.headspace.com/",
          description: "Mindfulness practice.",
        },
        {
          label: "Breathwrk",
          url: "https://www.breathwrk.com/",
          description: "Breathing for stress relief.",
        },
        {
          label: "Daylio",
          url: "https://daylio.net/",
          description: "Tap-based journaling.",
        },
        {
          label: "Reflectly",
          url: "https://reflectly.app/",
          description: "Guided reflections.",
        },
      ],
    },
    { title: "Inspiration & Motivation", items: [] },
  ];

  return (
    <View
      style={styles.container}
      accessibilityLabel="Wellness screen"
      accessible
    >
      <Text
        ref={titleRef}
        nativeID="wellness-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Wellness
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <Text style={styles.subtitle}>
        {t("wellness.intro", "Wellness resources and guidance.")}
      </Text>
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />

      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 8 }]}
      >
        Tools
      </Text>
      <Link href={"/(tabs)/wellness/symptom-tracker" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 6 }]}>
          {t(
            "wellness.tools.symptom",
            "Symptom & Pain Tracker (exportable report)",
          )}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/sleep-energy-tracker" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 6 }]}>
          {t(
            "wellness.tools.sleep",
            "Sleep & Energy Tracker (legal/medical summary)",
          )}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/self-care-library" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t("wellness.tools.selfcare", "Accessible Self‑Care Library")}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/work-balance-ai" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t("wellness.tools.work_balance", "Wellness + Work Balance AI")}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/grief-support" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t("wellness.tools.grief", "Grief + Identity Support Hub")}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/adaptive-meditation" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t(
            "wellness.tools.adaptive_meditation",
            "Adaptive Meditation & Relaxation",
          )}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/rehab-games" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t(
            "wellness.tools.rehab_games",
            "Virtual Rehab Games (gentle movement)",
          )}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/daily-planner" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t("wellness.tools.daily_planner", "Adaptive Daily Planner")}
        </Text>
      </Link>
      <Link href={"/(tabs)/wellness/achievements" as Href} asChild>
        <Text style={[styles.linkLabel, { marginBottom: 12 }]}>
          {t("wellness.achievements.title", "Achievements")}
        </Text>
      </Link>

      {/* Daily reflection composer */}
      <View style={{ paddingVertical: 8 }} accessibilityLabel="Daily reflection" accessible>
        <Text style={styles.sectionTitle}>Daily Reflection</Text>
        {!user ? (
          <Text style={styles.tipText}>Sign in to save reflections.</Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {(['bad','ok','good','great'] as Reflection['mood'][]).map((m) => (
                <Pressable key={m} onPress={() => setMood(m)} accessibilityRole="button"
                  style={({ pressed }) => [
                    { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
                    mood === m && { backgroundColor: palette.primary, borderColor: palette.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[{ color: palette.text }, mood === m && { color: palette.onPrimary, fontWeight: '700' }]}>{m.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              placeholderTextColor={palette.text}
              style={{ borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, marginBottom: 8 }}
              multiline
            />
            <Pressable
              onPress={async () => {
                try {
                  await addReflection(mood, note.trim());
                  setNote('');
                  setRecent(await listReflections(10));
                  Alert.alert('Saved', 'Reflection saved.');
                } catch { Alert.alert('Not saved', 'Sign in to save reflections.'); }
              }}
              accessibilityRole="button"
              style={({ pressed }) => [{ backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }, pressed && { opacity: 0.9 }]}
            >
              <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>Save Reflection</Text>
            </Pressable>
            {recent.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.sectionTitle}>Recent</Text>
                {recent.map((r) => (
                  <Text key={r.id} style={styles.tipText}>
                    {new Date(r.createdAt?.toDate?.() || Date.now()).toLocaleString()} — {r.mood.toUpperCase()}{r.note ? `: ${r.note}` : ''}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {sections.map((sec) => (
        <View
          key={sec.title}
          style={styles.section}
          accessibilityLabel={`${sec.title} section`}
          accessible
        >
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          {sec.items.length === 0 ? (
            <Text style={styles.tipText}>Curated resources coming soon.</Text>
          ) : (
            sec.items.map((it) => (
              <View
                key={it.label}
                style={styles.itemRow}
                accessible
                accessibilityLabel={it.label}
              >
                {it.url ? (
                  <Pressable
                    onPress={() => onOpen(it.url!)}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${it.label}`}
                    style={({ pressed }) => [
                      styles.linkRow,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.linkLabel}>{it.label}</Text>
                    {!!it.description && (
                      <Text style={styles.tipText}>{it.description}</Text>
                    )}
                  </Pressable>
                ) : (
                  <View>
                    <Text style={styles.itemLabel}>{it.label}</Text>
                    {!!it.description && (
                      <Text style={styles.tipText}>{it.description}</Text>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      ))}

      <Text style={[styles.disclaimer, { marginTop: 16 }]}>
        This information is educational and not a substitute for professional
        medical advice. Consult your healthcare provider for personalized
        guidance.
      </Text>
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
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(17 * factor),
      color: palette.text,
      opacity: 0.9,
      marginBottom: 16,
    },
    section: {
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    sectionTitle: {
      color: palette.text,
      fontWeight: "700",
      marginBottom: 8,
      fontSize: 18,
    },
    itemRow: { paddingVertical: 8 },
    itemLabel: { color: palette.text, fontWeight: "600", marginBottom: 4 },
    linkRow: {},
    linkLabel: { color: palette.primary, fontWeight: "600", marginBottom: 4 },
    tipText: { color: palette.text, opacity: 0.9 },
    disclaimer: { color: palette.muted, fontSize: 13 },
  });
}
