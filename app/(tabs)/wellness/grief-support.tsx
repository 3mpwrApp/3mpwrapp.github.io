import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { DyslexiaText } from "../../../components/DyslexiaText";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";

type Item = { label: string; url: string; description?: string };

export const options = { href: null };

export default function GriefSupport() {
  // Info card for discoverability
  const openSuggestResource = () => {
    Linking.openURL('mailto:hello@empowrapp.com?subject=Suggest%20Grief%20Support%20Resource');
  };
  // Export/share resources
  const exportResources = async () => {
    try {
      const rows = [
        ["Section", "Label", "URL", "Description"],
        ...sections.flatMap(sec => sec.items.map(it => [sec.title, it.label, it.url, it.description || ""])),
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) return;
      const path = `${baseDir}grief_support_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Grief Support Resources CSV' });
      }
    } catch {
      // Optionally show error
    }
  };
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Grief + Identity Support");
  useFocusOnRefOnMount(titleRef);

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Finding Identity After Injury",
      items: [
        {
          label: "Identity & Chronic Illness (Essay)",
          url: "https://www.psychologytoday.com/ca/blog/turning-straw-gold/201509/when-chronic-illness-changes-your-identity",
          description: "Reflecting on identity shifts.",
        },
        {
          label: "Purpose After Trauma (Guide)",
          url: "https://www.helpguide.org/articles/ptsd-trauma/coping-with-traumatic-events.htm",
          description: "Coping and purpose.",
        },
      ],
    },
    {
      title: "Peer & Community",
      items: [
        {
          label: "Injury/Disability Forums",
          url: "https://www.reddit.com/r/ChronicIllness/",
          description: "Peer experiences and support.",
        },
        {
          label: "Local Support Groups",
          url: "https://www.mentalhealthcommission.ca/English/find-your-way",
          description: "Find community resources.",
        },
      ],
    },
    {
      title: "Gentle Practices",
      items: [
        {
          label: "Writing Prompts for Loss",
          url: "https://grief.com/grief-the-6th-stage/",
          description: "Journal prompts for grief.",
        },
        {
          label: "Compassionate SelfÃ¢â‚¬â€˜Talk",
          url: "https://self-compassion.org/",
          description: "SelfÃ¢â‚¬â€˜kindness basics.",
        },
      ],
    },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <View style={[s.section, { backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12, padding: 12 }]}> 
        <Text style={[s.title, { color: palette.primary }]}>How to Use the Grief Support Hub</Text>
        <Text style={s.tipText}>
          Explore curated resources for identity, loss, and community support. Tap any link to open. You can export the full list or suggest new resources.
        </Text>
        <A11yPressable
          onPress={exportResources}
          style={[s.linkRow, { backgroundColor: palette.primary, borderRadius: 6, padding: 8, marginBottom: 6 }]}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel="Export grief support resources as CSV"
          accessibilityHint="Shares the full list of resources as a CSV file for tracking or sharing."
        >
          <Text style={[s.linkLabel, { color: palette.onPrimary }]}>Export Resources (CSV)</Text>
        </A11yPressable>
        <A11yPressable
          onPress={openSuggestResource}
          style={[s.linkRow, { backgroundColor: palette.surface, borderRadius: 6, padding: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel="Suggest a new grief support resource"
          accessibilityHint="Opens email to suggest a new resource for the hub."
        >
          <Text style={[s.linkLabel, { color: palette.primary }]}>Suggest a Resource</Text>
        </A11yPressable>
      </View>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Grief + Identity Support Hub
      </Text>
      <DyslexiaText style={s.subtitle}>
        Resources for the loss of identity and purpose that can follow injury or
        disability.
      </DyslexiaText>
      {sections.map((sec) => (
        <View
          key={sec.title}
          style={s.section}
          accessibilityLabel={`${sec.title} section`}
          accessible
        >
          <Text style={s.sectionTitle}>{sec.title}</Text>
          {sec.items.map((it) => (
            <A11yPressable
              key={it.label}
              onPress={() => open(it.url)}
              accessibilityRole="link"
              accessibilityLabel={it.label}
              accessibilityHint={it.description ? it.description : `Opens ${it.label}`}
              hitSlop={HIT_SLOP_8}
              style={({ pressed }) => [s.linkRow, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.linkLabel}>{it.label}</Text>
              {!!it.description && (
                <DyslexiaText style={s.tipText}>{it.description}</DyslexiaText>
              )}
            </A11yPressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
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
  });
}
