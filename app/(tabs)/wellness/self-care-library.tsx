import React from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";

type Item = { label: string; url: string; description?: string };

export const options = { href: null };

export default function SelfCareLibrary() {
  // Info card for discoverability
  const openSuggestResource = () => {
    Linking.openURL('mailto:hello@empowrapp.com?subject=Suggest%20Self-Care%20Resource');
  };
  // Export/share resources
  const exportResources = async () => {
    try {
      const rows = [
        ["Section", "Label", "URL", "Description"],
        ...sections.flatMap(sec => sec.items.map(it => [sec.title, it.label, it.url, it.description || ""])),
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      await require("react-native-share").default.open({ message: csv, title: "Self-Care Resources CSV" });
    } catch {
      // Optionally show error
    }
  };
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("SelfÃ¢â‚¬â€˜Care Library");
  useFocusOnRefOnMount(titleRef);

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Audio & Guided Practices",
      items: [
        {
          label: "Insight Timer Ã¢â‚¬â€œ Sleep & Calm",
          url: "https://insighttimer.com/",
          description: "Audio meditations, sleep stories.",
        },
        {
          label: "NHS Breathing Exercises (Audio)",
          url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/",
          description: "Accessible breathing guide.",
        },
        {
          label: "Box Breathing (1Ã¢â‚¬â€˜min)",
          url: "https://www.youtube.com/results?search_query=box+breathing+1+minute",
          description: "Quick calming practice.",
        },
      ],
    },
    {
      title: "Gentle & Adaptive Movement",
      items: [
        {
          label: "Chair Yoga Basics (Video)",
          url: "https://www.youtube.com/results?search_query=chair+yoga+beginner",
          description: "Seated options; adapt to comfort.",
        },
        {
          label: "Aquatic Exercise Ã¢â‚¬â€œ Arthritis.ca",
          url: "https://arthritis.ca/living-well/exercise/aquatic-exercise",
          description: "Low-impact hydrotherapy ideas.",
        },
        {
          label: "Bed/Seated Mobility",
          url: "https://www.youtube.com/results?search_query=bed+exercises+gentle",
          description: "Very lowÃ¢â‚¬â€˜impact options.",
        },
      ],
    },
    {
      title: "EasyÃ¢â‚¬â€˜Read Guides",
      items: [
        {
          label: "Gentle Pacing & Energy",
          url: "https://www.mssociety.ca/resources/energy-conservation-and-pacing",
          description: "Activity pacing basics.",
        },
        {
          label: "Sleep Hygiene Ã¢â‚¬â€œ Simple Tips",
          url: "https://www.camh.ca/en/health-info/mental-illness-and-addiction-index/sleep-problems",
          description: "PlainÃ¢â‚¬â€˜language sleep guide.",
        },
        {
          label: "Pain Flare Planning",
          url: "https://painbc.ca/resources/self-management/pain-flares",
          description: "Plan for flare days.",
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <View style={[styles.section, { backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12, padding: 12 }]}> 
        <Text style={[styles.title, { color: palette.primary }]}>How to Use the Self-Care Library</Text>
        <Text style={styles.tipText}>
          Explore curated audio, video, and easy-read guides for accessible self-care. Tap any link to open. You can export the full list or suggest new resources.
        </Text>
        <Pressable
          onPress={exportResources}
          style={[styles.linkRow, { backgroundColor: palette.primary, borderRadius: 6, padding: 8, marginBottom: 6 }]}
          accessibilityRole="button"
          accessibilityLabel="Export self-care resources as CSV"
          accessibilityHint="Shares the full list of resources as a CSV file for tracking or sharing."
        >
          <Text style={[styles.linkLabel, { color: palette.onPrimary }]}>Export Resources (CSV)</Text>
        </Pressable>
        <Pressable
          onPress={openSuggestResource}
          style={[styles.linkRow, { backgroundColor: palette.surface, borderRadius: 6, padding: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
          accessibilityRole="button"
          accessibilityLabel="Suggest a new self-care resource"
          accessibilityHint="Opens email to suggest a new resource for the library."
        >
          <Text style={[styles.linkLabel, { color: palette.primary }]}>Suggest a Resource</Text>
        </Pressable>
      </View>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Accessible SelfÃ¢â‚¬â€˜Care Library
      </Text>
      <Text style={styles.subtitle}>
        Audio, video, and easyÃ¢â‚¬â€˜read guides curated for accessibility.
      </Text>
      {sections.map((sec) => (
        <View
          key={sec.title}
          style={styles.section}
          accessibilityLabel={`${sec.title} section`}
          accessible
        >
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          {sec.items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => open(it.url)}
              accessibilityRole="link"
              accessibilityLabel={it.label}
              accessibilityHint={it.description ? it.description : `Opens ${it.label}`}
              style={({ pressed }) => [
                styles.linkRow,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.linkLabel}>{it.label}</Text>
              {!!it.description && (
                <Text style={styles.tipText}>{it.description}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
      <Text style={styles.disclaimer}>
        Always adapt activities to your abilities and consult a clinician when
        needed.
      </Text>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
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
    linkRow: { marginBottom: 10 },
    linkLabel: { color: palette.primary, fontWeight: "600", marginBottom: 2 },
    tipText: { color: palette.text, opacity: 0.9 },
    disclaimer: { color: palette.muted, fontSize: 13, marginTop: 12 },
  });
}
